// models/inventory.model.js
import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema(
  {
    productId: {
      type: String,  // Cambiar de Number a String para alinearse con Products Service
      required: [true, 'El ID del producto es obligatorio'],
      unique: true,
      index: true,
      trim: true
    },
    productName: {
      type: String,
      required: [true, 'El nombre del producto es obligatorio'],
      trim: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'La cantidad no puede ser negativa'],
      default: 0
    },
    minStock: {
      type: Number,
      min: 0,
      default: 10
    },
    location: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['Disponible', 'Bajo_Stock', 'Agotado'],
      default: 'Disponible'
    },
    lastRestockDate: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Método para actualizar el estado según la cantidad
inventorySchema.methods.updateStatus = function () {
  if (this.quantity === 0) {
    this.status = 'Agotado';
  } else if (this.quantity <= this.minStock) {
    this.status = 'Bajo_Stock';
  } else {
    this.status = 'Disponible';
  }
};

inventorySchema.pre("save", function (next) {
  this.updateStatus();
  next();
});

export default mongoose.model("Inventory", inventorySchema);