// config/db.js
import mongoose from "mongoose";
import { MONGO_URI } from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: 'inventorydb' // ← Agregar esta línea
    });

    console.log(`✅ MongoDB conectado - Inventory Service`);
  } catch (error) {
    console.error("❌ Error conectando a MongoDB:", error.message);
    process.exit(1);
  }
};

export default connectDB;