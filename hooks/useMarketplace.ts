import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// ============================================================================
// TYPES
// ============================================================================

export interface Product {
  id: string;
  sellerId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
  seller: {
    id: string;
    nickname: string;
    storeName: string | null;
    user: {
      image: string | null;
    };
  };
}

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  createdAt: string;
  product: Product;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  totalAmount: number;
  status: string;
  pixKey: string;
  paymentProof: string | null;
  paymentProofUploadedAt: string | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  buyer: {
    id: string;
    nickname: string;
    user: {
      image: string | null;
      email: string;
    };
  };
  seller: {
    id: string;
    nickname: string;
    storeName: string | null;
    user: {
      image: string | null;
    };
  };
  orderItems: OrderItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productPrice: number;
  quantity: number;
  subtotal: number;
  product: {
    id: string;
    images: string[];
  };
}

// ============================================================================
// PRODUCTS HOOKS
// ============================================================================

export function useProducts(filters?: {
  category?: string;
  sellerId?: string;
  search?: string;
  activeOnly?: boolean;
}) {
  const params = new URLSearchParams();
  if (filters?.category) params.append('category', filters.category);
  if (filters?.sellerId) params.append('sellerId', filters.sellerId);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.activeOnly !== undefined) params.append('activeOnly', String(filters.activeOnly));

  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => apiClient.get<Product[]>(`/api/products?${params.toString()}`),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => apiClient.get<Product>(`/api/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      price: number;
      category: string;
      stock: number;
      images?: string[];
    }) => apiClient.post<Product>('/api/products', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      stock?: number;
      images?: string[];
      active?: boolean;
    }) => apiClient.patch<Product>(`/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ============================================================================
// CART HOOKS
// ============================================================================

export function useCart() {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => apiClient.get<{ items: CartItem[]; total: number }>('/api/cart'),
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { productId: string; quantity?: number }) =>
      apiClient.post<CartItem>('/api/cart', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useUpdateCartItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quantity: number) =>
      apiClient.patch<CartItem>(`/api/cart/${id}`, { quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/api/cart/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.delete('/api/cart'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

// ============================================================================
// ORDERS HOOKS
// ============================================================================

export function useOrders(type: 'buyer' | 'seller' = 'buyer', status?: string) {
  const params = new URLSearchParams({ type });
  if (status) params.append('status', status);

  return useQuery({
    queryKey: ['orders', type, status],
    queryFn: () => apiClient.get<Order[]>(`/api/orders?${params.toString()}`),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => apiClient.get<Order>(`/api/orders/${id}`),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { paymentProof: string }) =>
      apiClient.post<{ orders: Order[]; message: string }>('/api/orders', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useConfirmOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post(`/api/orders/${id}/confirm`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
    },
  });
}

export function useCancelOrder(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) =>
      apiClient.post(`/api/orders/${id}/cancel`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders', id] });
    },
  });
}
