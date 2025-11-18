import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  stock: number;
  supplier?: string;
  image_url?: string;
  created_at: string;
}

export interface CreateProductData {
  name: string;
  sku: string;
  barcode?: string;
  description?: string;
  price: number;
  stock: number;
  supplier?: string;
  image_url?: string;
}

export interface UpdateProductData extends Partial<CreateProductData> {}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Hook para obtener productos
export const useProducts = (params?: {
  page?: number;
  limit?: number;
  search?: string;
}) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async (): Promise<ProductsResponse> => {
      const response = await api.get('/products', { params });
      return response.data;
    },
  });
};

// Hook para obtener un producto por ID
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async (): Promise<{ success: boolean; data: Product }> => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};

// Hook para buscar producto por código de barras
export const useProductByBarcode = (barcode: string) => {
  return useQuery({
    queryKey: ['product-barcode', barcode],
    queryFn: async (): Promise<{ success: boolean; data: Product }> => {
      const response = await api.get(`/products/search/${barcode}`);
      return response.data;
    },
    enabled: !!barcode,
  });
};

// Hook para crear producto
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProductData): Promise<{ success: boolean; data: Product }> => {
      const response = await api.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Hook para actualizar producto
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductData }): Promise<{ success: boolean; data: Product }> => {
      const response = await api.patch(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', id] });
    },
  });
};

// Hook para eliminar producto
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<{ success: boolean }> => {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};
