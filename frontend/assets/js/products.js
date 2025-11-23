let currentProducts = [];
let editingProductId = null;

// ============================================
// Cargar productos al iniciar
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupEventListeners();
});

// ============================================
// Configurar event listeners
// ============================================
function setupEventListeners() {
    // Botón nuevo producto
    document.getElementById('btnNewProduct').addEventListener('click', () => {
        openModal();
    });

    // Cerrar modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Submit formulario
    document.getElementById('productForm').addEventListener('submit', handleSubmit);

    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', (e) => {
        filterProducts(e.target.value, document.getElementById('categoryFilter').value);
    });

    // Filtro categoría
    document.getElementById('categoryFilter').addEventListener('change', (e) => {
        filterProducts(document.getElementById('searchInput').value, e.target.value);
    });

    // Cerrar sesión
    document.getElementById('logoutBtn').addEventListener('click', () => {
        Utils.logout();
    });

    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('productModal');
        if (e.target === modal) {
            closeModal();
        }
    });
}

// ============================================
// Cargar productos
// ============================================
async function loadProducts() {
    try {
        const productsGrid = document.getElementById('productsGrid');
        productsGrid.innerHTML = '<div class="loading">Cargando productos...</div>';

        const response = await ProductsAPI.getAll();
        
        if (response.success) {
            currentProducts = response.data;
            renderProducts(currentProducts);
        } else {
            throw new Error(response.message || 'Error al cargar productos');
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<div class="error-message">❌ Error al cargar productos. Verifica tu conexión.</div>';
    }
}

// ============================================
// Renderizar productos
// ============================================
function renderProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (products.length === 0) {
        productsGrid.innerHTML = '<div class="empty-state">📦 No hay productos disponibles</div>';
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card" data-id="${product._id}">
            <div class="product-header">
                <h3>${product.name}</h3>
                <span class="product-category">${product.category || 'Sin categoría'}</span>
            </div>
            <div class="product-body">
                <p class="product-description">${product.description || 'Sin descripción'}</p>
                <p class="product-sku">SKU: ${product.sku || 'N/A'}</p>
                <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
            </div>
            <div class="product-actions">
                <button class="btn btn-sm btn-primary" onclick="editProduct('${product._id}')">
                    ✏️ Editar
                </button>
                <button class="btn btn-sm btn-success" onclick="syncInventory('${product._id}')">
                    🔄 Sync Inventario
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteProduct('${product._id}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// ============================================
// Filtrar productos
// ============================================
function filterProducts(searchTerm, category) {
    let filtered = [...currentProducts];

    // Filtrar por búsqueda
    if (searchTerm) {
        filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }

    // Filtrar por categoría
    if (category) {
        filtered = filtered.filter(p => p.category === category);
    }

    renderProducts(filtered);
}

// ============================================
// Abrir modal
// ============================================
function openModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    form.reset();
    editingProductId = null;

    if (product) {
        // Modo edición
        modalTitle.textContent = 'Editar Producto';
        editingProductId = product._id;
        document.getElementById('productId').value = product._id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productSku').value = product.sku || '';
    } else {
        // Modo creación
        modalTitle.textContent = 'Nuevo Producto';
    }

    modal.style.display = 'flex';
}

// ============================================
// Cerrar modal
// ============================================
function closeModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('productForm').reset();
    editingProductId = null;
    Utils.hideMessages();
}

// ============================================
// Manejar submit del formulario
// ============================================
async function handleSubmit(e) {
    e.preventDefault();
    Utils.hideMessages();
    Utils.toggleButtonLoader('saveBtn', true);

    try {
        const productData = {
            name: document.getElementById('productName').value.trim(),
            description: document.getElementById('productDescription').value.trim(),
            price: parseFloat(document.getElementById('productPrice').value),
            category: document.getElementById('productCategory').value.trim(),
            sku: document.getElementById('productSku').value.trim()
        };

        // Remover campos vacíos opcionales
        if (!productData.description) delete productData.description;
        if (!productData.category) delete productData.category;
        if (!productData.sku) delete productData.sku;

        let response;
        if (editingProductId) {
            // Actualizar
            response = await ProductsAPI.update(editingProductId, productData);
        } else {
            // Crear
            response = await ProductsAPI.create(productData);
        }

        if (response.success) {
            Utils.showSuccess(response.message || 'Operación exitosa');
            closeModal();
            await loadProducts();
        } else {
            throw new Error(response.message || 'Error en la operación');
        }
    } catch (error) {
        console.error('Error en operación:', error);
        Utils.showError(error.message || 'Error al guardar el producto');
    } finally {
        Utils.toggleButtonLoader('saveBtn', false);
    }
}

// ============================================
// Editar producto
// ============================================
async function editProduct(productId) {
    try {
        const response = await ProductsAPI.getById(productId);
        if (response.success) {
            openModal(response.data);
        }
    } catch (error) {
        console.error('Error cargando producto:', error);
        Utils.showError('Error al cargar el producto');
    }
}

// ============================================
// Eliminar producto
// ============================================
async function deleteProduct(productId) {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar este producto?');
    
    if (!confirmDelete) {
        return;
    }

    try {
        // Primero eliminar el producto
        const response = await ProductsAPI.delete(productId);
        
        if (response.success) {
            Utils.showSuccess('Producto eliminado exitosamente');
            
            // Preguntar si quiere eliminar el inventario asociado
            const deleteInventory = confirm(
                '¿Deseas también eliminar el inventario asociado a este producto?\n\n' +
                'Si no lo eliminas, quedará un registro de inventario huérfano.'
            );
            
            if (deleteInventory) {
                try {
                    await InventoryAPI.delete(productId);
                    Utils.showSuccess('Producto e inventario eliminados exitosamente');
                } catch (invError) {
                    // Si no existe inventario, no mostrar error
                    if (invError.status !== 404) {
                        console.warn('No se pudo eliminar el inventario:', invError.message);
                    }
                }
            }
            
            await loadProducts();
        } else {
            throw new Error(response.message || 'Error al eliminar');
        }
    } catch (error) {
        console.error('Error eliminando producto:', error);
        Utils.showError(error.message || 'Error al eliminar el producto');
    }
}

// Después de la función deleteProduct
async function syncInventory(productId) {
    if (!confirm('¿Deseas sincronizar el inventario de este producto?')) {
        return;
    }

    try {
        const response = await ProductsAPI.syncInventory(productId);
        
        if (response.success) {
            Utils.showSuccess('Inventario sincronizado exitosamente');
        } else {
            throw new Error(response.message || 'Error al sincronizar');
        }
    } catch (error) {
        console.error('Error sincronizando inventario:', error);
        Utils.showError(error.message || 'Error al sincronizar inventario');
    }
}

// Exponer funciones globalmente para los onclick
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.syncInventory = syncInventory;
