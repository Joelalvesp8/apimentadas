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

// GET /api/users/explore - List active users for social discovery
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
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'activity'; // 'activity' | 'rating'

    // Build where clause
    const whereClause: any = {
      id: { not: currentProfile.id }, // Exclude current user
    };

    // Add search filter if provided
    if (search) {
      whereClause.nickname = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Build orderBy clause
    let orderBy: any;
    if (sortBy === 'rating') {
      orderBy = [
        { averageRating: 'desc' as const },
        { sessionsPlayed: 'desc' as const },
      ];
    } else {
      // Default: sort by activity
      orderBy = [
        { lastActiveAt: 'desc' as const },
        { sessionsPlayed: 'desc' as const },
      ];
    }

    // Fetch users
    const users = await prisma.profile.findMany({
      where: whereClause,
      orderBy,
      take: 50, // Limit to 50 users
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
          },
        },
      },
    });

    // Transform data for response (name is private - only nickname is public)
    const transformedUsers = users.map((profile) => ({
      id: profile.id,
      nickname: profile.nickname,
      image: profile.user.image,
      bio: profile.bio,
      orientation: profile.orientation,
      sessionsPlayed: profile.sessionsPlayed,
      averageRating: profile.averageRating,
      lastActiveAt: profile.lastActiveAt,
      memberSince: profile.createdAt,
    }));

    return successResponse(transformedUsers);
  } catch (error: any) {
    console.error('Error fetching users for explore:', error);
    return errorResponse('Erro ao buscar usuários', 500);
  }
}
