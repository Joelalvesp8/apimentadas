import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateCardInput } from '@/lib/validations/card';

export interface Card {
  id: string;
  type: string;
  category: string;
  difficulty: string;
  content: string;
  isOfficial: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserCard {
  id: string;
  userId: string;
  type: string;
  category: string;
  difficulty: string;
  content: string;
  approved: boolean;
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    image: string | null;
  };
}

export function useRandomCard(type?: string, category?: string, sessionId?: string) {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (category) params.append('category', category);
  if (sessionId) params.append('sessionId', sessionId);

  return useQuery({
    queryKey: ['cards', 'random', type, category, sessionId],
    queryFn: () =>
      apiClient.get<Card>(
        `/api/cards/random${params.toString() ? `?${params.toString()}` : ''}`
      ),
    enabled: false, // Manual refetch
  });
}

export function useLikeCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cardId: string) =>
      apiClient.post<{ message: string; liked: boolean }>(
        `/api/cards/${cardId}/like`,
        {}
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cards'] });
    },
  });
}

export function useUserCards() {
  return useQuery({
    queryKey: ['user-cards'],
    queryFn: () => apiClient.get<UserCard[]>('/api/user-cards'),
  });
}

export function useCreateUserCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCardInput) =>
      apiClient.post<UserCard>('/api/user-cards', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-cards'] });
    },
  });
}

export function usePopularCards(type?: string, category?: string) {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (category) params.append('category', category);

  return useQuery({
    queryKey: ['user-cards', 'popular', type, category],
    queryFn: () =>
      apiClient.get<UserCard[]>(
        `/api/user-cards/popular${params.toString() ? `?${params.toString()}` : ''}`
      ),
  });
}
