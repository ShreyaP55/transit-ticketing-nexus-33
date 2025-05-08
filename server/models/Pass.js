
import mongoose from "mongoose";

const PassSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk User ID
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
  fare: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true }, // Expires in 1 month
});

// Check if the model exists before creating a new one
const Pass = mongoose.models.Pass || mongoose.model("Pass", PassSchema);

export default Pass;
