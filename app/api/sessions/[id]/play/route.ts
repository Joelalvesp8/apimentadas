import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/utils/responses';
import { playCardSchema } from '@/lib/validations/session';

// POST /api/sessions/:id/play - Pick a card (turn-based)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Get user's profile
    const userProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!userProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    const body = await request.json();

    // Validate input
    const validation = playCardSchema.safeParse(body);
    if (!validation.success) {
      const errors: Record<string, string[]> = {};
      validation.error.errors.forEach((err) => {
        const path = err.path[0] as string;
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return validationErrorResponse(errors);
    }

    const { cardId, qualitativeRating } = validation.data;

    // Get session with participants
    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        sessionParticipants: {
          include: {
            profile: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            joinedAt: 'asc',
          },
        },
        playedCards: {
          orderBy: {
            playedAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!session) {
      return errorResponse('Sessão não encontrada', 404);
    }

    if (session.status !== 'active') {
      return errorResponse('Sessão não está ativa', 400);
    }

    // Check if user is participant
    const userParticipant = session.sessionParticipants.find(
      (p) => p.profile.userId === user.id
    );

    if (!userParticipant) {
      return errorResponse('Você não é participante desta sessão', 403);
    }

    // Check if it's user's turn to pick a card
    if (session.currentTurnProfileId !== userProfile.id) {
      return errorResponse('Não é sua vez de pegar uma carta', 403);
    }

    // Check if card exists (can be official card or user-created card)
    const officialCard = await prisma.card.findUnique({
      where: { id: cardId },
    });

    const userCard = !officialCard ? await prisma.userCard.findUnique({
      where: { id: cardId },
    }) : null;

    if (!officialCard && !userCard) {
      return errorResponse('Carta não encontrada', 404);
    }

    // Determine who should answer (next participant in rotation)
    const currentIndex = session.sessionParticipants.findIndex(
      (p) => p.profileId === session.currentTurnProfileId
    );
    const nextIndex = (currentIndex + 1) % session.sessionParticipants.length;
    const answererProfileId = session.sessionParticipants[nextIndex].profileId;

    // Play card and update turn in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create played card
      const playedCard = await tx.playedCard.create({
        data: {
          sessionId: params.id,
          cardId,
          pickedByProfileId: userProfile.id,
          answeredByProfileId: answererProfileId,
          qualitativeRating,
        },
        include: {
          card: true,
        },
      });

      // Calculate next turn (move to answerer for next round)
      // The person who answered becomes the next one to pick a card
      const nextTurnProfileId = answererProfileId;

      // Update session stats and turn
      const allPlayedCards = await tx.playedCard.findMany({
        where: { sessionId: params.id },
      });

      const cardsPlayed = allPlayedCards.length;
      // Convert qualitativeRating to numeric value: ruim=1, satisfatoria=3, excelente=5
      const qualitativeToNum = (r: string | null): number | null =>
        r === 'ruim' ? 1 : r === 'satisfatoria' ? 3 : r === 'excelente' ? 5 : null;
      const ratingsWithValue = allPlayedCards
        .map((pc) => qualitativeToNum(pc.qualitativeRating))
        .filter((v): v is number => v !== null);
      const ratingsSum = ratingsWithValue.reduce((sum, v) => sum + v, 0);
      const ratingsCount = ratingsWithValue.length;
      const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : null;

      const updatedSession = await tx.gameSession.update({
        where: { id: params.id },
        data: {
          cardsPlayed,
          averageRating,
          currentTurnProfileId: nextTurnProfileId,
        },
        include: {
          sessionParticipants: {
            include: {
              profile: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              joinedAt: 'asc',
            },
          },
        },
      });

      return { playedCard, session: updatedSession };
    });

    return successResponse(result);
  } catch (error) {
    console.error('Error in POST /api/sessions/:id/play:', error);
    return errorResponse('Erro ao jogar carta');
  }
}
