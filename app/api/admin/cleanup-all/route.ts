import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/admin/cleanup-all - Clean all corrupted online sessions
export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    // 1. Find all online rounds with their cards
    const allRounds = await prisma.onlineRound.findMany({
      include: { card: true },
    });

    // Filter corrupted rounds (without cards)
    const corruptedRounds = allRounds.filter((r) => !r.card);

    // 2. Delete corrupted rounds in batch
    const corruptedIds = corruptedRounds.map((r) => r.id);
    const deletedRounds = await prisma.onlineRound.deleteMany({
      where: { id: { in: corruptedIds } },
    });

    // 3. Clear currentRoundId from sessions affected
    const corruptedSessionIds = Array.from(new Set(corruptedRounds.map((r) => r.sessionId)));
    let clearedSessionsCount = 0;

    if (corruptedSessionIds.length > 0) {
      const result = await prisma.gameSession.updateMany({
        where: { id: { in: corruptedSessionIds }, currentRoundId: { not: null } },
        data: { currentRoundId: null },
      });
      clearedSessionsCount = result.count;
    }

    // 4. Find empty online sessions
    const emptySessions = await prisma.gameSession.findMany({
      where: { mode: 'online', onlineRounds: { none: {} } },
      select: { id: true },
    });

    // 5. Final stats
    const finalStats = {
      totalOnlineSessions: await prisma.gameSession.count({ where: { mode: 'online' } }),
      totalOnlineRounds: await prisma.onlineRound.count(),
      totalCards: await prisma.card.count(),
    };

    return NextResponse.json({
      success: true,
      message: 'Global cleanup completed successfully',
      data: {
        corruptedRoundsDeleted: deletedRounds.count,
        sessionsCleared: clearedSessionsCount,
        emptySessionsFound: emptySessions.length,
        finalStats,
      },
    });
  } catch (error: any) {
    console.error('[CLEANUP-ALL] Error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
