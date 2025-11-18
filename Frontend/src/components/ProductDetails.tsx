import { X, Package, DollarSign, Hash, Barcode, Image } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import type { Product } from '../hooks/useProducts';

interface ProductDetailsProps {
  product: Product;
  onClose: () => void;
}

export function ProductDetails({ product, onClose }: ProductDetailsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white animate-zoom-in">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5" />
            <CardTitle>Detalles del Producto</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Información Básica</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                  <p className="text-sm">{product.name}</p>
                </div>
                
                {product.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Descripción</label>
                    <p className="text-sm">{product.description}</p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                  <p className="text-sm">{formatDate(product.created_at)}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Precio y Stock</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Precio</label>
                    <p className="text-lg font-semibold">${product.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Stock</label>
                    <p className={`text-lg font-semibold ${
                      product.stock > 10 
                        ? 'text-green-700' 
                        : product.stock > 0 
                          ? 'text-yellow-700'
                          : 'text-red-700'
                    }`}>
                      {product.stock} unidades
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    product.stock > 0 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {product.stock > 0 ? 'Disponible' : 'Agotado'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Códigos y Referencias */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Códigos y Referencias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {product.sku && (
                <div className="flex items-center space-x-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">SKU</label>
                    <p className="text-sm font-mono">{product.sku}</p>
                  </div>
                </div>
              )}

              {product.barcode && (
                <div className="flex items-center space-x-2">
                  <Barcode className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Código de Barras</label>
                    <p className="text-sm font-mono">{product.barcode}</p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Imagen */}
          {product.image_url && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Imagen del Producto</h3>
              <div className="flex items-center space-x-2">
                <Image className="h-4 w-4 text-muted-foreground" />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">URL de Imagen</label>
                  <p className="text-sm break-all">{product.image_url}</p>
                </div>
              </div>
              <div className="mt-4">
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="max-w-full h-48 object-cover rounded-md border"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<div class="h-48 w-full bg-muted flex items-center justify-center rounded-md border"><svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                      }
                    }}
                  />
                ) : (
                  <div className="h-48 w-full bg-muted flex items-center justify-center rounded-md border">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón de cerrar */}
          <div className="flex justify-end pt-6 border-t">
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
