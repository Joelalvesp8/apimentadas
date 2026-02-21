import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/posts/[id]/comments — List comments for a post
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const comments = await prisma.postComment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            image: true,
            profile: { select: { nickname: true } },
          },
        },
      },
    });

    const data = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: {
        nickname: c.user.profile?.nickname ?? 'Anônimo',
        image: c.user.image,
      },
      isOwn: c.userId === user.id,
    }));

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[GET /api/posts/[id]/comments]', error);
    return NextResponse.json({ error: 'Erro ao buscar comentários' }, { status: 500 });
  }
}

// POST /api/posts/[id]/comments — Add a comment
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const post = await prisma.post.findUnique({
      where: { id: params.id },
      select: { id: true, profile: { select: { userId: true, nickname: true } } },
    });
    if (!post) return NextResponse.json({ error: 'Post não encontrado' }, { status: 404 });

    const body = await request.json();
    const content: string = (body.content ?? '').trim();
    if (!content) return NextResponse.json({ error: 'Comentário vazio' }, { status: 400 });
    if (content.length > 280) return NextResponse.json({ error: 'Máximo de 280 caracteres' }, { status: 400 });

    const comment = await prisma.postComment.create({
      data: { postId: params.id, userId: user.id, content },
      include: {
        user: {
          select: {
            image: true,
            profile: { select: { nickname: true } },
          },
        },
      },
    });

    // Notify post author (if different from commenter)
    if (post.profile.userId !== user.id) {
      const commenterProfile = await prisma.profile.findUnique({
        where: { userId: user.id },
        select: { nickname: true },
      });
      if (commenterProfile) {
        await prisma.notification.create({
          data: {
            userId: post.profile.userId,
            type: 'post_comment',
            message: `@${commenterProfile.nickname} comentou no seu post`,
            data: { postId: params.id, fromNickname: commenterProfile.nickname },
          },
        }).catch(() => {});
      }
    }

    return NextResponse.json({
      data: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: {
          nickname: comment.user.profile?.nickname ?? 'Anônimo',
          image: comment.user.image,
        },
        isOwn: true,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/posts/[id]/comments]', error);
    return NextResponse.json({ error: 'Erro ao comentar' }, { status: 500 });
  }
}

// DELETE /api/posts/[id]/comments?commentId=xxx
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('commentId');
    if (!commentId) return NextResponse.json({ error: 'commentId obrigatório' }, { status: 400 });

    const comment = await prisma.postComment.findUnique({ where: { id: commentId } });
    if (!comment) return NextResponse.json({ error: 'Comentário não encontrado' }, { status: 404 });
    if (comment.userId !== user.id) return NextResponse.json({ error: 'Sem permissão' }, { status: 403 });

    await prisma.postComment.delete({ where: { id: commentId } });
    return NextResponse.json({ data: { deleted: true } });
  } catch (error) {
    console.error('[DELETE /api/posts/[id]/comments]', error);
    return NextResponse.json({ error: 'Erro ao deletar comentário' }, { status: 500 });
  }
}
