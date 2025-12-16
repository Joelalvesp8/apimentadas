import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// PATCH /api/admin/user-cards/:id - Approve or reject a card
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user is admin
    if (!isAdmin(user)) {
      return errorResponse('Acesso negado. Apenas administradores podem aprovar cartas.', 403);
    }

    const body = await request.json();
    const { approved } = body;

    if (typeof approved !== 'boolean') {
      return errorResponse('Campo "approved" é obrigatório e deve ser boolean', 400);
    }

    // Check if card exists
    const card = await prisma.userCard.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return errorResponse('Carta não encontrada', 404);
    }

    // Update card
    const updatedCard = await prisma.userCard.update({
      where: { id: params.id },
      data: { approved },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return successResponse(updatedCard);
  } catch (error) {
    console.error('Error in PATCH /api/admin/user-cards/:id:', error);
    return errorResponse('Erro ao atualizar carta');
  }
}

// DELETE /api/admin/user-cards/:id - Delete a card
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user is admin
    if (!isAdmin(user)) {
      return errorResponse('Acesso negado. Apenas administradores podem excluir cartas.', 403);
    }

    // Check if card exists
    const card = await prisma.userCard.findUnique({
      where: { id: params.id },
    });

    if (!card) {
      return errorResponse('Carta não encontrada', 404);
    }

    // Delete card
    await prisma.userCard.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Carta excluída com sucesso' });
  } catch (error) {
    console.error('Error in DELETE /api/admin/user-cards/:id:', error);
    return errorResponse('Erro ao excluir carta');
  }
}
