
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { getHighAccuracyLocation, LocationData } from "@/services/locationService";

export const useLocationTracking = () => {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  const toggleLocationTracking = useCallback(async () => {
    if (!isTracking) {
      try {
        const location = await getHighAccuracyLocation();
        setUserLocation(location);
        setIsTracking(true);
        
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation: LocationData = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            };
            setUserLocation(newLocation);
          },
          (error) => {
            console.error("Error watching location:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000
          }
        );
        
        toast.success("Location tracking started");
      } catch (error) {
        console.error("Error starting location tracking:", error);
        toast.error("Failed to start location tracking. Please enable location access.");
      }
    } else {
      setIsTracking(false);
      toast.info("Location tracking stopped");
    }
  }, [isTracking]);

  return {
    userLocation,
    isTracking,
    toggleLocationTracking
  };
};
