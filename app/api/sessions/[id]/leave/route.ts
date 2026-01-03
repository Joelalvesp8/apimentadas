import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}

// POST /api/sessions/:id/leave - Leave online session (individual participant)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Get session
    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        sessionParticipants: true,
      },
    });

    if (!session) {
      return errorResponse('Sessão não encontrada', 404);
    }

    // Check if user is participant
    const participantRecord = session.sessionParticipants.find(
      (p) => p.profileId === profile.id
    );

    if (!participantRecord) {
      return errorResponse('Você não é participante desta sessão', 403);
    }

    // Remove participant from session
    await prisma.sessionParticipant.delete({
      where: { id: participantRecord.id },
    });

    // If session has no more participants or only 1 left (for online), finish it
    const remainingParticipants = await prisma.sessionParticipant.count({
      where: { sessionId: session.id },
    });

    if (remainingParticipants === 0 || (session.mode === 'online' && remainingParticipants < 2)) {
      await prisma.gameSession.update({
        where: { id: session.id },
        data: {
          status: 'finished',
          finishedAt: new Date(),
        },
      });
    }

    return successResponse({
      message: 'Você saiu da sessão',
      sessionFinished: remainingParticipants === 0 || (session.mode === 'online' && remainingParticipants < 2),
      remainingParticipants,
    });
  } catch (error: any) {
    console.error('Error leaving session:', error);
    return errorResponse('Erro ao sair da sessão', 500);
  }
}
