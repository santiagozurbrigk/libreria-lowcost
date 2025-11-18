import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Package, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import type { Product, CreateProductData, UpdateProductData } from '../hooks/useProducts';
import { useImageUpload } from '../hooks/useImageUpload';
import { useState } from 'react';

const productSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.number().min(0, 'El stock debe ser mayor o igual a 0'),
  image_url: z.string().url('Debe ser una URL válida').optional().or(z.literal('')),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: CreateProductData | UpdateProductData) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function ProductForm({ product, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const isEditing = !!product;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageUpload = useImageUpload();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      description: product.description || '',
      price: product.price,
      sku: product.sku || '',
      barcode: product.barcode || '',
      stock: product.stock,
      image_url: product.image_url || '',
    } : {
      name: '',
      description: '',
      price: 0,
      sku: '',
      barcode: '',
      stock: 0,
      image_url: '',
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;

    try {
      const result = await imageUpload.mutateAsync(selectedFile);
      setValue('image_url', result.data.url);
      setPreviewUrl(result.data.url);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error subiendo imagen:', error);
    }
  };

  const handleFormSubmit = (data: ProductFormData) => {
    // Limpiar campos vacíos
    const cleanData = {
      ...data,
      description: data.description || undefined,
      sku: data.sku || undefined,
      barcode: data.barcode || undefined,
      image_url: data.image_url || undefined,
    };
    
    onSubmit(cleanData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white animate-zoom-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <CardTitle>
              {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
            </CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Nombre del Producto *
                </label>
                <input
                  id="name"
                  {...register('name')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Ej: Lapicera Bic Azul"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Descripción
                </label>
                <textarea
                  id="description"
                  {...register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Descripción detallada del producto"
                />
                {errors.description && (
                  <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
                )}
              </div>

              {/* Precio */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium mb-2">
                  Precio *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price', { valueAsNumber: true })}
                    className="w-full pl-8 pr-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                  />
                </div>
                {errors.price && (
                  <p className="text-sm text-destructive mt-1">{errors.price.message}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium mb-2">
                  Stock *
                </label>
                <input
                  id="stock"
                  type="number"
                  {...register('stock', { valueAsNumber: true })}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label htmlFor="sku" className="block text-sm font-medium mb-2">
                  SKU
                </label>
                <input
                  id="sku"
                  {...register('sku')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Código único del producto"
                />
                {errors.sku && (
                  <p className="text-sm text-destructive mt-1">{errors.sku.message}</p>
                )}
              </div>

              {/* Código de Barras */}
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium mb-2">
                  Código de Barras
                </label>
                <input
                  id="barcode"
                  {...register('barcode')}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="1234567890123"
                />
                {errors.barcode && (
                  <p className="text-sm text-destructive mt-1">{errors.barcode.message}</p>
                )}
              </div>


              {/* Subida de Imagen */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Imagen del Producto
                </label>
                
                {/* Preview de imagen */}
                {previewUrl && (
                  <div className="mb-4">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
                
                {/* Input de archivo */}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  
                  {selectedFile && (
                    <div className="flex items-center space-x-2">
                      <Button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={imageUpload.isPending}
                        className="flex items-center space-x-2"
                      >
                        <Upload className="h-4 w-4" />
                        <span>
                          {imageUpload.isPending ? 'Subiendo...' : 'Subir Imagen'}
                        </span>
                      </Button>
                    </div>
                  )}
                  
                  {/* Campo oculto para la URL */}
                  <input
                    type="hidden"
                    {...register('image_url')}
                  />
                </div>
                
                {errors.image_url && (
                  <p className="text-sm text-destructive mt-1">{errors.image_url.message}</p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  isEditing ? 'Actualizar Producto' : 'Crear Producto'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
