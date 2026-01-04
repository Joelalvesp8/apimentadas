import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/admin/import-cards - Import cards from JSON array
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!Array.isArray(body.cards)) {
      return NextResponse.json(
        { error: 'Body must contain "cards" array' },
        { status: 400 }
      );
    }

    const cards = body.cards;

    console.log(`[IMPORT-CARDS] Starting import of ${cards.length} cards...`);

    // Validate each card
    const errors = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      if (!card.type || !card.category || !card.difficulty || !card.content) {
        errors.push(`Card ${i + 1}: Missing required fields (type, category, difficulty, content)`);
      }
      if (!['pergunta', 'tarefa'].includes(card.type)) {
        errors.push(`Card ${i + 1}: type must be "pergunta" or "tarefa"`);
      }
      if (!['casais', 'trios', 'grupos'].includes(card.category)) {
        errors.push(`Card ${i + 1}: category must be "casais", "trios", or "grupos"`);
      }
      if (!['facil', 'medio', 'dificil', 'extremo', 'picante'].includes(card.difficulty)) {
        errors.push(`Card ${i + 1}: difficulty must be "facil", "medio", "dificil", "extremo", or "picante"`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation errors', details: errors },
        { status: 400 }
      );
    }

    // Insert cards
    let insertedCount = 0;
    const insertedIds = [];

    for (const card of cards) {
      const created = await prisma.card.create({
        data: {
          type: card.type,
          category: card.category,
          difficulty: card.difficulty,
          content: card.content,
          isOfficial: true,
        },
      });
      insertedCount++;
      insertedIds.push(created.id);

      if (insertedCount % 10 === 0) {
        console.log(`[IMPORT-CARDS] Inserted ${insertedCount}/${cards.length}...`);
      }
    }

    console.log(`[IMPORT-CARDS] Successfully inserted ${insertedCount} cards`);

    // Get updated stats
    const stats = await prisma.card.groupBy({
      by: ['type', 'category'],
      _count: true,
    });

    const totalCards = await prisma.card.count();

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${insertedCount} cards`,
      data: {
        insertedCount,
        totalCards,
        stats,
        insertedIds: insertedIds.slice(0, 5), // Show first 5 IDs
      },
    });
  } catch (error: any) {
    console.error('[IMPORT-CARDS] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
