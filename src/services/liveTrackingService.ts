
import { useState, useEffect } from 'react';

export interface BusLocation {
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  updatedAt: string;
}

export interface BusLocations {
  [busId: string]: BusLocation;
}

export const useTrackBuses = (busIds: string[]): BusLocations => {
  const [busLocations, setBusLocations] = useState<BusLocations>({});

  useEffect(() => {
    console.log('=== LIVE TRACKING INITIALIZED ===');
    console.log('Bus IDs to track:', busIds);
    
    if (busIds.length === 0) {
      console.log('No bus IDs provided for tracking');
      return;
    }

    console.log('Starting live bus tracking for IDs:', busIds);

    // Simulate real-time bus tracking with more realistic movement
    const interval = setInterval(() => {
      console.log('=== UPDATING BUS LOCATIONS ===');
      const timestamp = new Date().toISOString();
      const newLocations: BusLocations = {};
      
      busIds.forEach((busId, index) => {
        // Generate coordinates around different areas in Goa
        const baseLocations = [
          { lat: 15.4909, lng: 73.8278, name: 'Panaji' },
          { lat: 15.5937, lng: 73.7515, name: 'Mapusa' },
          { lat: 15.2993, lng: 74.1240, name: 'Margao' },
          { lat: 15.5500, lng: 73.7500, name: 'Calangute' },
        ];
        
        const baseLocation = baseLocations[index % baseLocations.length];
        
        // Get previous location for smooth movement
        const prevLocation = busLocations[busId];
        let newLat, newLng;
        
        if (prevLocation) {
          // Small incremental movement for realistic tracking
          const maxMove = 0.0008; // Approximately 80 meters
          const direction = Math.random() * 2 * Math.PI; // Random direction
          const distance = Math.random() * maxMove;
          
          newLat = prevLocation.latitude + Math.cos(direction) * distance;
          newLng = prevLocation.longitude + Math.sin(direction) * distance;
          
          // Ensure we don't move too far from base location
          const distanceFromBase = Math.sqrt(
            Math.pow(newLat - baseLocation.lat, 2) + 
            Math.pow(newLng - baseLocation.lng, 2)
          );
          
          if (distanceFromBase > 0.05) { // If too far, move back towards base
            newLat = baseLocation.lat + (Math.random() - 0.5) * 0.02;
            newLng = baseLocation.lng + (Math.random() - 0.5) * 0.02;
          }
        } else {
          // Initial position with some randomness
          newLat = baseLocation.lat + (Math.random() - 0.5) * 0.02;
          newLng = baseLocation.lng + (Math.random() - 0.5) * 0.02;
        }
        
        const speed = Math.random() * 30 + 15; // 15-45 km/h
        const heading = Math.random() * 360;
        
        const locationUpdate = {
          latitude: newLat,
          longitude: newLng,
          lat: newLat,
          lng: newLng,
          speed: speed,
          heading: heading,
          updatedAt: timestamp
        };
        
        newLocations[busId] = locationUpdate;
        
        console.log(`Bus ${busId} location updated:`, {
          busId,
          area: baseLocation.name,
          lat: newLat.toFixed(6),
          lng: newLng.toFixed(6),
          speed: speed.toFixed(1) + ' km/h',
          timestamp
        });
      });
      
      setBusLocations(prevLocations => {
        console.log('Previous locations:', prevLocations);
        console.log('New locations:', newLocations);
        return newLocations;
      });
    }, 3000); // Update every 3 seconds

    return () => {
      console.log('=== STOPPING LIVE TRACKING ===');
      console.log('Clearing tracking interval for buses:', busIds);
      clearInterval(interval);
    };
  }, [busIds]);

  return busLocations;
};

// Enhanced location service for user tracking
export const locationService = {
  getCurrentPosition: (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocation is not supported');
        console.error('Geolocation not supported');
        reject(error);
        return;
      }

      console.log('=== GETTING USER LOCATION ===');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('=== USER LOCATION SUCCESS ===');
          console.log('Current position obtained:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy + 'm',
            timestamp: new Date(position.timestamp).toISOString()
          });
          resolve(position);
        },
        (error) => {
          console.error('=== USER LOCATION ERROR ===');
          console.error('Geolocation error:', {
            code: error.code,
            message: error.message,
            PERMISSION_DENIED: error.code === 1,
            POSITION_UNAVAILABLE: error.code === 2,
            TIMEOUT: error.code === 3
          });
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    });
  },

  watchPosition: (callback: (position: GeolocationPosition) => void) => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported');
    }

    console.log('=== STARTING POSITION WATCH ===');
    return navigator.geolocation.watchPosition(
      (position) => {
        console.log('=== POSITION UPDATE ===');
        console.log('Position update:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy + 'm',
          speed: position.coords.speed,
          heading: position.coords.heading,
          timestamp: new Date(position.timestamp).toISOString()
        });
        callback(position);
      },
      (error) => {
        console.error('=== POSITION WATCH ERROR ===');
        console.error('Position watch error:', {
          code: error.code,
          message: error.message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000
      }
    );
  },

  clearWatch: (watchId: number) => {
    console.log('=== CLEARING POSITION WATCH ===');
    console.log('Clearing position watch:', watchId);
    navigator.geolocation.clearWatch(watchId);
  }
};
