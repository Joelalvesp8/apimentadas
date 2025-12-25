import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// POST /api/cards/:id/like - Like a card
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
      // Already liked
      return successResponse({ message: 'Carta já curtida', liked: true });
    }

    // Like
    await prisma.cardLike.create({
      data: {
        userId: user.id,
        cardId: params.id,
      },
    });

    return successResponse({ message: 'Carta curtida', liked: true });
  } catch (error) {
    console.error('Error in POST /api/cards/:id/like:', error);
    return errorResponse('Erro ao curtir carta');
  }
}

// DELETE /api/cards/:id/like - Unlike a card
export async function DELETE(
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

    // Check if liked
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
    }

    // Not liked yet
    return successResponse({ message: 'Carta não estava curtida', liked: false });
  } catch (error) {
    console.error('Error in DELETE /api/cards/:id/like:', error);
    return errorResponse('Erro ao remover curtida');
  }
}
