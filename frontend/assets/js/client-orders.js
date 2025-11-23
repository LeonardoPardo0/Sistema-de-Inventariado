/**
 * Pedidos del Cliente
 */

// Verificar autenticación
if (!Utils.isAuthenticated()) {
    Utils.redirectToLogin();
}

let myOrders = [];

document.addEventListener('DOMContentLoaded', () => {
    loadMyOrders();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);
    document.getElementById('logoutBtn').addEventListener('click', () => Utils.logout());
}

async function loadMyOrders() {
    try {
        const response = await OrdersAPI.getMyOrders();
        
        if (response.success) {
            myOrders = response.data;
            renderOrders(myOrders);
        } else {
            throw new Error(response.message || 'Error al cargar pedidos');
        }
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        document.getElementById('ordersGrid').innerHTML = 
            '<div class="error-message">❌ Error al cargar tus pedidos</div>';
    }
}

function renderOrders(orders) {
    const grid = document.getElementById('ordersGrid');
    
    if (orders.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                🧾 No tienes pedidos aún.
                <br><br>
                <a href="client-products.html" class="btn btn-primary">Explorar Productos</a>
            </div>
        `;
        return;
    }

    grid.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Pedido #${order._id.slice(-8)}</h3>
                <span class="order-status ${getStatusClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </div>
            <div class="order-body">
                <p><strong>Fecha:</strong> ${Utils.formatDate(order.createdAt)}</p>
                <p><strong>Items:</strong> ${order.items.length} producto(s)</p>
                <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
                <p><strong>Dirección:</strong> ${order.shippingAddress.substring(0, 40)}...</p>
            </div>
            <div class="order-actions">
                <button class="btn btn-sm btn-primary" onclick="viewOrderDetail('${order._id}')">
                    👁️ Ver Detalle
                </button>
                ${order.status === 'pendiente' ? `
                    <button class="btn btn-sm btn-danger" onclick="cancelOrder('${order._id}')">
                        ❌ Cancelar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function filterOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = myOrders;
    
    if (statusFilter) {
        filtered = myOrders.filter(order => order.status === statusFilter);
    }
    
    renderOrders(filtered);
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
        'pendiente': '⏳ Pendiente',
        'pagada': '💳 Pagada',
        'enviada': '🚚 Enviada',
        'entregada': '✅ Entregada',
        'cancelada': '❌ Cancelada'
    };
    return texts[status] || status;
}

window.viewOrderDetail = async (orderId) => {
    try {
        const response = await OrdersAPI.getById(orderId);
        
        if (response.success) {
            const order = response.data;
            
            document.getElementById('orderDetailContent').innerHTML = `
                <div class="order-detail">
                    <div class="detail-section">
                        <h3>📋 Información General</h3>
                        <p><strong>ID del Pedido:</strong> ${order._id}</p>
                        <p><strong>Estado:</strong> <span class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
                        <p><strong>Fecha:</strong> ${Utils.formatDate(order.createdAt)}</p>
                        <p><strong>Dirección de Envío:</strong> ${order.shippingAddress}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h3>📦 Productos</h3>
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.productName}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${item.price.toFixed(2)}</td>
                                        <td>$${(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3"><strong>TOTAL</strong></td>
                                    <td><strong>$${order.totalAmount.toFixed(2)}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;
            
            document.getElementById('orderDetailModal').style.display = 'flex';
        }
    } catch (error) {
        Utils.showError('Error al cargar detalle del pedido');
    }
};

function closeDetailModal() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

window.cancelOrder = async (orderId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
        return;
    }

    try {
        const response = await OrdersAPI.cancel(orderId);
        
        if (response.success) {
            Utils.showSuccess('Pedido cancelado exitosamente');
            await loadMyOrders();
        } else {
            throw new Error(response.message || 'Error al cancelar');
        }
    } catch (error) {
        console.error('Error cancelando pedido:', error);
        Utils.showError(error.message || 'Error al cancelar el pedido');
    }
};