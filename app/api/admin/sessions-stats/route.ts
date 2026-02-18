import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { isAdmin } from '@/lib/utils/admin-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const user = await getAuthenticatedUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
    }

    const [
      totalSessions,
      activeSessions,
      finishedSessions,
      participantsGrouped,
      allProfiles,
      recentSessions,
    ] = await Promise.all([
      prisma.gameSession.count(),
      prisma.gameSession.count({ where: { status: 'active' } }),
      prisma.gameSession.count({ where: { status: 'finished' } }),
      prisma.sessionParticipant.groupBy({
        by: ['profileId'],
        _count: { sessionId: true },
        orderBy: { _count: { sessionId: 'desc' } },
      }),
      prisma.profile.findMany({
        select: {
          id: true,
          nickname: true,
          sessionsPlayed: true,
          user: {
            select: { email: true, approved: true },
          },
        },
      }),
      prisma.gameSession.findMany({
        take: 30,
        orderBy: { createdAt: 'desc' },
        include: {
          sessionParticipants: {
            include: {
              profile: {
                select: { id: true, nickname: true },
              },
            },
          },
        },
      }),
    ]);

    // Map participants count by profileId
    const participantMap = new Map(
      participantsGrouped.map((p) => [p.profileId, p._count.sessionId])
    );

    // Build user stats with session counts
    const userStats = allProfiles
      .filter((profile) => profile.user.approved)
      .map((profile) => ({
        profileId: profile.id,
        nickname: profile.nickname,
        email: profile.user.email,
        sessionsCount: participantMap.get(profile.id) || 0,
      }))
      .sort((a, b) => b.sessionsCount - a.sessionsCount);

    const neverPlayedCount = userStats.filter((u) => u.sessionsCount === 0).length;

    return NextResponse.json({
      data: {
        totalSessions,
        activeSessions,
        finishedSessions,
        neverPlayedCount,
        userStats,
        recentSessions: recentSessions.map((s) => ({
          id: s.id,
          sessionType: s.sessionType,
          mode: s.mode,
          status: s.status,
          cardsPlayed: s.cardsPlayed,
          createdAt: s.createdAt,
          finishedAt: s.finishedAt,
          participants: s.sessionParticipants.map((p) => ({
            profileId: p.profileId,
            nickname: p.profile.nickname,
          })),
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching sessions stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas de sessões' },
      { status: 500 }
    );
  }
}
