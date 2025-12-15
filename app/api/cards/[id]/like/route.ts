import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// POST /api/cards/:id/like
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Check if card exists
    const card = await prisma.card.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return errorResponse('Carta não encontrada', 404);
    }

    // Check if already liked
    const existingLike = await prisma.cardLike.findFirst({
      where: {
        userId: user.id,
        cardId: params.id,
      },
    });

    if (existingLike) {
      // Unlike
      await prisma.cardLike.delete({
        where: { id: existingLike.id },
      });

      return successResponse({ message: 'Like removido', liked: false });
    } else {
      // Like
      await prisma.cardLike.create({
        data: {
          userId: user.id,
          cardId: params.id,
        },
      });

      return successResponse({ message: 'Carta curtida', liked: true });
    }
  } catch (error) {
    console.error('Error in POST /api/cards/:id/like:', error);
    return errorResponse('Erro ao curtir carta');
  }
}
