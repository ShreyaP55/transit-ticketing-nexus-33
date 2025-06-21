
import { useState, useEffect } from 'react';
import { startTrip, endTrip, getActiveTrip } from "@/services/tripService";
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

  // Fetch location once at mount
  useEffect(() => {
    setIsLoadingLocation(true);
    setLocationError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoadingLocation(false);
          setLocationError(null);
          console.log("Location obtained:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocation(null);
          setLocationError("Unable to get your current location. Please enable location services.");
          setIsLoadingLocation(false);
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
        toast.error("Unable to get current location. Please try again.");
        setScanned(false);
        setUserId(null);
        return;
      }

      setIsLoading(true);
      try {
        const authToken = await getAuthToken() || "dummy-auth-token";
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        const trip = await getActiveTrip(extractedUserId, authToken);
        setActiveTrip(trip);

        if (trip) {
          toast.success(`Active trip found. Ready for check-out.`);
        } else {
          toast.success(`User scanned successfully. Ready for check-in.`);
        }
      } catch (error: any) {
        console.error("Error checking trip status:", error);
        if (error.message && error.message.includes("Server is not running")) {
          setConnectionError(true);
          toast.error("Backend server is not running. Please start the server first.");
        } else if (error.message && error.message.includes("Too many requests")) {
          toast.warning("Please wait a moment before scanning again.");
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
      const authToken = await getAuthToken() || "dummy-auth-token";
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      await startTrip(userId, location.lat, location.lng, authToken);
      toast.success("Check-in successful! Trip started.");
      // Reset for next scan
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 2000);
    } catch (error: any) {
      console.error("Check-in error:", error);
      if (error.message && error.message.includes("Server is not running")) {
        setConnectionError(true);
        toast.error("Backend server is not running. Please start the server first.");
      } else if (error.message && error.message.includes("Too many requests")) {
        toast.warning("Please wait a moment before trying again.");
      } else {
        toast.error(error.message || "Failed to check in user");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!userId || !location || !activeTrip) return;
    setIsLoading(true);
    try {
      const authToken = await getAuthToken() || "dummy-auth-token";
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      const result = await endTrip(activeTrip._id, location.lat, location.lng, authToken);

      if (result.success) {
        const fare = result.trip?.fare || 0;
        const distance = result.trip?.distance || 0;
        const tripDetails = `Distance: ${distance.toFixed(2)} km, Fare: ₹${fare.toFixed(2)}.`;

        if (result.deduction?.status === 'success') {
          toast.success("Check-out successful!", {
            description: `${tripDetails} ${result.deduction.message}`,
            duration: 6000,
          });
        } else {
          toast.warning("Check-out complete, but payment failed.", {
            description: `${tripDetails} ${result.deduction.message}`,
            duration: 8000,
          });
        }
      } else {
        toast.error(result.error || "Check-out failed. Please try again.");
      }

      // Reset for next scan
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 5000);
    } catch (error: any) {
      console.error("Check-out error:", error);
      if (error.message && error.message.includes("Server is not running")) {
        setConnectionError(true);
        toast.error("Backend server is not running. Please start the server first.");
      } else if (error.message && error.message.includes("Too many requests")) {
        toast.warning("Please wait a moment before trying again.");
      } else {
        toast.error(error.message || "Failed to check out user");
      }
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
