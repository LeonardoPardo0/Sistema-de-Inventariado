/**
 * Inventory Service
 * Control de inventario y stock
 */

import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import connectDB from "./config/db.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import warehouseRoutes from "./routes/warehouse.routes.js";
import swaggerSpec from "./config/swagger.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
connectDB();

// Rutas
app.use("/inventory", inventoryRoutes);
app.use("/warehouses", warehouseRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Inventory Service API Docs"
}));

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpec);
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "Inventory Service",
    status: "running",
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Corriendo en http://localhost:${PORT}`);
  console.log(`Swagger en http://localhost:${PORT}/api-docs`);
});
