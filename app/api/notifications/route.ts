import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/notifications — List last 30 notifications for current user
export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse('Não autorizado');

    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = notifications.filter((n) => !n.read).length;

    return NextResponse.json({ data: { notifications, unreadCount } });
  } catch (error) {
    console.error('[GET /api/notifications]', error);
    return NextResponse.json({ error: 'Erro ao buscar notificações' }, { status: 500 });
  }
}
