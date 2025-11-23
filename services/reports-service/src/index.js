/**
 * Reports Service
 * Generación de reportes (ventas, inventario, usuarios)
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import reportsRoutes from "./routes/reports.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/reports", reportsRoutes);

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`📈 Reports Service corriendo en el puerto ${PORT}`);
});
