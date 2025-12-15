import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  from: {
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
  to: {
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
}

export function useConnections(status?: string) {
  return useQuery({
    queryKey: ['connections', status],
    queryFn: () =>
      apiClient.get<Connection[]>(
        `/api/connections${status ? `?status=${status}` : ''}`
      ),
  });
}

export function useCreateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (toProfileId: string) =>
      apiClient.post<Connection>('/api/connections', { toProfileId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useUpdateConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.put<Connection>(`/api/connections/${id}`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}

export function useDeleteConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete<{ message: string }>(`/api/connections/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
    },
  });
}
