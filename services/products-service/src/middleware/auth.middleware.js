import axios from 'axios';
import { AUTH_SERVICE_URL } from '../config/env.js';

export const validateToken = async (req, res, next) => {
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

    const url = `${AUTH_SERVICE_URL}/auth/validate`;

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 5000 // evita colgar el servicio si Auth no responde
    });

    if (!response.data?.user) {
      return res.status(401).json({
        success: false,
        message: 'Respuesta inválida del servicio de autenticación'
      });
    }

    // Adjuntar el usuario verificado a la request
    req.user = response.data.user;
    next();
  } catch (error) {
    const status = error.response?.status || 500;
    const errorMessage =
      error.response?.data?.message || error.message || 'Error desconocido';

    console.error(
      `❌ Error validando token (${AUTH_SERVICE_URL}/auth/validate):`,
      errorMessage
    );

    res.status(status === 500 ? 401 : status).json({
      success: false,
      message: 'Token inválido o expirado',
      error: errorMessage
    });
  }
};
