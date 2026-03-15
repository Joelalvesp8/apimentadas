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

/**
 * GET /api/sessions/[id]/rounds/history
 * Retorna histórico temporário de todas as rodadas de uma sessão online ATIVA
 * Permite que participantes vejam perguntas e respostas anteriores durante a sessão
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const sessionId = params.id;

    // Verificar se usuário tem acesso à sessão
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Buscar sessão
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        sessionParticipants: true,
      },
    });

    if (!session) {
      return errorResponse('Sessão não encontrada', 404);
    }

    // Verificar se é modo online
    if (session.mode !== 'online') {
      return errorResponse('Esta funcionalidade é apenas para sessões online', 400);
    }

    // Verificar se sessão está ativa (histórico só disponível durante sessão ativa)
    if (session.status !== 'active') {
      return errorResponse('Histórico disponível apenas durante sessões ativas', 400);
    }

    // Verificar se usuário é participante
    const isParticipant = session.sessionParticipants.some(
      (p) => p.profileId === profile.id
    );

    if (!isParticipant) {
      return errorResponse('Você não é participante desta sessão', 403);
    }

    // Buscar todas as rodadas da sessão (completadas e em andamento)
    const rounds = await prisma.onlineRound.findMany({
      where: {
        sessionId,
      },
      include: {
        card: {
          select: {
            id: true,
            content: true,
            category: true,
            difficulty: true,
          },
        },
        answers: {
          include: {
            profile: {
              select: {
                id: true,
                nickname: true,
                user: {
                  select: {
                    id: true,
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
      orderBy: {
        roundNumber: 'asc',
      },
    });

    // Adicionar metadados para cada rodada
    const roundsWithMetadata = rounds.map((round) => {
      const totalParticipants = session.sessionParticipants.length;
      const totalAnswers = round.answers.length;
      const isCompleted = round.status === 'completed';
      const currentUserAnswered = round.answers.some(
        (a) => a.profileId === profile.id
      );

      // Verificar se o usuário pode ver a pergunta
      // Em rodadas completadas, todos podem ver
      // Em rodadas ativas, apenas quem já respondeu ou quem tem a vez pode ver
      const isCurrentUserTurn = round.currentTurnProfileId === profile.id;
      const canSeeQuestion = isCompleted || currentUserAnswered || isCurrentUserTurn;

      // Encontrar quem tem a vez
      const currentTurnProfile = session.sessionParticipants.find(
        (p) => p.profileId === round.currentTurnProfileId
      );

      return {
        ...round,
        metadata: {
          totalParticipants,
          totalAnswers,
          isCompleted,
          currentUserAnswered,
          canSeeQuestion,
          isCurrentUserTurn,
          currentTurnUserNickname: currentTurnProfile
            ? (currentTurnProfile as any).profile?.nickname
            : null,
        },
      };
    });

    return successResponse({
      rounds: roundsWithMetadata,
      totalRounds: rounds.length,
      completedRounds: rounds.filter((r) => r.status === 'completed').length,
      sessionStatus: session.status,
    });
  } catch (error: any) {
    console.error('Error fetching round history:', error);
    return errorResponse('Erro ao buscar histórico de rodadas', 500);
  }
}
