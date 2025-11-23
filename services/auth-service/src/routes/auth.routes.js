/**
 * Rutas del servicio de autenticación
 * Base: /auth
 */

import express from "express";
import { 
  register, 
  login, 
  getProfile, 
  validateToken 
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * POST /auth/register
 * Registro de nuevos usuarios
 * Body: { name, email, password, role? }
 */
router.post("/register", register);

/**
 * POST /auth/login
 * Inicio de sesión y emisión de JWT
 * Body: { email, password }
 */
router.post("/login", login);

/**
 * GET /auth/profile
 * Obtener datos del usuario autenticado
 * Headers: Authorization: Bearer <token>
 */
router.get("/profile", verifyToken, getProfile);

/**
 * GET /auth/validate
 * Validar token JWT (endpoint interno para otros servicios)
 * Headers: Authorization: Bearer <token>
 */
router.get("/validate", verifyToken, validateToken);

export default router;