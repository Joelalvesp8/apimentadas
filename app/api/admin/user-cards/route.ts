import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// GET /api/admin/user-cards - List all user cards
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user is admin
    if (!isAdmin(user)) {
      return errorResponse('Acesso negado. Apenas administradores podem acessar esta página.', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'pending' | 'approved' | 'all'

    // Build where clause
    const where: any = {};
    if (status === 'pending') {
      where.approved = false;
    } else if (status === 'approved') {
      where.approved = true;
    }
    // If status === 'all', no filter

    const userCards = await prisma.userCard.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return successResponse(userCards);
  } catch (error) {
    console.error('Error in GET /api/admin/user-cards:', error);
    return errorResponse('Erro ao buscar cartas');
  }
}
