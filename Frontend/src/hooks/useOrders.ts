import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  products: {
    id: number;
    name: string;
    sku?: string;
  };
}

export interface Order {
  id: number;
  client_id: number;
  total: number;
  status: 'pendiente' | 'preparando' | 'listo' | 'entregado';
  is_paid: boolean;
  created_at: string;
  updated_at: string;
  // Campos del cliente almacenados directamente en el pedido
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  clients: {
    id: number;
    phone?: string;
    address?: string;
    users?: {
      id: string;
      full_name: string;
      email: string;
    };
  };
  order_items: OrderItem[];
}

export interface OrdersResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UpdateOrderData {
  status?: 'pendiente' | 'preparando' | 'listo' | 'entregado';
  is_paid?: boolean;
}

export interface CreateOrderData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  items: {
    product_id: number;
    quantity: number;
    subtotal: number;
  }[];
  total: number;
}

// Hook para obtener pedidos
export const useOrders = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async (): Promise<OrdersResponse> => {
      const response = await api.get('/orders', { params });
      return response.data;
    },
  });
};

// Hook para obtener un pedido específico
export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<{ success: boolean; data: Order }> => {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para actualizar pedido
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateOrderData }) => {
      const response = await api.patch(`/orders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

// Hook para crear pedido
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await api.post('/orders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

// Hook para eliminar pedido
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/orders/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};