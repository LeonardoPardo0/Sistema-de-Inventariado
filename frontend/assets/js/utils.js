/**
 * Utilidades generales del frontend
 */

const Utils = {

    /**
     * Redirigir al dashboard según el rol del usuario
     */
    redirectToDashboardByRole() {
        const user = this.getUser();
        if (user && user.role === 'cliente') {
            window.location.href = '/pages/cliente/client-dashboard.html';
        } else {
            window.location.href = '/pages/administrador/administrador-dashboard.html';
        }
    },

    /**
     * Mostrar mensaje de error
     */
    showError(message, elementId = 'errorMessage') {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
            
            // Ocultar mensaje de éxito si existe
            const successElement = document.getElementById('successMessage');
            if (successElement) {
                successElement.style.display = 'none';
            }
        }
    },

    /**
     * Mostrar mensaje de éxito
     */
    showSuccess(message, elementId = 'successMessage') {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.textContent = message;
            successElement.style.display = 'block';
            
            // Ocultar mensaje de error si existe
            const errorElement = document.getElementById('errorMessage');
            if (errorElement) {
                errorElement.style.display = 'none';
            }
        }
    },

    /**
     * Ocultar todos los mensajes
     */
    hideMessages() {
        const errorElement = document.getElementById('errorMessage');
        const successElement = document.getElementById('successMessage');
        
        if (errorElement) errorElement.style.display = 'none';
        if (successElement) successElement.style.display = 'none';
    },

    /**
     * Mostrar/ocultar loader en botón
     */
    toggleButtonLoader(buttonId, show) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        const textElement = button.querySelector('.btn-text');
        const loaderElement = button.querySelector('.btn-loader');

        if (show) {
            button.disabled = true;
            if (textElement) textElement.style.display = 'none';
            if (loaderElement) loaderElement.style.display = 'inline-block';
        } else {
            button.disabled = false;
            if (textElement) textElement.style.display = 'inline';
            if (loaderElement) loaderElement.style.display = 'none';
        }
    },

    /**
     * Guardar token en localStorage
     */
    saveToken(token) {
        localStorage.setItem('auth_token', token);
    },

    /**
     * Obtener token de localStorage
     */
    getToken() {
        return localStorage.getItem('auth_token');
    },

    /**
     * Eliminar token de localStorage
     */
    removeToken() {
        localStorage.removeItem('auth_token');
    },

    /**
     * Guardar datos de usuario
     */
    saveUser(userData) {
        localStorage.setItem('user_data', JSON.stringify(userData));
    },

    /**
     * Obtener datos de usuario
     */
    getUser() {
        const userData = localStorage.getItem('user_data');
        return userData ? JSON.parse(userData) : null;
    },

    /**
     * Eliminar datos de usuario
     */
    removeUser() {
        localStorage.removeItem('user_data');
    },

    /**
     * Verificar si el usuario está autenticado
     */
    isAuthenticated() {
        return !!this.getToken();
    },

    /**
     * Redirigir a página de login
     */
    redirectToLogin() {
        window.location.href = '/pages/login.html';
    },

    /**
     * Redirigir a dashboard de admin
     */
    redirectToDashboard() {
        window.location.href = '/pages/administrador/administrador-dashboard.html';
    },

    /**
     * Redirigir a dashboard de cliente
     */
    redirectToClientDashboard() {
        window.location.href = '/pages/cliente/client-dashboard.html';
    },

    /**
     * Cerrar sesión
     */
    logout() {
        this.removeToken();
        this.removeUser();
        this.redirectToLogin();
    },

    /**
     * Formatear fecha
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    /**
     * Validar email
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    /**
     * Capitalizar primera letra
     */
    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
};