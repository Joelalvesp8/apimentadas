'use client';

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

export interface PostAuthor {
  id: string;
  nickname: string;
  image: string | null;
}

export interface Post {
  id: string;
  content: string;
  createdAt: string;
  author: PostAuthor;
  likesCount: number;
  likedByMe: boolean;
  isOwn: boolean;
}

interface PostsPage {
  data: Post[];
  nextCursor: string | null;
}

// Feed infinito de posts
export function usePosts() {
  return useInfiniteQuery<PostsPage>({
    queryKey: ['posts'],
    queryFn: async ({ pageParam }) => {
      const url = pageParam ? `/api/posts?cursor=${pageParam}` : '/api/posts';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Erro ao carregar posts');
      return res.json();
    },
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}

// Criar post
export function useCreatePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erro ao criar post');
      return json.data as Post;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Deletar post
export function useDeletePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erro ao deletar post');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}

// Curtir / descurtir post
export function useLikePost() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? 'Erro ao curtir post');
      return json.data as { liked: boolean; likesCount: number };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
}
