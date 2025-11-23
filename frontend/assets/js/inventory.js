let currentInventory = [];
let editingProductId = null;
let warehouses = [];
let availableProducts = []; // Productos sin inventario

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    loadWarehouses();
    loadAvailableProducts();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('btnNewInventory').addEventListener('click', openModal);
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.getElementById('inventoryForm').addEventListener('submit', handleSubmit);
    document.getElementById('searchInput').addEventListener('input', filterInventory);
    document.getElementById('statusFilter').addEventListener('change', filterInventory);
    document.getElementById('warehouseFilter').addEventListener('change', filterInventory);
    document.getElementById('logoutBtn').addEventListener('click', () => Utils.logout());
    document.getElementById('productSelect').addEventListener('change', updateProductInfo);
}

async function loadInventory() {
    try {
        const response = await InventoryAPI.getAll();
        if (response.success) {
            currentInventory = response.data;
            renderInventory(currentInventory);
        }
    } catch (error) {
        console.error('Error cargando inventario:', error);
        document.getElementById('inventoryGrid').innerHTML =
            '<div class="error-message">❌ Error al cargar inventario</div>';
    }
}

// Cargar productos disponibles (sin inventario)
async function loadAvailableProducts() {
    try {
        const productsResponse = await ProductsAPI.getAll();
        
        if (!productsResponse.success) {
            throw new Error('No se pudieron cargar los productos');
        }
        
        const allProducts = productsResponse.data;
        
        // Obtener inventarios existentes
        let existingInventory = [];
        try {
            const inventoryResponse = await InventoryAPI.getAll();
            if (inventoryResponse.success) {
                existingInventory = inventoryResponse.data;
            }
        } catch (error) {
            console.warn('No se pudo cargar inventario existente:', error);
        }
        
        // Filtrar productos que NO tienen inventario
        availableProducts = allProducts.filter(product => 
            !existingInventory.some(inv => inv.productId === product._id)
        );
        
        console.log('✅ Productos disponibles para inventario:', availableProducts.length);
        updateProductSelect();
        
    } catch (error) {
        console.error('Error cargando productos disponibles:', error);
        Utils.showError('Error al cargar productos disponibles');
    }
}

function updateProductSelect() {
    const productSelect = document.getElementById('productSelect');

    productSelect.innerHTML = '<option value="">Seleccionar producto</option>' +
        availableProducts.map(product =>
            `<option value="${product._id}" data-name="${product.name}">
                ${product.name} (ID: ${product._id})
            </option>`
        ).join('');
}

function updateProductInfo() {
    const productSelect = document.getElementById('productSelect');
    const selectedOption = productSelect.options[productSelect.selectedIndex];
    
    if (selectedOption.value) {
        const productId = selectedOption.value;
        const productName = selectedOption.getAttribute('data-name') || selectedOption.text;
        
        document.getElementById('productIdDisplay').value = productId;
        document.getElementById('productNameDisplay').value = productName;
        
        console.log('📦 Producto seleccionado:', { productId, productName });
    } else {
        document.getElementById('productIdDisplay').value = '';
        document.getElementById('productNameDisplay').value = '';
    }
}

async function loadWarehouses() {
    try {
        const response = await InventoryAPI.getWarehouses();
        if (response.success) {
            warehouses = response.data;
            updateWarehouseFilters();
        }
    } catch (error) {
        console.error('Error cargando almacenes:', error);
    }
}

function updateWarehouseFilters() {
    const warehouseSelect = document.getElementById('warehouseFilter');
    const locationSelect = document.getElementById('location');
    
    // Usar warehouseCode o sequenceId como valor
    const options = warehouses.map(warehouse => 
        `<option value="${warehouse.warehouseCode || warehouse.sequenceId}">${warehouse.name}</option>`
    ).join('');
    
    if (warehouseSelect) {
        warehouseSelect.innerHTML = '<option value="">Todos los almacenes</option>' + options;
    }
    
    if (locationSelect) {
        locationSelect.innerHTML = '<option value="">Seleccionar almacén</option>' + options;
    }
}

function renderInventory(inventory) {
    const grid = document.getElementById('inventoryGrid');

    if (inventory.length === 0) {
        grid.innerHTML = '<div class="empty-state">🏬 No hay registros de inventario</div>';
        return;
    }

    grid.innerHTML = inventory.map(item => `
        <div class="product-card">
            <div class="product-header">
                <h3>${item.productName}</h3>
                <span class="product-category ${getStatusClass(item.status)}">
                    ${getStatusText(item.status)}
                </span>
            </div>
            <div class="product-body">
                <p><strong>Product ID:</strong> ${item.productId}</p>
                <p><strong>Stock:</strong> ${item.quantity} unidades</p>
                <p><strong>Ubicación:</strong> ${getWarehouseName(item.location)}</p>
                <p><strong>Última actualización:</strong> ${Utils.formatDate(item.updatedAt)}</p>
            </div>
            <div class="product-actions">
                <button class="btn btn-sm btn-primary" onclick="editInventory('${item.productId}')">
                    ✏️ Editar
                </button>
                <button class="btn btn-sm btn-warning" onclick="updateStock('${item.productId}', 1)">
                    ➕ Stock
                </button>
                <button class="btn btn-sm btn-danger" onclick="updateStock('${item.productId}', 2)">
                    ➖ Stock
                </button>
            </div>
        </div>
    `).join('');
}

function getStatusText(status) {
    const statusTexts = {
        'Disponible': 'Disponible',
        'Bajo_Stock': 'Stock Bajo',
        'Agotado': 'Agotado',
        'Descontinuado': 'Descontinuado'
    };
    return statusTexts[status] || status;
}

function getStatusClass(status) {
    const statusClasses = {
        'Disponible': 'status-available',
        'Bajo_Stock': 'status-low',
        'Agotado': 'status-out',
        'Descontinuado': 'status-discontinued'
    };
    return statusClasses[status] || '';
}

function getWarehouseName(warehouseId) {
    const warehouse = warehouses.find(w => w.warehouseId == warehouseId);
    return warehouse ? warehouse.name : `Almacén ${warehouseId}`;
}

async function openModal() {
    editingProductId = null;
    document.getElementById('modalTitle').textContent = 'Gestionar Inventario';
    document.getElementById('inventoryForm').reset();
    document.getElementById('productSelect').value = '';
    document.getElementById('productIdDisplay').value = '';
    document.getElementById('productNameDisplay').value = '';
    document.getElementById('inventoryModal').style.display = 'flex';

    // Recargar productos disponibles
    await loadAvailableProducts();
}

function closeModal() {
    document.getElementById('inventoryModal').style.display = 'none';
}

async function handleSubmit(e) {
    e.preventDefault();
    
    // ✅ AGREGAR ESTAS VALIDACIONES
    const productId = document.getElementById('productSelect').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const location = document.getElementById('location').value;
    const minStock = parseInt(document.getElementById('minStock').value) || 10;

    // Validaciones mejoradas
    if (!productId) {
        Utils.showError('Debe seleccionar un producto');
        document.getElementById('productSelect').focus();
        return;
    }

    if (isNaN(quantity) || quantity < 0) {
        Utils.showError('La cantidad debe ser un número válido mayor o igual a 0');
        document.getElementById('quantity').focus();
        return;
    }

    if (!location) {
        Utils.showError('Debe seleccionar una ubicación (almacén)');
        document.getElementById('location').focus();
        return;
    }

    if (isNaN(minStock) || minStock < 0) {
        Utils.showError('El stock mínimo debe ser un número válido');
        document.getElementById('minStock').focus();
        return;
    }

    try {
        const formData = {
            productId: productId,
            quantity: quantity,
            location: location,
            minStock: minStock
        };

        const response = await InventoryAPI.create(formData);

        if (response.success) {
            closeModal();
            loadInventory();
            Utils.showSuccess('Inventario creado exitosamente');
        }
    } catch (error) {
        Utils.showError(error.message || 'Error al crear el inventario');
    }
}

function filterInventory() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const statusFilter = document.getElementById('statusFilter').value;
    const warehouseFilter = document.getElementById('warehouseFilter').value;

    let filtered = currentInventory.filter(item => {
        const matchesSearch = item.productName.toLowerCase().includes(searchTerm) ||
            item.productId.toString().includes(searchTerm);
        const matchesStatus = !statusFilter || item.status === statusFilter;
        const matchesWarehouse = !warehouseFilter || item.location == warehouseFilter;

        return matchesSearch && matchesStatus && matchesWarehouse;
    });

    renderInventory(filtered);
}


window.editInventory = async (productId) => {
    try {
        const response = await InventoryAPI.getByProduct(productId);
        if (response.success) {
            const item = response.data;
            editingProductId = productId;

            document.getElementById('modalTitle').textContent = 'Editar Inventario';
            document.getElementById('productId').value = item.productId;
            document.getElementById('productName').value = item.productName;
            document.getElementById('quantity').value = item.quantity;
            document.getElementById('location').value = item.location;
            document.getElementById('minStock').value = item.minStock;

            document.getElementById('inventoryModal').style.display = 'block';
        }
    } catch (error) {
        Utils.showError('Error al cargar producto: ' + error.message);
    }
};

window.updateStock = async (productId, operation) => {
    const operationText = operation === 1 ? 'agregar' : 'restar';
    const quantity = prompt(`¿Cuántas unidades deseas ${operationText}?`);

    if (!quantity || isNaN(quantity) || quantity <= 0) return;

    try {
        const response = await InventoryAPI.updateStock(productId, {
            quantity: parseInt(quantity),
            operation: operation
        });

        if (response.success) {
            loadInventory();
            Utils.showSuccess(`Stock ${operationText}do exitosamente`);
        }
    } catch (error) {
        Utils.showError(error.message);
    }
};

window.editInventory = editInventory;
window.updateStock = updateStock;

// ============================================
// GESTIÓN DE ALMACENES
// ============================================

let editingWarehouseId = null;

// Configurar event listeners de almacenes
function setupWarehouseEventListeners() {
    document.getElementById('btnNewWarehouse').addEventListener('click', openWarehouseModal);
    document.getElementById('closeWarehouseModal').addEventListener('click', closeWarehouseModal);
    document.getElementById('cancelWarehouseBtn').addEventListener('click', closeWarehouseModal);
    document.getElementById('warehouseForm').addEventListener('submit', handleWarehouseSubmit);
}

// Cargar almacenes
async function loadWarehouses() {
    try {
        const response = await InventoryAPI.getWarehouses();
        if (response.success) {
            warehouses = response.data;
            renderWarehouses(warehouses);
            updateWarehouseFilters();
        }
    } catch (error) {
        console.error('Error cargando almacenes:', error);
        document.getElementById('warehousesGrid').innerHTML = 
            '<div class="empty-state">⚠️ Error al cargar almacenes</div>';
    }
}

// Renderizar almacenes
function renderWarehouses(warehousesList) {
    const grid = document.getElementById('warehousesGrid');
    
    if (!warehousesList || warehousesList.length === 0) {
        grid.innerHTML = '<div class="empty-state">🏭 No hay almacenes registrados. Crea uno para comenzar.</div>';
        return;
    }

    grid.innerHTML = warehousesList.map(warehouse => `
        <div class="warehouse-card">
            <div class="warehouse-header">
                <h3>${warehouse.name}</h3>
                <span class="warehouse-code">${warehouse.warehouseCode || 'Sin código'}</span>
            </div>
            <div class="warehouse-body">
                <p><strong>ID:</strong> ${warehouse.sequenceId || warehouse._id}</p>
                <p><strong>Dirección:</strong> ${warehouse.address || 'No especificada'}</p>
            </div>
            <div class="warehouse-actions">
                <button class="btn btn-sm btn-primary" onclick="editWarehouse('${warehouse._id}', '${warehouse.warehouseCode}', '${warehouse.name}', '${warehouse.address || ''}')">
                    ✏️ Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteWarehouse('${warehouse._id}')">
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    `).join('');
}

// Abrir modal de almacén
function openWarehouseModal() {
    editingWarehouseId = null;
    document.getElementById('warehouseModalTitle').textContent = 'Nuevo Almacén';
    document.getElementById('warehouseForm').reset();
    document.getElementById('warehouseId').value = '';
    document.getElementById('warehouseModal').style.display = 'flex';
}

// Cerrar modal de almacén
function closeWarehouseModal() {
    document.getElementById('warehouseModal').style.display = 'none';
    document.getElementById('warehouseForm').reset();
    editingWarehouseId = null;
}

// Manejar submit de almacén
async function handleWarehouseSubmit(e) {
    e.preventDefault();
    
    const warehouseCode = document.getElementById('warehouseCode').value.trim();
    const name = document.getElementById('warehouseName').value.trim();
    const address = document.getElementById('warehouseAddress').value.trim();

    if (!warehouseCode || !name) {
        Utils.showError('El código y nombre del almacén son obligatorios');
        return;
    }

    Utils.toggleButtonLoader('saveWarehouseBtn', true);

    try {
        const warehouseData = {
            warehouseCode,
            name,
            address
        };

        let response;
        if (editingWarehouseId) {
            response = await InventoryAPI.updateWarehouse(editingWarehouseId, warehouseData);
        } else {
            response = await InventoryAPI.createWarehouse(warehouseData);
        }

        if (response.success) {
            closeWarehouseModal();
            await loadWarehouses();
            Utils.showSuccess(editingWarehouseId ? 'Almacén actualizado exitosamente' : 'Almacén creado exitosamente');
        } else {
            throw new Error(response.message || 'Error al guardar almacén');
        }
    } catch (error) {
        console.error('Error guardando almacén:', error);
        Utils.showError(error.message || 'Error al guardar el almacén');
    } finally {
        Utils.toggleButtonLoader('saveWarehouseBtn', false);
    }
}

// Editar almacén
window.editWarehouse = (id, code, name, address) => {
    editingWarehouseId = id;
    document.getElementById('warehouseModalTitle').textContent = 'Editar Almacén';
    document.getElementById('warehouseId').value = id;
    document.getElementById('warehouseCode').value = code;
    document.getElementById('warehouseName').value = name;
    document.getElementById('warehouseAddress').value = address;
    document.getElementById('warehouseModal').style.display = 'flex';
};

// Eliminar almacén
window.deleteWarehouse = async (warehouseId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este almacén?\n\nNota: No podrás eliminar almacenes que tengan inventario asociado.')) {
        return;
    }

    try {
        const response = await InventoryAPI.deleteWarehouse(warehouseId);
        
        if (response.success) {
            await loadWarehouses();
            Utils.showSuccess('Almacén eliminado exitosamente');
        } else {
            throw new Error(response.message || 'Error al eliminar');
        }
    } catch (error) {
        console.error('Error eliminando almacén:', error);
        Utils.showError(error.message || 'Error al eliminar el almacén');
    }
};

// Inicializar almacenes
document.addEventListener('DOMContentLoaded', () => {
    setupWarehouseEventListeners();
});