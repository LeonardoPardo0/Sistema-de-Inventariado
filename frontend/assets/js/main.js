/**
 * Script principal del frontend
 * Funcionalidad global y configuración inicial
 */

// ============================================
// Configuración global
// ============================================
console.log('🚀 Sistema de Microservicios iniciado');
console.log('📍 API Gateway:', 'http://localhost:80/api');

// ============================================
// Redirigir si ya está autenticado
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Si estamos en index o login y ya hay sesión, ir al dashboard
    const currentPath = window.location.pathname;
    
    if ((currentPath === '/' || currentPath === '/index.html' || currentPath.includes('login.html')) 
        && Utils.isAuthenticated()) {
        
        console.log('✅ Sesión activa detectada, redirigiendo al dashboard...');
        Utils.redirectToDashboard();
    }
});

// ============================================
// Manejo de errores globales
// ============================================
window.addEventListener('error', (event) => {
    console.error('Error global capturado:', event.error);
});

// ============================================
// Verificar conectividad con el API Gateway
// ============================================
async function checkAPIHealth() {
    try {
        const response = await fetch('http://localhost:80/health');
        const text = await response.text();
        console.log('✅ API Gateway:', text);
    } catch (error) {
        console.warn('⚠️ No se pudo conectar con el API Gateway');
    }
}

// Verificar salud del API al cargar
checkAPIHealth();