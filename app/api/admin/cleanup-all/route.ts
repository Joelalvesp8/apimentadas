import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/cleanup-all - Clean all corrupted online sessions
export async function GET() {
  return POST();
}

// POST /api/admin/cleanup-all - Clean all corrupted online sessions
export async function POST() {
  try {
    console.log('[CLEANUP-ALL] Starting global cleanup...');

    // 1. Find all online rounds with their cards
    const allRounds = await prisma.onlineRound.findMany({
      include: {
        card: true,
      },
    });

    // Filter corrupted rounds (without cards)
    const corruptedRounds = allRounds.filter((r) => !r.card);

    console.log('[CLEANUP-ALL] Found corrupted rounds:', {
      count: corruptedRounds.length,
      roundIds: corruptedRounds.map((r) => r.id),
    });

    // 2. Delete all corrupted rounds individually
    let deletedCount = 0;
    for (const round of corruptedRounds) {
      await prisma.onlineRound.delete({
        where: { id: round.id },
      });
      deletedCount++;
    }

    const deletedRounds = { count: deletedCount };

    console.log('[CLEANUP-ALL] Deleted corrupted rounds:', deletedRounds.count);

    // 3. Get all online sessions with their rounds
    const onlineSessions = await prisma.gameSession.findMany({
      where: {
        mode: 'online',
      },
      include: {
        onlineRounds: true,
      },
    });

    console.log('[CLEANUP-ALL] Found online sessions:', {
      count: onlineSessions.length,
    });

    // 4. Clear currentRoundId from sessions that had corrupted rounds
    let clearedSessionsCount = 0;
    const corruptedSessionIds = new Set(corruptedRounds.map((r) => r.sessionId));

    for (const session of onlineSessions) {
      // Clear currentRoundId if it was pointing to a corrupted round
      if (session.currentRoundId && corruptedSessionIds.has(session.id)) {
        await prisma.gameSession.update({
          where: { id: session.id },
          data: { currentRoundId: null },
        });
        clearedSessionsCount++;
        console.log('[CLEANUP-ALL] Cleared currentRoundId from session:', session.id);
      }
    }

    // 5. Optionally delete all empty online sessions (sessions with 0 rounds)
    const emptySessions = await prisma.gameSession.findMany({
      where: {
        mode: 'online',
        onlineRounds: {
          none: {},
        },
      },
    });

    console.log('[CLEANUP-ALL] Found empty sessions:', {
      count: emptySessions.length,
    });

    // 6. Get final statistics
    const finalStats = {
      totalOnlineSessions: await prisma.gameSession.count({
        where: { mode: 'online' },
      }),
      totalOnlineRounds: await prisma.onlineRound.count(),
      totalCards: await prisma.card.count(),
    };

    console.log('[CLEANUP-ALL] Cleanup complete. Final stats:', finalStats);

    return NextResponse.json({
      success: true,
      message: 'Global cleanup completed successfully',
      data: {
        corruptedRoundsDeleted: deletedRounds.count,
        sessionsCleared: clearedSessionsCount,
        emptySessionsFound: emptySessions.length,
        finalStats,
        details: {
          corruptedRoundIds: corruptedRounds.map((r) => r.id),
          clearedSessionIds: Array.from(corruptedSessionIds),
        },
      },
    });
  } catch (error: any) {
    console.error('[CLEANUP-ALL] Error during global cleanup:', error);
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
