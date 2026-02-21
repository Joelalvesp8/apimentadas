import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/utils/auth-helper';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const POST_LIMIT = 280;
const PAGE_SIZE = 20;

// GET /api/posts — Feed de posts (paginado por cursor)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const currentProfile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!currentProfile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') ?? undefined;

    const posts = await prisma.post.findMany({
      take: PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        profile: {
          select: {
            id: true,
            nickname: true,
            user: { select: { image: true } },
          },
        },
        likes: { select: { profileId: true } },
        _count: { select: { comments: true } },
      },
    });

    const hasMore = posts.length > PAGE_SIZE;
    const items = hasMore ? posts.slice(0, PAGE_SIZE) : posts;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({
      data: items.map((post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        author: {
          id: post.profile.id,
          nickname: post.profile.nickname,
          image: post.profile.user.image,
        },
        likesCount: post.likes.length,
        commentsCount: post._count.comments,
        likedByMe: post.likes.some((l) => l.profileId === currentProfile.id),
        isOwn: post.profile.id === currentProfile.id,
      })),
      nextCursor,
    });
  } catch (error) {
    console.error('[GET /api/posts]', error);
    return NextResponse.json({ error: 'Erro ao carregar posts' }, { status: 500 });
  }
}

// POST /api/posts — Criar post
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    if (!profile) return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 });

    const body = await request.json();
    const content: string = (body.content ?? '').trim();

    if (!content) {
      return NextResponse.json({ error: 'O post não pode ser vazio.' }, { status: 400 });
    }
    if (content.length > POST_LIMIT) {
      return NextResponse.json(
        { error: `Máximo de ${POST_LIMIT} caracteres.` },
        { status: 400 }
      );
    }

    const post = await prisma.post.create({
      data: { profileId: profile.id, content },
      include: {
        profile: {
          select: {
            id: true,
            nickname: true,
            user: { select: { image: true } },
          },
        },
      },
    });

    return NextResponse.json({
      data: {
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        author: {
          id: post.profile.id,
          nickname: post.profile.nickname,
          image: post.profile.user.image,
        },
        likesCount: 0,
        likedByMe: false,
        isOwn: true,
      },
    });
  } catch (error) {
    console.error('[POST /api/posts]', error);
    return NextResponse.json({ error: 'Erro ao criar post' }, { status: 500 });
  }
}
