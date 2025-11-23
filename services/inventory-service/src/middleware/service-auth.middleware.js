/**
 * Middleware para validar token de servicio interno
 * Permite comunicación entre microservicios sin pasar token de usuario
 */

// Token secreto compartido entre servicios (usar variable de entorno)
const SERVICE_TOKEN = process.env.SERVICE_SECRET || 'service-secret-key-change-in-production';

export const validateServiceToken = (req, res, next) => {
    try {
        const serviceHeader = req.headers['x-service-token'];

        if (!serviceHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de servicio no proporcionado'
            });
        }

        if (serviceHeader !== SERVICE_TOKEN) {
            return res.status(403).json({
                success: false,
                message: 'Token de servicio inválido'
            });
        }

        // Token válido, continuar
        next();

    } catch (error) {
        console.error('❌ Error en validación de servicio:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Error al validar token de servicio',
            error: error.message
        });
    }
};

/**
 * Middleware flexible: acepta token de usuario O token de servicio
 */
export const validateUserOrService = async (req, res, next) => {
    // Primero intentar con token de servicio
    const serviceToken = req.headers['x-service-token'];

    if (serviceToken === SERVICE_TOKEN) {
        req.isServiceRequest = true;
        return next();
    }

    // Si no hay token de servicio, intentar con token de usuario
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: 'Token no proporcionado'
        });
    }

    // Aquí podrías validar el token JWT si es necesario
    // Por ahora solo lo dejamos pasar
    req.isServiceRequest = false;
    next();
};