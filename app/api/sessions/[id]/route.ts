import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// GET /api/sessions/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: {
            id: true,
            image: true,
          },
        },
        sessionParticipants: {
          include: {
            profile: {
              include: {
                user: {
                  select: {
                    id: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
        playedCards: {
          include: {
            card: true,
          },
          orderBy: {
            playedAt: 'desc',
          },
        },
      },
    });

    if (!session) {
      return errorResponse('Sessão não encontrada', 404);
    }

    // Check if user is participant
    const isParticipant = session.sessionParticipants.some(
      (p) => p.profile.userId === user.id
    );

    if (!isParticipant && session.creatorId !== user.id) {
      return errorResponse('Você não é participante desta sessão', 403);
    }

    return successResponse(session);
  } catch (error) {
    console.error('Error in GET /api/sessions/:id:', error);
    return errorResponse('Erro ao buscar sessão');
  }
}
