'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Trash2, Loader2, Send, MessageCircle, X } from 'lucide-react';
import {
  usePosts, useCreatePost, useDeletePost, useLikePost,
  usePostComments, useAddComment, useDeleteComment,
  Post,
} from '@/hooks/usePosts';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const MAX_CHARS = 280;

function getInitials(nickname: string) {
  return nickname.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'agora';
  if (m < 60) return `${m}m`;
  if (h < 24) return `${h}h`;
  if (d < 7) return `${d}d`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function PostCard({ post }: { post: Post }) {
  const { toast } = useToast();
  const likePost = useLikePost();
  const deletePost = useDeletePost();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentInput, setCommentInput] = useState('');

  const { data: comments, isLoading: commentsLoading } = usePostComments(post.id, showComments);
  const addComment = useAddComment(post.id);
  const deleteComment = useDeleteComment(post.id);

  const handleLike = () => { likePost.mutate(post.id); };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deletePost.mutate(post.id, {
      onError: () => toast({ title: 'Erro ao deletar post', variant: 'destructive' }),
    });
  };

  const handleAddComment = () => {
    const trimmed = commentInput.trim();
    if (!trimmed) return;
    addComment.mutate(trimmed, {
      onSuccess: () => setCommentInput(''),
      onError: (err: any) => toast({ title: err.message ?? 'Erro ao comentar', variant: 'destructive' }),
    });
  };

  return (
    <div className="px-4 py-4 border-b border-zinc-800/60">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-10 w-10 shrink-0 ring-1 ring-red-700/30">
          <AvatarImage src={post.author.image ?? undefined} />
          <AvatarFallback className="bg-gradient-to-br from-red-900 to-zinc-900 text-white text-xs font-bold">
            {getInitials(post.author.nickname)}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-white font-semibold text-sm">@{post.author.nickname}</span>
            <span className="text-gray-500 text-xs">{timeAgo(post.createdAt)}</span>
          </div>

          <p className="text-gray-200 text-sm mt-1 leading-relaxed whitespace-pre-wrap break-words">
            {post.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-3">
            <button
              onClick={handleLike}
              disabled={likePost.isPending}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                post.likedByMe ? 'text-red-500 hover:text-red-400' : 'text-gray-500 hover:text-red-400'
              )}
            >
              <Heart className={cn('h-4 w-4', post.likedByMe && 'fill-red-500')} />
              <span>{post.likesCount > 0 ? post.likesCount : ''}</span>
            </button>

            <button
              onClick={() => setShowComments((v) => !v)}
              className={cn(
                'flex items-center gap-1.5 text-xs transition-colors',
                showComments ? 'text-blue-400' : 'text-gray-500 hover:text-blue-400'
              )}
            >
              <MessageCircle className="h-4 w-4" />
              <span>{post.commentsCount > 0 ? post.commentsCount : ''}</span>
            </button>

            {post.isOwn && (
              <button
                onClick={handleDelete}
                disabled={deletePost.isPending}
                className={cn(
                  'flex items-center gap-1.5 text-xs transition-colors',
                  confirmDelete ? 'text-red-500 hover:text-red-400' : 'text-gray-600 hover:text-red-400'
                )}
                title={confirmDelete ? 'Clique para confirmar' : 'Deletar post'}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {confirmDelete && <span>Confirmar?</span>}
              </button>
            )}
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-3 space-y-2">
              {/* Comment input */}
              <div className="flex gap-2">
                <input
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                  placeholder="Adicionar comentário..."
                  maxLength={280}
                  className="flex-1 text-xs bg-zinc-900/60 border border-zinc-700 rounded-lg px-3 py-1.5 text-white placeholder:text-gray-600 focus:outline-none focus:border-red-700/60"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!commentInput.trim() || addComment.isPending}
                  className="p-1.5 rounded-lg bg-red-700/80 hover:bg-red-600 disabled:opacity-40 transition-colors"
                >
                  <Send className="h-3.5 w-3.5 text-white" />
                </button>
              </div>

              {/* Comments list */}
              {commentsLoading ? (
                <div className="flex justify-center py-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
                </div>
              ) : comments && comments.length > 0 ? (
                <div className="space-y-2">
                  {comments.map((c) => (
                    <div key={c.id} className="flex gap-2 group">
                      <Avatar className="h-6 w-6 shrink-0 ring-1 ring-zinc-700">
                        <AvatarImage src={c.author.image ?? undefined} />
                        <AvatarFallback className="bg-zinc-800 text-white text-[10px]">
                          {getInitials(c.author.nickname)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 bg-zinc-900/50 rounded-lg px-2.5 py-1.5">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-white text-xs font-medium">@{c.author.nickname}</span>
                          <div className="flex items-center gap-1">
                            <span className="text-gray-600 text-[10px]">{timeAgo(c.createdAt)}</span>
                            {c.isOwn && (
                              <button
                                onClick={() => deleteComment.mutate(c.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-xs text-center py-2">
                  Sem comentários ainda. Seja o primeiro!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostsPage() {
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const observerTarget = useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = usePosts();

  const createPost = useCreatePost();

  const posts = data?.pages.flatMap((p) => p.data) ?? [];

  // Infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0.1 });
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [handleObserver]);

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    createPost.mutate(trimmed, {
      onSuccess: () => {
        setContent('');
        toast({ title: 'Post publicado!' });
      },
      onError: (err: any) =>
        toast({ title: err.message ?? 'Erro ao publicar', variant: 'destructive' }),
    });
  };

  const charsLeft = MAX_CHARS - content.length;
  const isOverLimit = charsLeft < 0;
  const isNearLimit = charsLeft <= 20;

  return (
    <div className="max-w-2xl mx-auto px-0 sm:px-4 py-4">
      {/* Page header */}
      <div className="px-4 pb-3 border-b border-zinc-800/60">
        <h1 className="text-xl font-bold text-white">Publicações</h1>
        <p className="text-gray-500 text-xs mt-0.5">Compartilhe com a comunidade</p>
      </div>

      {/* Compose box */}
      <div className="px-4 py-4 border-b border-zinc-800/60">
        <Textarea
          placeholder="O que está acontecendo?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={MAX_CHARS + 10}
          rows={3}
          className="bg-zinc-900/60 border-zinc-700 text-white placeholder:text-gray-600 resize-none focus:border-red-700/60 focus:ring-red-700/20"
        />
        <div className="flex items-center justify-between mt-2">
          <span
            className={cn(
              'text-xs',
              isOverLimit
                ? 'text-red-500 font-medium'
                : isNearLimit
                  ? 'text-yellow-500'
                  : 'text-gray-600'
            )}
          >
            {charsLeft} caracteres restantes
          </span>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || isOverLimit || createPost.isPending}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white h-8 px-4"
          >
            {createPost.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <Send className="h-3.5 w-3.5 mr-1.5" />
                Publicar
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-red-500" />
        </div>
      ) : error ? (
        <div className="px-4 py-8 text-center text-gray-500 text-sm">
          Erro ao carregar posts.
        </div>
      ) : posts.length === 0 ? (
        <div className="px-4 py-12 text-center">
          <p className="text-gray-500 text-sm">Nenhuma publicação ainda.</p>
          <p className="text-gray-600 text-xs mt-1">Seja o primeiro a publicar!</p>
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}

          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-red-500" />
            </div>
          )}

          {!hasNextPage && posts.length > 0 && (
            <div className="py-6 text-center text-gray-600 text-xs">
              Você chegou ao fim do feed
            </div>
          )}
        </>
      )}
    </div>
  );
}
