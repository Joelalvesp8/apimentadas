import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/delete-all-sessions - Delete ALL online sessions from ALL users
export async function GET() {
  return POST();
}

// POST /api/admin/delete-all-sessions - Delete ALL online sessions from ALL users
export async function POST() {
  try {
    console.log('[DELETE-ALL-SESSIONS] Starting complete cleanup...');

    // 1. Count everything before deletion
    const beforeStats = {
      onlineRounds: await prisma.onlineRound.count(),
      onlineAnswers: await prisma.onlineAnswer.count(),
      onlineSessions: await prisma.gameSession.count({
        where: { mode: 'online' },
      }),
      sessionParticipants: await prisma.sessionParticipant.count({
        where: {
          session: { mode: 'online' },
        },
      }),
    };

    console.log('[DELETE-ALL-SESSIONS] Before deletion:', beforeStats);

    // 2. Delete all online answers (must be first due to foreign keys)
    const deletedAnswers = await prisma.onlineAnswer.deleteMany({});
    console.log('[DELETE-ALL-SESSIONS] Deleted answers:', deletedAnswers.count);

    // 3. Delete all online rounds
    const deletedRounds = await prisma.onlineRound.deleteMany({});
    console.log('[DELETE-ALL-SESSIONS] Deleted rounds:', deletedRounds.count);

    // 4. Delete all session participants for online sessions
    const deletedParticipants = await prisma.sessionParticipant.deleteMany({
      where: {
        session: { mode: 'online' },
      },
    });
    console.log('[DELETE-ALL-SESSIONS] Deleted participants:', deletedParticipants.count);

    // 5. Delete all online sessions
    const deletedSessions = await prisma.gameSession.deleteMany({
      where: { mode: 'online' },
    });
    console.log('[DELETE-ALL-SESSIONS] Deleted sessions:', deletedSessions.count);

    // 6. Count everything after deletion
    const afterStats = {
      onlineRounds: await prisma.onlineRound.count(),
      onlineAnswers: await prisma.onlineAnswer.count(),
      onlineSessions: await prisma.gameSession.count({
        where: { mode: 'online' },
      }),
      sessionParticipants: await prisma.sessionParticipant.count({
        where: {
          session: { mode: 'online' },
        },
      }),
    };

    console.log('[DELETE-ALL-SESSIONS] After deletion:', afterStats);

    return NextResponse.json({
      success: true,
      message: 'All online sessions deleted successfully',
      data: {
        beforeStats,
        afterStats,
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
