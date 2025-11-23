/**
 * Configuración de entorno del frontend
 * Copia este archivo como env.js y ajusta las URLs según tu entorno
 */

const ENV = {
    // URL del API Gateway
    API_GATEWAY_URL: 'http://localhost:80',
    
    // URLs de servicios individuales (opcional, para debugging)
    SERVICES: {
        AUTH: 'http://localhost:3000',
        PRODUCTS: 'http://localhost:3001',
        INVENTORY: 'http://localhost:3002',
        ORDERS: 'http://localhost:3003',
        BILLING: 'http://localhost:3004',
        REPORTS: 'http://localhost:3005'
    },
    
    // Configuración de la aplicación
    APP: {
        NAME: 'Sistema de Microservicios',
        VERSION: '1.0.0',
        TOKEN_KEY: 'auth_token',
        USER_KEY: 'user_data'
    }
};

// Exportar configuración (si se usa con módulos)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENV;
}