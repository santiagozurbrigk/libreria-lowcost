import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, ShoppingBag, CheckCircle } from 'lucide-react';
import { useCartStore } from '../store/cart';
import { useCreateOrder } from '../hooks/useOrders';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { formatPrice } from '../lib/utils';

const checkoutSchema = z.object({
  customer_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  customer_phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  customer_email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export function Checkout() {
  const navigate = useNavigate();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const createOrder = useCreateOrder();
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
  });

  const onSubmit = async (data: CheckoutFormData) => {
    try {
      const orderData = {
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_email: data.customer_email || undefined,
        items: items.map(item => ({
          product_id: Number(item.id),
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
        total: getTotalPrice(),
      };

      await createOrder.mutateAsync(orderData);
      clearCart();
      setIsSuccess(true);
    } catch (error) {
      console.error('Error creando reserva:', error);
    }
  };

  if (items.length === 0 && !isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-8 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Tu carrito está vacío</h2>
            <p className="text-muted-foreground mb-6">
              Agrega algunos productos antes de proceder a la reserva.
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

  if (isSuccess) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Reserva exitosa</h2>
            <p className="text-muted-foreground mb-4">
              A la brevedad nos contactaremos para coordinar el pago y envio
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              Volver al catálogo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al catálogo
          </Button>
          <h1 className="text-3xl font-bold">Confirmar Reserva</h1>
          <p className="text-muted-foreground">
            Completa tus datos para finalizar la reserva
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Datos de Contacto</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="customer_name" className="block text-sm font-medium mb-2">
                    Nombre completo *
                  </label>
                  <input
                    id="customer_name"
                    type="text"
                    {...register('customer_name')}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tu nombre completo"
                  />
                  {errors.customer_name && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.customer_name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="customer_phone" className="block text-sm font-medium mb-2">
                    Teléfono *
                  </label>
                  <input
                    id="customer_phone"
                    type="tel"
                    {...register('customer_phone')}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="11 1234-5678"
                  />
                  {errors.customer_phone && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.customer_phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="customer_email" className="block text-sm font-medium mb-2">
                    Email (opcional)
                  </label>
                  <input
                    id="customer_email"
                    type="email"
                    {...register('customer_email')}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="tu@email.com"
                  />
                  {errors.customer_email && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.customer_email.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? 'Procesando...' : 'Confirmar Reserva'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen de la Reserva</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">💡 Proceso simple y rápido:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• <strong>Sin registro necesario</strong> - Solo completa tus datos</li>
                    <li>• <strong>Pago al retirar</strong> - No necesitas pagar ahora</li>
                    <li>• <strong>Notificación por WhatsApp</strong> - Te avisamos cuando esté listo</li>
                    <li>• <strong>Preparación rápida</strong> - 24-48 horas máximo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
