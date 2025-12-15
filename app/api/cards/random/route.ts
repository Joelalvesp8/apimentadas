import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// GET /api/cards/random?type=&category=
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
      isOfficial: true,
    };

    if (type) {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    // Get total count
    const total = await prisma.card.count({ where });

    if (total === 0) {
      return errorResponse('Nenhuma carta encontrada com esses filtros', 404);
    }

    // Get random card
    const skip = Math.floor(Math.random() * total);
    const card = await prisma.card.findFirst({
      where,
      skip,
    });

    return successResponse(card);
  } catch (error) {
    console.error('Error in GET /api/cards/random:', error);
    return errorResponse('Erro ao buscar carta aleatória');
  }
}
