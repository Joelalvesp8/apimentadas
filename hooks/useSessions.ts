import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateSessionInput, PlayCardInput } from '@/lib/validations/session';

export interface GameSession {
  id: string;
  creatorId: string;
  sessionType: string;
  mode: string; // 'local' | 'online'
  status: string;
  currentTurnProfileId: string | null;
  currentRoundId: string | null; // For online mode
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

export function useActiveSessions() {
  return useQuery({
    queryKey: ['sessions', 'active'],
    queryFn: () => apiClient.get<GameSession[]>('/api/sessions'),
    refetchInterval: 5000, // Poll every 5 seconds for new sessions
  });
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

// ============================================================================
// ONLINE MODE HOOKS
// ============================================================================

export interface OnlineRound {
  id: string;
  sessionId: string;
  cardId: string;
  roundNumber: number;
  status: 'waiting' | 'completed';
  startedAt: string;
  completedAt: string | null;
  card: {
    id: string;
    type: string;
    category: string;
    difficulty: string;
    content: string;
  };
  answers: Array<{
    id: string;
    roundId: string;
    profileId: string;
    answer: string;
    answeredAt: string;
    profile: {
      id: string;
      nickname: string;
      user: {
        image: string | null;
      };
    };
  }>;
  metadata?: {
    totalParticipants: number;
    totalAnswers: number;
    waitingCount: number;
    waitingProfiles: Array<{
      id: string;
      nickname: string;
      image: string | null;
    }>;
    currentUserAnswered: boolean;
  };
}

export interface SessionStatus {
  sessionId: string;
  mode: string;
  sessionType: string;
  status: string;
  totalRounds: number;
  completedRounds: number;
  cardsPlayed: number;
  canStartNext: boolean;
  answersNeeded: number;
  currentRound: {
    roundNumber: number;
    status: string;
    answersReceived: number;
    answersNeeded: number;
    awaitingAnswers: number;
  } | null;
  participantCount: number;
}

// Create online session
export function useCreateOnlineSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { participantIds: string[]; difficulty?: string }) =>
      apiClient.post<GameSession>('/api/sessions/online', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}

// Start new round in online session
export function useStartRound(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post<OnlineRound>(`/api/sessions/${sessionId}/rounds/start`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'rounds', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'status'] });
    },
  });
}

// Submit answer to current round
export function useSubmitAnswer(sessionId: string, roundId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { answer: string }) =>
      apiClient.post(`/api/sessions/${sessionId}/rounds/${roundId}/answer`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'rounds', 'current'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId, 'status'] });
    },
  });
}

// Get current round (with polling)
export function useCurrentRound(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'rounds', 'current'],
    queryFn: async () => {
      const data = await apiClient.get<OnlineRound | null>(`/api/sessions/${sessionId}/rounds/current`);
      console.log('[useCurrentRound] Fetched:', {
        hasRound: !!data,
        status: data?.status,
        totalAnswers: data?.metadata?.totalAnswers,
        totalParticipants: data?.metadata?.totalParticipants,
      });
      return data;
    },
    enabled: !!sessionId,
    refetchInterval: (query) => {
      // If round exists and all answered but status is still 'waiting', poll faster
      const round = query.state.data;
      if (round && round.metadata) {
        const allAnswered = round.metadata.totalAnswers >= round.metadata.totalParticipants;
        const isWaiting = round.status === 'waiting';

        if (allAnswered && isWaiting) {
          console.log('[useCurrentRound] All answered but status=waiting, polling every 500ms');
          return 500; // Poll every 500ms when waiting for completion
        }
      }
      return 3000; // Normal polling every 3 seconds
    },
  });
}

// Get session status (with polling)
export function useSessionStatus(sessionId: string) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'status'],
    queryFn: () => apiClient.get<SessionStatus>(`/api/sessions/${sessionId}/status`),
    enabled: !!sessionId,
    refetchInterval: 3000, // Poll every 3 seconds
  });
}

// Leave session (individual participant)
export function useLeaveSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) =>
      apiClient.post(`/api/sessions/${sessionId}/leave`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
}
