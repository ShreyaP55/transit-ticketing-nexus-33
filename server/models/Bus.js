
import mongoose from "mongoose";

const BusSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Bus name is required'], 
    unique: true, 
    trim: true 
  },
  route: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: [true, 'Route is required'],
  },
  capacity: { 
    type: Number, 
    required: [true, 'Capacity is required'], 
    min: [1, 'Capacity must be at least 1'] 
  },
}, {
  timestamps: true
});

// Add indexes for better performance
BusSchema.index({ route: 1 });
BusSchema.index({ name: 1 });

// Clear any existing model to avoid recompilation errors
if (mongoose.models.Bus) {
  delete mongoose.models.Bus;
}

const Bus = mongoose.model("Bus", BusSchema);

export default Bus;
