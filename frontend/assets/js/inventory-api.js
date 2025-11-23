// assets/js/inventory-api.js
const InventoryAPI = {
    /**
     * Obtener todo el inventario
     */
    async getAll() {
        return await API.get('/inventory');
    },

    /**
     * Obtener inventario por producto
     */
    async getByProduct(productId) {
        return await API.get(`/inventory/${productId}`);
    },

    /**
     * Crear nuevo registro de inventario
     */
    async create(inventoryData) {
        return await API.post('/inventory', inventoryData, true);
    },

    /**
     * Actualizar stock
     */
    async updateStock(productId, stockData) {
        return await API.put(`/inventory/${productId}`, stockData, true);
    },

    /**
     * Verificar stock disponible
     */
    async checkStock(productId, quantity = 1) {
        return await API.get(`/inventory/${productId}/check?quantity=${quantity}`);
    },

    /**
     * Obtener productos con stock bajo
     */
    async getLowStock() {
        return await API.get('/inventory/low-stock');
    },

    /**
     * Eliminar registro de inventario
     */
    async delete(productId) {
        return await API.delete(`/inventory/${productId}`, true);
    },

    /**
     * Obtener todos los almacenes
     */
    async getWarehouses() {
        return await API.get('/warehouses');
    },

    /**
     * Crear nuevo almacén
     */
    async createWarehouse(warehouseData) {
        return await API.post('/warehouses', warehouseData, true);
    },

    /**
     * Actualizar almacén
     */
    async updateWarehouse(warehouseId, warehouseData) {
        return await API.put(`/warehouses/${warehouseId}`, warehouseData, true);
    },

    /**
     * Eliminar almacén
     */
    async deleteWarehouse(warehouseId) {
        return await API.delete(`/warehouses/${warehouseId}`, true);
    }
};