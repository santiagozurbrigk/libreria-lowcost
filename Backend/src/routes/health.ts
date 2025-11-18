import { Router } from 'express';
import { testConnection } from '../config/database';

const router = Router();

// Endpoint de salud básico
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Endpoint de salud completo (incluye verificación de BD)
router.get('/detailed', async (req, res) => {
  try {
    const dbStatus = await testConnection();
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: dbStatus ? 'connected' : 'disconnected',
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Error verificando estado del sistema'
    });
  }
});

export { router as healthRoutes };
