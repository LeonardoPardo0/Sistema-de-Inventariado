/**
 * Lógica del Dashboard
 */

// ============================================
// Verificar autenticación y rol
// ============================================
const currentUser = Utils.getUser();

if (!Utils.isAuthenticated()) {
    Utils.redirectToLogin();
}

// Redirigir cliente a su dashboard específico
if (currentUser && currentUser.role === 'cliente') {
    window.location.href = '/pages/cliente/client-dashboard.html';
}

// ============================================
// Cargar información del usuario
// ============================================
async function loadUserProfile() {
    try {
        // Obtener datos locales primero
        const localUser = Utils.getUser();
        
        if (localUser) {
            displayUserInfo(localUser);
        }

        // Obtener datos actualizados del servidor
        const response = await AuthAPI.getProfile();
        
        if (response && response.user) {
            // Actualizar datos locales
            Utils.saveUser(response.user);
            displayUserInfo(response.user);
        }

    } catch (error) {
        console.error('Error al cargar perfil:', error);
        
        // Si el token es inválido, cerrar sesión
        if (error.status === 401) {
            alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
            Utils.logout();
        }
    }
}

// ============================================
// Mostrar información del usuario en el dashboard
// ============================================
function displayUserInfo(user) {
    // Actualizar header
    const userNameElement = document.getElementById('userName');
    const userRoleElement = document.getElementById('userRole');
    
    if (userNameElement) {
        userNameElement.textContent = user.name || 'Usuario';
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = Utils.capitalize(user.role || 'cliente');
    }

    // Actualizar perfil completo
    const profileElement = document.getElementById('userProfile');
    if (profileElement) {
        profileElement.innerHTML = `
            <p><strong>ID:</strong> ${user.id}</p>
            <p><strong>Nombre:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Rol:</strong> ${Utils.capitalize(user.role)}</p>
            <p><strong>Registrado:</strong> ${Utils.formatDate(user.createdAt)}</p>
        `;
    }
}

// ============================================
// Cerrar sesión
// ============================================
const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            Utils.logout();
        }
    });
}

/**
 * Cargar estadísticas del dashboard
 */
async function loadDashboardStats() {
    try {
        await Promise.all([
            loadProductsStats(),
            loadInventoryStats(),
            loadOrdersStats(),
            loadSalesStats()
        ]);
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

/**
 * Cargar estadísticas de productos
 */
async function loadProductsStats() {
    try {
        const response = await ProductsAPI.getAll();
        if (response.success) {
            document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = 
                response.data.length;
        }
    } catch (error) {
        document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = '0';
    }
}

/**
 * Cargar estadísticas de inventario
 */
async function loadInventoryStats() {
    try {
        const response = await InventoryAPI.getAll();
        if (response.success) {
            const totalItems = response.data.reduce((sum, item) => sum + item.quantity, 0);
            document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = 
                totalItems.toLocaleString();
            
            // También cargar alertas de stock bajo
            await loadLowStockAlerts();
        }
    } catch (error) {
        document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = '0';
    }
}

/**
 * Cargar alertas de stock bajo
 */
async function loadLowStockAlerts() {
    try {
        const response = await InventoryAPI.getLowStock();
        if (response.success && response.data.length > 0) {
            // Agregar alerta visual en el dashboard
            const inventoryCard = document.querySelector('.stat-card:nth-child(2)');
            inventoryCard.style.borderLeft = '4px solid var(--warning-color)';
            
            // Puedes agregar un tooltip o badge
            const alertBadge = document.createElement('span');
            alertBadge.className = 'alert-badge';
            alertBadge.textContent = `${response.data.length} bajo stock`;
            alertBadge.style.background = 'var(--warning-color)';
            alertBadge.style.color = 'white';
            alertBadge.style.padding = '2px 8px';
            alertBadge.style.borderRadius = '12px';
            alertBadge.style.fontSize = '12px';
            alertBadge.style.marginLeft = '8px';
            
            inventoryCard.querySelector('h3').appendChild(alertBadge);
        }
    } catch (error) {
        console.error('Error cargando alertas de stock:', error);
    }
}

/**
 * Cargar estadísticas de órdenes (placeholder)
 */
async function loadOrdersStats() {
    // Por ahora placeholder, luego se integrará con Orders Service
    document.querySelector('.stat-card:nth-child(3) .stat-value').textContent = '0';
}

/**
 * Cargar estadísticas de ventas (placeholder)
 */
async function loadSalesStats() {
    // Por ahora placeholder, luego se integrará con Billing Service
    document.querySelector('.stat-card:nth-child(4) .stat-value').textContent = '$0';
}

// Actualiza la inicialización del dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    loadDashboardStats(); // ← Agregar esta línea
});