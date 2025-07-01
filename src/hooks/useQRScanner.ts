
import { useState, useEffect } from 'react';
import { tripsAPI } from '@/services/api';
import { toast } from "sonner";
import { getHighAccuracyLocation } from '@/services/locationService';
import { extractUserIdFromQR } from '@/services/qrProcessingService';
import { useTripOperations } from '@/hooks/useTripOperations';
import { useUser } from '@/context/UserContext';

export const useQRScanner = () => {
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const { userId: currentUserId } = useUser();
  const { handleCheckIn, handleCheckOut, isLoading } = useTripOperations(currentUserId || undefined);

  // Fetch location with high accuracy on mount
  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoadingLocation(true);
      setLocationError(null);
      
      try {
        const locationData = await getHighAccuracyLocation();
        setLocation({
          lat: locationData.lat,
          lng: locationData.lng
        });
        setLocationError(null);
      } catch (error: any) {
        console.error("Error getting location for QR scanner:", error);
        setLocation(null);
        setLocationError(error.message);
      } finally {
        setIsLoadingLocation(false);
      }
    };

    fetchLocation();
  }, []);

  // Function to handle successful QR scan
  const handleScan = async (data: string | null) => {
    if (data && !scanned) {
      console.log("QR Code scanned:", data);
      
      const extractedUserId = extractUserIdFromQR(data);
      if (!extractedUserId) {
        toast.error("Invalid QR code format. Please scan a valid user QR code.");
        return;
      }
      
      setScanned(true);
      setUserId(extractedUserId);
      setConnectionError(false);
      
      if (!location) {
        toast.error("Unable to get current location. Please enable location services and try again.");
        setScanned(false);
        setUserId(null);
        return;
      }

      try {
        console.log("Checking trip status for user:", extractedUserId);
        // Check if user has an active trip
        const trip = await tripsAPI.getActiveTrip(extractedUserId);
        setActiveTrip(trip);

        if (trip) {
          toast.success(`Active trip found for user. Ready for check-out.`);
          console.log("Active trip details:", trip);
        } else {
          toast.success(`User scanned successfully. Ready for check-in.`);
          console.log("No active trip found, ready for check-in");
        }
      } catch (error: any) {
        console.error("Error checking trip status:", error);
        if (error.message && error.message.includes("Server is not running")) {
          setConnectionError(true);
          toast.error("Backend server is not running. Please start the server first.");
        } else {
          toast.error("Failed to check trip status. Please try again.");
        }
        setScanned(false);
        setUserId(null);
      }
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scan error:", error);
    toast.error("Failed to scan QR code. Please try again.");
  };

  const onCheckIn = async () => {
    if (!userId || !location) return;
    
    try {
      const result = await handleCheckIn(userId, location);
      
      // Reset for next scan after showing success
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 2000);
    } catch (error) {
      // Error handling is done in useTripOperations hook
    }
  };

  const onCheckOut = async () => {
    if (!userId || !location || !activeTrip) return;
    
    try {
      const result = await handleCheckOut(activeTrip._id, location);

      // Reset for next scan
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 3000);
    } catch (error) {
      // Error handling is done in useTripOperations hook
    }
  };

  const handleReset = () => {
    setScanned(false);
    setUserId(null);
    setActiveTrip(null);
    setConnectionError(false);
  };
  
  return {
    scanned,
    userId,
    location,
    isLoadingLocation,
    isLoading,
    activeTrip,
    connectionError,
    locationError,
    handleScan,
    handleError,
    handleCheckIn: onCheckIn,
    handleCheckOut: onCheckOut,
    handleReset,
  };
};
