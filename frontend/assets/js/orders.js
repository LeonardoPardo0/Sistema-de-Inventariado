let currentOrders = [];
let availableProducts = [];
let currentUser = null;

document.addEventListener('DOMContentLoaded', () => {
    currentUser = Utils.getUser();
    loadOrders();
    loadAvailableProducts();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('btnNewOrder').addEventListener('click', openModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('closeDetailModal').addEventListener('click', closeDetailModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('orderForm').addEventListener('submit', handleSubmit);
    document.getElementById('searchInput').addEventListener('input', filterOrders);
    document.getElementById('statusFilter').addEventListener('change', filterOrders);
    document.getElementById('logoutBtn').addEventListener('click', () => Utils.logout());
    document.getElementById('btnAddItem').addEventListener('click', addItemRow);
    
    // Delegación de eventos para botones dinámicos
    document.getElementById('itemsContainer').addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item')) {
            removeItemRow(e.target);
        }
    });
}

async function loadOrders() {
    try {
        const ordersGrid = document.getElementById('ordersGrid');
        ordersGrid.innerHTML = '<div class="loading">Cargando órdenes...</div>';

        // Usar getMyOrders para clientes, getAll para admins
        const response = currentUser?.role === 'admin' 
            ? await OrdersAPI.getAll()
            : await OrdersAPI.getMyOrders();
        
        if (response.success) {
            currentOrders = response.data;
            renderOrders(currentOrders);
        } else {
            throw new Error(response.message || 'Error al cargar órdenes');
        }
    } catch (error) {
        console.error('Error cargando órdenes:', error);
        document.getElementById('ordersGrid').innerHTML = 
            '<div class="error-message">❌ Error al cargar órdenes</div>';
    }
}

async function loadAvailableProducts() {
    try {
        const response = await ProductsAPI.getAll();
        if (response.success) {
            availableProducts = response.data;
            updateProductSelects();
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

function updateProductSelects() {
    const selects = document.querySelectorAll('.product-select');
    const options = '<option value="">Seleccionar producto...</option>' + 
        availableProducts.map(product => 
            `<option value="${product._id}" data-name="${product.name}" data-price="${product.price}">
                ${product.name} - $${product.price}
            </option>`
        ).join('');
    
    selects.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = options;
        select.value = currentValue;
    });
}

function addItemRow() {
    const container = document.getElementById('itemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'order-item';
    newItem.innerHTML = `
        <select class="form-control product-select" required>
            <option value="">Seleccionar producto...</option>
        </select>
        <input 
            type="number" 
            class="form-control quantity-input" 
            placeholder="Cantidad" 
            min="1" 
            value="1"
            required
        >
        <button type="button" class="btn btn-sm btn-danger remove-item">✖</button>
    `;
    container.appendChild(newItem);
    updateProductSelects();
}

function removeItemRow(button) {
    const container = document.getElementById('itemsContainer');
    const items = container.querySelectorAll('.order-item');
    
    if (items.length > 1) {
        button.closest('.order-item').remove();
    } else {
        Utils.showError('Debe haber al menos un producto en la orden');
    }
}

function renderOrders(orders) {
    const ordersGrid = document.getElementById('ordersGrid');
    
    if (orders.length === 0) {
        ordersGrid.innerHTML = '<div class="empty-state">🧾 No hay órdenes registradas</div>';
        return;
    }

    ordersGrid.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <h3>Orden #${order._id.slice(-8)}</h3>
                <span class="order-status ${getStatusClass(order.status)}">
                    ${getStatusText(order.status)}
                </span>
            </div>
            <div class="order-body">
                <p><strong>Cliente:</strong> ${order.userName || order.userEmail}</p>
                <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
                <p><strong>Items:</strong> ${order.items.length} producto(s)</p>
                <p><strong>Fecha:</strong> ${Utils.formatDate(order.createdAt)}</p>
                <p><strong>Dirección:</strong> ${order.shippingAddress.substring(0, 50)}...</p>
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
                ${order.status === 'cancelada' ? `
                    <button class="btn btn-sm btn-danger" onclick="deleteOrder('${order._id}')">
                        🗑️ Eliminar
                    </button>
                ` : ''}
                ${currentUser?.role === 'admin' ? `
                    <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order._id}')">
                        🔄 Cambiar Estado
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
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

function openModal() {
    document.getElementById('modalTitle').textContent = 'Nueva Orden';
    document.getElementById('orderForm').reset();
    
    // Limpiar items y agregar uno inicial
    const container = document.getElementById('itemsContainer');
    container.innerHTML = `
        <div class="order-item">
            <select class="form-control product-select" required>
                <option value="">Seleccionar producto...</option>
            </select>
            <input 
                type="number" 
                class="form-control quantity-input" 
                placeholder="Cantidad" 
                min="1" 
                value="1"
                required
            >
            <button type="button" class="btn btn-sm btn-danger remove-item">✖</button>
        </div>
    `;
    
    updateProductSelects();
    document.getElementById('orderModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('orderModal').style.display = 'none';
    Utils.hideMessages();
}

function closeDetailModal() {
    document.getElementById('orderDetailModal').style.display = 'none';
}

async function handleSubmit(e) {
    e.preventDefault();
    Utils.hideMessages();
    Utils.toggleButtonLoader('saveBtn', true);

    try {
        const shippingAddress = document.getElementById('shippingAddress').value.trim();
        
        // Obtener items
        const items = [];
        const itemRows = document.querySelectorAll('.order-item');
        
        itemRows.forEach(row => {
            const productSelect = row.querySelector('.product-select');
            const quantityInput = row.querySelector('.quantity-input');
            
            if (productSelect.value && quantityInput.value) {
                items.push({
                    productId: productSelect.value,
                    quantity: parseInt(quantityInput.value)
                });
            }
        });

        if (items.length === 0) {
            throw new Error('Debe agregar al menos un producto');
        }

        const orderData = {
            items: items,
            shippingAddress: shippingAddress
        };

        const response = await OrdersAPI.create(orderData);

        if (response.success) {
            Utils.showSuccess('Orden creada exitosamente');
            closeModal();
            await loadOrders();
        } else {
            throw new Error(response.message || 'Error al crear orden');
        }
    } catch (error) {
        console.error('Error en operación:', error);
        Utils.showError(error.message || 'Error al crear la orden');
    } finally {
        Utils.toggleButtonLoader('saveBtn', false);
    }
}

function filterOrders() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filtered = currentOrders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm) ||
                             (order.userName && order.userName.toLowerCase().includes(searchTerm)) ||
                             (order.userEmail && order.userEmail.toLowerCase().includes(searchTerm));
        const matchesStatus = !statusFilter || order.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderOrders(filtered);
}

window.viewOrderDetail = async (orderId) => {
    try {
        const response = await OrdersAPI.getById(orderId);
        if (response.success) {
            const order = response.data;
            
            const detailContent = `
                <div class="order-detail">
                    <div class="detail-section">
                        <h3>📋 Información General</h3>
                        <p><strong>ID:</strong> ${order._id}</p>
                        <p><strong>Estado:</strong> <span class="order-status ${getStatusClass(order.status)}">${getStatusText(order.status)}</span></p>
                        <p><strong>Cliente:</strong> ${order.userName || 'N/A'} (${order.userEmail})</p>
                        <p><strong>Fecha:</strong> ${Utils.formatDate(order.createdAt)}</p>
                        <p><strong>Dirección:</strong> ${order.shippingAddress}</p>
                    </div>
                    
                    <div class="detail-section">
                        <h3>🛒 Productos</h3>
                        <table class="detail-table">
                            <thead>
                                <tr>
                                    <th>Producto</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unit.</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.items.map(item => `
                                    <tr>
                                        <td>${item.productName || 'Producto no disponible'}</td>
                                        <td>${item.quantity}</td>
                                        <td>$${item.price ? item.price.toFixed(2) : '0.00'}</td>
                                        <td>$${((item.price || 0) * item.quantity).toFixed(2)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" style="text-align: right;"><strong>TOTAL:</strong></td>
                                    <td><strong>$${order.totalAmount ? order.totalAmount.toFixed(2) : '0.00'}</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;
            
            document.getElementById('orderDetailContent').innerHTML = detailContent;
            document.getElementById('orderDetailModal').style.display = 'flex';
        }
    } catch (error) {
        console.error('Error cargando detalle:', error);
        Utils.showError('Error al cargar detalle de orden');
    }
};

window.cancelOrder = async (orderId) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta orden? El stock será restaurado al inventario.')) {
        return;
    }

    try {
        const response = await OrdersAPI.cancel(orderId);
        
        if (response.success) {
            Utils.showSuccess('Orden cancelada exitosamente');
            await loadOrders();
        } else {
            throw new Error(response.message || 'Error al cancelar orden');
        }
    } catch (error) {
        console.error('Error cancelando orden:', error);
        Utils.showError(error.message || 'Error al cancelar la orden');
    }
};

window.updateOrderStatus = async (orderId) => {
    const newStatus = prompt('Ingrese el nuevo estado:\n- pendiente\n- pagada\n- enviada\n- entregada\n- cancelada');
    
    if (!newStatus) return;
    
    const validStatuses = ['pendiente', 'pagada', 'enviada', 'entregada', 'cancelada'];
    if (!validStatuses.includes(newStatus.toLowerCase())) {
        Utils.showError('Estado inválido');
        return;
    }

    try {
        const response = await OrdersAPI.updateStatus(orderId, newStatus.toLowerCase());
        
        if (response.success) {
            Utils.showSuccess('Estado actualizado exitosamente');
            await loadOrders();
        } else {
            throw new Error(response.message || 'Error al actualizar estado');
        }
    } catch (error) {
        console.error('Error actualizando estado:', error);
        Utils.showError(error.message || 'Error al actualizar el estado');
    }
};

window.deleteOrder = async (orderId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar permanentemente esta orden cancelada?')) {
        return;
    }

    try {
        const response = await OrdersAPI.delete(orderId);
        
        if (response.success) {
            Utils.showSuccess('Orden eliminada permanentemente');
            await loadOrders();
        } else {
            throw new Error(response.message || 'Error al eliminar orden');
        }
    } catch (error) {
        console.error('Error eliminando orden:', error);
        Utils.showError(error.message || 'Error al eliminar la orden');
    }
};