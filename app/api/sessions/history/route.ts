import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// GET /api/sessions/history
export async function GET(request: NextRequest) {
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

    // Get sessions where user is creator or participant
    const sessions = await prisma.gameSession.findMany({
      where: {
        OR: [
          { creatorId: user.id },
          {
            sessionParticipants: {
              some: {
                profileId: profile.id,
              },
            },
          },
        ],
        status: 'finished',
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
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
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        finishedAt: 'desc',
      },
    });

    return successResponse(sessions);
  } catch (error) {
    console.error('Error in GET /api/sessions/history:', error);
    return errorResponse('Erro ao buscar histórico de sessões');
  }
}
