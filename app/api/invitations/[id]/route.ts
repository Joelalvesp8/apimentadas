import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const updateSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled']),
});

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// PATCH /api/invitations/:id - Update invitation status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { status } = updateSchema.parse(body);

    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!currentProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    const invitation = await prisma.sessionInvitation.findUnique({
      where: { id: params.id },
    });

    if (!invitation) {
      return errorResponse('Convite não encontrado', 404);
    }

    // Only receiver can accept/reject, only sender can cancel
    if (status === 'cancelled' && invitation.senderId !== currentProfile.id) {
      return errorResponse('Apenas o remetente pode cancelar o convite', 403);
    }

    if ((status === 'accepted' || status === 'rejected') && invitation.receiverId !== currentProfile.id) {
      return errorResponse('Apenas o destinatário pode aceitar/rejeitar', 403);
    }

    const updatedInvitation = await prisma.sessionInvitation.update({
      where: { id: params.id },
      data: { status },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            user: { select: { image: true } },
          },
        },
        receiver: {
          select: {
            id: true,
            nickname: true,
            user: { select: { image: true } },
          },
        },
      },
    });

    return successResponse(updatedInvitation);
  } catch (error: any) {
    console.error('Error updating invitation:', error);
    return errorResponse('Erro ao atualizar convite', 500);
  }
}
