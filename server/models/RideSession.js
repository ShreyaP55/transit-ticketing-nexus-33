
import mongoose from 'mongoose';

const RideSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route', required: true },
  startCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  endCoords: {
    lat: { type: Number },
    lng: { type: Number },
  },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  fare: { type: Number, default: 0 },
  totalDistance: { type: Number, default: 0 }, // Added totalDistance field
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
});

export default mongoose.models.RideSession || mongoose.model('RideSession', RideSessionSchema);
