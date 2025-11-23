import mongoose from 'mongoose';
import { MONGO_URI } from './env.js';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
        console.log(`📂 Base de datos: ${conn.connection.name}`);
    } catch (error) {
        console.error('❌ Error conectando a MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;