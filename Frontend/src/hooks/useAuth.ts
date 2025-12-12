import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore, type User } from '../store/auth';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'empleado' | 'cliente';
  phone?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
  };
}

// Función helper para validar y convertir el role
const validateRole = (role: string): 'admin' | 'empleado' | 'cliente' => {
  if (role === 'admin' || role === 'empleado' || role === 'cliente') {
    return role;
  }
  return 'cliente'; // Default fallback
};

// Hook para login
export const useLogin = () => {
  const { login } = useAuthStore();
  
  return useMutation({
    mutationFn: async (data: LoginData): Promise<AuthResponse> => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: validateRole(data.user.role),
        phone: data.user.phone,
      };
      login(user, data.token);
    },
  });
};

// Hook para registro
export const useRegister = () => {
  const { login } = useAuthStore();
  
  return useMutation({
    mutationFn: async (data: RegisterData): Promise<AuthResponse> => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      const user: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: validateRole(data.user.role),
        phone: data.user.phone,
      };
      login(user, data.token);
    },
  });
};

// Hook para obtener perfil del usuario
export const useProfile = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const response = await api.get('/auth/profile');
      return response.data;
    },
    enabled: isAuthenticated,
  });
};

// Hook para logout
export const useLogout = () => {
  const { logout } = useAuthStore();
  
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      logout();
    },
  });
};
