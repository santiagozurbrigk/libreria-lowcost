import { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import type { Order } from '../hooks/useOrders';

interface OrderStatusUpdateProps {
  order: Order;
  onSubmit: (orderId: string, data: any) => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function OrderStatusUpdate({ order, onSubmit, onCancel, isLoading }: OrderStatusUpdateProps) {
  const [status, setStatus] = useState(order.status);
  const [isPaid, setIsPaid] = useState(order.is_paid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(order.id.toString(), {
      status,
      is_paid: isPaid,
    });
  };

  const statusOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'preparando', label: 'Preparando' },
    { value: 'listo', label: 'Listo para retirar' },
    { value: 'entregado', label: 'Entregado' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md border shadow-lg" style={{ backgroundColor: 'white' }}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5" />
            <CardTitle>Actualizar Reserva #{order.id}</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información de la reserva */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-2">Cliente</div>
              <div className="font-medium">{order.customer_name || 'Cliente sin nombre'}</div>
              <div className="text-sm text-muted-foreground">{order.customer_email || 'Sin email'}</div>
              <div className="text-sm text-muted-foreground mt-1">Total: ${order.total.toFixed(2)}</div>
            </div>

            {/* Estado de la reserva */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium mb-2">
                Estado de la Reserva
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Estado de pago */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Estado de Pago
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={isPaid}
                    onChange={() => setIsPaid(true)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Pagado</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="payment"
                    checked={!isPaid}
                    onChange={() => setIsPaid(false)}
                    className="text-primary focus:ring-primary"
                  />
                  <span className="text-sm">Pendiente</span>
                </label>
              </div>
            </div>

            {/* Resumen de cambios */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-2">Resumen de cambios:</div>
              <div className="text-sm text-blue-800 space-y-1">
                <div>• Estado: {statusOptions.find(opt => opt.value === status)?.label}</div>
                <div>• Pago: {isPaid ? 'Pagado' : 'Pendiente'}</div>
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
                    Actualizando...
                  </>
                ) : (
                  'Actualizar Reserva'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
