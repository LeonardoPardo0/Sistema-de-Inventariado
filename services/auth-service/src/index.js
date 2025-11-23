/**
 * Auth Service - Punto de entrada principal
 * Puerto: 3000
 * Responsabilidades: Autenticación, registro, validación JWT
 */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

// Cargar variables de entorno
dotenv.config();

const app = express();

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a base de datos
connectDB();

// Rutas
app.use("/auth", authRoutes);

// Ruta de health check
app.get("/health", (req, res) => {
  res.status(200).json({ 
    service: "Auth Service", 
    status: "running",
    timestamp: new Date().toISOString()
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(err.status || 500).json({ 
    error: err.message || "Error interno del servidor" 
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🧍 Auth Service corriendo en puerto ${PORT}`);
});