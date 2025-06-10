
import mongoose from "mongoose";

const LocationPointSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  accuracy: { type: Number }, // GPS accuracy in meters
  speed: { type: Number }, // Speed in km/h
  heading: { type: Number } // Direction in degrees
});

const RideSessionSchema = new mongoose.Schema({
  rideId: { type: String, required: true, unique: true },
  clerkId: { type: String, required: true }, // User's Clerk ID
  userName: { type: String, required: true },
  busId: { type: String, required: true },
  busName: { type: String, required: true },
  rideToken: { type: String, required: true, unique: true }, // Secure token for this ride
  
  // Ride lifecycle
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  },
  
  // Location data
  startLocation: { type: LocationPointSchema, required: true },
  endLocation: { type: LocationPointSchema },
  userPath: [LocationPointSchema], // User's GPS path during ride
  busPath: [LocationPointSchema], // Bus GPS path during ride
  
  // Fare calculation
  totalDistance: { type: Number }, // in kilometers
  fareRate: { type: Number, default: 8 }, // per km rate
  baseFare: { type: Number, default: 20 }, // minimum fare
  totalFare: { type: Number },
  
  // Timestamps
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  duration: { type: Number }, // in minutes
  
  // Payment
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'pending' 
  },
  walletTransactionId: { type: String }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Calculate total distance using GPS path
RideSessionSchema.methods.calculateDistance = function() {
  if (!this.busPath || this.busPath.length < 2) {
    return 0;
  }
  
  const toRadians = (degree) => degree * (Math.PI / 180);
  const R = 6371; // Earth's radius in kilometers
  let totalDistance = 0;
  
  for (let i = 1; i < this.busPath.length; i++) {
    const lat1 = this.busPath[i-1].latitude;
    const lon1 = this.busPath[i-1].longitude;
    const lat2 = this.busPath[i].latitude;
    const lon2 = this.busPath[i].longitude;
    
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    totalDistance += R * c;
  }
  
  this.totalDistance = parseFloat(totalDistance.toFixed(2));
  return this.totalDistance;
};

// Calculate fare based on distance
RideSessionSchema.methods.calculateFare = function() {
  const distance = this.calculateDistance();
  this.totalFare = Math.max(this.baseFare, this.baseFare + (distance * this.fareRate));
  return Math.round(this.totalFare);
};

// Calculate ride duration
RideSessionSchema.methods.calculateDuration = function() {
  if (!this.startTime || !this.endTime) return 0;
  
  const durationMs = new Date(this.endTime) - new Date(this.startTime);
  this.duration = Math.round(durationMs / 60000); // Convert to minutes
  return this.duration;
};

// Generate secure ride token
RideSessionSchema.statics.generateRideToken = function() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  return `RT_${timestamp}_${randomString}`;
};

// Generate unique ride ID
RideSessionSchema.statics.generateRideId = function() {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `RIDE_${timestamp}_${randomString}`;
};

const RideSession = mongoose.models.RideSession || mongoose.model("RideSession", RideSessionSchema);

export default RideSession;
