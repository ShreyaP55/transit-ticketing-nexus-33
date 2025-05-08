
import mongoose, { Schema, model, models } from "mongoose";

const TicketSchema = new Schema(
  {
    userId: { type: String, required: true },
    routeId: { type: Schema.Types.ObjectId, ref: "Route", required: true },
    busId: { type: Schema.Types.ObjectId, ref: "Bus", required: true },
    startStation: { type: String, required: true },
    endStation: { type: String, required: true },
    price: { type: Number, required: true },
    paymentIntentId: { type: String, required: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

const Ticket = models.Ticket || model("Ticket", TicketSchema);
export default Ticket;
