import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function successResponse(data: any, status = 200) {
  return NextResponse.json({ data }, { status });
}

function errorResponse(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

// GET /api/explore - Explore users (tipo Instagram)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    // Get current user's profile
    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!currentProfile) {
      return errorResponse('Perfil não encontrado', 404);
    }

    // Get query params
    const { searchParams } = new URL(request.url);
    const orientation = searchParams.get('orientation'); // Filtrar por orientação
    const sex = searchParams.get('sex'); // Filtrar por gênero
    const search = searchParams.get('search'); // Buscar por nickname
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      id: {
        not: currentProfile.id, // Não mostrar o próprio perfil
      },
      user: {
        approved: true,
      },
    };

    if (orientation) {
      where.orientation = orientation;
    }

    if (sex) {
      where.sex = sex;
    }

    if (search) {
      where.OR = [
        { nickname: { contains: search, mode: 'insensitive' } },
        { bio: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get users
    const users = await prisma.profile.findMany({
      where,
      select: {
        id: true,
        nickname: true,
        bio: true,
        orientation: true,
        sex: true,
        sessionsPlayed: true,
        averageRating: true,
        lastActiveAt: true,
        user: {
          select: {
            image: true,
          },
        },
        // Check connection status with current user
        connectionsFrom: {
          where: {
            toId: currentProfile.id,
          },
          select: {
            status: true,
          },
        },
        connectionsTo: {
          where: {
            fromId: currentProfile.id,
          },
          select: {
            status: true,
          },
        },
      },
      orderBy: [
        { lastActiveAt: 'desc' }, // Usuários mais ativos primeiro
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });

    // Transform data to include connection status
    const usersWithConnectionStatus = users.map((user) => {
      let connectionStatus = 'none'; // 'none' | 'pending' | 'connected'

      // Check if current user sent connection to this user
      if (user.connectionsTo.length > 0) {
        connectionStatus = user.connectionsTo[0].status === 'accepted' ? 'connected' : 'pending_sent';
      }
      // Check if this user sent connection to current user
      else if (user.connectionsFrom.length > 0) {
        connectionStatus = user.connectionsFrom[0].status === 'accepted' ? 'connected' : 'pending_received';
      }

      return {
        id: user.id,
        nickname: user.nickname,
        bio: user.bio,
        orientation: user.orientation,
        sex: user.sex,
        sessionsPlayed: user.sessionsPlayed,
        averageRating: user.averageRating,
        image: user.user?.image,
        lastActiveAt: user.lastActiveAt,
        connectionStatus,
      };
    });

    // Get total count for pagination
    const totalCount = await prisma.profile.count({ where });

    return successResponse({
      users: usersWithConnectionStatus,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching explore users:', error);
    return errorResponse('Erro ao buscar usuários', 500);
  }
}
