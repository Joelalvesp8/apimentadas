import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/sessions/:id/cleanup - Clean corrupted rounds from session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    console.log('[CLEANUP] Starting cleanup for session:', sessionId);

    // Get session
    const session = await prisma.gameSession.findUnique({
      where: { id: sessionId },
      include: {
        onlineRounds: {
          include: {
            card: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    console.log('[CLEANUP] Found session with rounds:', {
      sessionId,
      totalRounds: session.onlineRounds.length,
      currentRoundId: session.currentRoundId,
    });

    // Find corrupted rounds (without card)
    const corruptedRounds = session.onlineRounds.filter((r) => !r.card);

    console.log('[CLEANUP] Found corrupted rounds:', {
      count: corruptedRounds.length,
      roundIds: corruptedRounds.map((r) => r.id),
    });

    // Delete corrupted rounds
    let deletedCount = 0;
    for (const round of corruptedRounds) {
      await prisma.onlineRound.delete({
        where: { id: round.id },
      });
      deletedCount++;
      console.log('[CLEANUP] Deleted corrupted round:', round.id);
    }

    // Clear currentRoundId if it was corrupted
    if (session.currentRoundId && corruptedRounds.some((r) => r.id === session.currentRoundId)) {
      await prisma.gameSession.update({
        where: { id: sessionId },
        data: { currentRoundId: null },
      });
      console.log('[CLEANUP] Cleared currentRoundId from session');
    }

    // Get remaining rounds
    const remainingRounds = await prisma.onlineRound.findMany({
      where: { sessionId },
    });

    console.log('[CLEANUP] Cleanup complete:', {
      deletedCount,
      remainingRounds: remainingRounds.length,
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned ${deletedCount} corrupted rounds`,
      data: {
        deletedCount,
        remainingRounds: remainingRounds.length,
        sessionId,
      },
    });
  } catch (error: any) {
    console.error('[CLEANUP] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar sessão' },
      { status: 500 }
    );
  }
}
