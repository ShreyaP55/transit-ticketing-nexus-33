
import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  name: { type: String, required: true },
  route: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Route", // ✅ Reference the Route model
    required: true 
  }, 
  capacity: { type: Number, required: true },
});

// Check if the model exists before creating a new one
const Bus = mongoose.models.Bus || mongoose.model("Bus", BusSchema);

export default Bus;
