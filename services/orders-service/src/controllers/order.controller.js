import Order from '../models/order.model.js';
import { getProductInfo, checkStock, discountStock, restoreStock } from '../utils/httpClient.js';

/**
 * Obtener todas las órdenes
 * - Admin: ve todas las órdenes
 * - Cliente: solo ve sus propias órdenes
 */
export const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;
        const isAdmin = req.user.role === 'admin';

        let filter = {};

        // Si es cliente, solo ver sus órdenes
        if (!isAdmin) {
            filter.userId = req.user.id;
        }

        // Filtrar por estado si se proporciona
        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Error al obtener órdenes:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener órdenes',
            error: error.message
        });
    }
};

/**
 * Obtener orden por ID
 */
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        // Verificar permisos: admin o dueño de la orden
        const isAdmin = req.user.role === 'admin';
        const isOwner = order.belongsToUser(req.user.id);

        if (!isAdmin && !isOwner) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para ver esta orden'
            });
        }

        return res.status(200).json({
            success: true,
            data: order
        });

    } catch (error) {
        console.error('Error al obtener orden:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener orden',
            error: error.message
        });
    }
};

/**
 * Crear nueva orden
 * FLUJO COMPLETO:
 * 1. Validar productos existen
 * 2. Obtener precios actuales
 * 3. Verificar stock disponible
 * 4. Descontar stock
 * 5. Crear orden
 */
export const createOrder = async (req, res) => {
    try {
        const { items, shippingAddress } = req.body;
        const userId = req.user.id;

        console.log(`📝 Procesando nueva orden para usuario ${req.user.email}`);

        // Array para almacenar items validados con precios actuales
        const validatedItems = [];
        let totalAmount = 0;

        // ================================================
        // PASO 1 y 2: Validar productos y obtener precios
        // ================================================
        for (const item of items) {
            try {
                // Obtener información del producto
                const product = await getProductInfo(item.productId);

                // Verificar que el producto esté activo
                if (!product.isActive) {
                    return res.status(400).json({
                        success: false,
                        message: `El producto "${product.name}" no está disponible`
                    });
                }

                // Usar el precio actual del producto
                const itemData = {
                    productId: product._id,
                    productName: product.name,
                    quantity: item.quantity,
                    price: product.price
                };

                validatedItems.push(itemData);
                totalAmount += product.price * item.quantity;

            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message || `Error validando producto ${item.productId}`
                });
            }
        }

        // ================================================
        // PASO 3: Verificar stock disponible
        // ================================================
        for (const item of validatedItems) {
            try {
                const stockCheck = await checkStock(item.productId, item.quantity);

                if (!stockCheck.available) {
                    return res.status(400).json({
                        success: false,
                        message: `Stock insuficiente para "${item.productName}". Disponible: ${stockCheck.currentStock}, Solicitado: ${item.quantity}`
                    });
                }

            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: error.message || `Error verificando stock de ${item.productName}`
                });
            }
        }

        // ================================================
        // PASO 4: Descontar stock (transacción crítica)
        // ================================================
        const discountedProducts = [];

        try {
            for (const item of validatedItems) {
                await discountStock(item.productId, item.quantity);
                discountedProducts.push(item.productId);
                console.log(`✅ Stock descontado: ${item.productName} x${item.quantity}`);
            }
        } catch (error) {
            // ⚠️ ROLLBACK: Si falla el descuento, deberíamos restaurar el stock
            // En producción, esto debería manejarse con transacciones distribuidas o eventos
            console.error('❌ Error descontando stock:', error.message);

            return res.status(500).json({
                success: false,
                message: 'Error al procesar el inventario. Por favor, intenta nuevamente.',
                error: error.message
            });
        }

        // ================================================
        // PASO 5: Crear orden en la base de datos
        // ================================================
        const newOrder = new Order({
            userId: userId,
            items: validatedItems,
            totalAmount: totalAmount,
            shippingAddress: shippingAddress,
            status: 'pendiente',
            // Información adicional del usuario para auditoría
            userEmail: req.user.email,
            userName: req.user.name
        });

        await newOrder.save();

        console.log(`✅ Orden ${newOrder._id} creada exitosamente`);

        return res.status(201).json({
            success: true,
            message: 'Orden creada exitosamente',
            data: newOrder
        });

    } catch (error) {
        console.error('Error al crear orden:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al crear orden',
            error: error.message
        });
    }
};

/**
 * Actualizar estado de orden
 * Solo admin puede actualizar estados
 */
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const order = await Order.findById(id);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }

        // Validar transiciones de estado
        if (order.status === 'cancelada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede actualizar una orden cancelada'
            });
        }

        if (order.status === 'entregada' && status !== 'entregada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cambiar el estado de una orden ya entregada'
            });
        }

        // Actualizar estado
        order.status = status;
        await order.save();

        console.log(`✅ Orden ${id} actualizada a estado: ${status}`);

        return res.status(200).json({
            success: true,
            message: 'Estado de orden actualizado exitosamente',
            data: order
        });

    } catch (error) {
        console.error('Error al actualizar orden:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar orden',
            error: error.message
        });
    }
};

/**
 * Cancelar orden y restaurar stock
 */
export const cancelOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Buscar la orden
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        
        // Verificar que la orden no esté ya cancelada o entregada
        if (order.status === 'cancelada') {
            return res.status(400).json({
                success: false,
                message: 'La orden ya está cancelada'
            });
        }
        
        if (order.status === 'entregada') {
            return res.status(400).json({
                success: false,
                message: 'No se puede cancelar una orden ya entregada'
            });
        }
        
        // Verificar permisos: solo el dueño o admin puede cancelar
        if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para cancelar esta orden'
            });
        }
        
        // ✅ RESTAURAR STOCK DE CADA PRODUCTO
        const stockErrors = [];
        
        for (const item of order.items) {
            try {
                await restoreStock(item.productId, item.quantity);
                console.log(`✅ Stock restaurado: ${item.quantity} unidades de ${item.productName || item.productId}`);
            } catch (stockError) {
                console.error(`❌ Error restaurando stock de ${item.productId}:`, stockError.message);
                stockErrors.push({
                    productId: item.productId,
                    productName: item.productName,
                    quantity: item.quantity,
                    error: stockError.message
                });
            }
        }
        
        // Actualizar estado de la orden
        order.status = 'cancelada';
        order.cancelledAt = new Date();
        order.cancelledBy = req.user.id;
        await order.save();
        
        // Respuesta con información de restauración de stock
        const response = {
            success: true,
            message: 'Orden cancelada exitosamente',
            data: order
        };
        
        if (stockErrors.length > 0) {
            response.stockWarnings = stockErrors;
            response.message = 'Orden cancelada, pero hubo errores al restaurar algunos stocks';
        } else {
            response.stockRestored = true;
            response.message = 'Orden cancelada y stock restaurado exitosamente';
        }
        
        res.json(response);
        
    } catch (error) {
        console.error('Error al cancelar orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cancelar la orden',
            error: error.message
        });
    }
};

/**
 * Obtener órdenes del usuario autenticado
 */
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status } = req.query;

        let filter = { userId };

        if (status) {
            filter.status = status;
        }

        const orders = await Order.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });

    } catch (error) {
        console.error('Error al obtener órdenes del usuario:', error);
        return res.status(500).json({
            success: false,
            message: 'Error al obtener tus órdenes',
            error: error.message
        });
    }
};

/**
 * Eliminar orden cancelada permanentemente
 */
export const deleteOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Buscar la orden
        const order = await Order.findById(orderId);
        
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Orden no encontrada'
            });
        }
        
        // Solo permitir eliminar órdenes canceladas
        if (order.status !== 'cancelada') {
            return res.status(400).json({
                success: false,
                message: 'Solo se pueden eliminar órdenes canceladas'
            });
        }
        
        // Verificar permisos: solo el dueño o admin puede eliminar
        if (order.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'No tienes permiso para eliminar esta orden'
            });
        }
        
        // Eliminar permanentemente
        await Order.findByIdAndDelete(orderId);
        
        res.json({
            success: true,
            message: 'Orden eliminada permanentemente'
        });
        
    } catch (error) {
        console.error('Error al eliminar orden:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la orden',
            error: error.message
        });
    }
};