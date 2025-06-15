
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

// Predefined bus routes with realistic waypoints in Goa
const BUS_ROUTES = {
  'route1': [
    { lat: 15.4909, lng: 73.8278, name: 'Panaji Bus Stand' },
    { lat: 15.4985, lng: 73.8242, name: 'Panaji Market' },
    { lat: 15.5150, lng: 73.8050, name: 'Dona Paula' },
    { lat: 15.5500, lng: 73.7500, name: 'Calangute' },
  ],
  'route2': [
    { lat: 15.2993, lng: 74.1240, name: 'Margao Bus Stand' },
    { lat: 15.3200, lng: 74.1100, name: 'Margao Market' },
    { lat: 15.4000, lng: 73.9500, name: 'Ponda Junction' },
    { lat: 15.4909, lng: 73.8278, name: 'Panaji' },
  ],
  'route3': [
    { lat: 15.5937, lng: 73.7515, name: 'Mapusa Bus Stand' },
    { lat: 15.5800, lng: 73.7600, name: 'Mapusa Market' },
    { lat: 15.5500, lng: 73.7500, name: 'Calangute Beach' },
    { lat: 15.5200, lng: 73.7300, name: 'Baga Beach' },
  ]
};

export const useTrackBuses = (busIds: string[], routeId: string | null): BusLocations => {
  const [busLocations, setBusLocations] = useState<BusLocations>({});
  const [busRouteProgress, setBusRouteProgress] = useState<{ [busId: string]: number }>({});

  useEffect(() => {
    console.log('=== LIVE TRACKING INITIALIZED ===');
    console.log('Bus IDs to track:', busIds, 'on route:', routeId);
    
    if (busIds.length === 0) {
      console.log('No bus IDs provided for tracking');
      setBusLocations({});
      return;
    }

    console.log('Starting realistic bus tracking for IDs:', busIds);

    // Initialize route progress for each bus
    const initialProgress: { [busId: string]: number } = {};
    busIds.forEach((busId) => {
      initialProgress[busId] = Math.random() * 0.5; // Start buses at different points
    });
    setBusRouteProgress(initialProgress);

    const interval = setInterval(() => {
      console.log('=== UPDATING BUS LOCATIONS ===');
      const timestamp = new Date().toISOString();
      const newLocations: BusLocations = {};
      
      setBusRouteProgress(prevProgress => {
        const updatedProgress = { ...prevProgress };
        
        busIds.forEach((busId, index) => {
          const routeKeys = Object.keys(BUS_ROUTES);
          let routeKey: keyof typeof BUS_ROUTES;

          if (routeId) {
            // Deterministically select a route based on routeId
            const hash = Array.from(routeId).reduce((acc, char) => acc + char.charCodeAt(0), 0);
            routeKey = routeKeys[hash % routeKeys.length] as keyof typeof BUS_ROUTES;
          } else {
            // Fallback for when no route is selected
            routeKey = routeKeys[index % routeKeys.length] as keyof typeof BUS_ROUTES;
          }
          
          const route = BUS_ROUTES[routeKey];
          
          // Get current progress for this bus
          let progress = updatedProgress[busId] || 0;
          
          // Increment progress (simulate bus movement along route)
          progress += 0.002 + (Math.random() * 0.003); // Variable speed
          
          // Reset progress if bus completes route
          if (progress >= 1) {
            progress = 0;
            console.log(`Bus ${busId} completed route, starting new journey`);
          }
          
          updatedProgress[busId] = progress;
          
          // Calculate position based on progress along route
          const segmentCount = route.length - 1;
          const segmentProgress = progress * segmentCount;
          const currentSegment = Math.floor(segmentProgress);
          const segmentRatio = segmentProgress - currentSegment;
          
          // Interpolate between current and next waypoint
          const startPoint = route[Math.min(currentSegment, route.length - 1)];
          const endPoint = route[Math.min(currentSegment + 1, route.length - 1)];
          
          const lat = startPoint.lat + (endPoint.lat - startPoint.lat) * segmentRatio;
          const lng = startPoint.lng + (endPoint.lng - startPoint.lng) * segmentRatio;
          
          // Add small random variation for realism
          const latVariation = (Math.random() - 0.5) * 0.0005;
          const lngVariation = (Math.random() - 0.5) * 0.0005;
          
          const finalLat = lat + latVariation;
          const finalLng = lng + lngVariation;
          
          // Calculate realistic speed and heading
          const speed = 20 + Math.random() * 25; // 20-45 km/h
          const heading = Math.atan2(endPoint.lng - startPoint.lng, endPoint.lat - startPoint.lat) * 180 / Math.PI;
          
          const locationUpdate = {
            latitude: finalLat,
            longitude: finalLng,
            lat: finalLat,
            lng: finalLng,
            speed: speed,
            heading: heading < 0 ? heading + 360 : heading,
            updatedAt: timestamp
          };
          
          newLocations[busId] = locationUpdate;
          
          console.log(`Bus ${busId} location updated:`, {
            busId,
            route: routeKey,
            progress: (progress * 100).toFixed(1) + '%',
            currentSegment: `${startPoint.name} → ${endPoint.name}`,
            lat: finalLat.toFixed(6),
            lng: finalLng.toFixed(6),
            speed: speed.toFixed(1) + ' km/h',
            heading: heading.toFixed(0) + '°',
            timestamp
          });
        });
        
        return updatedProgress;
      });
      
      setBusLocations(prevLocations => {
        console.log('Previous locations count:', Object.keys(prevLocations).length);
        console.log('New locations count:', Object.keys(newLocations).length);
        return newLocations;
      });
    }, 2000); // Update every 2 seconds for smoother tracking

    return () => {
      console.log('=== STOPPING LIVE TRACKING ===');
      console.log('Clearing tracking interval for buses:', busIds);
      clearInterval(interval);
    };
  }, [busIds, routeId]);

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
          timeout: 15000,
          maximumAge: 60000
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
        timeout: 10000,
        maximumAge: 30000
      }
    );
  },

  clearWatch: (watchId: number) => {
    console.log('=== CLEARING POSITION WATCH ===');
    console.log('Clearing position watch:', watchId);
    navigator.geolocation.clearWatch(watchId);
  }
};
