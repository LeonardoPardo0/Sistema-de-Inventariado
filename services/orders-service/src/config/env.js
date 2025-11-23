import dotenv from 'dotenv';

dotenv.config();

// Validar variables críticas
const requiredEnvVars = [
    'MONGO_URI',
    'AUTH_SERVICE_URL',
    'INVENTORY_SERVICE_URL',
    'PRODUCTS_SERVICE_URL'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`❌ ERROR: Variable de entorno ${varName} no configurada`);
        process.exit(1);
    }
});

export const PORT = process.env.PORT || 3003;
export const MONGO_URI = process.env.MONGO_URI;
export const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL;
export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL;
export const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL;
export const SERVICE_NAME = process.env.SERVICE_NAME || 'Orders Service';
export const SERVICE_VERSION = process.env.SERVICE_VERSION || '1.0.0';