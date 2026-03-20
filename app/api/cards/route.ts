import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/cards?type=&category=&difficulty=
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse('Não autorizado');
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') || undefined;
    const category = searchParams.get('category') || undefined;
    const difficulty = searchParams.get('difficulty') || undefined;

    const where: any = { isOfficial: true };
    if (type) where.type = type;
    if (category) where.category = category;
    if (difficulty) where.difficulty = difficulty;

    const cards = await prisma.card.findMany({
      where,
      orderBy: [{ category: 'asc' }, { type: 'asc' }, { difficulty: 'asc' }],
      select: {
        id: true,
        type: true,
        category: true,
        difficulty: true,
        content: true,
        isOfficial: true,
        createdAt: true,
      },
    });

    return successResponse(cards);
  } catch (error) {
    console.error('Error in GET /api/cards:', error);
    return errorResponse('Erro ao buscar cartas');
  }
}
