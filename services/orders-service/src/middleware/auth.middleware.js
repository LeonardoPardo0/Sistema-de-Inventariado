import { validateToken } from '../utils/httpClient.js';

/**
 * Middleware para validar token JWT
 */
export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token inválido'
            });
        }

        // Validar token con Auth Service
        const validation = await validateToken(token);

        if (!validation.valid) {
            return res.status(401).json({
                success: false,
                message: 'Token inválido o expirado'
            });
        }

        // Adjuntar usuario a la request
        req.user = validation.user;
        next();

    } catch (error) {
        console.error('❌ Error en middleware de autenticación:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error al validar autenticación',
            error: error.message
        });
    }
};

/**
 * Middleware para verificar rol de administrador
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Usuario no autenticado'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Acceso denegado. Se requiere rol de administrador'
        });
    }

    next();
};