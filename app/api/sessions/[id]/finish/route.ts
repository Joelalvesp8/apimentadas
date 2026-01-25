import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// POST /api/sessions/:id/finish
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Get session
    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
      include: {
        sessionParticipants: {
          include: {
            profile: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!session) {
      return errorResponse('Sessão não encontrada', 404);
    }

    if (session.status !== 'active') {
      return errorResponse('Sessão já foi finalizada', 400);
    }

    // Check if user is creator or participant
    const isParticipant = session.sessionParticipants.some(
      (p) => p.profile.userId === user.id
    );

    if (!isParticipant && session.creatorId !== user.id) {
      return errorResponse('Você não pode finalizar esta sessão', 403);
    }

    // Finish session and update participant stats in transaction
    const finishedSession = await prisma.$transaction(async (tx) => {
      // 1. Mark session as finished
      const updated = await tx.gameSession.update({
        where: { id: params.id },
        data: {
          status: 'finished',
          finishedAt: new Date(),
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
          playedCards: {
            include: {
              card: true,
            },
          },
        },
      });

      // 2. Update stats for each participant
      for (const participant of updated.sessionParticipants) {
        const profileId = participant.profileId;

        // Get all finished sessions where this profile participated
        const allFinishedSessions = await tx.gameSession.findMany({
          where: {
            status: 'finished',
            sessionParticipants: {
              some: {
                profileId: profileId,
              },
            },
          },
          select: {
            id: true,
            averageRating: true,
          },
        });

        // Calculate overall average rating across all sessions
        const sessionsWithRating = allFinishedSessions.filter(s => s.averageRating !== null);
        const totalRating = sessionsWithRating.reduce((sum, s) => sum + (s.averageRating || 0), 0);
        const averageRating = sessionsWithRating.length > 0
          ? totalRating / sessionsWithRating.length
          : null;

        // Update profile
        await tx.profile.update({
          where: { id: profileId },
          data: {
            sessionsPlayed: allFinishedSessions.length,
            averageRating: averageRating,
            lastActiveAt: new Date(),
          },
        });
      }

      return updated;
    });

    return successResponse(finishedSession);
  } catch (error) {
    console.error('Error in POST /api/sessions/:id/finish:', error);
    return errorResponse('Erro ao finalizar sessão');
  }
}
