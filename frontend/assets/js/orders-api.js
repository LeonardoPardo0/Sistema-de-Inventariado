// assets/js/orders-api.js
const OrdersAPI = {
    /**
     * Obtener todas las órdenes (admin ve todas, cliente solo las suyas)
     */
    async getAll(status = '') {
        const query = status ? `?status=${status}` : '';
        return await API.get(`/orders${query}`, true);
    },

    /**
     * Obtener mis órdenes (usuario autenticado)
     */
    async getMyOrders(status = '') {
        const query = status ? `?status=${status}` : '';
        return await API.get(`/orders/my-orders${query}`, true);
    },

    /**
     * Obtener orden por ID
     */
    async getById(orderId) {
        return await API.get(`/orders/${orderId}`, true);
    },

    /**
     * Crear nueva orden
     */
    async create(orderData) {
        return await API.post('/orders', orderData, true);
    },

    /**
     * Actualizar estado de orden (solo admin)
     */
    async updateStatus(orderId, status) {
        return await API.put(`/orders/${orderId}/status`, { status }, true);
    },

    /**
     * Cancelar orden
     */
    async cancel(orderId) {
        return await API.put(`/orders/${orderId}/cancel`, {}, true);
    },

    /**
     * Eliminar orden cancelada
     */
    async delete(orderId) {
        return await API.delete(`/orders/${orderId}`, true);
    }
};