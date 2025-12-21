import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// Force dynamic rendering for authenticated routes
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check if user is admin
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
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

    return NextResponse.json(allCards);
  } catch (error) {
    console.error('Error fetching all cards:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cartas' },
      { status: 500 }
    );
  }
}
