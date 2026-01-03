import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/debug/cards - Debug endpoint to check cards in database
export async function GET() {
  try {
    // Count all cards
    const totalCards = await prisma.card.count();

    // Group by type and category
    const cardStats = await prisma.card.groupBy({
      by: ['type', 'category'],
      _count: true,
    });

    // Get sample cards from each category
    const casaisPerguntas = await prisma.card.findMany({
      where: {
        type: 'pergunta',
        category: 'casais',
        isOfficial: true,
      },
      take: 3,
      select: {
        id: true,
        content: true,
        difficulty: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCards,
        stats: cardStats,
        sampleCasaisPerguntas: casaisPerguntas,
      },
    });
  } catch (error: any) {
    console.error('Error fetching cards debug info:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
