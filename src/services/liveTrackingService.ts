
import { useState, useEffect } from 'react';

export interface BusLocation {
  latitude: number;
  longitude: number;
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
          updatedAt: new Date().toISOString()
        };
      });
      
      setBusLocations(newLocations);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [busIds]);

  return busLocations;
};
