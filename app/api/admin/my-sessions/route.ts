import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/admin/my-sessions - List all sessions for current user and clean them
export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user) {
      return unauthorizedResponse('Não autorizado');
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Get all sessions where user is participant
    const sessions = await prisma.gameSession.findMany({
      where: {
        sessionParticipants: {
          some: {
            profileId: profile.id,
          },
        },
        mode: 'online',
      },
      include: {
        sessionParticipants: {
          include: {
            profile: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
        onlineRounds: {
          include: {
            card: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('[MY-SESSIONS] Found sessions:', {
      userId: user.id,
      profileId: profile.id,
      sessionCount: sessions.length,
    });

    // Clean each session
    let totalCleaned = 0;
    const cleanedSessions = [];

    for (const session of sessions) {
      const corruptedRounds = session.onlineRounds.filter((r) => !r.card);

      if (corruptedRounds.length > 0) {
        console.log('[MY-SESSIONS] Cleaning session:', {
          sessionId: session.id,
          corruptedRounds: corruptedRounds.length,
        });

        // Delete corrupted rounds
        for (const round of corruptedRounds) {
          await prisma.onlineRound.delete({
            where: { id: round.id },
          });
          totalCleaned++;
        }

        // Clear currentRoundId if it was corrupted
        if (session.currentRoundId && corruptedRounds.some((r) => r.id === session.currentRoundId)) {
          await prisma.gameSession.update({
            where: { id: session.id },
            data: { currentRoundId: null },
          });
        }
      }

      cleanedSessions.push({
        id: session.id,
        sessionType: session.sessionType,
        status: session.status,
        createdAt: session.createdAt,
        currentRoundId: session.currentRoundId,
        totalRounds: session.onlineRounds.length,
        corruptedRounds: corruptedRounds.length,
        participants: session.sessionParticipants.map((p) => ({
          nickname: p.profile.nickname,
        })),
        url: `https://www.apimentadas.app/game-online/${session.id}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: `Found ${sessions.length} sessions, cleaned ${totalCleaned} corrupted rounds`,
      data: {
        profile: {
          id: profile.id,
          nickname: profile.nickname,
        },
        totalSessions: sessions.length,
        totalCleaned,
        sessions: cleanedSessions,
      },
    });
  } catch (error: any) {
    console.error('[MY-SESSIONS] Error:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar sessões' },
      { status: 500 }
    );
  }
}
