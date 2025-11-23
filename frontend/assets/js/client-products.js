/**
 * Catálogo de Productos para Clientes
 */

// Verificar autenticación
if (!Utils.isAuthenticated()) {
    Utils.redirectToLogin();
}

let allProducts = [];
let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    loadCartFromStorage();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterProducts);
    document.getElementById('categoryFilter').addEventListener('change', filterProducts);
    document.getElementById('logoutBtn').addEventListener('click', () => Utils.logout());
    
    // Carrito
    document.getElementById('btnViewCart').addEventListener('click', openCartModal);
    document.getElementById('closeCartModal').addEventListener('click', closeCartModal);
    document.getElementById('clearCartBtn').addEventListener('click', clearCart);
    document.getElementById('checkoutBtn').addEventListener('click', openCheckoutModal);
    
    // Checkout
    document.getElementById('closeCheckoutModal').addEventListener('click', closeCheckoutModal);
    document.getElementById('cancelCheckoutBtn').addEventListener('click', closeCheckoutModal);
    document.getElementById('checkoutForm').addEventListener('submit', handleCheckout);
}

async function loadProducts() {
    try {
        const response = await ProductsAPI.getAll();
        if (response.success) {
            allProducts = response.data;
            renderProducts(allProducts);
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<div class="error-message">❌ Error al cargar productos</div>';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="empty-state">📦 No hay productos disponibles</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card client-card">
            <div class="product-header">
                <h3>${product.name}</h3>
                <span class="product-category">${product.category || 'General'}</span>
            </div>
            <div class="product-body">
                <p class="product-description">${product.description || 'Sin descripción'}</p>
                <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
            </div>
            <div class="product-actions">
                <div class="quantity-selector">
                    <button type="button" class="qty-btn" onclick="decreaseQty('${product._id}')">-</button>
                    <input type="number" id="qty-${product._id}" value="1" min="1" max="99" class="qty-input">
                    <button type="button" class="qty-btn" onclick="increaseQty('${product._id}')">+</button>
                </div>
                <button class="btn btn-primary btn-add-cart" onclick="addToCart('${product._id}')">
                    🛒 Agregar
                </button>
            </div>
        </div>
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    
    let filtered = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                             (product.description && product.description.toLowerCase().includes(searchTerm));
        const matchesCategory = !category || product.category === category;
        return matchesSearch && matchesCategory;
    });
    
    renderProducts(filtered);
}

// ============================================
// CARRITO DE COMPRAS
// ============================================

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
}

function saveCartToStorage() {
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
}

window.increaseQty = (productId) => {
    const input = document.getElementById(`qty-${productId}`);
    if (input && input.value < 99) {
        input.value = parseInt(input.value) + 1;
    }
};

window.decreaseQty = (productId) => {
    const input = document.getElementById(`qty-${productId}`);
    if (input && input.value > 1) {
        input.value = parseInt(input.value) - 1;
    }
};

window.addToCart = (productId) => {
    const product = allProducts.find(p => p._id === productId);
    if (!product) return;
    
    const qtyInput = document.getElementById(`qty-${productId}`);
    const quantity = parseInt(qtyInput.value) || 1;
    
    // Verificar si ya está en el carrito
    const existingIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push({
            productId: product._id,
            productName: product.name,
            price: product.price,
            quantity: quantity
        });
    }
    
    saveCartToStorage();
    updateCartCount();
    
    // Reset cantidad
    qtyInput.value = 1;
    
    // Feedback visual
    Utils.showSuccess(`${product.name} agregado al carrito`);
};

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

function openCartModal() {
    renderCartItems();
    document.getElementById('cartModal').style.display = 'flex';
}

function closeCartModal() {
    document.getElementById('cartModal').style.display = 'none';
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        container.innerHTML = '<div class="empty-cart">🛒 Tu carrito está vacío</div>';
        document.getElementById('cartTotal').textContent = '0.00';
        return;
    }
    
    container.innerHTML = cart.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.productName}</h4>
                <p>$${parseFloat(item.price).toFixed(2)} x ${item.quantity}</p>
            </div>
            <div class="cart-item-total">
                <strong>$${(item.price * item.quantity).toFixed(2)}</strong>
                <button class="btn btn-sm btn-danger" onclick="removeFromCart(${index})">🗑️</button>
            </div>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
}

window.removeFromCart = (index) => {
    cart.splice(index, 1);
    saveCartToStorage();
    updateCartCount();
    renderCartItems();
};

function clearCart() {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
        cart = [];
        saveCartToStorage();
        updateCartCount();
        renderCartItems();
    }
}

// ============================================
// CHECKOUT
// ============================================

function openCheckoutModal() {
    if (cart.length === 0) {
        Utils.showError('Tu carrito está vacío');
        return;
    }
    
    closeCartModal();
    renderOrderSummary();
    document.getElementById('checkoutModal').style.display = 'flex';
}

function closeCheckoutModal() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function renderOrderSummary() {
    const container = document.getElementById('orderSummary');
    
    container.innerHTML = cart.map(item => `
        <div class="summary-item">
            <span>${item.productName} x ${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('summaryTotal').textContent = total.toFixed(2);
}

async function handleCheckout(e) {
    e.preventDefault();
    
    const shippingAddress = document.getElementById('shippingAddress').value.trim();
    
    if (shippingAddress.length < 10) {
        Utils.showError('La dirección debe tener al menos 10 caracteres');
        return;
    }
    
    Utils.toggleButtonLoader('confirmOrderBtn', true);
    
    try {
        const orderData = {
            items: cart.map(item => ({
                productId: item.productId,
                quantity: item.quantity
            })),
            shippingAddress: shippingAddress
        };
        
        const response = await OrdersAPI.create(orderData);
        
        if (response.success) {
            // Limpiar carrito
            cart = [];
            saveCartToStorage();
            updateCartCount();
            
            closeCheckoutModal();
            Utils.showSuccess('¡Pedido realizado exitosamente!');
            
            // Redirigir a mis pedidos después de 2 segundos
            setTimeout(() => {
                window.location.href = 'client-orders.html';
            }, 2000);
        } else {
            throw new Error(response.message || 'Error al crear pedido');
        }
    } catch (error) {
        console.error('Error en checkout:', error);
        Utils.showError(error.message || 'Error al procesar el pedido');
    } finally {
        Utils.toggleButtonLoader('confirmOrderBtn', false);
    }
}