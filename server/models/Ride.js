
import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const rideSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  routeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  busId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus' },
  startLocation: { type: locationSchema, required: true },
  endLocation: { type: locationSchema },
  startStation: { type: String },
  endStation: { type: String },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'cancelled'], 
    default: 'active' 
  },
  distance: { type: Number }, // in km
  realWorldDistance: { type: Boolean, default: false },
  calculationMethod: { type: String, enum: ['distancematrix_ai', 'haversine'], default: 'haversine' },
  duration: { type: Number }, // in minutes
  fare: { type: Number },
  originalFare: { type: Number },
  discountAmount: { type: Number },
  discountPercentage: { type: Number },
  concessionType: { type: String, default: 'general' },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['wallet', 'pass', 'cash'], 
    default: 'wallet' 
  }
}, { timestamps: true });

// Calculate distance using Haversine formula (fallback)
rideSchema.methods.calculateHaversineDistance = function() {
  if (!this.endLocation) return 0;
  
  const R = 6371; // Earth's radius in km
  const dLat = (this.endLocation.latitude - this.startLocation.latitude) * Math.PI / 180;
  const dLng = (this.endLocation.longitude - this.startLocation.longitude) * Math.PI / 180;
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(this.startLocation.latitude * Math.PI / 180) * 
    Math.cos(this.endLocation.latitude * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 100) / 100; // Round to 2 decimal places
};

// Enhanced fare calculation with concession support
rideSchema.methods.calculateFareWithConcession = function(userConcessionType = 'general') {
  if (!this.distance) return;
  
  this.concessionType = userConcessionType;
  
  // Base fare + per km charge
  const baseFare = 20;
  const perKmCharge = 8;
  const originalFare = baseFare + (this.distance * perKmCharge);
  
  // Concession discounts
  const discounts = {
    general: 0,
    student: 30,
    child: 50,
    women: 20,
    elderly: 40,
    disabled: 50
  };
  
  const discountPercentage = discounts[userConcessionType] || 0;
  const discountAmount = (originalFare * discountPercentage) / 100;
  const finalFare = originalFare - discountAmount;
  
  this.originalFare = Math.round(originalFare);
  this.discountAmount = Math.round(discountAmount);
  this.discountPercentage = discountPercentage;
  this.fare = Math.round(finalFare);
  
  return this.fare;
};

// Calculate duration in minutes
rideSchema.methods.calculateDuration = function() {
  if (!this.endLocation) return;
  const start = new Date(this.startLocation.timestamp);
  const end = new Date(this.endLocation.timestamp);
  this.duration = Math.round((end - start) / (1000 * 60)); // Convert to minutes
};

export default mongoose.models.Ride || mongoose.model('Ride', rideSchema);
