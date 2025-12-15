import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProduct } from '../hooks/useProducts';
import { useCartStore } from '../store/cart';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { formatPrice } from '../lib/utils';
import { useState } from 'react';

export function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useProduct(id || '');
  const { addItem } = useCartStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-32 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Producto no encontrado</h2>
            <p className="text-muted-foreground mb-6">
              El producto que buscas no existe o ha sido eliminado.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al catálogo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const product = data.data;
  const images = product.images && product.images.length > 0 
    ? product.images.map(img => img.image_url)
    : product.image_url 
      ? [product.image_url]
      : [];

  const currentImage = images[selectedImageIndex] || null;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image_url: images[0] || product.image_url,
      stock: product.stock,
    });
  };

  const handlePreviousImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Botón de volver */}
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-6 transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al catálogo
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            {/* Imagen principal */}
            <Card className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                {currentImage ? (
                  <>
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="h-full w-full bg-muted flex items-center justify-center"><svg class="h-24 w-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }
                      }}
                    />
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={handlePreviousImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white"
                          onClick={handleNextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                          {selectedImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="h-full w-full bg-muted flex items-center justify-center">
                    <Package className="h-24 w-24 text-muted-foreground" />
                  </div>
                )}
              </div>
            </Card>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-primary ring-2 ring-primary ring-offset-2'
                        : 'border-transparent hover:border-muted-foreground/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} - Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              {product.sku && (
                <p className="text-muted-foreground font-mono text-sm">SKU: {product.sku}</p>
              )}
              {product.barcode && (
                <p className="text-muted-foreground font-mono text-sm">Código: {product.barcode}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-4xl font-bold">{formatPrice(product.price)}</span>
              <div className="flex items-center space-x-2 text-sm">
                <Package className="h-4 w-4" />
                <span className={isOutOfStock ? 'text-destructive font-semibold' : 'text-muted-foreground'}>
                  {isOutOfStock ? 'Sin stock' : `${product.stock} disponibles`}
                </span>
              </div>
            </div>

            {product.description && (
              <div>
                <h2 className="text-xl font-semibold mb-2">Descripción</h2>
                <p className="text-muted-foreground whitespace-pre-line">{product.description}</p>
              </div>
            )}

            <div className="pt-6 border-t">
              <Button
                className="w-full text-lg py-6 transition-all duration-200 hover:scale-105 active:scale-95"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

