// config/env.js
import dotenv from 'dotenv';

dotenv.config();

export const PORT = process.env.PRODUCTS_PORT || 3001;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@mongodb:27017/productsdb';
export const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';
export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002';