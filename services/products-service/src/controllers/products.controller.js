import axios from "axios";
import { INVENTORY_SERVICE_URL } from '../config/env.js';
import Product from '../models/products.model.js';

// Obtener todos los productos
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener los productos',
      error: error.message,
    });
  }
};

// Obtener producto por ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al obtener el producto',
      error: error.message,
    });
  }
};

// Crear nuevo producto
// Crear nuevo producto
export const createProduct = async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El nombre y el precio son obligatorios',
      });
    }

    if (req.body.sku) {
      const existingSku = await Product.findOne({ sku: req.body.sku });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'El SKU ya está en uso',
        });
      }
    }

    const newProduct = new Product(req.body);
    const savedProduct = await newProduct.save();

    return res.status(201).json({
          success: true,
          message: 'Producto creado exitosamente',
          data: savedProduct
        });
    
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El SKU ya está en uso',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Error al crear el producto',
      error: error.message,
    });
  }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Si se intenta actualizar el SKU, verificar que no exista
    if (req.body.sku) {
      const existingSku = await Product.findOne({ 
        sku: req.body.sku,
        _id: { $ne: id }
      });
      if (existingSku) {
        return res.status(400).json({
          success: false,
          message: 'El SKU ya está en uso por otro producto',
        });
      }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: updatedProduct,
    });
  } catch (error) {
    // Error de duplicado de SKU
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'El SKU ya está en uso',
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Error al actualizar el producto',
      error: error.message,
    });
  }
};

// Eliminar producto (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Producto eliminado exitosamente',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar el producto',
      error: error.message,
    });
  }
};

// Sincronizar inventario para producto existente
export const syncInventory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar que el producto existe
    const product = await Product.findById(id);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
      });
    }

    // Verificar si ya tiene inventario
    try {
      const checkResponse = await axios.get(
        `${INVENTORY_SERVICE_URL}/inventory/${id}`,
        { timeout: 5000 }
      );
      
      if (checkResponse.data.success) {
        return res.status(200).json({
          success: true,
          message: 'El inventario ya existe para este producto',
          data: checkResponse.data.data
        });
      }
    } catch (error) {
      // Si es 404, continuar para crear el inventario
      if (error.response?.status !== 404) {
        throw error;
      }
    }

    // Crear inventario
    await axios.post(
      `${INVENTORY_SERVICE_URL}/inventory`,
      {
        productId: product._id.toString(),
        productName: product.name,
        quantity: 0,
        minStock: 10,
      },
      { timeout: 5000 }
    );

    return res.status(200).json({
      success: true,
      message: 'Inventario sincronizado exitosamente',
      data: { productId: product._id, productName: product.name }
    });

  } catch (error) {
    console.error('Error al sincronizar inventario:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Error al sincronizar inventario',
      error: error.response?.data?.message || error.message,
    });
  }
};