
import { useState, useEffect } from 'react';

// This is a mock service that would connect to your real backend in production
// In a real implementation, this would use WebSockets or Server-Sent Events

type BusLocation = {
  lat: number;
  lng: number;
  updatedAt: Date;
};

type BusLocations = {
  [busId: string]: BusLocation;
};

// Simulated backend endpoint for bus locations
let busLocationsStore: BusLocations = {};

// Function to update bus location (simulates what a mobile device would call)
export const updateBusLocation = (busId: string, lat: number, lng: number): void => {
  busLocationsStore[busId] = {
    lat,
    lng,
    updatedAt: new Date()
  };
  
  console.log(`Bus ${busId} location updated:`, { lat, lng });
};

// Hook to subscribe to bus location updates
export const useTrackBuses = (busIds: string[] = []): BusLocations => {
  const [busLocations, setBusLocations] = useState<BusLocations>({});

  useEffect(() => {
    if (busIds.length === 0) return;
    
    // Initial fetch
    setBusLocations({...busLocationsStore});
    
    // Set up polling interval
    const intervalId = setInterval(() => {
      const freshData = {...busLocationsStore};
      
      // Filter to only requested busIds if specified
      if (busIds.length > 0) {
        const filteredData: BusLocations = {};
        busIds.forEach(id => {
          if (freshData[id]) {
            filteredData[id] = freshData[id];
          }
        });
        setBusLocations(filteredData);
      } else {
        setBusLocations(freshData);
      }
    }, 2000);
    
    // Set up the simulated bus movements (for demo purposes)
    const simulationIds: number[] = [];
    
    busIds.forEach(busId => {
      // Initial position if not set
      if (!busLocationsStore[busId]) {
        busLocationsStore[busId] = {
          // Random starting position around Delhi
          lat: 28.7041 + (Math.random() - 0.5) * 0.05,
          lng: 77.1025 + (Math.random() - 0.5) * 0.05,
          updatedAt: new Date()
        };
      }
      
      // Simulate movement
      const simId = window.setInterval(() => {
        const currentLocation = busLocationsStore[busId];
        if (currentLocation) {
          updateBusLocation(
            busId,
            currentLocation.lat + (Math.random() - 0.5) * 0.002,
            currentLocation.lng + (Math.random() - 0.5) * 0.002
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
  }, [busIds.join(',')]);
  
  return busLocations;
};
