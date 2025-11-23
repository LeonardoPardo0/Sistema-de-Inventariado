/**
 * Orders Service
 * Gestión de órdenes de compra
 */

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db.js';
import orderRoutes from './routes/order.routes.js';
import swaggerSpec from './config/swagger.js';
import { startCleanupJob } from './jobs/cleanup.job.js';
import { PORT, SERVICE_NAME, SERVICE_VERSION } from './config/env.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
connectDB();

// Iniciar job de limpieza automática
startCleanupJob();

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas principales
app.use('/orders', orderRoutes);

// Documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: `${SERVICE_NAME} - API Docs`
}));

// Endpoint para obtener JSON de Swagger
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    status: 'running',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    service: SERVICE_NAME,
    version: SERVICE_VERSION,
    status: 'active',
    endpoints: {
      health: '/health',
      docs: '/api-docs',
      orders: '/orders'
    }
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.path
  });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('❌ Error no manejado:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 ${SERVICE_NAME} v${SERVICE_VERSION}`);
  console.log(`📡 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 Documentación API: http://localhost:${PORT}/api-docs`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log('='.repeat(50));
});

// Manejo de señales de terminación
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM recibido. Cerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT recibido. Cerrando servidor...');
  process.exit(0);
});