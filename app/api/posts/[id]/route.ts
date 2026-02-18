import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// DELETE /api/posts/[id] — Deletar próprio post
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { profileId: true },
    });

    if (!post) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });
    if (post.profileId !== profile.id) {
      return NextResponse.json({ error: 'Sem permissão para deletar este post' }, { status: 403 });
    }

    await prisma.post.delete({ where: { id: params.id } });

    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error('[DELETE /api/posts/[id]]', error);
    return NextResponse.json({ error: 'Erro ao deletar post' }, { status: 500 });
  }
}
