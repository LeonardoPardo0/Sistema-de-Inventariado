import { Router } from "express";
import {
  getAllWarehouses,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse
} from "../controllers/warehouse.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Warehouses
 *   description: Gestión de almacenes
 */

/**
 * @swagger
 * /warehouses:
 *   get:
 *     summary: Obtener todos los almacenes
 *     tags: [Warehouses]
 *     responses:
 *       200:
 *         description: Lista de almacenes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Warehouse'
 */
router.get("/", getAllWarehouses);

/**
 * @swagger
 * /warehouses:
 *   post:
 *     summary: Crear un almacén
 *     tags: [Warehouses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Warehouse'
 *     responses:
 *       200:
 *         description: Almacén creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Warehouse'
 */
router.post("/", createWarehouse);

/**
 * @swagger
 * /warehouses/{warehouseId}:
 *   put:
 *     summary: Actualizar un almacén
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del almacén
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Warehouse'
 *     responses:
 *       200:
 *         description: Almacén actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Warehouse'
 */
router.put("/:warehouseId", updateWarehouse);

/**
 * @swagger
 * /warehouses/{warehouseId}:
 *   delete:
 *     summary: Eliminar un almacén
 *     tags: [Warehouses]
 *     parameters:
 *       - in: path
 *         name: warehouseId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID del almacén
 *     responses:
 *       200:
 *         description: Almacén eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete("/:warehouseId", deleteWarehouse);

export default router;