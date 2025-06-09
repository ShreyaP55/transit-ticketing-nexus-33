
import { useState, useEffect } from 'react';

export interface BusLocation {
  latitude: number;
  longitude: number;
  lat: number;  // Add lat property for compatibility
  lng: number;  // Add lng property for compatibility
  speed?: number;  // Add speed property
  heading?: number;  // Add heading property
  updatedAt: string;
}

export interface BusLocations {
  [busId: string]: BusLocation;
}

export const useTrackBuses = (busIds: string[]): BusLocations => {
  const [busLocations, setBusLocations] = useState<BusLocations>({});

  useEffect(() => {
    if (busIds.length === 0) return;

    // Simulate real-time bus tracking
    const interval = setInterval(() => {
      const newLocations: BusLocations = {};
      
      busIds.forEach(busId => {
        // Generate random coordinates around Goa area
        const baseLat = 15.4909;
        const baseLng = 73.8278;
        const randomLat = baseLat + (Math.random() - 0.5) * 0.1;
        const randomLng = baseLng + (Math.random() - 0.5) * 0.1;
        
        newLocations[busId] = {
          latitude: randomLat,
          longitude: randomLng,
          lat: randomLat,  // For compatibility
          lng: randomLng,  // For compatibility
          speed: Math.random() * 60 + 10,  // Random speed between 10-70 km/h
          heading: Math.random() * 360,  // Random heading 0-360 degrees
          updatedAt: new Date().toISOString()
        };
      });
      
      setBusLocations(newLocations);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [busIds]);

  return busLocations;
};
