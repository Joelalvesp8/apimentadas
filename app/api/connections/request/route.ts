import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const requestSchema = z.object({
  toProfileId: z.string(),
});

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}

// POST /api/connections/request - Request connection with another user
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { toProfileId } = requestSchema.parse(body);

    // Get current user's profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!currentProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Can't connect to yourself
    if (currentProfile.id === toProfileId) {
      return errorResponse('Você não pode se conectar consigo mesmo', 400);
    }

    // Check if target profile exists
    const targetProfile = await prisma.profile.findUnique({
      where: { id: toProfileId },
    });

    if (!targetProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Check if connection already exists
    const existingConnection = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromId: currentProfile.id, toId: toProfileId },
          { fromId: toProfileId, toId: currentProfile.id },
        ],
      },
    });

    if (existingConnection) {
      if (existingConnection.status === 'accepted') {
        return errorResponse('Vocês já estão conectados', 400);
      } else if (existingConnection.status === 'pending') {
        return errorResponse('Já existe uma solicitação pendente', 400);
      }
    }

    // Create connection request
    const connection = await prisma.connection.create({
      data: {
        fromId: currentProfile.id,
        toId: toProfileId,
        status: 'pending',
      },
      include: {
        from: {
          select: {
            id: true,
            nickname: true,
            user: { select: { image: true } },
          },
        },
        to: {
          select: {
            id: true,
            nickname: true,
            userId: true,
            user: { select: { image: true } },
          },
        },
      },
    });

    // Create notification for the recipient
    await prisma.notification.create({
      data: {
        userId: connection.to.userId,
        type: 'connection_request',
        message: `@${currentProfile.nickname} quer se conectar com você`,
        data: { fromProfileId: currentProfile.id, fromNickname: currentProfile.nickname },
      },
    }).catch(() => {}); // Don't fail the request if notification fails

    return successResponse(connection, 201);
  } catch (error: any) {
    console.error('Error requesting connection:', error);
    return errorResponse('Erro ao solicitar conexão', 500);
  }
}
