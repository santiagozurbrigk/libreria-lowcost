import { useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import { Download, Barcode } from 'lucide-react';
import { Button } from './ui/Button';

interface OrderBarcodeProps {
  barcode: string;
  orderId?: string;
}

export function OrderBarcode({ barcode, orderId }: OrderBarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `codigo-barras-${barcode}${orderId ? `-${orderId}` : ''}.png`;
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
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded-lg border">
      <div className="flex items-center gap-2 mb-2">
        <Barcode className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Código de Barras</span>
      </div>
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

