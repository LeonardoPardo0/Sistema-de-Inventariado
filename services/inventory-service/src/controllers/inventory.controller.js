// controllers/inventory.controller.js
import Inventory from "../models/inventory.model.js";
import { validateProduct } from "../utils/httpClient.js";

// Crear nuevo inventario (CON INTEGRACIÓN REAL)
export const createInventory = async (req, res) => {
  try {
    const { productId, quantity, minStock, location } = req.body;

    // ✅ VALIDAR QUE EL PRODUCTO EXISTE EN PRODUCTS SERVICE
    const productValidation = await validateProduct(productId);
    
    if (!productValidation.exists) {
      return res.status(400).json({
        success: false,
        message: "El producto no existe en el catálogo"
      });
    }

    // Obtener nombre del producto desde la validación
    const productName = productValidation.product?.name || `Producto ${productId}`;

    // Verificar si ya existe inventario para ese producto
    const existingInventory = await Inventory.findOne({ productId });
    if (existingInventory) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un inventario para este producto"
      });
    }

    const inventory = new Inventory({
      productId,
      productName,
      quantity: quantity || 0,
      minStock: minStock || 10,
      location
    });

    await inventory.save();

    res.status(201).json({
      success: true,
      message: "Inventario creado exitosamente",
      data: inventory
    });
  } catch (error) {
    console.error("Error al crear inventario:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear inventario",
      error: error.message
    });
  }
};

// En getInventoryByProduct, también actualizar para usar String
export const getInventoryByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventario no encontrado para este producto"
      });
    }

    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener inventario",
      error: error.message
    });
  }
};

// Actualizar updateStock para usar String en productId
export const updateStock = async (req, res) => {
  try {
    const { productId } = req.params; // Ya es String
    const { quantity, operation } = req.body;

    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      return res.status(404).json({ 
        success: false, 
        message: "Producto no encontrado en inventario" 
      });
    }

    if (operation === 1) { // add
      inventory.quantity += quantity;
    } else if (operation === 2) { // subtract
      if (inventory.quantity < quantity) {
        return res.status(400).json({ 
          success: false, 
          message: "Stock insuficiente" 
        });
      }
      inventory.quantity -= quantity;
    } else {
      return res.status(400).json({ 
        success: false, 
        message: "Operación no válida" 
      });
    }

    inventory.updateStatus();
    await inventory.save();

    res.json({ 
      success: true, 
      message: "Stock actualizado", 
      data: inventory 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Error al actualizar stock",
      error: error.message
    });
  }
};

export const checkStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.query;

    const inventory = await Inventory.findOne({ productId });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        available: false,
        message: "Producto no encontrado en inventario"
      });
    }

    const requestedQty = parseInt(quantity) || 1;
    const isAvailable = inventory.quantity >= requestedQty;

    res.json({
      success: true,
      available: isAvailable,
      currentStock: inventory.quantity,
      requestedQuantity: requestedQty,
      status: inventory.status
    });
  } catch (error) {
    console.error("Error al verificar stock:", error);
    res.status(500).json({
      success: false,
      message: "Error al verificar stock",
      error: error.message
    });
  }
};
// controllers/inventory.controller.js - FUNCIONES FALTANTES

// Obtener todos los inventarios
export const getAllInventories = async (req, res) => {
  try {
    const { status, location } = req.query;
    
    let filter = {};
    
    // Filtrar por estado si se proporciona
    if (status) {
      const statusMap = {
        '1': 'Disponible',
        '2': 'Bajo_Stock', 
        '3': 'Agotado',
        '4': 'Descontinuado'
      };
      filter.status = statusMap[status] || status;
    }
    
    // Filtrar por ubicación si se proporciona
    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }
    
    const inventories = await Inventory.find(filter);
    
    res.json({
      success: true,
      count: inventories.length,
      data: inventories
    });
  } catch (error) {
    console.error("Error al obtener inventarios:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener inventarios",
      error: error.message
    });
  }
};

// Obtener productos con stock bajo
export const getLowStock = async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({
      $expr: { $lte: ['$quantity', '$minStock'] },
      status: { $ne: 'Agotado' }
    });
    
    res.json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    console.error("Error al obtener stock bajo:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener productos con stock bajo",
      error: error.message
    });
  }
};

// Eliminar inventario
export const deleteInventory = async (req, res) => {
  try {
    const { productId } = req.params;
    
    const inventory = await Inventory.findOneAndDelete({ productId });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventario no encontrado"
      });
    }
    
    res.json({
      success: true,
      message: "Inventario eliminado exitosamente",
      data: inventory
    });
  } catch (error) {
    console.error("Error al eliminar inventario:", error);
    res.status(500).json({
      success: false,
      message: "Error al eliminar inventario",
      error: error.message
    });
  }
};

// Descontar stock (para integración con OrderService)
export const discountStockEndpoint = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: "La cantidad a descontar debe ser mayor a 0"
      });
    }
    
    const inventory = await Inventory.findOne({ productId });
    
    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado en inventario"
      });
    }
    
    // Verificar stock suficiente
    if (inventory.quantity < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stock insuficiente. Disponible: ${inventory.quantity}, Solicitado: ${quantity}`,
        availableStock: inventory.quantity,
        requestedQuantity: quantity
      });
    }
    
    // Descontar stock
    inventory.quantity -= quantity;
    inventory.updateStatus();
    await inventory.save();
    
    res.json({
      success: true,
      message: `Stock descontado exitosamente. Nuevo stock: ${inventory.quantity}`,
      data: {
        productId: inventory.productId,
        productName: inventory.productName,
        previousStock: inventory.quantity + quantity,
        newStock: inventory.quantity,
        status: inventory.status
      }
    });
    
  } catch (error) {
    console.error("Error al descontar stock:", error);
    res.status(500).json({
      success: false,
      message: "Error al descontar stock",
      error: error.message
    });
  }
};