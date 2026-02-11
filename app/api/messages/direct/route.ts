import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/utils/responses';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Validation schema
const sendDirectMessageSchema = z.object({
  receiverId: z.string().min(1, 'ID do destinatário é obrigatório'),
  message: z.string().min(1, 'Mensagem é obrigatória').max(500, 'Mensagem deve ter no máximo 500 caracteres'),
});

// POST /api/messages/direct - Send a direct message
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Get current user's profile
    const senderProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!senderProfile) {
      return errorResponse('Perfil do remetente não encontrado', 404);
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = sendDirectMessageSchema.safeParse(body);

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

    const { receiverId, message } = validation.data;

    // Check if receiver exists
    const receiverProfile = await prisma.profile.findUnique({
      where: { id: receiverId },
    });

    if (!receiverProfile) {
      return errorResponse('Destinatário não encontrado', 404);
    }

    // Don't allow sending message to self
    if (senderProfile.id === receiverId) {
      return errorResponse('Você não pode enviar mensagem para si mesmo', 400);
    }

    // Check if they already have a connection
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { fromId: senderProfile.id, toId: receiverId, status: 'accepted' },
          { fromId: receiverId, toId: senderProfile.id, status: 'accepted' },
        ],
      },
    });

    if (connection) {
      return errorResponse('Vocês já são conectados. Use o chat de conexões.', 400);
    }

    // Check if sender has already sent a message to this receiver recently (last 24 hours)
    const recentMessage = await prisma.directMessage.findFirst({
      where: {
        senderId: senderProfile.id,
        receiverId: receiverId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
        },
      },
    });

    if (recentMessage) {
      return errorResponse('Você já enviou uma mensagem para este usuário. Aguarde 24 horas.', 429);
    }

    // Create the direct message
    const directMessage = await prisma.directMessage.create({
      data: {
        senderId: senderProfile.id,
        receiverId: receiverId,
        message,
      },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return successResponse(
      {
        id: directMessage.id,
        senderId: directMessage.senderId,
        receiverId: directMessage.receiverId,
        message: directMessage.message,
        read: directMessage.read,
        createdAt: directMessage.createdAt,
        sender: {
          id: directMessage.sender.id,
          nickname: directMessage.sender.nickname,
          image: directMessage.sender.user.image,
        },
      },
      201
    );
  } catch (error: any) {
    console.error('Error sending direct message:', error);
    return errorResponse('Erro ao enviar mensagem', 500);
  }
}

// GET /api/messages/direct - Get direct messages (inbox)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Get current user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'received'; // 'received' | 'sent'

    const messages = await prisma.directMessage.findMany({
      where:
        type === 'sent'
          ? { senderId: profile.id }
          : { receiverId: profile.id },
      include: {
        sender: {
          select: {
            id: true,
            nickname: true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            nickname: true,
            user: {
              select: {
                image: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 most recent messages
    });

    const formattedMessages = messages.map((msg) => ({
      id: msg.id,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      message: msg.message,
      read: msg.read,
      createdAt: msg.createdAt,
      sender: {
        id: msg.sender.id,
        nickname: msg.sender.nickname,
        image: msg.sender.user.image,
      },
      receiver: {
        id: msg.receiver.id,
        nickname: msg.receiver.nickname,
        image: msg.receiver.user.image,
      },
    }));

    return successResponse({ messages: formattedMessages });
  } catch (error: any) {
    console.error('Error fetching direct messages:', error);
    return errorResponse('Erro ao buscar mensagens', 500);
  }
}
