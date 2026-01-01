import { useQuery } from '@tanstack/react-query';
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
  sessionsPlayed: number;
  averageRating: number | null;
  lastActiveAt: string;
  memberSince: string;
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
 * @param search - Optional search term to filter by nickname
 * @param sortBy - Sort by 'activity' (default) or 'rating'
 */
export function useExploreUsers(
  search?: string,
  sortBy: 'activity' | 'rating' = 'activity'
) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (sortBy) params.append('sortBy', sortBy);

  return useQuery({
    queryKey: ['users', 'explore', search, sortBy],
    queryFn: () =>
      apiClient.get<ExploreUser[]>(
        `/api/users/explore${params.toString() ? `?${params.toString()}` : ''}`
      ),
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
