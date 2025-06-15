
import { useState, useEffect } from 'react';
import { startTrip, endTrip, getActiveTrip } from "@/services/tripService";
import { toast } from "sonner";

// TODO: In production, replace this with the user's actual auth token
const DUMMY_AUTH_TOKEN = "dummy-auth-token";

export const useQRScanner = () => {
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

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

  // Function to handle successful QR scan
  const handleScan = async (data: string | null) => {
    if (data && !scanned) {
      console.log("QR Code scanned:", data);
      setScanned(true);
      setUserId(data);
      setConnectionError(false);
      
      if (!location) {
        toast.error("Unable to get current location. Please try again.");
        setScanned(false);
        setUserId(null);
        return;
      }

      setIsLoading(true);
      try {
        const trip = await getActiveTrip(data, DUMMY_AUTH_TOKEN);
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
      await startTrip(userId, location.lat, location.lng, DUMMY_AUTH_TOKEN);
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
      const result = await endTrip(activeTrip._id, location.lat, location.lng, DUMMY_AUTH_TOKEN);

      if (result.success) {
        const fare = result.trip?.fare || 0;
        const distance = result.trip?.distance || 0;
        const tripDetails = `Distance: ${distance.toFixed(2)} km, Fare: ₹${fare.toFixed(2)}.`;

        if (result.deduction?.status === 'success') {
          toast.success("Check-out successful!", {
            description: `${tripDetails} ${result.deduction.message}`,
            duration: 6000,
          });
        } else { // 'error' or any other status
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
