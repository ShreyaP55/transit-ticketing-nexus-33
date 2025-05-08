
import mongoose, { Schema, model, models } from "mongoose";

const PassSchema = new Schema({
  userId: { type: String, required: true }, // Clerk User ID
  routeId: { type: Schema.Types.ObjectId, ref: "Route", required: true },
  fare: { type: Number, required: true },
  purchaseDate: { type: Date, default: Date.now },
  expiryDate: { type: Date, required: true }, // Expires in 1 month
});

// 🛡️ Fix for hot-reloading issues (important in Next.js)
const Pass = models.Pass || model("Pass", PassSchema);

export default Pass;
