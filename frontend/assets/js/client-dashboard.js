/**
 * Dashboard del Cliente
 */

// Verificar autenticación
if (!Utils.isAuthenticated()) {
    Utils.redirectToLogin();
}

const currentUser = Utils.getUser();

// Si es admin, redirigir al dashboard de admin
if (currentUser && currentUser.role === 'admin') {
    window.location.href = '/pages/administrador/administrador-dashboard.html';
}

// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', () => {
    loadUserInfo();
    loadClientStats();
    loadRecentOrders();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
            Utils.logout();
        }
    });
}

function loadUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.name || 'Cliente';
        document.getElementById('welcomeMessage').textContent = `Hola ${currentUser.name}, ¿qué deseas hacer hoy?`;
    }
}

async function loadClientStats() {
    try {
        // Cargar productos
        const productsResponse = await ProductsAPI.getAll();
        if (productsResponse.success) {
            document.getElementById('totalProducts').textContent = productsResponse.data.length;
        }

        // Cargar mis órdenes
        const ordersResponse = await OrdersAPI.getMyOrders();
        if (ordersResponse.success) {
            const orders = ordersResponse.data;
            document.getElementById('totalOrders').textContent = orders.length;
            
            const pending = orders.filter(o => ['pendiente', 'pagada', 'enviada'].includes(o.status)).length;
            document.getElementById('pendingOrders').textContent = pending;
            
            const delivered = orders.filter(o => o.status === 'entregada').length;
            document.getElementById('deliveredOrders').textContent = delivered;
        }
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
    }
}

async function loadRecentOrders() {
    try {
        const response = await OrdersAPI.getMyOrders();
        const container = document.getElementById('recentOrders');
        
        if (response.success && response.data.length > 0) {
            const recentOrders = response.data.slice(0, 5); // Últimos 5
            
            container.innerHTML = recentOrders.map(order => `
                <div class="recent-order-item">
                    <div class="order-info">
                        <strong>Orden #${order._id.slice(-8)}</strong>
                        <span class="order-date">${Utils.formatDate(order.createdAt)}</span>
                    </div>
                    <div class="order-status">
                        <span class="status-badge ${getStatusClass(order.status)}">${getStatusText(order.status)}</span>
                        <span class="order-total">$${order.totalAmount.toFixed(2)}</span>
                    </div>
                </div>
            `).join('');
        } else {
            container.innerHTML = '<p class="empty-message">No tienes pedidos aún. <a href="client-products.html">¡Explora nuestros productos!</a></p>';
        }
    } catch (error) {
        console.error('Error cargando pedidos recientes:', error);
        document.getElementById('recentOrders').innerHTML = '<p>Error al cargar pedidos</p>';
    }
}

function getStatusClass(status) {
    const classes = {
        'pendiente': 'status-pending',
        'pagada': 'status-paid',
        'enviada': 'status-shipped',
        'entregada': 'status-delivered',
        'cancelada': 'status-cancelled'
    };
    return classes[status] || '';
}

function getStatusText(status) {
    const texts = {
        'pendiente': 'Pendiente',
        'pagada': 'Pagada',
        'enviada': 'Enviada',
        'entregada': 'Entregada',
        'cancelada': 'Cancelada'
    };
    return texts[status] || status;
}