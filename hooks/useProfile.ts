import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import {
  CreateProfileInput,
  UpdateProfileInput,
} from '@/lib/validations/profile';

export interface Profile {
  id: string;
  userId: string;
  nickname: string;
  bio: string | null;
  orientation: string | null;
  // Marketplace - Seller fields
  isVendor: boolean;
  pixKey: string | null;
  storeName: string | null;
  storeDescription: string | null;
  // Delivery address fields
  deliveryAddress: string | null;
  deliveryCity: string | null;
  deliveryState: string | null;
  deliveryZipCode: string | null;
  deliveryComplement: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
  };
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => apiClient.get<Profile>('/api/profile'),
    retry: false,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProfileInput) =>
      apiClient.post<Profile>('/api/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileInput) =>
      apiClient.put<Profile>('/api/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}

export function useSearchProfiles(query: string) {
  return useQuery({
    queryKey: ['profiles', 'search', query],
    queryFn: () =>
      apiClient.get<Profile[]>(`/api/profile/search?q=${encodeURIComponent(query)}`),
    enabled: query.length >= 2,
  });
}

export function useUpdateProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (image: string) =>
      apiClient.patch('/api/user/image', { image }),
    onSuccess: () => {
      // Invalidate both profile and session queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
