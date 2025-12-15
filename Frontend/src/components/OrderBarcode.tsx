import { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Barcode } from 'lucide-react';
import { Button } from './ui/Button';

interface OrderBarcodeProps {
  barcode: string;
  orderId?: string;
  orderItems?: Array<{
    products: {
      name: string;
    };
    quantity: number;
  }>;
  total?: number;
}

export function OrderBarcode({ barcode, orderId, orderItems, total }: OrderBarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (canvasRef.current && barcode) {
      try {
        JsBarcode(canvasRef.current, barcode, {
          format: 'CODE128',
          width: 2,
          height: 80,
          displayValue: true,
          fontSize: 16,
          margin: 10,
          background: '#ffffff',
          lineColor: '#000000',
        });
      } catch (error) {
        console.error('Error generando código de barras:', error);
      }
    }
  }, [barcode]);

  const handleDownload = () => {
    if (!containerRef.current) return;

    // Crear un canvas más grande para incluir el texto
    const container = containerRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar dimensiones del canvas
    const padding = 20;
    const barcodeCanvas = canvasRef.current;
    if (!barcodeCanvas) return;

    const barcodeWidth = barcodeCanvas.width;
    const barcodeHeight = barcodeCanvas.height;
    
    // Calcular altura del texto
    const lineHeight = 20;
    let textHeight = 0;
    let orderDetailsText = '';
    
    if (orderItems && orderItems.length > 0) {
      orderDetailsText = orderItems
        .map(item => `${item.products.name} x${item.quantity}`)
        .join('\n');
      const lines = orderDetailsText.split('\n').length;
      textHeight = lines * lineHeight + 10;
    }
    
    if (total !== undefined) {
      textHeight += lineHeight + 10;
    }

    canvas.width = barcodeWidth + padding * 2;
    canvas.height = barcodeHeight + textHeight + padding * 2;
    
    // Fondo blanco
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar texto arriba del código de barras
    ctx.fillStyle = '#000000';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    
    let yOffset = padding + 15;
    
    if (orderDetailsText) {
      const lines = orderDetailsText.split('\n');
      lines.forEach((line, index) => {
        ctx.fillText(line, canvas.width / 2, yOffset + index * lineHeight);
      });
      yOffset += lines.length * lineHeight + 10;
    }
    
    if (total !== undefined) {
      ctx.font = 'bold 16px Arial';
      ctx.fillText(`Total: $${total.toFixed(2)}`, canvas.width / 2, yOffset);
      yOffset += lineHeight + 10;
    }
    
    // Dibujar código de barras
    ctx.drawImage(barcodeCanvas, padding, yOffset);
    
    // Descargar imagen
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `codigo-barras-pedido-${orderId || barcode}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!barcode) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Barcode className="h-4 w-4" />
        <span className="text-sm">Sin código de barras</span>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Barcode className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Código de Barras</span>
      </div>
      
      {/* Información del pedido arriba del código */}
      {(orderItems && orderItems.length > 0) || total !== undefined ? (
        <div className="w-full text-center space-y-2 mb-4 pb-4 border-b">
          {orderItems && orderItems.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Detalles del Pedido:</p>
              {orderItems.map((item, index) => (
                <p key={index} className="text-sm">
                  {item.products.name} x{item.quantity}
                </p>
              ))}
            </div>
          )}
          {total !== undefined && (
            <div className="mt-3">
              <p className="text-lg font-bold">Total: ${total.toFixed(2)}</p>
            </div>
          )}
        </div>
      ) : null}
      
      <canvas ref={canvasRef} className="max-w-full" />
      <div className="text-center">
        <p className="text-sm font-mono font-semibold mb-2">{barcode}</p>
        <Button
          onClick={handleDownload}
          variant="outline"
          size="sm"
          className="transition-all duration-200 hover:scale-105"
        >
          <Download className="mr-2 h-4 w-4" />
          Descargar Imagen
        </Button>
      </div>
    </div>
  );
}

