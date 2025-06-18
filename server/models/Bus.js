
import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: true,
  },
  capacity: { type: Number, required: true, min: 1 },
});

// Ensure we don't try to recompile the model if it already exists
const Bus = mongoose.models.Bus || mongoose.model("Bus", BusSchema);

export default Bus;
