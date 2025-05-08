
import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, enum: ["pass", "ticket"], required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: "Route", default: null },
  start: { type: String, default: null },
  end: { type: String, default: null },
  fare: { type: Number, required: true },
  stripeSessionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ["pending", "completed"], default: "pending" },
});

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
