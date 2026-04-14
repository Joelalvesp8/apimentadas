import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/debug/cards - Debug endpoint to check cards in database (ADMIN ONLY)
export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    const totalCards = await prisma.card.count();

    const cardStats = await prisma.card.groupBy({
      by: ['type', 'category'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCards,
        stats: cardStats,
      },
    });
  } catch (error: any) {
    console.error('Error fetching cards debug info:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
