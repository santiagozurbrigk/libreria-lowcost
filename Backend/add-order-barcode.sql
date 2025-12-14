-- Script para agregar campo barcode a la tabla orders
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Agregar columna barcode a la tabla orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS barcode VARCHAR(50) UNIQUE;

-- 2. Crear función para generar código de barras único
CREATE OR REPLACE FUNCTION generate_order_barcode()
RETURNS TRIGGER AS $$
DECLARE
  new_barcode VARCHAR(50);
BEGIN
  -- Generar código de barras basado en timestamp y ID
  -- Formato: ORD + año + mes + día + últimos 6 dígitos del UUID
  new_barcode := 'ORD' || 
    TO_CHAR(NOW(), 'YYYYMMDD') || 
    RIGHT(REPLACE(NEW.id::TEXT, '-', ''), 6);
  
  -- Asegurar que sea único
  WHILE EXISTS (SELECT 1 FROM orders WHERE barcode = new_barcode) LOOP
    new_barcode := 'ORD' || 
      TO_CHAR(NOW(), 'YYYYMMDD') || 
      RIGHT(REPLACE(NEW.id::TEXT, '-', ''), 6) ||
      LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
  END LOOP;
  
  NEW.barcode := new_barcode;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Crear trigger para generar código de barras automáticamente
DROP TRIGGER IF EXISTS generate_order_barcode_trigger ON orders;
CREATE TRIGGER generate_order_barcode_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.barcode IS NULL)
  EXECUTE FUNCTION generate_order_barcode();

-- 4. Generar códigos de barras para pedidos existentes que no tienen código
DO $$
DECLARE
  order_record RECORD;
  new_barcode VARCHAR(50);
BEGIN
  FOR order_record IN SELECT id, created_at FROM orders WHERE barcode IS NULL LOOP
    -- Generar código único para pedidos existentes
    new_barcode := 'ORD' || 
      TO_CHAR(order_record.created_at, 'YYYYMMDD') || 
      RIGHT(REPLACE(order_record.id::TEXT, '-', ''), 6);
    
    -- Asegurar que sea único
    WHILE EXISTS (SELECT 1 FROM orders WHERE barcode = new_barcode) LOOP
      new_barcode := 'ORD' || 
        TO_CHAR(order_record.created_at, 'YYYYMMDD') || 
        RIGHT(REPLACE(order_record.id::TEXT, '-', ''), 6) ||
        LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    END LOOP;
    
    UPDATE orders SET barcode = new_barcode WHERE id = order_record.id;
  END LOOP;
END $$;

-- 5. Verificar que todos los pedidos tienen código de barras
SELECT COUNT(*) as total_orders, 
       COUNT(barcode) as orders_with_barcode,
       COUNT(*) - COUNT(barcode) as orders_without_barcode
FROM orders;

