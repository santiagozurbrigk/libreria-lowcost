-- Script para crear tabla de imágenes de productos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Crear tabla product_images
CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  CONSTRAINT fk_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 2. Crear índice para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_display_order ON product_images(product_id, display_order);

-- 3. Migrar imágenes existentes de products.image_url a product_images
-- Solo para productos que tienen image_url pero no tienen imágenes en product_images
INSERT INTO product_images (product_id, image_url, display_order)
SELECT id, image_url, 0
FROM products
WHERE image_url IS NOT NULL 
  AND image_url != ''
  AND id NOT IN (SELECT DISTINCT product_id FROM product_images WHERE product_id IS NOT NULL);

