/**
 * Products Service
 * Gestión de productos (CRUD) + Frontend visualization
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { PORT } from './config/env.js';
import connectDB from './config/db.js';
import serviceRoutes from './routes/products.routes.js';

const app = express();

// Para poder usar __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json()); // <-- Parse JSON automáticamente

// ✅ Servir carpeta pública para el frontend (ahora dentro del microservicio)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


// Rutas API
app.use('/products', serviceRoutes);

// Endpoint de salud
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores globales
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Conectar a MongoDB y arrancar el servidor
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Products Service corriendo en puerto ${PORT}`);
      console.log(`✅ Base URL API: http://localhost:${PORT}/products`);
      console.log(`✅ Frontend: http://localhost:${PORT}/`);
    });
  })
  .catch((err) => {
    console.error('❌ Error al conectar a MongoDB:', err.message);
    process.exit(1);
  });
