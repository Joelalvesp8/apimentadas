import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/notifications/read-all — Mark all notifications as read
export async function POST() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    await prisma.notification.updateMany({
      where: { userId: user.id, read: false },
      data: { read: true },
    });

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('[POST /api/notifications/read-all]', error);
    return NextResponse.json({ error: 'Erro ao marcar notificações' }, { status: 500 });
  }
}
