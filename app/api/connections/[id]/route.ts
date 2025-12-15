import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// PUT /api/connections/:id - Accept/Reject connection
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['accepted', 'rejected'].includes(status)) {
      return errorResponse('Status deve ser "accepted" ou "rejected"', 400);
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Get connection
    const connection = await prisma.connection.findUnique({
      where: { id: params.id },
    });

    if (!connection) {
      return errorResponse('Conexão não encontrada', 404);
    }

    // Only the receiver can accept/reject
    if (connection.toId !== profile.id) {
      return errorResponse('Você não pode aceitar/rejeitar esta conexão', 403);
    }

    // Update connection
    const updatedConnection = await prisma.connection.update({
      where: { id: params.id },
      data: { status },
      include: {
        from: {
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
        to: {
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
    });

    return successResponse(updatedConnection);
  } catch (error) {
    console.error('Error in PUT /api/connections/:id:', error);
    return errorResponse('Erro ao atualizar conexão');
  }
}

// DELETE /api/connections/:id - Remove connection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Get connection
    const connection = await prisma.connection.findUnique({
      where: { id: params.id },
    });

    if (!connection) {
      return errorResponse('Conexão não encontrada', 404);
    }

    // Only participants can delete
    if (connection.fromId !== profile.id && connection.toId !== profile.id) {
      return errorResponse('Você não pode remover esta conexão', 403);
    }

    // Delete connection
    await prisma.connection.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Conexão removida com sucesso' });
  } catch (error) {
    console.error('Error in DELETE /api/connections/:id:', error);
    return errorResponse('Erro ao remover conexão');
  }
}
