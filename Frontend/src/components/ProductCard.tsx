import { ShoppingCart, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { useCartStore } from '../store/cart';
import { formatPrice } from '../lib/utils';
import type { Product } from '../hooks/useProducts';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCartStore();
  const navigate = useNavigate();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      sku: product.sku,
      price: product.price,
      image_url: product.image_url,
      stock: product.stock,
    });
  };

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const isOutOfStock = product.stock === 0;
  
  // Obtener la primera imagen disponible
  const displayImage = product.images && product.images.length > 0
    ? product.images[0].image_url
    : product.image_url;

  return (
    <Card 
      className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="aspect-square overflow-hidden rounded-t-lg">
        {displayImage ? (
          <img
            src={displayImage}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            onError={(e) => {
              // Si la imagen falla al cargar, mostrar el ícono por defecto
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<div class="h-full w-full bg-muted flex items-center justify-center"><svg class="h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
              }
            }}
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <Package className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <CardHeader className="flex-1">
        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
        <div className="space-y-1 text-sm text-muted-foreground">
          <p>SKU: {product.sku}</p>
          {product.barcode && <p>Código: {product.barcode}</p>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
          <div className="flex items-center space-x-1 text-sm">
            <Package className="h-4 w-4" />
            <span className={isOutOfStock ? 'text-destructive' : 'text-muted-foreground'}>
              {isOutOfStock ? 'Sin stock' : `${product.stock} disponibles`}
            </span>
          </div>
        </div>

        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {product.description}
          </p>
        )}

        <Button
          className="w-full transition-all duration-200 hover:scale-105 active:scale-95"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Sin stock' : 'Agregar al carrito'}
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Haz clic en la tarjeta para ver detalles
        </p>
      </CardContent>
    </Card>
  );
}
