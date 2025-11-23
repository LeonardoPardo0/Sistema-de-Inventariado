/**
 * Controlador de Autenticación
 * Lógica de negocio para registro, login, profile y validación
 */

import User from "../models/user.model.js";
import { generateToken } from "../utils/token.js";

/**
 * POST /auth/register
 * Registro de nuevos usuarios
 */
export const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validar campos requeridos
        if (!name || !email || !password) {
            return res.status(400).json({
                error: "Todos los campos son requeridos (name, email, password)"
            });
        }

        // Verificar si el usuario ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: "El email ya está registrado"
            });
        }

        // Crear nuevo usuario
        const user = new User({
            name,
            email,
            password,
            role: role || "cliente" // Por defecto cliente
        });

        await user.save();

        // Generar token JWT
        const token = generateToken(user);

        res.status(201).json({
            message: "Usuario registrado exitosamente",
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error("Error en register:", error);
        res.status(500).json({
            error: "Error al registrar usuario",
            details: error.message
        });
    }
};

/**
 * POST /auth/login
 * Inicio de sesión y emisión de JWT
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar campos requeridos
        if (!email || !password) {
            return res.status(400).json({
                error: "Email y contraseña son requeridos"
            });
        }

        // Buscar usuario por email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                error: "Credenciales inválidas"
            });
        }

        // Verificar contraseña
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: "Credenciales inválidas"
            });
        }

        // Generar token JWT
        const token = generateToken(user);

        res.status(200).json({
            message: "Login exitoso",
            token,
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({
            error: "Error al iniciar sesión",
            details: error.message
        });
    }
};

/**
 * GET /auth/profile
 * Obtener datos del usuario autenticado (requiere token)
 */
export const getProfile = async (req, res) => {
    try {
        // El usuario viene del middleware de autenticación
        const userId = req.user.id;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                error: "Usuario no encontrado"
            });
        }

        res.status(200).json({
            user: user.toPublicJSON()
        });

    } catch (error) {
        console.error("Error en getProfile:", error);
        res.status(500).json({
            error: "Error al obtener perfil",
            details: error.message
        });
    }
};

/**
 * GET /auth/validate
 * Validar token JWT (endpoint interno para otros servicios)
 */
export const validateToken = async (req, res) => {
    try {
        // El token ya fue validado por el middleware
        // Solo devolvemos los datos del usuario
        res.status(200).json({
            valid: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                role: req.user.role
            }
        });

    } catch (error) {
        console.error("Error en validateToken:", error);
        res.status(500).json({
            error: "Error al validar token",
            details: error.message
        });
    }
};