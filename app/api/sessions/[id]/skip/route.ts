import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import {
  errorResponse,
  successResponse,
  unauthorizedResponse,
} from '@/lib/utils/responses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/sessions/:id/skip — Skip current card (uses one skip token)
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse();

    const userProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });

    if (!userProfile) return errorResponse('Perfil não encontrado', 404);

    const session = await prisma.gameSession.findUnique({
      where: { id: params.id },
    });

    if (!session) return errorResponse('Sessão não encontrada', 404);
    if (session.status !== 'active') return errorResponse('Sessão não está ativa', 400);
    if (session.currentTurnProfileId !== userProfile.id) {
      return errorResponse('Não é sua vez', 403);
    }

    if (session.skipsUsed >= session.maxSkips) {
      return errorResponse(
        `Limite de skips atingido (${session.maxSkips}/${session.maxSkips})`,
        400
      );
    }

    const updated = await prisma.gameSession.update({
      where: { id: params.id },
      data: { skipsUsed: session.skipsUsed + 1 },
      select: { skipsUsed: true, maxSkips: true },
    });

    const remaining = updated.maxSkips - updated.skipsUsed;
    return successResponse({
      skipsUsed: updated.skipsUsed,
      maxSkips: updated.maxSkips,
      remaining,
    });
  } catch (error) {
    console.error('[POST /api/sessions/[id]/skip]', error);
    return errorResponse('Erro ao pular carta');
  }
}
