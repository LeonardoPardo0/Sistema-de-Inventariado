const ProductsAPI = {
    /**
     * Obtener todos los productos
     */
    async getAll() {
        return await API.get('/products');
    },

    /**
     * Obtener producto por ID
     */
    async getById(productId) {
        return await API.get(`/products/${productId}`);
    },

    /**
     * Crear nuevo producto (requiere autenticación)
     */
    async create(productData) {
        return await API.post('/products', productData, true);
    },

    /**
     * Actualizar producto (requiere autenticación)
     */
    async update(productId, productData) {
        return await API.put(`/products/${productId}`, productData, true);
    },

    /**
     * Eliminar producto (requiere autenticación)
     */
    async delete(productId) {
        return await API.delete(`/products/${productId}`, true);
    },

    /**
     * Obtener productos por categoría
     */
    async getByCategory(category) {
        const products = await this.getAll();
        return products.data.filter(p => p.category === category);
    },

    /**
     * Buscar productos por nombre
     */
    async search(searchTerm) {
        const products = await this.getAll();
        return products.data.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    },

    /**
     * Sincronizar inventario de un producto
    */
    async syncInventory(productId) {
        return await API.post(`/products/${productId}/sync-inventory`, {}, true);
    }
};