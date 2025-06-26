
import { useState, useEffect } from 'react';
import { tripsAPI } from '@/services/api';
import { useAuthService } from "@/services/authService";
import { toast } from "sonner";

export const useQRScanner = () => {
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const { getAuthToken } = useAuthService();

  // Fetch location with high accuracy on mount
  useEffect(() => {
    setIsLoadingLocation(true);
    setLocationError(null);
    
    if (navigator.geolocation) {
      console.log("Requesting high-accuracy location for QR scanner...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setLocation(coords);
          setIsLoadingLocation(false);
          setLocationError(null);
          console.log("QR Scanner location obtained:", coords, "Accuracy:", position.coords.accuracy, "meters");
        },
        (error) => {
          console.error("Error getting location for QR scanner:", error);
          setLocation(null);
          setLocationError(`Unable to get your current location: ${error.message}. Please enable location services.`);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000
        }
      );
    } else {
      setLocation(null);
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  }, []);

  // Function to extract userId from QR data
  const extractUserIdFromQR = (qrData: string): string | null => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(qrData);
      if (parsed.userId) {
        return parsed.userId;
      }
    } catch (e) {
      // If not JSON, treat as plain string
      console.log("QR data is not JSON, treating as plain string");
    }
    
    // If it's just a string that looks like a user ID, return it
    if (typeof qrData === 'string' && qrData.trim().length > 0) {
      return qrData.trim();
    }
    
    return null;
  };

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

      setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scan error:", error);
    toast.error("Failed to scan QR code. Please try again.");
  };

  const handleCheckIn = async () => {
    if (!userId || !location) return;
    setIsLoading(true);
    
    try {
      console.log("Starting check-in for user:", userId, "at coordinates:", location);
      const result = await tripsAPI.startTrip(userId, location.lat, location.lng);
      console.log("Check-in successful:", result);
      
      toast.success("Check-in successful! Trip started.", {
        description: `Started at ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`,
      });
      
      // Reset for next scan after showing success
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 2000);
    } catch (error: any) {
      console.error("Check-in error:", error);
      toast.error("Check-in failed", {
        description: error.message || "Failed to check in user"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!userId || !location || !activeTrip) return;
    setIsLoading(true);
    
    try {
      console.log("Starting check-out for trip:", activeTrip._id, "at coordinates:", location);
      const result = await tripsAPI.endTrip(activeTrip._id, location.lat, location.lng);
      console.log("Check-out successful:", result);
      
      if (result.success) {
        const fare = result.trip?.fare || 0;
        const distance = result.trip?.distance || 0;
        const tripDetails = `Distance: ${distance.toFixed(2)} km, Fare: ₹${fare.toFixed(2)}`;

        if (result.deduction?.status === 'success') {
          toast.success("Check-out successful!", {
            description: `${tripDetails}. ${result.deduction.message}`,
            duration: 6000,
          });
        } else {
          toast.warning("Trip completed, but payment issue occurred.", {
            description: `${tripDetails}. ${result.deduction?.message || 'Payment processing failed.'}`,
            duration: 8000,
          });
        }
      } else {
        toast.error("Check-out failed", {
          description: result.error || "Please try again."
        });
      }

      // Reset for next scan
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 3000);
    } catch (error: any) {
      console.error("Check-out error:", error);
      toast.error("Check-out failed", {
        description: error.message || "Failed to check out user"
      });
    } finally {
      setIsLoading(false);
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
    handleCheckIn,
    handleCheckOut,
    handleReset,
  };
};
