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

// GET /api/sessions/:id/rounds/current - Get current round with all answers
export async function GET(
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
        sessionParticipants: {
          include: {
            profile: {
              select: {
                id: true,
                nickname: true,
                user: {
                  select: {
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!session) {
      return errorResponse('Sessão não encontrada', 404);
    }

    // Verify user is participant
    const isParticipant = session.sessionParticipants.some(
      (p) => p.profileId === profile.id
    );

    if (!isParticipant) {
      return errorResponse('Você não é participante desta sessão', 403);
    }

    // If no current round, return null
    if (!session.currentRoundId) {
      return successResponse(null);
    }

    // Get current round with all data
    const currentRound = await prisma.onlineRound.findUnique({
      where: { id: session.currentRoundId },
      include: {
        card: true,
        answers: {
          include: {
            profile: {
              select: {
                id: true,
                nickname: true,
                user: {
                  select: {
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            answeredAt: 'asc',
          },
        },
      },
    });

    if (!currentRound) {
      return successResponse(null);
    }

    // Add metadata about who answered
    const participantIds = session.sessionParticipants.map((p) => p.profileId);
    const answeredIds = currentRound.answers.map((a) => a.profileId);
    const waitingIds = participantIds.filter((id) => !answeredIds.includes(id));

    const roundWithMeta = {
      ...currentRound,
      metadata: {
        totalParticipants: participantIds.length,
        totalAnswers: answeredIds.length,
        waitingCount: waitingIds.length,
        waitingProfiles: session.sessionParticipants
          .filter((p) => waitingIds.includes(p.profileId))
          .map((p) => ({
            id: p.profile.id,
            nickname: p.profile.nickname,
            image: p.profile.user?.image || null,
          })),
        currentUserAnswered: answeredIds.includes(profile.id),
      },
    };

    return successResponse(roundWithMeta);
  } catch (error: any) {
    console.error('Error fetching current round:', error);
    return errorResponse('Erro ao buscar rodada atual', 500);
  }
}
