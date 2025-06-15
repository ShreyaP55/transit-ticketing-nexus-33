
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
    if (busIds.length === 0) {
      console.log('No bus IDs provided for tracking');
      return;
    }

    console.log('Starting bus tracking for IDs:', busIds);

    // Simulate real-time bus tracking with more realistic movement
    const interval = setInterval(() => {
      const newLocations: BusLocations = {};
      
      busIds.forEach((busId, index) => {
        // Generate coordinates around different areas in Goa
        const baseLocations = [
          { lat: 15.4909, lng: 73.8278 }, // Panaji
          { lat: 15.5937, lng: 73.7515 }, // Mapusa
          { lat: 15.2993, lng: 74.1240 }, // Margao
          { lat: 15.5500, lng: 73.7500 }, // Calangute
        ];
        
        const baseLocation = baseLocations[index % baseLocations.length];
        
        // Get previous location for smooth movement
        const prevLocation = busLocations[busId];
        let newLat, newLng;
        
        if (prevLocation) {
          // Small incremental movement for realistic tracking
          const maxMove = 0.001; // Approximately 100 meters
          newLat = prevLocation.latitude + (Math.random() - 0.5) * maxMove;
          newLng = prevLocation.longitude + (Math.random() - 0.5) * maxMove;
        } else {
          // Initial position with some randomness
          newLat = baseLocation.lat + (Math.random() - 0.5) * 0.02;
          newLng = baseLocation.lng + (Math.random() - 0.5) * 0.02;
        }
        
        const speed = Math.random() * 40 + 20; // 20-60 km/h
        const heading = Math.random() * 360;
        
        newLocations[busId] = {
          latitude: newLat,
          longitude: newLng,
          lat: newLat,
          lng: newLng,
          speed: speed,
          heading: heading,
          updatedAt: new Date().toISOString()
        };
        
        console.log(`Bus ${busId} location updated:`, {
          lat: newLat.toFixed(6),
          lng: newLng.toFixed(6),
          speed: speed.toFixed(1)
        });
      });
      
      setBusLocations(newLocations);
    }, 3000); // Update every 3 seconds for smoother tracking

    return () => {
      console.log('Stopping bus tracking');
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
        reject(new Error('Geolocation is not supported'));
        return;
      }

      console.log('Getting current position...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log('Current position obtained:', {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
          resolve(position);
        },
        (error) => {
          console.error('Geolocation error:', error);
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

    console.log('Starting position watching...');
    return navigator.geolocation.watchPosition(
      (position) => {
        console.log('Position update:', {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        });
        callback(position);
      },
      (error) => {
        console.error('Position watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000
      }
    );
  },

  clearWatch: (watchId: number) => {
    console.log('Clearing position watch:', watchId);
    navigator.geolocation.clearWatch(watchId);
  }
};
