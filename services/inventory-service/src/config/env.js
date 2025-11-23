// config/env.js
import dotenv from 'dotenv';

dotenv.config();

export const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3002';
export const PORT = process.env.INVENTORY_PORT || 3002;
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin123@mongodb:27017/inventorydb';
export const PRODUCTS_SERVICE_URL = process.env.PRODUCTS_SERVICE_URL || 'http://products-service:3001';
export const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://auth-service:3000';