import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateSessionInput, PlayCardInput } from '@/lib/validations/session';

export interface GameSession {
  id: string;
  creatorId: string;
  sessionType: string;
  status: string;
  currentTurnProfileId: string | null;
  averageRating: number | null;
  cardsPlayed: number;
  createdAt: string;
  finishedAt: string | null;
  updatedAt: string;
  creator: {
    id: string;
    name: string;
    image: string | null;
  };
  sessionParticipants: Array<{
    id: string;
    sessionId: string;
    profileId: string;
    joinedAt: string;
    profile: {
      id: string;
      userId: string;
      nickname: string;
      bio: string | null;
      orientation: string | null;
      user: {
        id: string;
        name: string;
        image: string | null;
      };
    };
  }>;
  playedCards?: Array<{
    id: string;
    sessionId: string;
    cardId: string;
    pickedByProfileId: string;
    answeredByProfileId: string | null;
    qualitativeRating: string | null;
    rating: number | null;
    playedAt: string;
    card: {
      id: string;
      type: string;
      category: string;
      difficulty: string;
      content: string;
    };
  }>;
}

export function useCreateSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSessionInput) =>
      apiClient.post<GameSession>('/api/sessions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useSession(id: string) {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => apiClient.get<GameSession>(`/api/sessions/${id}`),
    enabled: !!id,
  });
}

export function usePlayCard(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PlayCardInput) =>
      apiClient.post<any>(`/api/sessions/${sessionId}/play`, data),
    onSuccess: (data) => {
      // Update the cache with the new session data
      if (data.session) {
        queryClient.setQueryData(['sessions', sessionId], data.session);
      }
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    },
  });
}

export function useFinishSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.post<GameSession>(`/api/sessions/${sessionId}/finish`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

export function useSessionHistory() {
  return useQuery({
    queryKey: ['sessions', 'history'],
    queryFn: () => apiClient.get<GameSession[]>('/api/sessions/history'),
  });
}
