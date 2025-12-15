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

// POST /api/sessions/:id/play
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
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

    const { cardId, rating } = validation.data;

    // Get session
    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        sessionParticipants: true,
        playedCards: true,
      },
    });

    if (!session) {
      return errorResponse('Sessão não encontrada', 404);
    }

    if (session.status !== 'active') {
      return errorResponse('Sessão não está ativa', 400);
    }

    // Check if user is participant
    const isParticipant = session.sessionParticipants.some(
      (p) => p.profile.userId === user.id
    );

    if (!isParticipant && session.creatorId !== user.id) {
      return errorResponse('Você não é participante desta sessão', 403);
    }

    // Check if card exists
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return errorResponse('Carta não encontrada', 404);
    }

    // Play card and update session stats in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create played card
      const playedCard = await tx.playedCard.create({
        data: {
          sessionId: params.id,
          cardId,
          rating,
        },
      });

      // Update session stats
      const allPlayedCards = await tx.playedCard.findMany({
        where: { sessionId: params.id },
      });

      const cardsPlayed = allPlayedCards.length;
      const ratingsSum = allPlayedCards.reduce(
        (sum, pc) => sum + (pc.rating || 0),
        0
      );
      const ratingsCount = allPlayedCards.filter((pc) => pc.rating !== null).length;
      const averageRating = ratingsCount > 0 ? ratingsSum / ratingsCount : null;

      const updatedSession = await tx.gameSession.update({
        where: { id: params.id },
        data: {
          cardsPlayed,
          averageRating,
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
