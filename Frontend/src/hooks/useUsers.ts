import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role_id: number;
  role: string;
  created_at: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'empleado' | 'cliente';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'empleado' | 'cliente';
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Hook para obtener usuarios
export const useUsers = (params?: {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: async (): Promise<UsersResponse> => {
      const response = await api.get('/admin/users', { params });
      return response.data;
    },
  });
};

// Hook para obtener un usuario específico
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async (): Promise<{ success: boolean; data: User }> => {
      const response = await api.get(`/admin/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para crear usuario
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

// Hook para actualizar usuario
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const response = await api.patch(`/admin/users/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

// Hook para eliminar usuario
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/admin/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};
