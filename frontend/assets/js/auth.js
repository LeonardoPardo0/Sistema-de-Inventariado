/**
 * Lógica de autenticación (Login y Register)
 */

// ============================================
// LOGIN
// ============================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        Utils.hideMessages();
        Utils.toggleButtonLoader('loginBtn', true);

        try {
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;

            // Validación básica
            if (!email || !password) {
                throw new Error('Todos los campos son requeridos');
            }

            if (!Utils.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            // Realizar login
            const response = await AuthAPI.login({ email, password });

            // Guardar token y datos del usuario
            Utils.saveToken(response.token);
            Utils.saveUser(response.user);

            // Mostrar mensaje de éxito
            Utils.showSuccess('¡Login exitoso! Redirigiendo...');

            // Redirigir al dashboard
            setTimeout(() => {
                Utils.redirectToDashboardByRole();
            }, 1000);

        } catch (error) {
            console.error('Error en login:', error);
            Utils.showError(error.message || 'Error al iniciar sesión');
        } finally {
            Utils.toggleButtonLoader('loginBtn', false);
        }
    });
}

// ============================================
// REGISTER
// ============================================
const registerForm = document.getElementById('registerForm');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        Utils.hideMessages();
        Utils.toggleButtonLoader('registerBtn', true);

        try {
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const role = document.getElementById('role').value;

            // Validaciones
            if (!name || !email || !password || !confirmPassword) {
                throw new Error('Todos los campos son requeridos');
            }

            if (name.length < 3) {
                throw new Error('El nombre debe tener al menos 3 caracteres');
            }

            if (!Utils.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            if (password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            if (password !== confirmPassword) {
                throw new Error('Las contraseñas no coinciden');
            }

            // Realizar registro
            const response = await AuthAPI.register({
                name,
                email,
                password,
                role
            });

            // Guardar token y datos del usuario
            Utils.saveToken(response.token);
            Utils.saveUser(response.user);

            // Mostrar mensaje de éxito
            Utils.showSuccess('¡Registro exitoso! Redirigiendo...');

            // Redirigir al dashboard
            setTimeout(() => {
                Utils.redirectToDashboardByRole();
            }, 1500);

        } catch (error) {
            console.error('Error en registro:', error);
            Utils.showError(error.message || 'Error al registrar usuario');
        } finally {
            Utils.toggleButtonLoader('registerBtn', false);
        }
    });
}

// ============================================
// Verificar autenticación en páginas protegidas
// ============================================
function checkAuth() {
    // Solo en páginas del dashboard
    if (window.location.pathname.includes('dashboard') || 
        window.location.pathname.includes('products')) {
        
        if (!Utils.isAuthenticated()) {
            Utils.redirectToLogin();
        }
    }
}

// Ejecutar verificación al cargar la página
document.addEventListener('DOMContentLoaded', checkAuth);