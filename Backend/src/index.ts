import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/auth';
import { productRoutes } from './routes/products';
import { orderRoutes } from './routes/orders';
import { adminRoutes } from './routes/admin';
import { healthRoutes } from './routes/health';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const isDev = process.env.NODE_ENV !== 'production';
    const allowedFromEnv = (process.env.FRONTEND_URL || '').split(',').map(o => o.trim()).filter(Boolean);
    const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:5173'];
    const vercelPreviewRegex = /^https?:\/\/[a-z0-9-]+-\w+\.vercel\.app$/i;
    const vercelProdRegex = /^https?:\/\/.*\.vercel\.app$/i;

    const allowedOrigins = new Set([...(isDev ? defaultDevOrigins : []), ...allowedFromEnv]);

    if (!origin) {
      return callback(null, true); // requests como curl o health checks sin origin
    }

    if (allowedOrigins.has(origin) || vercelPreviewRegex.test(origin) || vercelProdRegex.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS bloqueado para origen: ${origin}`));
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
});
app.use(limiter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/health', healthRoutes);
app.use('/auth', authRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Librería Low Cost API',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📚 Librería Low Cost API v1.0.0`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
