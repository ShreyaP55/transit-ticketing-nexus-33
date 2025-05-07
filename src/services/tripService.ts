
import { ITrip } from "@/types";
import { deductFunds } from "./walletService";

// In-memory trip store (would be a database in production)
let tripStore: { [tripId: string]: ITrip } = {};

// Base fare in rupees
const BASE_FARE = 20;

// Rate per kilometer in rupees
const RATE_PER_KM = 5;

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

// Calculate fare based on distance
const calculateFare = (distance: number): number => {
  return Math.ceil(BASE_FARE + (distance * RATE_PER_KM));
};

// Start a trip
export const startTrip = async (userId: string, lat: number, lng: number): Promise<ITrip> => {
  try {
    const tripId = `trip_${userId}_${Date.now()}`;
    
    const trip: ITrip = {
      _id: tripId,
      userId,
      startLocation: {
        lat,
        lng,
        timestamp: new Date().toISOString()
      },
      status: 'started',
      createdAt: new Date().toISOString()
    };
    
    // Save trip
    tripStore[tripId] = trip;
    
    console.log(`Trip started for user ${userId} at location (${lat}, ${lng})`);
    
    return trip;
  } catch (error) {
    console.error("Error starting trip:", error);
    throw new Error("Failed to start trip");
  }
};

// End a trip and calculate fare
export const endTrip = async (tripId: string, lat: number, lng: number): Promise<ITrip> => {
  try {
    // Get existing trip
    const trip = tripStore[tripId];
    if (!trip) {
      throw new Error("Trip not found");
    }
    
    if (trip.status !== 'started') {
      throw new Error("Trip already completed or cancelled");
    }
    
    // Update trip with end location
    trip.endLocation = {
      lat,
      lng,
      timestamp: new Date().toISOString()
    };
    
    // Calculate distance and fare
    const distance = calculateDistance(
      trip.startLocation.lat,
      trip.startLocation.lng,
      lat,
      lng
    );
    
    const fare = calculateFare(distance);
    
    // Update trip with distance and fare
    trip.distance = parseFloat(distance.toFixed(2));
    trip.fare = fare;
    trip.status = 'completed';
    
    // Save updated trip
    tripStore[tripId] = trip;
    
    console.log(`Trip ended for user ${trip.userId} with distance ${distance.toFixed(2)}km and fare ₹${fare}`);
    
    // Deduct fare from user's wallet
    await deductFunds(trip.userId, fare);
    
    return trip;
  } catch (error) {
    console.error("Error ending trip:", error);
    throw error;
  }
};

// Get recent trips for a user
export const getUserTrips = async (userId: string, limit = 5): Promise<ITrip[]> => {
  try {
    // In a real app, this would be a database query
    return Object.values(tripStore)
      .filter(trip => trip.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  } catch (error) {
    console.error("Error fetching user trips:", error);
    return [];
  }
};

// Get a specific trip
export const getTrip = async (tripId: string): Promise<ITrip | null> => {
  try {
    return tripStore[tripId] || null;
  } catch (error) {
    console.error("Error fetching trip:", error);
    return null;
  }
};

// Get user's active trip
export const getActiveTrip = async (userId: string): Promise<ITrip | null> => {
  try {
    return Object.values(tripStore)
      .find(trip => trip.userId === userId && trip.status === 'started') || null;
  } catch (error) {
    console.error("Error fetching active trip:", error);
    return null;
  }
};
