
import { useState, useEffect } from 'react';
import { getAllBusLocations, BusLocationData } from '@/services/busLocationService';

export const useRealTimeBusTracking = (busIds: string[], intervalMs = 5000) => {
  const [busLocations, setBusLocations] = useState<Record<string, BusLocationData>>({});
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    if (busIds.length === 0) return;

    setIsTracking(true);
    
    const trackBuses = async () => {
      try {
        const locations = await getAllBusLocations();
        const locationMap: Record<string, BusLocationData> = {};
        
        locations.forEach(location => {
          if (busIds.includes(location.busId)) {
            locationMap[location.busId] = location;
          }
        });
        
        setBusLocations(locationMap);
      } catch (error) {
        console.error('Error tracking buses:', error);
      }
    };

    // Initial fetch
    trackBuses();

    // Set up interval for real-time updates
    const interval = setInterval(trackBuses, intervalMs);

    return () => {
      clearInterval(interval);
      setIsTracking(false);
    };
  }, [busIds, intervalMs]);

  return { busLocations, isTracking };
};
