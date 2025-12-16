import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

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
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function useAdminUserCards(status: 'pending' | 'approved' | 'all' = 'pending') {
  return useQuery({
    queryKey: ['admin', 'user-cards', status],
    queryFn: () => apiClient.get<UserCard[]>(`/api/admin/user-cards?status=${status}`),
  });
}

export function useApproveUserCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, approved }: { id: string; approved: boolean }) =>
      apiClient.patch<UserCard>(`/api/admin/user-cards/${id}`, { approved }),
    onSuccess: () => {
      // Invalidate all user-cards queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-cards'] });
    },
  });
}

export function useDeleteUserCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`/api/admin/user-cards/${id}`),
    onSuccess: () => {
      // Invalidate all user-cards queries to refresh the list
      queryClient.invalidateQueries({ queryKey: ['admin', 'user-cards'] });
    },
  });
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ['admin', 'me'],
    queryFn: () => apiClient.get<{ isAdmin: boolean }>('/api/admin/me'),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
