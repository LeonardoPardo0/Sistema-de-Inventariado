import mongoose from "mongoose";
import AutoIncrementFactory from "mongoose-sequence";

const warehouseSchema = new mongoose.Schema({
  warehouseCode: {  // Mantener como String para código personalizado
      type: String,
      required: true,
      unique: true
  },
  sequenceId: {     // Nuevo campo para auto-incremento numérico
      type: Number
  },
  name: {
    type: String,
    required: true
  },
  address: String
}, { timestamps: true });

const AutoIncrement = AutoIncrementFactory(mongoose);
warehouseSchema.plugin(AutoIncrement, { 
  inc_field: "sequenceId",  // Usar el nuevo campo numérico
  id: "warehouse_seq"
});

export default mongoose.model("Warehouse", warehouseSchema);