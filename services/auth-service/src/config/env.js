/**
 * Configuración centralizada de variables de entorno
 */

import dotenv from "dotenv";

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1h",
    nodeEnv: process.env.NODE_ENV || "development"
};

// Validar variables críticas
if (!config.jwtSecret) {
    throw new Error("JWT_SECRET no está definido en las variables de entorno");
}

if (!config.mongoUri) {
    throw new Error("MONGO_URI no está definido en las variables de entorno");
}