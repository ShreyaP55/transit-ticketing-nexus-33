
import mongoose from "mongoose";

const BusLocationSchema = new mongoose.Schema({
  busId: { type: String, required: true, index: true },
  busName: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  speed: { type: Number, default: 0 }, // km/h
  heading: { type: Number, default: 0 }, // degrees
  accuracy: { type: Number }, // GPS accuracy in meters
  isActive: { type: Boolean, default: true },
  driverId: { type: String }, // Admin/driver who is updating location
  activeRides: [{ type: String }], // Array of active ride IDs on this bus
  lastUpdated: { type: Date, default: Date.now }
}, { 
  timestamps: true,
  toJSON: { virtuals: true }
});

// Index for geospatial queries
BusLocationSchema.index({ "location": "2dsphere" });

// TTL index to auto-delete old location data after 24 hours
BusLocationSchema.index({ "lastUpdated": 1 }, { expireAfterSeconds: 86400 });

// Update location method
BusLocationSchema.methods.updateLocation = function(lat, lng, speed = 0, heading = 0, accuracy = null) {
  this.location.latitude = lat;
  this.location.longitude = lng;
  this.speed = speed;
  this.heading = heading;
  this.accuracy = accuracy;
  this.lastUpdated = new Date();
  this.isActive = true;
  
  return this.save();
};

// Get buses within radius
BusLocationSchema.statics.findNearby = function(lat, lng, radiusKm = 5) {
  return this.find({
    location: {
      $near: {
        $geometry: { type: "Point", coordinates: [lng, lat] },
        $maxDistance: radiusKm * 1000 // Convert km to meters
      }
    },
    isActive: true,
    lastUpdated: { $gte: new Date(Date.now() - 300000) } // Last 5 minutes
  });
};

const BusLocation = mongoose.models.BusLocation || mongoose.model("BusLocation", BusLocationSchema);

export default BusLocation;
