/**
 * Billing Service
 * Facturación y procesamiento de pagos
 */

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import billingRoutes from "./routes/billing.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

connectDB();

app.use("/billing", billingRoutes);

const PORT = process.env.PORT || 3004;

app.listen(PORT, () => {
  console.log(`💳 Billing Service corriendo en el puerto ${PORT}`);
});
