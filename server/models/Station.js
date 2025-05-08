
import mongoose from "mongoose";

const StationSchema = new mongoose.Schema({
  routeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Route",
    required: true 
  },
  busId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Bus",
    required: true 
  },
  name: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  fare: { type: Number, required: true },
  location: { type: String }
});

export default mongoose.models.Station || mongoose.model("Station", StationSchema);
