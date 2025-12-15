import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// GET /api/user-cards/popular
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;

    // Build where clause
    const where: any = {
      approved: true, // Only approved cards
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    // Get popular user cards
    const userCards = await prisma.userCard.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        likesCount: 'desc',
      },
      take: 20,
    });

    return successResponse(userCards);
  } catch (error) {
    console.error('Error in GET /api/user-cards/popular:', error);
    return errorResponse('Erro ao buscar cartas populares');
  }
}
