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

// GET /api/sessions/:id/status - Get session status and progress
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

    // Get session with rounds
    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        sessionParticipants: true,
        onlineRounds: {
          include: {
            answers: true,
          },
          orderBy: {
            roundNumber: 'desc',
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

    // Calculate status
    const totalRounds = session.onlineRounds.length;
    const completedRounds = session.onlineRounds.filter(
      (r) => r.status === 'completed'
    ).length;

    let canStartNext = true;
    let answersNeeded = 0;
    let currentRoundStatus = null;

    // Check current round status
    if (session.currentRoundId) {
      const currentRound = session.onlineRounds.find(
        (r) => r.id === session.currentRoundId
      );

      if (currentRound) {
        const totalParticipants = session.sessionParticipants.length;
        const totalAnswers = currentRound.answers.length;
        answersNeeded = totalParticipants - totalAnswers;

        currentRoundStatus = {
          roundNumber: currentRound.roundNumber,
          status: currentRound.status,
          answersReceived: totalAnswers,
          answersNeeded: totalParticipants,
          awaitingAnswers: answersNeeded,
        };

        // Can only start next if current round is completed
        if (currentRound.status === 'waiting') {
          canStartNext = false;
        }
      }
    }

    const statusData = {
      sessionId: session.id,
      mode: session.mode,
      sessionType: session.sessionType,
      status: session.status,
      totalRounds,
      completedRounds,
      cardsPlayed: session.cardsPlayed,
      canStartNext,
      answersNeeded,
      currentRound: currentRoundStatus,
      participantCount: session.sessionParticipants.length,
    };

    return successResponse(statusData);
  } catch (error: any) {
    console.error('Error fetching session status:', error);
    return errorResponse('Erro ao buscar status da sessão', 500);
  }
}
