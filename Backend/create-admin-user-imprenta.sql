-- Script para crear usuario admin: dzurbrigkimprenta@gmail.com
-- Ejecuta este script en el SQL Editor de Supabase

-- PASO 1: Verificar si el usuario ya existe
SELECT id, full_name, email, role_id, created_at 
FROM users 
WHERE email = 'dzurbrigkimprenta@gmail.com';

-- PASO 2: Crear el usuario admin
-- Email: dzurbrigkimprenta@gmail.com
-- Contraseña: AdministracionImprenta2025
-- Rol: Administrador (role_id = 1)

INSERT INTO users (full_name, email, password_hash, role_id, created_at)
VALUES (
  'Administrador Imprenta',
  'dzurbrigkimprenta@gmail.com',
  '$2a$12$44u3.KSUEAH/PnArMcGhQ.3iFvpu7JTp77T50Ulhva17SwUf0Lx/6',
  1,  -- 1 = admin
  NOW()
)
ON CONFLICT (email) DO NOTHING;

-- PASO 3: Verificar que el usuario se creó correctamente
SELECT id, full_name, email, role_id, created_at 
FROM users 
WHERE email = 'dzurbrigkimprenta@gmail.com';

