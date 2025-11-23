/**
 * Cliente API - Gestión centralizada de peticiones HTTP
 */

const API_BASE_URL = 'http://localhost:80/api';

/**
 * Configuración global de peticiones
 */
const API = {
    /**
     * Realizar petición GET
     */
    async get(endpoint, includeAuth = false) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (includeAuth) {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'GET',
                headers: headers
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    },

    /**
     * Realizar petición POST
     */
    async post(endpoint, data, includeAuth = false) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (includeAuth) {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    },

    /**
     * Realizar petición PUT
     */
    async put(endpoint, data, includeAuth = false) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (includeAuth) {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(data)
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    },

    /**
     * Realizar petición DELETE
     */
    async delete(endpoint, includeAuth = false) {
        try {
            const headers = {
                'Content-Type': 'application/json'
            };

            if (includeAuth) {
                const token = localStorage.getItem('auth_token');
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'DELETE',
                headers: headers
            });

            return await this.handleResponse(response);
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    },

    /**
     * Manejar respuestas HTTP
     */
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        // Manejar 401 globalmente
        if (response.status === 401) {
            console.warn('⚠️ Token inválido o expirado');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user_data');
            
            // Solo redirigir si NO estamos en páginas públicas
            const path = window.location.pathname;
            if (!path.includes('login') && 
                !path.includes('register') &&
                !path.endsWith('/') &&
                !path.endsWith('/index.html')) {
                window.location.href = '/pages/login.html';
            }
        }
        
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: data.error || data.message || 'Error en la petición',
                    data: data
                };
            }
            
            return data;
        }
        
        const text = await response.text();
        
        if (!response.ok) {
            throw {
                status: response.status,
                message: text || 'Error en la petición'
            };
        }
        
        return text;
    }
};

/**
 * API específica de Auth Service
 */
const AuthAPI = {
    /**
     * Registrar nuevo usuario
     */
    async register(userData) {
        return await API.post('/auth/register', userData);
    },

    /**
     * Iniciar sesión
     */
    async login(credentials) {
        return await API.post('/auth/login', credentials);
    },

    /**
     * Obtener perfil del usuario autenticado
     */
    async getProfile() {
        return await API.get('/auth/profile', true);
    },

    /**
     * Validar token
     */
    async validateToken() {
        return await API.get('/auth/validate', true);
    }
};