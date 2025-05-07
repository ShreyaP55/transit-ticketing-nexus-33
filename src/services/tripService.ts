
import { ITrip } from "@/types";

// In-memory store for trips (would be a database in production)
const tripStore: { [tripId: string]: ITrip } = {};

// Get active trip for a user
export const getActiveTrip = async (userId: string): Promise<ITrip | null> => {
  try {
    // Find any active trip for this user
    const activeTrip = Object.values(tripStore).find(
      trip => trip.userId === userId && trip.status === "started"
    );
    
    return activeTrip || null;
  } catch (error) {
    console.error("Error fetching active trip:", error);
    return null;
  }
};

// Get all trips for a user
export const getUserTrips = async (userId: string): Promise<ITrip[]> => {
  try {
    // Filter trips for this user
    return Object.values(tripStore)
      .filter(trip => trip.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching user trips:", error);
    return [];
  }
};

// Start a new trip
export const startTrip = async (userId: string, lat: number, lng: number): Promise<ITrip> => {
  try {
    // Check if user already has an active trip
    const existingTrip = await getActiveTrip(userId);
    if (existingTrip) {
      throw new Error("You already have an active trip");
    }
    
    // Create a new trip
    const tripId = `trip_${Date.now()}`;
    const newTrip: ITrip = {
      _id: tripId,
      userId,
      startLocation: {
        lat,
        lng,
        timestamp: new Date().toISOString()
      },
      status: "started",
      createdAt: new Date().toISOString()
    };
    
    // Save the trip
    tripStore[tripId] = newTrip;
    
    return newTrip;
  } catch (error) {
    console.error("Error starting trip:", error);
    throw error;
  }
};

// End a trip and calculate fare
export const endTrip = async (tripId: string, lat: number, lng: number): Promise<ITrip> => {
  try {
    // Get the trip
    const trip = tripStore[tripId];
    if (!trip) {
      throw new Error("Trip not found");
    }
    
    if (trip.status !== "started") {
      throw new Error("Trip is not active");
    }
    
    // Update trip with end location
    trip.endLocation = {
      lat,
      lng,
      timestamp: new Date().toISOString()
    };
    
    // Calculate distance (using Haversine formula)
    const distance = calculateDistance(
      trip.startLocation.lat, 
      trip.startLocation.lng, 
      lat, 
      lng
    );
    
    // Calculate fare (₹5 per km, minimum ₹10)
    const fare = Math.max(Math.round(distance * 5), 10);
    
    // Update trip with distance and fare
    trip.distance = parseFloat(distance.toFixed(2));
    trip.fare = fare;
    trip.status = "completed";
    
    // Save the updated trip
    tripStore[tripId] = trip;
    
    // In a real app, you would deduct the fare from the user's wallet here
    // For this demo, we'll just return the trip with calculated fare
    
    return trip;
  } catch (error) {
    console.error("Error ending trip:", error);
    throw error;
  }
};

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = degToRad(lat2 - lat1);
  const dLon = degToRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  
  return distance;
};

const degToRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
