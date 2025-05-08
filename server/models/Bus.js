
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

export default mongoose.models.Bus || mongoose.model("Bus", BusSchema);
