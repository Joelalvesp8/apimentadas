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

    const [total, approved] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { approved: true } }),
    ]);

    return NextResponse.json({
      data: {
        total,
        approved,
      },
    });
  } catch (error) {
    console.error('Error fetching users stats:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
