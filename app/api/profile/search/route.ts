import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { errorResponse, successResponse, unauthorizedResponse } from '@/lib/utils/responses';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/profile/search?q=nickname
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return errorResponse('Query deve ter no mínimo 2 caracteres', 400);
    }

    // Search profiles by nickname
    const profiles = await prisma.profile.findMany({
      where: {
        nickname: {
          contains: query,
          mode: 'insensitive',
        },
        userId: {
          not: user.id, // Exclude current user
        },
      },
      select: {
        id: true,
        userId: true,
        nickname: true,
        bio: true,
        orientation: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      take: 20, // Limit to 20 results
    });

    return successResponse(profiles);
  } catch (error) {
    console.error('Error in GET /api/profile/search:', error);
    return errorResponse('Erro ao buscar perfis');
  }
}
