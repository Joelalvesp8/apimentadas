import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';

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

// GET /api/users/:nickname/profile - Get public profile by nickname
export async function GET(
  request: NextRequest,
  { params }: { params: { nickname: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Get target profile by nickname
    const profile = await prisma.profile.findUnique({
      where: { nickname: params.nickname },
      select: {
        id: true,
        nickname: true,
        bio: true,
        orientation: true,
        sessionsPlayed: true,
        averageRating: true,
        lastActiveAt: true,
        createdAt: true,
        user: {
          select: {
            image: true,
            // DO NOT expose email, name or other sensitive data
          },
        },
      },
    });

    if (!profile) {
      return errorResponse('Usuário não encontrado', 404);
    }

    // Get recent sessions (last 10, without card details for privacy)
    const recentSessions = await prisma.gameSession.findMany({
      where: {
        sessionParticipants: {
          some: {
            profileId: profile.id,
          },
        },
        status: 'finished',
      },
      orderBy: {
        finishedAt: 'desc',
      },
      take: 10,
      select: {
        id: true,
        sessionType: true,
        mode: true,
        cardsPlayed: true,
        averageRating: true,
        finishedAt: true,
        createdAt: true,
        sessionParticipants: {
          select: {
            profile: {
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
        },
      },
    });

    // Check if current user is connected to this profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    let isConnected = false;
    if (currentProfile) {
      const connection = await prisma.connection.findFirst({
        where: {
          OR: [
            {
              fromId: currentProfile.id,
              toId: profile.id,
              status: 'accepted',
            },
            {
              fromId: profile.id,
              toId: currentProfile.id,
              status: 'accepted',
            },
          ],
        },
      });
      isConnected = !!connection;
    }

    // Build response (name is private - only nickname is public)
    const publicProfile = {
      id: profile.id,
      nickname: profile.nickname,
      image: profile.user.image,
      bio: profile.bio,
      orientation: profile.orientation,
      sessionsPlayed: profile.sessionsPlayed,
      averageRating: profile.averageRating,
      lastActiveAt: profile.lastActiveAt,
      memberSince: profile.createdAt,
      isConnected,
      recentSessions: recentSessions.map((session) => ({
        id: session.id,
        sessionType: session.sessionType,
        mode: session.mode,
        cardsPlayed: session.cardsPlayed,
        averageRating: session.averageRating,
        finishedAt: session.finishedAt,
        createdAt: session.createdAt,
        participantCount: session.sessionParticipants.length,
        participants: session.sessionParticipants.map((p) => ({
          id: p.profile.id,
          nickname: p.profile.nickname,
          image: p.profile.user.image,
        })),
      })),
    };

    return successResponse(publicProfile);
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return errorResponse('Erro ao buscar perfil do usuário', 500);
  }
}
