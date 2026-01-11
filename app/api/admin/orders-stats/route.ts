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

    const [pending, total] = await Promise.all([
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count(),
    ]);

    return NextResponse.json({
      data: {
        pending,
        total,
      },
    });
  } catch (error) {
    console.error('Error fetching orders stats:', error);
    return NextResponse.json({ error: 'Erro ao buscar estatísticas' }, { status: 500 });
  }
}
