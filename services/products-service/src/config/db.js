// config/db.js
import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'productsdb' });
    console.log('✅ Conexión exitosa a MongoDB - Products Service');
  } catch (error) {
    console.error('❌ Error conectando a MongoDB:', error.message);
    setTimeout(connectDB, 5000); // Reintenta conexión
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB desconectado. Reintentando conexión...');
  setTimeout(connectDB, 5000);
});

export default connectDB;
