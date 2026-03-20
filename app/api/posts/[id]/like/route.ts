import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';
import { unauthorizedResponse } from '@/lib/utils/responses';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// POST /api/posts/[id]/like — Toggle curtida
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return unauthorizedResponse('Não autorizado');

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

    const post = await prisma.post.findUnique({ where: { id: params.id } });
    if (!post) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });

    const existing = await prisma.postLike.findUnique({
      where: { postId_profileId: { postId: params.id, profileId: profile.id } },
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.postLike.create({
        data: { postId: params.id, profileId: profile.id },
      });
    }

    const likesCount = await prisma.postLike.count({ where: { postId: params.id } });

    return NextResponse.json({ data: { liked: !existing, likesCount } });
  } catch (error) {
    console.error('[POST /api/posts/[id]/like]', error);
    return NextResponse.json({ error: 'Erro ao curtir post' }, { status: 500 });
  }
}
