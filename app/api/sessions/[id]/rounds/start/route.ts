import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// POST /api/sessions/:id/rounds/start - Start new round in online session
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

    // Get session and verify it's online mode
    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        sessionParticipants: true,
        onlineRounds: {
          orderBy: { roundNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!session) {
      return errorResponse('Sessão não encontrada', 404);
    }

    if (session.mode !== 'online') {
      return errorResponse('Esta funcionalidade é apenas para sessões online', 400);
    }

    // Verify user is participant
    const isParticipant = session.sessionParticipants.some(
      (p) => p.profileId === profile.id
    );

    if (!isParticipant) {
      return errorResponse('Você não é participante desta sessão', 403);
    }

    // Check if there's a current round that isn't completed
    if (session.currentRoundId) {
      const currentRound = await prisma.onlineRound.findUnique({
        where: { id: session.currentRoundId },
        include: {
          answers: true,
        },
      });

      if (currentRound && currentRound.status === 'waiting') {
        const participantCount = session.sessionParticipants.length;
        const answersCount = currentRound.answers.length;

        return errorResponse(
          `Ainda há participantes que não responderam (${answersCount}/${participantCount})`,
          400
        );
      }
    }

    // Get next round number
    const lastRound = session.onlineRounds[0];
    const nextRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

    // Determine who should pick the card this round (alternating turns)
    // Get all participants ordered by join time for consistent turn order
    const participants = await prisma.sessionParticipant.findMany({
      where: { sessionId: session.id },
      orderBy: { joinedAt: 'asc' },
      select: { profileId: true },
    });

    if (participants.length === 0) {
      return errorResponse('Nenhum participante encontrado', 404);
    }

    // Calculate whose turn it is based on round number
    // Round 1 -> participant 0, Round 2 -> participant 1, etc.
    const turnIndex = (nextRoundNumber - 1) % participants.length;
    const currentTurnProfileId = participants[turnIndex].profileId;

    console.log('[START ROUND] Turn assignment:', {
      roundNumber: nextRoundNumber,
      totalParticipants: participants.length,
      turnIndex,
      currentTurnProfileId,
    });

    // Get all cards already played in this session to avoid repetition
    const playedCardIds = await prisma.onlineRound.findMany({
      where: { sessionId: session.id },
      select: { cardId: true },
    }).then((rounds) => rounds.map((r) => r.cardId));

    // Map sessionType (singular) to card category (plural)
    // sessionType: "casal" | "trisal" | "grupo" | "solteiro"
    // card category: "casais" | "trios" | "grupos" | "solteiros"
    const categoryMap: Record<string, string> = {
      casal: 'casais',
      trisal: 'trios',
      grupo: 'grupos',
      solteiro: 'solteiros',
    };

    const cardCategory = categoryMap[session.sessionType] || session.sessionType;

    // Find random question card (excluding already played cards)
    // Online mode uses ONLY "pergunta" type cards
    console.log('[START ROUND] Looking for cards with:', {
      type: 'pergunta',
      sessionType: session.sessionType,
      cardCategory,
      playedCardIds,
      playedCount: playedCardIds.length,
    });

    // First, count available cards (official + user-created)
    const availableCardsCount = await prisma.card.count({
      where: {
        type: 'pergunta',
        category: cardCategory,
        // Removed isOfficial filter to include user-created cards
        id: {
          notIn: playedCardIds,
        },
      },
    });

    console.log('[START ROUND] Available cards count:', availableCardsCount);

    if (availableCardsCount === 0) {
      return errorResponse(
        'Todas as cartas desta categoria já foram jogadas!',
        404
      );
    }

    // Random skip based on actual available cards
    const randomSkip = Math.floor(Math.random() * availableCardsCount);

    const card = await prisma.card.findFirst({
      where: {
        type: 'pergunta', // CRITICAL: Only questions in online mode
        category: cardCategory, // FIXED: Use mapped category (plural)
        // Removed isOfficial filter to include user-created cards
        id: {
          notIn: playedCardIds, // CRITICAL: Exclude already played cards
        },
      },
      skip: randomSkip, // FIXED: Skip based on actual count, not hardcoded 100
    });

    console.log('[START ROUND] Card found:', card ? { id: card.id, content: card.content.substring(0, 50) } : null);

    if (!card) {
      console.error('[START ROUND] No card found despite count check!', {
        availableCardsCount,
        playedCards: playedCardIds.length,
        sessionType: session.sessionType,
        cardCategory,
        randomSkip,
      });

      return errorResponse(
        `Erro ao buscar carta. Disponíveis: ${availableCardsCount}, Já jogadas: ${playedCardIds.length}`,
        500
      );
    }

    // Create new round
    const newRound = await prisma.onlineRound.create({
      data: {
        sessionId: session.id,
        cardId: card.id,
        roundNumber: nextRoundNumber,
        currentTurnProfileId, // Define de quem é a vez de virar a carta
        status: 'waiting',
      },
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
        },
      },
    });

    // Update session currentRoundId
    await prisma.gameSession.update({
      where: { id: session.id },
      data: {
        currentRoundId: newRound.id,
      },
    });

    return successResponse(newRound, 201);
  } catch (error: any) {
    console.error('Error starting round:', error);
    return errorResponse('Erro ao iniciar rodada', 500);
  }
}
