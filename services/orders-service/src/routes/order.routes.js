import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { validateSchema, createOrderSchema, updateOrderStatusSchema } from '../middleware/validate.middleware.js';
import {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getMyOrders,
  deleteOrder
} from '../controllers/order.controller.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gestión de órdenes de compra
 */

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Obtener todas las órdenes
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pendiente, pagada, enviada, entregada, cancelada]
 *         description: Filtrar por estado de orden
 *     responses:
 *       200:
 *         description: Lista de órdenes obtenida exitosamente
 *       401:
 *         description: No autenticado
 *       500:
 *         description: Error del servidor
 */
router.get('/', requireAuth, getAllOrders);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Obtener mis órdenes (usuario autenticado)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Órdenes del usuario obtenidas exitosamente
 */
router.get('/my-orders', requireAuth, getMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Obtener orden por ID
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden encontrada
 *       403:
 *         description: Sin permisos para ver esta orden
 *       404:
 *         description: Orden no encontrada
 */
router.get('/:id', requireAuth, getOrderById);

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Crear nueva orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - shippingAddress
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *               shippingAddress:
 *                 type: string
 *           example:
 *             items:
 *               - productId: "507f1f77bcf86cd799439011"
 *                 quantity: 2
 *               - productId: "507f1f77bcf86cd799439012"
 *                 quantity: 1
 *             shippingAddress: "Av. Siempre Viva 742, Springfield"
 *     responses:
 *       201:
 *         description: Orden creada exitosamente
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *       401:
 *         description: No autenticado
 */
router.post('/', requireAuth, validateSchema(createOrderSchema), createOrder);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Actualizar estado de orden (solo admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pendiente, pagada, enviada, entregada, cancelada]
 *           example:
 *             status: "pagada"
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *       400:
 *         description: Transición de estado inválida
 *       403:
 *         description: Requiere permisos de administrador
 *       404:
 *         description: Orden no encontrada
 */
router.put('/:id/status', requireAuth, requireAdmin, validateSchema(updateOrderStatusSchema), updateOrderStatus);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancelar orden
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la orden
 *     responses:
 *       200:
 *         description: Orden cancelada exitosamente
 *       400:
 *         description: La orden no puede ser cancelada
 *       403:
 *         description: Sin permisos para cancelar esta orden
 *       404:
 *         description: Orden no encontrada
 */
router.put('/:id/cancel', requireAuth, cancelOrder);

router.delete('/:orderId', requireAuth, deleteOrder);
export default router;