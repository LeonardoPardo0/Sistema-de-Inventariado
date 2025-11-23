/**
 * Utilidades para manejo de tokens JWT
 */

import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * Generar token JWT para un usuario
 * @param {Object} user - Objeto de usuario de MongoDB
 * @returns {String} Token JWT firmado
 */
export const generateToken = (user) => {
    const payload = {
        id: user._id,
        email: user.email,
        role: user.role
    };

    return jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn
    });
};

/**
 * Verificar y decodificar token JWT
 * @param {String} token - Token JWT a verificar
 * @returns {Object} Datos decodificados del token
 * @throws {Error} Si el token es inválido o expirado
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwtSecret);
    } catch (error) {
        throw new Error(`Token inválido: ${error.message}`);
    }
};

/**
 * Decodificar token sin verificar (útil para debugging)
 * @param {String} token - Token JWT a decodificar
 * @returns {Object} Datos decodificados (sin verificar firma)
 */
export const decodeToken = (token) => {
    return jwt.decode(token);
};