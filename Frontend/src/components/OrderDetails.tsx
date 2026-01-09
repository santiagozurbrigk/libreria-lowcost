import { X, ShoppingBag, User, MapPin, Phone, Mail, DollarSign, Calendar, Package, Clock, CheckCircle, Truck } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { OrderBarcode } from './OrderBarcode';
import type { Order } from '../hooks/useOrders';

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
}

export function OrderDetails({ order, onClose }: OrderDetailsProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="h-4 w-4" />;
      case 'preparando':
        return <Package className="h-4 w-4" />;
      case 'listo':
        return <CheckCircle className="h-4 w-4" />;
      case 'entregado':
        return <Truck className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'preparando':
        return 'bg-primary/10 text-primary border border-primary/20';
      case 'listo':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'entregado':
        return 'bg-gray-50 text-gray-700 border border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto border shadow-lg" style={{ backgroundColor: 'white' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <CardTitle>Detalles de la Reserva #{order.id}</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Información de la reserva */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Información de la Reserva</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Fecha de Creación</label>
                    <p className="text-sm">{formatDate(order.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Última Actualización</label>
                    <p className="text-sm">{formatDate(order.updated_at)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Total</label>
                    <p className="text-lg font-semibold text-primary">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1 capitalize">{order.status}</span>
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Estado de Pago</label>
                  <div className="mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.is_paid 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {order.is_paid ? 'Pagado' : 'Pendiente de pago'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                    <p className="text-sm">{order.customer_name || 'Cliente sin nombre'}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Email</label>
                    <p className="text-sm">{order.customer_email || 'Sin email'}</p>
                  </div>
                </div>

                {(order.customer_phone || order.clients?.phone) && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <p className="text-sm">{order.customer_phone || order.clients?.phone}</p>
                    </div>
                  </div>
                )}

                {order.clients.address && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                      <p className="text-sm">{order.clients.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Código de Barras */}
          {order.barcode && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Código de Barras de la Reserva</h3>
              <OrderBarcode 
                barcode={order.barcode} 
                orderId={order.id.toString()}
                orderItems={order.order_items}
                total={order.total}
              />
            </div>
          )}

          {/* Items de la reserva */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Productos de la Reserva</h3>
            <div className="space-y-3">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center">
                      <Package className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{item.products.name}</div>
                      {item.products.sku && (
                        <div className="text-sm text-muted-foreground font-mono">SKU: {item.products.sku}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-primary">${item.price.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">x{item.quantity}</div>
                    <div className="font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total de la Reserva:</span>
                <span className="text-primary">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

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
