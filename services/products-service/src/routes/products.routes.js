import express from 'express';
import { validateToken } from '../middleware/auth.middleware.js';
import { validateSchema, createProductSchema, updateProductSchema } from '../middleware/validate.middleware.js';
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  syncInventory
} from '../controllers/products.controller.js';

const router = express.Router();

// 🔹 Rutas públicas
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// 🔒 Rutas protegidas
router.post('/', validateToken, validateSchema(createProductSchema), createProduct);
router.put('/:id', validateToken, validateSchema(updateProductSchema), updateProduct);
router.delete('/:id', validateToken, deleteProduct);

router.post('/:id/sync-inventory', validateToken, syncInventory);

export default router;
