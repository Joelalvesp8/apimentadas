import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try {
    const user = await getAuthenticatedUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    // Delete in dependency order to avoid FK constraint violations
    const deletedAnswers = await prisma.onlineAnswer.deleteMany({});
    const deletedRounds = await prisma.onlineRound.deleteMany({});
    const [deletedParticipants, deletedPlayedCards] = await Promise.all([
      prisma.sessionParticipant.deleteMany({ where: { session: { mode: 'online' } } }),
      prisma.playedCard.deleteMany({ where: { session: { mode: 'online' } } }),
    ]);

    const deletedSessions = await prisma.gameSession.deleteMany({ where: { mode: 'online' } });

    // Reset sessionsPlayed counter on all profiles
    const resetProfiles = await prisma.profile.updateMany({
      data: { sessionsPlayed: 0 },
    });

    return NextResponse.json({
      data: {
        deleted: {
          sessions: deletedSessions.count,
          participants: deletedParticipants.count,
          playedCards: deletedPlayedCards.count,
          onlineRounds: deletedRounds.count,
          onlineAnswers: deletedAnswers.count,
        },
        resetProfiles: resetProfiles.count,
      },
    });
  } catch (error: any) {
    console.error('[RESET-SESSIONS] Error:', error);
    return NextResponse.json({ error: 'Erro ao zerar sessões' }, { status: 500 });
  }
}
