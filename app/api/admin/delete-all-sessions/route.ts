import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/admin/delete-all-sessions - Delete ALL online sessions from ALL users
export async function POST() {
  const user = await getAuthenticatedUser();
  if (!user || !isAdmin(user)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  try {
    // Delete in dependency order (FK constraints)
    const deletedAnswers = await prisma.onlineAnswer.deleteMany({});
    const deletedRounds = await prisma.onlineRound.deleteMany({});
    const deletedParticipants = await prisma.sessionParticipant.deleteMany({
      where: { session: { mode: 'online' } },
    });
    const deletedSessions = await prisma.gameSession.deleteMany({
      where: { mode: 'online' },
    });

    return NextResponse.json({
      success: true,
      message: 'All online sessions deleted successfully',
      data: {
        deleted: {
          answers: deletedAnswers.count,
          rounds: deletedRounds.count,
          participants: deletedParticipants.count,
          sessions: deletedSessions.count,
        },
      },
    });
  } catch (error: any) {
    console.error('[DELETE-ALL-SESSIONS] Error:', error);
    return NextResponse.json({ success: false, error: 'Erro interno' }, { status: 500 });
  }
}
