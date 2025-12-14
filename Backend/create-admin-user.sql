-- Script para crear usuario admin en Supabase
-- Ejecuta este script en el SQL Editor de Supabase

-- PASO 1: Verificar si el usuario ya existe
SELECT id, full_name, email, role_id, created_at 
FROM users 
WHERE email = 'admin@test.com';

-- PASO 2: Si no existe, ejecuta este INSERT
-- Hash generado para contraseña: admin123
-- Si quieres cambiar la contraseña, edita generate-password-hash.js y genera un nuevo hash

INSERT INTO users (full_name, email, password_hash, role_id, created_at)
VALUES (
  'Administrador',
  'admin@test.com',
  '$2a$12$cR/Cc5Qq1aPSC/.Yc8oYIO7EdwFANhZbvBeJykRUxB004kF2Ze7BG',  -- Hash para: admin123
  1,               -- 1 = admin
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- PASO 3: Verificar que el usuario se creó correctamente
SELECT id, full_name, email, role_id, created_at 
FROM users 
WHERE email = 'admin@test.com';

