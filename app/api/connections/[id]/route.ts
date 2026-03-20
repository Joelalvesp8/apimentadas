import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const updateSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// PATCH /api/connections/:id - Accept or reject connection request
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { status } = updateSchema.parse(body);

    // Get current user's profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!currentProfile) {
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
    if (connection.toId !== currentProfile.id) {
      return errorResponse('Você não pode modificar esta conexão', 403);
    }

    // Update connection status
    const updatedConnection = await prisma.connection.update({
      where: { id: params.id },
      data: { status },
      include: {
        from: {
          select: {
            id: true,
            nickname: true,
            userId: true,
            user: { select: { image: true } },
          },
        },
        to: {
          select: {
            id: true,
            nickname: true,
            user: { select: { image: true } },
          },
        },
      },
    });

    // Notify the requester when their request is accepted
    if (status === 'accepted') {
      await prisma.notification.create({
        data: {
          userId: updatedConnection.from.userId,
          type: 'connection_accepted',
          message: `@${currentProfile.nickname} aceitou sua solicitação de conexão`,
          data: { fromProfileId: currentProfile.id, fromNickname: currentProfile.nickname },
        },
      }).catch(() => {});
    }

    return successResponse(updatedConnection);
  } catch (error: any) {
    console.error('Error updating connection:', error);
    return errorResponse('Erro ao atualizar conexão', 500);
  }
}

// DELETE /api/connections/:id - Remove connection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Get current user's profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!currentProfile) {
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
    if (connection.fromId !== currentProfile.id && connection.toId !== currentProfile.id) {
      return errorResponse('Você não pode deletar esta conexão', 403);
    }

    // Delete connection
    await prisma.connection.delete({
      where: { id: params.id },
    });

    return successResponse({ message: 'Conexão removida com sucesso' });
  } catch (error: any) {
    console.error('Error deleting connection:', error);
    return errorResponse('Erro ao remover conexão', 500);
  }
}
