import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user is admin
    if (!isAdmin(user)) {
      return errorResponse('Acesso negado. Apenas administradores podem acessar esta página.', 403);
    }

    // Get all official cards
    const officialCards = await prisma.card.findMany({
      orderBy: [
        { category: 'asc' },
        { type: 'asc' },
        { difficulty: 'asc' },
      ],
    });

    // Get all user cards
    const userCards = await prisma.userCard.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { category: 'asc' },
        { type: 'asc' },
        { difficulty: 'asc' },
      ],
    });

    // Combine and format all cards
    const allCards = [
      ...officialCards.map(card => ({
        id: card.id,
        type: card.type,
        category: card.category,
        difficulty: card.difficulty,
        content: card.content,
        isOfficial: true,
        approved: true,
        createdBy: 'Sistema',
        createdAt: card.createdAt.toISOString(),
        likesCount: 0,
      })),
      ...userCards.map(card => ({
        id: card.id,
        type: card.type,
        category: card.category,
        difficulty: card.difficulty,
        content: card.content,
        isOfficial: false,
        approved: card.approved,
        createdBy: card.user.name,
        createdByEmail: card.user.email,
        createdAt: card.createdAt.toISOString(),
        likesCount: card.likesCount,
      })),
    ];

    return successResponse(allCards);
  } catch (error) {
    console.error('Error fetching all cards:', error);
    return errorResponse('Erro ao buscar cartas', 500);
  }
}
