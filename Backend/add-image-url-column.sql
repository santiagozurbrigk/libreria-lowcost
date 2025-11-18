-- Agregar columna image_url a la tabla products
ALTER TABLE products 
ADD COLUMN image_url TEXT;

-- Crear bucket para imágenes de productos (si no existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir lectura pública de imágenes
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

-- Política para permitir subida de imágenes (solo usuarios autenticados)
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Política para permitir actualización de imágenes (solo usuarios autenticados)
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');

-- Política para permitir eliminación de imágenes (solo usuarios autenticados)
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE USING (bucket_id = 'product-images' AND auth.role() = 'authenticated');
