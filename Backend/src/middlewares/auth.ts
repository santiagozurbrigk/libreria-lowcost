import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getSupabaseAdmin } from '../config/database';
import { createError } from './errorHandler';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('Token de acceso requerido', 401);
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw createError('JWT_SECRET no configurado', 500);
    }

    // Verificar token JWT
    const decoded = jwt.verify(token, jwtSecret) as any;
    
    // Verificar que el usuario existe en la base de datos
    const supabaseAdmin = getSupabaseAdmin();
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, full_name, role_id')
      .eq('id', decoded.userId)
      .single();

    if (error || !user) {
      throw createError('Usuario no encontrado', 401);
    }

    req.user = {
      ...user,
      name: user.full_name,
      role: decoded.role // Usar el rol del token JWT
    };
    next();
  } catch (error) {
    next(error);
  }
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Usuario no autenticado', 401));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(createError('Permisos insuficientes', 403));
    }

    next();
  };
};

// Middleware específico para admin
export const requireAdmin = authorizeRole(['admin']);

// Middleware para admin y empleado
export const requireStaff = authorizeRole(['admin', 'empleado']);

// Middleware opcional (no falla si no hay token)
export const optionalAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_SECRET;
      if (jwtSecret) {
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        const supabaseAdmin = getSupabaseAdmin();
        const { data: user } = await supabaseAdmin
          .from('users')
          .select('id, email, full_name, role_id')
          .eq('id', decoded.userId)
          .single();

        if (user) {
          req.user = {
            ...user,
            name: user.full_name,
            role: decoded.role // Usar el rol del token JWT
          };
        }
      }
    }
    
    next();
  } catch (error) {
    // En caso de error, continuar sin autenticación
    next();
  }
};
