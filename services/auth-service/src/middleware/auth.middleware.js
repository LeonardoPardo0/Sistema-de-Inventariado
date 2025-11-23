/**
 * Middleware de Autenticación
 * Verificación de tokens JWT
 */

import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * Middleware para verificar token JWT
 * Uso: aplicar en rutas protegidas
 */
export const verifyToken = (req, res, next) => {
    try {
        // Obtener token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                error: "Token no proporcionado"
            });
        }

        // Formato esperado: "Bearer <token>"
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                error: "Formato de token inválido"
            });
        }

        // Verificar y decodificar token
        const decoded = jwt.verify(token, config.jwtSecret);

        // Agregar datos del usuario al request
        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                error: "Token expirado"
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                error: "Token inválido"
            });
        }

        console.error("Error en verifyToken:", error);
        res.status(500).json({
            error: "Error al verificar token"
        });
    }
};

/**
 * Middleware para verificar rol de admin
 * Uso: aplicar después de verifyToken
 */
export const verifyAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            error: "Acceso denegado. Se requiere rol de administrador"
        });
    }
    next();
};

/**
 * Middleware opcional: verificar token si existe
 * No falla si no hay token, solo lo verifica si está presente
 */
export const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader) {
            const token = authHeader.split(" ")[1];
            if (token) {
                const decoded = jwt.verify(token, config.jwtSecret);
                req.user = {
                    id: decoded.id,
                    email: decoded.email,
                    role: decoded.role
                };
            }
        }

        next();

    } catch (error) {
        // Si hay error, simplemente continuar sin autenticación
        next();
    }
};