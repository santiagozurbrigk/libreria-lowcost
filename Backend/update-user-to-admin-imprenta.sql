-- Script para actualizar usuario existente a admin: dzurbrigkimprenta@gmail.com
-- Ejecuta este script en el SQL Editor de Supabase

-- Actualizar el usuario existente a administrador y cambiar la contraseña
UPDATE users 
SET 
  role_id = 1,  -- Cambiar a admin
  password_hash = '$2a$12$44u3.KSUEAH/PnArMcGhQ.3iFvpu7JTp77T50Ulhva17SwUf0Lx/6',  -- Nueva contraseña: AdministracionImprenta2025
  full_name = 'Administrador Imprenta'  -- Opcional: actualizar el nombre
WHERE email = 'dzurbrigkimprenta@gmail.com';

-- Verificar que se actualizó correctamente
SELECT id, full_name, email, role_id, created_at 
FROM users 
WHERE email = 'dzurbrigkimprenta@gmail.com';

