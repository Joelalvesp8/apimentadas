import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { createOnlineSessionSchema } from '@/lib/validations/session';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function unauthorizedResponse() {
  return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
}

// POST /api/sessions/online - Create online game session
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const body = await request.json();

    // Validate request
    const validatedData = createOnlineSessionSchema.parse(body);
    const { participantIds, difficulty, sessionType: requestedSessionType } = validatedData;

    // Get user's profile
    const creatorProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!creatorProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Validate all participant profiles exist
    const participantProfiles = await prisma.profile.findMany({
      where: {
        id: { in: participantIds },
      },
    });

    if (participantProfiles.length !== participantIds.length) {
      return errorResponse('Um ou mais participantes não foram encontrados', 404);
    }

    // Ensure creator is included in participants
    if (!participantIds.includes(creatorProfile.id)) {
      participantIds.push(creatorProfile.id);
    }

    // Determine session type: use requested type or auto-determine based on participant count
    let sessionType: string;

    if (requestedSessionType) {
      // Use explicitly requested session type (e.g., 'solteiro' for singles mixer)
      sessionType = requestedSessionType;
    } else {
      // Auto-determine based on participant count
      const participantCount = participantIds.length;

      if (participantCount === 2) {
        sessionType = 'casal';
      } else if (participantCount === 3) {
        sessionType = 'trisal';
      } else {
        sessionType = 'grupo';
      }
    }

    // Create online session
    const session = await prisma.gameSession.create({
      data: {
        creatorId: user.id,
        sessionType,
        mode: 'online',
        status: 'active',
        sessionParticipants: {
          create: participantIds.map((profileId) => ({
            profileId,
          })),
        },
      },
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
              select: {
                id: true,
                nickname: true,
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
      },
    });

    return successResponse(session, 201);
  } catch (error: any) {
    console.error('Error creating online session:', error);

    if (error instanceof ZodError) {
      return errorResponse(error.errors[0].message, 400);
    }

    return errorResponse('Erro ao criar sessão online', 500);
  }
}
