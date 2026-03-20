import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const inviteSchema = z.object({
  receiverId: z.string(),
  sessionType: z.enum(['casal', 'trisal', 'grupo']),
  message: z.string().optional(),
});

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// POST /api/invitations - Send session invitation
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();
    const { receiverId, sessionType, message } = inviteSchema.parse(body);

    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!currentProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Can't invite yourself
    if (currentProfile.id === receiverId) {
      return errorResponse('Você não pode convidar a si mesmo', 400);
    }

    // Check if receiver exists
    const receiver = await prisma.profile.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return errorResponse('Usuário não encontrado', 404);
    }

    // Create invitation
    const invitation = await prisma.sessionInvitation.create({
      data: {
        senderId: currentProfile.id,
        receiverId,
        sessionType,
        message,
        status: 'pending',
      },
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

    return successResponse(invitation, 201);
  } catch (error: any) {
    console.error('Error creating invitation:', error);
    return errorResponse('Erro ao criar convite', 500);
  }
}

// GET /api/invitations - Get user's invitations
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!currentProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'received' | 'sent'

    const invitations = await prisma.sessionInvitation.findMany({
      where: type === 'received'
        ? { receiverId: currentProfile.id }
        : { senderId: currentProfile.id },
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
      orderBy: { createdAt: 'desc' },
    });

    return successResponse(invitations);
  } catch (error: any) {
    console.error('Error fetching invitations:', error);
    return errorResponse('Erro ao buscar convites', 500);
  }
}
