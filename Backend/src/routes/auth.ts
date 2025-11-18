import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getSupabaseAdmin } from '../config/database';
import { authenticateToken, AuthRequest } from '../middlewares/auth';
import { createError } from '../middlewares/errorHandler';

const router = Router();

// Función para mapear role_id a string
const getRoleFromId = (roleId: number): string => {
  switch (roleId) {
    case 1: return 'admin';
    case 2: return 'empleado';
    case 3: return 'cliente';
    default: return 'cliente';
  }
};

// Función para mapear string a role_id
const getRoleIdFromString = (role: string): number => {
  switch (role) {
    case 'admin': return 1;
    case 'empleado': return 2;
    case 'cliente': return 3;
    default: return 3;
  }
};

// Esquemas de validación
const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['admin', 'empleado', 'cliente']).default('cliente')
});

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida')
});

// POST /auth/register
router.post('/register', async (req, res, next) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { name, email, password, role } = validatedData;

    // Verificar si el usuario ya existe
    const supabaseAdmin = getSupabaseAdmin();
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw createError('El usuario ya existe', 400);
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        full_name: name,
        email,
        password_hash: passwordHash,
        role_id: getRoleIdFromString(role)
      })
      .select('id, full_name, email, role_id, created_at')
      .single();

    if (error) {
      console.error('Error de Supabase:', error);
      throw createError(`Error creando usuario: ${error.message}`, 500);
    }

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: {
        ...newUser,
        name: newUser.full_name,
        role: getRoleFromId(newUser.role_id)
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/login
router.post('/login', async (req, res, next) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // Buscar usuario
    const supabaseAdmin = getSupabaseAdmin();
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, full_name, email, password_hash, role_id')
      .eq('email', email)
      .single();

    console.log('Login attempt for email:', email);
    console.log('User found:', user);
    console.log('Error:', error);

    if (error || !user) {
      console.log('User not found or error:', error?.message);
      throw createError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw createError('Credenciales inválidas', 401);
    }

    // Generar JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('JWT_SECRET no configurado', 500);
    }

    const userRole = getRoleFromId(user.role_id);
    
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: userRole
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Remover password_hash de la respuesta y mapear full_name a name
    const { password_hash, full_name, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: 'Login exitoso',
      token,
      user: {
        ...userWithoutPassword,
        name: full_name,
        role: userRole
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /auth/profile
router.get('/profile', authenticateToken, (req: AuthRequest, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

// POST /auth/logout (opcional, para invalidar tokens)
router.post('/logout', authenticateToken, (req: AuthRequest, res, next) => {
  try {
    // En una implementación más avanzada, podrías agregar el token a una blacklist
    res.json({
      success: true,
      message: 'Logout exitoso'
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
