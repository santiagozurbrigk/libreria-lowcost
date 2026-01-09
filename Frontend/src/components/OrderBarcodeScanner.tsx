import { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { X, Camera, Keyboard, Search, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { useOrderByBarcode } from '../hooks/useOrders';
import { OrderDetails } from './OrderDetails';
import type { Order } from '../hooks/useOrders';

interface OrderBarcodeScannerProps {
  onClose: () => void;
  onOrderFound?: (order: Order) => void;
  onOrderNotFound?: (barcode: string) => void;
}

export function OrderBarcodeScanner({ onClose, onOrderFound, onOrderNotFound }: OrderBarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('camera');
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedBarcode, setScannedBarcode] = useState<string | null>(null);
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const barcodeBufferRef = useRef<string>('');
  const lastKeyTimeRef = useRef<number>(0);

  const { data: orderData, isLoading: isLoadingOrder, error: orderError } = useOrderByBarcode(scannedBarcode || '');

  // Inicializar el lector de código de barras
  useEffect(() => {
    if (mode === 'camera' && !codeReaderRef.current) {
      codeReaderRef.current = new BrowserMultiFormatReader();
    }

    return () => {
      // Limpiar recursos al desmontar
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, [mode]);

  // Detectar escaneo de lector físico de código de barras
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInputFocused = document.activeElement === inputRef.current;
      
      // Si el usuario está escribiendo en otro input/textarea, ignorar
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !isInputFocused) {
        return;
      }

      const now = Date.now();
      const timeSinceLastKey = now - lastKeyTimeRef.current;

      // Si pasó más de 100ms desde la última tecla, reiniciar el buffer
      // (los lectores físicos envían caracteres muy rápido, menos de 50ms entre cada uno)
      if (timeSinceLastKey > 100) {
        barcodeBufferRef.current = '';
      }

      lastKeyTimeRef.current = now;

      // Si es Enter y tenemos caracteres en el buffer, procesar el código
      if (e.key === 'Enter' && barcodeBufferRef.current.length > 0) {
        // Solo procesar si NO estamos escribiendo en el input (escaneo físico)
        // O si el buffer tiene muchos caracteres (indicando escaneo rápido)
        if (!isInputFocused || barcodeBufferRef.current.length > 5) {
          e.preventDefault();
          e.stopPropagation();
          const scannedCode = barcodeBufferRef.current.trim();
          barcodeBufferRef.current = '';
          
          if (scannedCode.length > 0) {
            // Limpiar el código: eliminar espacios y caracteres especiales al inicio/final
            const cleanedCode = scannedCode.trim().replace(/[\r\n\t]/g, '');
            
            // Cambiar automáticamente a modo manual si estamos en modo cámara
            if (mode === 'camera') {
              setMode('manual');
            }
            setBarcode(cleanedCode);
            setScannedBarcode(cleanedCode);
            setError(null);
            setFoundOrder(null); // Limpiar reserva encontrada anterior
            console.log('Buscando reserva con código:', cleanedCode);
            // Enfocar el input después de procesar
            setTimeout(() => {
              inputRef.current?.focus();
            }, 50);
          }
        }
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
        // Solo agregar al buffer si NO estamos escribiendo en el input
        // O si detectamos escaneo rápido (caracteres muy seguidos)
        if (!isInputFocused || timeSinceLastKey < 50) {
          // Si estamos en modo cámara y detectamos caracteres rápidos, cambiar a manual
          if (mode === 'camera' && timeSinceLastKey < 100 && barcodeBufferRef.current.length === 0) {
            setMode('manual');
          }
          barcodeBufferRef.current += e.key;
        }
      }
    };

    // Agregar listener global cuando el componente está montado
    window.addEventListener('keydown', handleKeyPress);

    // Enfocar el input cuando se cambia a modo manual
    if (mode === 'manual' && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [mode]);

  // Iniciar escaneo con cámara
  const startScanning = async () => {
    if (!videoRef.current) return;

    setError(null);
    setIsScanning(true);

    try {
      const codeReader = codeReaderRef.current;
      if (!codeReader) {
        throw new Error('Lector de código de barras no inicializado');
      }

      // Obtener lista de cámaras disponibles
      const videoInputDevices = await codeReader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No se encontraron cámaras disponibles');
      }

      // Usar la primera cámara disponible (o la trasera si está disponible)
      const selectedDeviceId = videoInputDevices.length > 1 
        ? videoInputDevices.find(device => device.label.toLowerCase().includes('back') || device.label.toLowerCase().includes('rear'))?.deviceId || videoInputDevices[0].deviceId
        : videoInputDevices[0].deviceId;

      // Decodificar desde el video
      codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current, (result, err) => {
        if (result) {
          const scannedCode = result.getText();
          setScannedBarcode(scannedCode);
          setIsScanning(false);
          codeReader.reset();
        }
        
        if (err && !(err instanceof NotFoundException)) {
          console.error('Error escaneando:', err);
          setError('Error al escanear código de barras');
        }
      });
    } catch (err: any) {
      console.error('Error iniciando escaneo:', err);
      setError(err.message || 'Error al acceder a la cámara');
      setIsScanning(false);
    }
  };

  // Detener escaneo
  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setIsScanning(false);
    setError(null);
  };

  // Manejar búsqueda manual
  const handleManualSearch = () => {
    if (!barcode.trim()) {
      setError('Por favor ingresa un código de barras');
      return;
    }
    const cleanedCode = barcode.trim().replace(/[\r\n\t]/g, '');
    setScannedBarcode(cleanedCode);
    setError(null);
    setFoundOrder(null); // Limpiar reserva encontrada anterior
    console.log('Buscando reserva con código:', cleanedCode);
  };

  // Manejar resultado de búsqueda
  useEffect(() => {
    if (scannedBarcode) {
      // Solo procesar cuando la query haya terminado (no está cargando)
      if (!isLoadingOrder) {
        if (orderData?.data) {
          setFoundOrder(orderData.data);
          if (onOrderFound) {
            onOrderFound(orderData.data);
          }
        } else if (orderError) {
          // No llamar a onOrderNotFound automáticamente
          // Solo mostrar el error en la UI para que el usuario pueda intentar de nuevo
          setError(`Reserva no encontrada con código: ${scannedBarcode}`);
        }
      }
    }
  }, [orderData, orderError, scannedBarcode, isLoadingOrder, onOrderFound]);

  // Cambiar modo
  const handleModeChange = (newMode: 'camera' | 'manual') => {
    stopScanning();
    setMode(newMode);
    setBarcode('');
    setScannedBarcode(null);
    setFoundOrder(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white animate-zoom-in-95">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Buscar Reserva por Código de Barras
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              stopScanning();
              onClose();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selector de modo */}
          <div className="flex gap-2">
            <Button
              variant={mode === 'camera' ? 'default' : 'outline'}
              onClick={() => handleModeChange('camera')}
              className="flex-1"
            >
              <Camera className="mr-2 h-4 w-4" />
              Cámara
            </Button>
            <Button
              variant={mode === 'manual' ? 'default' : 'outline'}
              onClick={() => handleModeChange('manual')}
              className="flex-1"
            >
              <Keyboard className="mr-2 h-4 w-4" />
              Manual
            </Button>
          </div>

          {/* Modo cámara */}
          {mode === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                />
                {!isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Presiona "Iniciar Escaneo" para comenzar</p>
                    </div>
                  </div>
                )}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-white rounded-lg w-64 h-32 animate-pulse" />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {!isScanning ? (
                  <Button onClick={startScanning} className="flex-1">
                    <Camera className="mr-2 h-4 w-4" />
                    Iniciar Escaneo
                  </Button>
                ) : (
                  <Button onClick={stopScanning} variant="destructive" className="flex-1">
                    Detener Escaneo
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Modo manual */}
          {mode === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ingresa el código de barras de la reserva
                </label>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleManualSearch();
                      }
                    }}
                    placeholder="ORD20251214000001"
                    className="flex-1 px-3 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    autoFocus
                  />
                  <Button onClick={handleManualSearch}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Mensajes de error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Estado de búsqueda */}
          {scannedBarcode && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Search className="h-4 w-4 text-blue-700" />
                <span className="text-sm text-blue-700">
                  Buscando reserva con código: <strong className="font-mono">{scannedBarcode}</strong>
                </span>
              </div>

              {isLoadingOrder && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Buscando reserva...</p>
                </div>
              )}

              {orderError && !isLoadingOrder && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">Reserva no encontrada con código: <strong className="font-mono">{scannedBarcode}</strong></span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setScannedBarcode(null);
                        setBarcode('');
                        setError(null);
                        inputRef.current?.focus();
                      }}
                      className="flex-1"
                    >
                      Intentar de Nuevo
                    </Button>
                    {onOrderNotFound && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          onOrderNotFound(scannedBarcode);
                        }}
                        className="flex-1"
                      >
                        Cerrar
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {foundOrder && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Reserva encontrada</span>
                  </div>
                  <div className="border rounded-lg p-4">
                    <OrderDetails
                      order={foundOrder}
                      onClose={() => {
                        setFoundOrder(null);
                        setScannedBarcode(null);
                        setBarcode('');
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instrucciones */}
          <div className="text-xs text-muted-foreground space-y-1 pt-4 border-t">
            <p><strong>Modo Cámara:</strong> Escanea el código de barras de la reserva física usando la cámara.</p>
            <p><strong>Modo Manual:</strong> Ingresa el código de barras manualmente o usa un lector USB.</p>
            <p className="text-yellow-600"><strong>Nota:</strong> Asegúrate de permitir el acceso a la cámara cuando el navegador lo solicite.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

