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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        approved: true,
        createdAt: true,
        _count: {
          select: {
            gameSessions: true,
            userCards: true,
          },
        },
        profile: {
          select: {
            nickname: true,
            sessionsPlayed: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform data to match expected interface
    const transformedUsers = users.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      approved: u.approved,
      createdAt: u.createdAt,
      _count: {
        sessions: u._count.gameSessions,
        connections: u.profile?.sessionsPlayed || 0,
      },
    }));

    return NextResponse.json({ data: transformedUsers });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Erro ao buscar usuários' }, { status: 500 });
  }
}
