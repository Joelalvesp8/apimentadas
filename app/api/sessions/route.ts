import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from '@/lib/utils/responses';
import { createSessionSchema } from '@/lib/validations/session';

// POST /api/sessions - Create game session
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const body = await request.json();

    // Validate input
    const validation = createSessionSchema.safeParse(body);
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

    const { participantIds } = validation.data;

    // Get user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Verify all participants exist and are connected
    const participants = await prisma.profile.findMany({
      where: {
        id: {
          in: participantIds,
        },
      },
    });

    if (participants.length !== participantIds.length) {
      return errorResponse('Um ou mais participantes não foram encontrados', 404);
    }

    // Determine session type based on total participants (including creator)
    const totalParticipants = participantIds.length + 1; // +1 for creator
    let sessionType: string;

    if (totalParticipants === 2) {
      sessionType = 'casal';
    } else if (totalParticipants === 3) {
      sessionType = 'trisal';
    } else {
      sessionType = 'grupo';
    }

    // Create session with participants in a transaction
    const session = await prisma.$transaction(async (tx) => {
      // Create session with first turn set to creator
      const newSession = await tx.gameSession.create({
        data: {
          creatorId: user.id,
          sessionType,
          status: 'active',
          currentTurnProfileId: profile.id, // Creator starts the game
        },
      });

      // Add creator as participant
      await tx.sessionParticipant.create({
        data: {
          sessionId: newSession.id,
          profileId: profile.id,
        },
      });

      // Add other participants
      for (const participantId of participantIds) {
        await tx.sessionParticipant.create({
          data: {
            sessionId: newSession.id,
            profileId: participantId,
          },
        });
      }

      return newSession;
    });

    // Fetch complete session data
    const completeSession = await prisma.gameSession.findUnique({
      where: { id: session.id },
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
    });

    return successResponse(completeSession, 201);
  } catch (error) {
    console.error('Error in POST /api/sessions:', error);
    return errorResponse('Erro ao criar sessão');
  }
}
