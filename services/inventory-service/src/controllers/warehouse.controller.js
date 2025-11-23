import Warehouse from "../models/warehouse.model.js";

export const getAllWarehouses = async (req, res) => {
  try {
    const warehouses = await Warehouse.find();
    res.json({ success: true, data: warehouses });
  } catch (error) {
    console.error("Error al obtener almacenes:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al obtener almacenes",
      error: error.message 
    });
  }
};

export const createWarehouse = async (req, res) => {
  try {
    const { warehouseCode, name, address } = req.body;
    
    if (!warehouseCode || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "El código y nombre son obligatorios" 
      });
    }

    // Verificar si el código ya existe
    const existingWarehouse = await Warehouse.findOne({ warehouseCode });
    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un almacén con ese código"
      });
    }
    
    const warehouse = new Warehouse({ warehouseCode, name, address });
    await warehouse.save();
    
    res.status(201).json({
      success: true,
      message: "Almacén creado exitosamente",
      data: warehouse
    });
  } catch (error) {
    console.error("Error al crear almacén:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear almacén",
      error: error.message
    });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { name, address } = req.body;
    
    const warehouse = await Warehouse.findOneAndUpdate(
      { warehouseId },
      { name, address },
      { new: true }
    );
    
    if (!warehouse) {
      return res.status(404).json({ 
        success: false, 
        message: "Almacén no encontrado" 
      });
    }
    
    res.json({ success: true, data: warehouse });
  } catch (error) {
    console.error("Error al actualizar almacén:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al actualizar almacén",
      error: error.message 
    });
  }
};

export const deleteWarehouse = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const warehouse = await Warehouse.findOneAndDelete({ warehouseId });
    
    if (!warehouse) {
      return res.status(404).json({ 
        success: false, 
        message: "Almacén no encontrado" 
      });
    }
    
    res.json({ success: true, message: "Almacén eliminado exitosamente" });
  } catch (error) {
    console.error("Error al eliminar almacén:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error al eliminar almacén",
      error: error.message 
    });
  }
};