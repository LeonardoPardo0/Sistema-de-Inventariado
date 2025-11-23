import axios from 'axios';
import { 
  AUTH_SERVICE_URL, 
  INVENTORY_SERVICE_URL, 
  PRODUCTS_SERVICE_URL 
} from '../config/env.js';

// Token de servicio para comunicación interna
const SERVICE_TOKEN = process.env.SERVICE_SECRET || 'service-secret-key-change-in-production';

// Cliente HTTP configurado con timeout
const httpClient = axios.create({
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Validar token JWT con Auth Service
 * @param {string} token - Token JWT del usuario
 * @returns {Promise<{valid: boolean, user?: object}>}
 */
export const validateToken = async (token) => {
  try {
    console.log('🔐 Validando token con Auth Service...');
    
    const response = await httpClient.get(`${AUTH_SERVICE_URL}/auth/validate`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data && response.data.user) {
      console.log(`✅ Token válido para usuario: ${response.data.user.email}`);
      return {
        valid: true,
        user: response.data.user
      };
    }
    
    return { valid: false };
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('❌ Token inválido o expirado');
      return { valid: false };
    }
    
    console.error('❌ Error validando token:', error.message);
    throw new Error(`Error al comunicarse con Auth Service: ${error.message}`);
  }
};

/**
 * Validar que un producto existe en Products Service
 * @param {string} productId - ID del producto
 * @returns {Promise<{exists: boolean, product?: object}>}
 */
export const validateProduct = async (productId) => {
  try {
    console.log(`🔍 Validando existencia del producto ${productId}...`);
    
    const response = await httpClient.get(`${PRODUCTS_SERVICE_URL}/products/${productId}`);
    
    if (response.data.success && response.data.data) {
      console.log(`✅ Producto ${productId} encontrado: ${response.data.data.name}`);
      return {
        exists: true,
        product: response.data.data
      };
    }
    
    return { exists: false };
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`❌ Producto ${productId} no existe`);
      return { exists: false };
    }
    
    console.error('❌ Error validando producto:', error.message);
    // En caso de error de conexión, lanzar excepción
    throw new Error(`Error al comunicarse con Products Service: ${error.message}`);
  }
};

/**
 * Obtener información de un producto
 * @param {string} productId - ID del producto
 * @returns {Promise<Object>}
 */
export const getProductInfo = async (productId) => {
  try {
    console.log(`📦 Obteniendo información del producto ${productId}...`);
    
    const response = await httpClient.get(`${PRODUCTS_SERVICE_URL}/products/${productId}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Producto no encontrado');
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Producto ${productId} no existe`);
    }
    
    console.error('❌ Error obteniendo producto:', error.message);
    throw new Error(`Error al comunicarse con Products Service: ${error.message}`);
  }
};

/**
 * Verificar disponibilidad de stock
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad solicitada
 * @returns {Promise<{available: boolean, currentStock: number}>}
 */
export const checkStock = async (productId, quantity) => {
  try {
    console.log(`📊 Verificando stock de ${productId} (cantidad: ${quantity})...`);
    
    const response = await httpClient.get(
      `${INVENTORY_SERVICE_URL}/inventory/${productId}/check?quantity=${quantity}`
    );
    
    if (response.data.success) {
      return {
        available: response.data.available,
        currentStock: response.data.currentStock
      };
    }
    
    return { available: false, currentStock: 0 };
  } catch (error) {
    if (error.response?.status === 404) {
      throw new Error(`Producto ${productId} no tiene inventario registrado`);
    }
    
    console.error('❌ Error verificando stock:', error.message);
    throw new Error(`Error al comunicarse con Inventory Service: ${error.message}`);
  }
};

/**
 * Descontar stock del inventario
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad a descontar
 * @returns {Promise<boolean>}
 */
export const discountStock = async (productId, quantity) => {
  try {
    console.log(`📉 Descontando ${quantity} unidades del producto ${productId}...`);
    
    const response = await httpClient.post(
      `${INVENTORY_SERVICE_URL}/inventory/${productId}/discount`,
      { quantity }
    );
    
    if (response.data.success) {
      console.log(`✅ Stock descontado exitosamente`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error descontando stock:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Error al descontar stock');
  }
};

/**
 * Restaurar stock al inventario (cuando se cancela una orden)
 * @param {string} productId - ID del producto
 * @param {number} quantity - Cantidad a restaurar
 * @param {string} token - Token JWT del usuario (opcional)
 * @returns {Promise<boolean>}
 */
export const restoreStock = async (productId, quantity, token = null) => {
  try {
    console.log(`📈 Restaurando ${quantity} unidades del producto ${productId}...`);
    
    // Configurar headers con token si está disponible
    const config = {};
    if (token) {
      config.headers = {
        'Authorization': `Bearer ${token}`
      };
    }
    
    // Usar el endpoint de actualización de stock con operación de suma
    const response = await httpClient.put(
      `${INVENTORY_SERVICE_URL}/inventory/${productId}`,
      { 
        quantity: quantity,
        operation: 1 // 1 = agregar stock
      },
      config
    );
    
    if (response.data.success) {
      console.log(`✅ Stock restaurado exitosamente`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error restaurando stock:', error.response?.data?.message || error.message);
    throw new Error(error.response?.data?.message || 'Error al restaurar stock');
  }
};

export default httpClient;