import { ShoppingCart, X, Plus, Minus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cart';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatPrice } from '../lib/utils';

export function Cart() {
  const navigate = useNavigate();
  const {
    items,
    isOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    clearCart,
    getTotalItems,
    getTotalPrice,
  } = useCartStore();

  const handleCheckout = () => {
    toggleCart(); // Cerrar el carrito
    navigate('/checkout'); // Navegar al checkout
  };

  if (!isOpen) {
    return (
      <button
        onClick={toggleCart}
        className="fixed bottom-6 right-6 z-50 bg-white text-gray-800 rounded-full p-4 shadow-lg hover:bg-gray-50 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-gray-200 animate-slide-in-bottom"
      >
        <ShoppingCart className="h-6 w-6" />
        {getTotalItems() > 0 && (
          <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full h-6 w-6 flex items-center justify-center">
            {getTotalItems()}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 animate-fade-in" onClick={toggleCart}>
      <div
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl animate-slide-in-right"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-full flex-col">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-semibold">
              Carrito ({getTotalItems()})
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={toggleCart}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Tu carrito está vacío</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-muted rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Sin imagen</span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      <p className="text-sm font-medium">{formatPrice(item.price)}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      
                      <span className="w-8 text-center">{item.quantity}</span>
                      
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span>{formatPrice(getTotalPrice())}</span>
              </div>
              
              <div className="space-y-2">
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceder al Pedido
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={clearCart}
                >
                  Vaciar Carrito
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
