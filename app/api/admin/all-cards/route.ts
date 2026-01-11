import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/all-cards - List ALL cards (official + user created)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return unauthorizedResponse();
    }

    if (!isAdmin(user)) {
      return errorResponse('Acesso negado. Apenas administradores podem acessar esta página.', 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status'); // 'pending' | 'approved' | 'official' | 'all'

    // Fetch official cards
    const officialCards = await prisma.card.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Fetch user cards with filters
    const userCardWhere: any = {};
    if (status === 'pending') {
      userCardWhere.approved = false;
    } else if (status === 'approved') {
      userCardWhere.approved = true;
    }

    const userCards = await prisma.userCard.findMany({
      where: userCardWhere,
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

    // Transform and combine all cards
    const allCards = [
      // Official cards
      ...officialCards.map((card) => ({
        id: card.id,
        content: card.content,
        type: card.type,
        category: card.category,
        difficulty: card.difficulty,
        approved: true, // Official cards are always approved
        isOfficial: true,
        createdBy: 'Sistema',
        createdByEmail: 'admin@apimentadas.app',
        createdAt: card.createdAt.toISOString(),
        likesCount: 0,
        user: null,
      })),
      // User cards
      ...userCards.map((card) => ({
        id: card.id,
        content: card.content,
        type: card.type,
        category: card.category,
        difficulty: card.difficulty,
        approved: card.approved,
        isOfficial: false,
        createdBy: card.user.name,
        createdByEmail: card.user.email,
        createdAt: card.createdAt.toISOString(),
        likesCount: card.likesCount,
        user: card.user,
      })),
    ];

    // Apply status filter
    let filteredCards = allCards;
    if (status === 'official') {
      filteredCards = allCards.filter((c) => c.isOfficial);
    } else if (status === 'pending') {
      filteredCards = allCards.filter((c) => !c.isOfficial && !c.approved);
    } else if (status === 'approved') {
      filteredCards = allCards.filter((c) => c.approved);
    }

    // Sort by creation date (newest first)
    filteredCards.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return successResponse(filteredCards);
  } catch (error) {
    console.error('Error in GET /api/admin/all-cards:', error);
    return errorResponse('Erro ao buscar cartas');
  }
}
