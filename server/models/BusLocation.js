
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  busId: { type: String, required: true, unique: true },
  coords: {
    lat: Number,
    lng: Number,
  },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.BusLocation || mongoose.model('BusLocation', locationSchema);
