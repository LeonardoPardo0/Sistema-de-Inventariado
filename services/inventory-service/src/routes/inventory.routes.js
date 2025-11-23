import express from "express";
import {
  getAllInventories,
  getInventoryByProduct,
  createInventory,
  updateStock,
  checkStock,
  getLowStock,
  deleteInventory,
  discountStockEndpoint
} from "../controllers/inventory.controller.js";

const router = express.Router();

/**
 * @swagger
 * /inventory:
 *   get: 
 *     summary: Obtener todos los inventarios
 *     tags: [Inventory]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filtrar por estado (1=Disponible, 2=Bajo stock, 3=Agotado, 4=Descontinuado)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filtrar por ubicación
 *     responses:
 *       200:
 *         description: Lista de inventarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inventory'
 *       550:
 *         description: error al obtener inventarios
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getAllInventories);

/**
 * @swagger
 * /inventory/low-stock:
 *   get:
 *     summary: Obtener productos con stock bajo
 *     tags: [Stock]
 *     description: Retorna productos cuya cantidad es menor al stock mínimo configurado
 *     responses:
 *       200:
 *         description: Lista de productos con stock bajo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inventory'
 */
router.get("/low-stock", getLowStock);

/**
 * @swagger
 * /inventory/{productId}/check:
 *   get:
 *     summary: Verificar disponibilidad de stock
 *     tags: [Stock]
 *     description: Verifica si hay stock suficiente para una cantidad solicitada
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *       - in: query
 *         name: quantity
 *         required: true
 *         schema:
 *           type: number
 *         description: Cantidad a verificar
 *         example: 5
 *     responses:
 *       200:
 *         description: Verificación realizada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 available:
 *                   type: boolean
 *                 currentStock:
 *                   type: number
 *                 requestedQuantity:
 *                   type: number
 *                 status:
 *                   type: string
 *       404:
 *         description: Producto no encontrado
 */
router.get("/:productId/check", checkStock);

/**
 * @swagger
 * /inventory/{productId}:
 *   get:
 *     summary: Obtener inventario por ID de producto
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Inventario encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Inventory'
 *       404:
 *         description: Inventario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:productId", getInventoryByProduct);

/**
 * @swagger
 * /inventory:
 *   post:
 *     summary: Crear nuevo inventario
 *     tags: [Inventory]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Inventory'
 *     responses:
 *       201:
 *         description: Inventario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Datos inválidos o producto ya existe
 *       500:
 *         description: Error del servidor
 */
router.post("/", createInventory);

/**
 * @swagger
 * /inventory/{productId}:
 *   put:
 *     summary: Actualizar stock (agregar o restar)
 *     tags: [Stock]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StockUpdate'
 *           examples:
 *             agregar:
 *               summary: Agregar stock
 *               value:
 *                 quantity: 20
 *                 operation: "1"
 *             restar:
 *               summary: Restar stock
 *               value:
 *                 quantity: 5
 *                 operation: "2"
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Datos inválidos o stock insuficiente
 *       404:
 *         description: Inventario no encontrado
 */
router.put("/:productId", updateStock);

/**
 * @swagger
 * /inventory/{productId}:
 *   delete:
 *     summary: Eliminar inventario
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Inventario eliminado exitosamente
 *       404:
 *         description: Inventario no encontrado
 */
router.delete("/:productId", deleteInventory);

/**
 * @swagger
 * /inventory/{productId}/discount:
 *   post:
 *     summary: Descontar stock de un producto (Pardo lo conectas con OrderService, probablemente necesites otra logica xd)
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: Cantidad a descontar
 *     responses:
 *       200:
 *         description: Resultado de la operación
 */
router.post("/:productId/discount", discountStockEndpoint);

export default router;