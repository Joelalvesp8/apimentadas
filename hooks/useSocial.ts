import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export interface ExploreUser {
  id: string;
  nickname: string;
  image: string | null;
  bio: string | null;
  orientation: string | null;
  sex: string | null;
  sessionsPlayed: number;
  averageRating: number | null;
  lastActiveAt: string;
  connectionStatus: 'none' | 'pending_sent' | 'pending_received' | 'connected';
}

export interface PublicProfile {
  id: string;
  nickname: string;
  image: string | null;
  bio: string | null;
  orientation: string | null;
  sessionsPlayed: number;
  averageRating: number | null;
  lastActiveAt: string;
  memberSince: string;
  isConnected: boolean;
  recentSessions: Array<{
    id: string;
    sessionType: string;
    mode: string;
    cardsPlayed: number;
    averageRating: number | null;
    finishedAt: string | null;
    createdAt: string;
    participantCount: number;
    participants: Array<{
      id: string;
      nickname: string;
      image: string | null;
    }>;
  }>;
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook to fetch users for exploration/discovery
 * @param search - Optional search term to filter by nickname or bio
 * @param orientation - Optional filter by orientation
 */
export function useExploreUsers(search?: string, orientation?: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (orientation) params.append('orientation', orientation);

  return useQuery({
    queryKey: ['users', 'explore', search, orientation],
    queryFn: async () => {
      const response = await apiClient.get<{
        users: ExploreUser[];
        pagination: { total: number; limit: number; offset: number; hasMore: boolean };
      }>(`/api/explore${params.toString() ? `?${params.toString()}` : ''}`);
      return response.users;
    },
  });
}

/**
 * Hook to fetch users with infinite scroll pagination
 * @param search - Optional search term to filter by nickname or bio
 * @param orientation - Optional filter by orientation
 */
export function useInfiniteExploreUsers(search?: string, orientation?: string, sex?: string) {
  return useInfiniteQuery({
    queryKey: ['users', 'explore-infinite', search, orientation, sex],
    queryFn: async ({ pageParam = 0 }) => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (orientation) params.append('orientation', orientation);
      if (sex) params.append('sex', sex);
      params.append('limit', '20');
      params.append('offset', pageParam.toString());

      const response = await apiClient.get<{
        users: ExploreUser[];
        pagination: { total: number; limit: number; offset: number; hasMore: boolean };
      }>(`/api/explore?${params.toString()}`);

      return {
        users: response.users,
        pagination: response.pagination,
      };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.offset + lastPage.pagination.limit;
      }
      return undefined;
    },
  });
}

/**
 * Hook to request connection with a user
 */
export function useRequestConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (toProfileId: string) => {
      return apiClient.post('/api/connections/request', { toProfileId });
    },
    onSuccess: () => {
      // Invalidate explore users to refresh connection status
      queryClient.invalidateQueries({ queryKey: ['users', 'explore'] });
    },
  });
}

/**
 * Hook to send session invitation
 */
export function useSendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      receiverId: string;
      sessionType: 'casal' | 'trisal' | 'grupo';
      message?: string;
    }) => {
      return apiClient.post('/api/invitations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

/**
 * Hook to fetch a public profile by nickname
 * @param nickname - The user's nickname (e.g., "joao123")
 */
export function usePublicProfile(nickname: string) {
  return useQuery({
    queryKey: ['users', 'profile', nickname],
    queryFn: () => apiClient.get<PublicProfile>(`/api/users/${nickname}/profile`),
    enabled: !!nickname,
  });
}

/**
 * Hook to send a direct message to a user without connection
 */
export function useSendDirectMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { receiverId: string; message: string }) => {
      return apiClient.post('/api/messages/direct', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'direct'] });
    },
  });
}

/**
 * Hook to fetch direct messages
 * @param type - 'received' or 'sent'
 */
export function useDirectMessages(type: 'received' | 'sent' = 'received') {
  return useQuery({
    queryKey: ['messages', 'direct', type],
    queryFn: () => apiClient.get(`/api/messages/direct?type=${type}`),
  });
}
