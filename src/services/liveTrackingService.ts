
import { useState, useEffect, useCallback } from 'react';

// Types for bus location data
export type BusLocation = {
  lat: number;
  lng: number;
  updatedAt: Date;
  speed?: number;
  heading?: number;
};

export type BusLocations = {
  [busId: string]: BusLocation;
};

// In-memory store for bus locations (would be a database in production)
let busLocationsStore: BusLocations = {};

// Base URL for API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// API function to update a bus location (called by the bus device)
export const updateBusLocation = async (busId: string, lat: number, lng: number, speed?: number, heading?: number): Promise<boolean> => {
  try {
    // In a real app, this would be an actual API call
    busLocationsStore[busId] = {
      lat,
      lng,
      speed,
      heading,
      updatedAt: new Date()
    };
    
    console.log(`Bus ${busId} location updated:`, { lat, lng, speed, heading });
    
    // Simulate a server delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error("Error updating bus location:", error);
    return false;
  }
};

// API function to get the location of a specific bus
export const getBusLocation = async (busId: string): Promise<BusLocation | null> => {
  try {
    // In a real app, this would be an actual API call
    const location = busLocationsStore[busId];
    
    // Simulate a server delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return location || null;
  } catch (error) {
    console.error("Error fetching bus location:", error);
    return null;
  }
};

// API function to get locations of all buses
export const getAllBusLocations = async (): Promise<BusLocations> => {
  try {
    // In a real app, this would be an actual API call
    
    // Simulate a server delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {...busLocationsStore};
  } catch (error) {
    console.error("Error fetching all bus locations:", error);
    return {};
  }
};

// Hook to track multiple buses with real-time updates
export const useTrackBuses = (busIds: string[] = []): BusLocations => {
  const [busLocations, setBusLocations] = useState<BusLocations>({});
  const [isConnected, setIsConnected] = useState(true);
  
  const fetchBusLocations = useCallback(async () => {
    try {
      if (busIds.length === 0) {
        const locations = await getAllBusLocations();
        setBusLocations(locations);
        setIsConnected(true);
        return;
      }
      
      // For specific busIds, fetch only those
      const newLocations: BusLocations = {};
      for (const busId of busIds) {
        const location = await getBusLocation(busId);
        if (location) {
          newLocations[busId] = location;
        }
      }
      
      setBusLocations(newLocations);
      setIsConnected(true);
    } catch (error) {
      console.error("Error in fetchBusLocations:", error);
      setIsConnected(false);
    }
  }, [busIds.join(',')]);
  
  useEffect(() => {
    // Fetch immediately
    fetchBusLocations();
    
    // Set up polling interval (every 3 seconds)
    const intervalId = setInterval(fetchBusLocations, 3000);
    
    // Set up the simulated bus movements (for demo purposes)
    const simulationIds: number[] = [];
    
    busIds.forEach(busId => {
      // Initial position if not set
      if (!busLocationsStore[busId]) {
        busLocationsStore[busId] = {
          // Random starting position around Delhi
          lat: 28.7041 + (Math.random() - 0.5) * 0.05,
          lng: 77.1025 + (Math.random() - 0.5) * 0.05,
          speed: Math.floor(Math.random() * 80), // Random speed between 0-80 km/h
          heading: Math.floor(Math.random() * 360), // Random heading 0-359 degrees
          updatedAt: new Date()
        };
      }
      
      // Simulate movement with more realistic patterns
      const simId = window.setInterval(() => {
        const currentLocation = busLocationsStore[busId];
        if (currentLocation) {
          const heading = (currentLocation.heading || 0) + (Math.random() - 0.5) * 20; // Change direction slightly
          const speed = Math.max(0, Math.min(100, (currentLocation.speed || 30) + (Math.random() - 0.5) * 10)); // Adjust speed realistically
          
          // Convert heading to radians
          const headingRad = (heading * Math.PI) / 180;
          
          // Calculate movement based on heading and speed (simplified)
          // Speed is in km/h, convert to degrees per 5 seconds
          const speedFactor = speed * 0.00001; // Approximation of km/h to degrees
          
          updateBusLocation(
            busId,
            currentLocation.lat + Math.cos(headingRad) * speedFactor,
            currentLocation.lng + Math.sin(headingRad) * speedFactor,
            speed,
            heading
          );
        }
      }, 5000);
      
      simulationIds.push(simId);
    });
    
    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      simulationIds.forEach(id => clearInterval(id));
    };
  }, [busIds.join(','), fetchBusLocations]);
  
  return busLocations;
};

// Simulate a real API endpoint to update bus location (for mobile devices)
export const simulateMobileDeviceUpdate = async (
  busId: string, 
  lat: number, 
  lng: number, 
  speed?: number, 
  heading?: number
): Promise<Response> => {
  try {
    // Would be a real API call in production
    await updateBusLocation(busId, lat, lng, speed, heading);
    
    // Simulate a response from the server
    return new Response(
      JSON.stringify({ success: true }), 
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: 'Failed to update location' }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};

// Function to simulate a bus device sending location updates
export const startBusSimulation = (busId: string, initialLat: number, initialLng: number): () => void => {
  // Initial position
  let lat = initialLat;
  let lng = initialLng;
  let speed = Math.floor(Math.random() * 60) + 20; // 20-80 km/h
  let heading = Math.floor(Math.random() * 360); // 0-359 degrees
  
  // Update at regular intervals
  const intervalId = setInterval(() => {
    // Adjust heading slightly
    heading = (heading + (Math.random() - 0.5) * 20) % 360;
    if (heading < 0) heading += 360;
    
    // Adjust speed slightly
    speed = Math.max(0, Math.min(100, speed + (Math.random() - 0.5) * 10));
    
    // Convert heading to radians
    const headingRad = (heading * Math.PI) / 180;
    
    // Calculate movement based on heading and speed
    // Speed is in km/h, convert to degrees per 5 seconds
    const speedFactor = speed * 0.00001; // Approximation
    
    lat += Math.cos(headingRad) * speedFactor;
    lng += Math.sin(headingRad) * speedFactor;
    
    // Send update to "server"
    updateBusLocation(busId, lat, lng, speed, heading);
  }, 5000);
  
  // Return a function to stop the simulation
  return () => clearInterval(intervalId);
};
