
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Check, X, Loader2 } from "lucide-react";
import { tripsAPI } from "@/services/api/trips";
import { useUser } from "@/context/UserContext";
import { useAuthService } from "@/services/authService";
import { validateQRCode } from "@/utils/qrSecurity";

const QRScanPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, userId: currentUserId } = useUser();
  const { getAuthToken } = useAuthService();

  // Get current location with high accuracy
  useEffect(() => {
    if (!userId) return;
    
    const getLocation = () => {
      setIsLoading(true);
      setError(null);
      
      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser");
        setIsLoading(false);
        return;
      }
      
      console.log("Requesting high-accuracy location...");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          console.log("Location obtained:", coords, "Accuracy:", position.coords.accuracy, "meters");
          setLocation(coords);
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError(`Failed to get your current location: ${error.message}`);
          setIsLoading(false);
        },
        { 
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000
        }
      );
    };
    
    getLocation();
    
    // Check if there's an active trip
    const checkActiveTrip = async () => {
      try {
        if (userId && isAuthenticated) {
          console.log("Checking for active trip for user:", userId);
          const trip = await tripsAPI.getActiveTrip(userId);
          console.log("Active trip result:", trip);
          setActiveTrip(trip);
        }
      } catch (error) {
        console.error("Error checking active trip:", error);
      }
    };
    
    checkActiveTrip();
  }, [userId, isAuthenticated]);
  
  // Handle check-in
  const handleCheckIn = async () => {
    if (!userId || !location || !isAuthenticated) return;
    
    try {
      setIsProcessing(true);
      console.log("Starting check-in process for user:", userId, "at location:", location);
      
      // Validate QR code if userId is encrypted
      if (userId.length > 50) {
        const validation = validateQRCode(userId);
        if (!validation.isValid) {
          throw new Error(validation.error || 'Invalid QR code');
        }
      }
      
      // Start a new trip
      const result = await tripsAPI.startTrip(userId, location.lat, location.lng);
      console.log("Trip started successfully:", result);
      
      setActiveTrip(result.trip || result);
      
      toast.success("Check-in Successful", {
        description: `Your trip has started at ${new Date().toLocaleTimeString()}`,
      });
    } catch (error) {
      console.error("Check-in error:", error);
      toast.error("Check-in Failed", {
        description: error instanceof Error ? error.message : "Failed to start trip",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle check-out
  const handleCheckOut = async () => {
    if (!userId || !location || !activeTrip || !isAuthenticated) return;
    
    try {
      setIsProcessing(true);
      console.log("Starting check-out process for trip:", activeTrip._id, "at location:", location);
      
      // End the trip
      const result = await tripsAPI.endTrip(activeTrip._id, location.lat, location.lng);
      console.log("Trip ended successfully:", result);
      
      const trip = result.trip || result;
      
      setActiveTrip(null);
      
      // Show success message with trip details
      const distance = trip.distance || 0;
      const fare = trip.fare || 0;
      
      if (result.deduction?.status === 'success') {
        toast.success("Check-out Successful", {
          description: `Trip completed! Distance: ${distance.toFixed(2)}km, Fare: ₹${fare.toFixed(2)}. ${result.deduction.message}`,
          duration: 6000,
        });
      } else {
        toast.warning("Trip Completed", {
          description: `Distance: ${distance.toFixed(2)}km, Fare: ₹${fare.toFixed(2)}. ${result.deduction?.message || 'Payment processing issue.'}`,
          duration: 8000,
        });
      }
      
      // Navigate to wallet page after a delay
      setTimeout(() => {
        navigate(`/wallet`);
      }, 3000);
    } catch (error) {
      console.error("Check-out error:", error);
      toast.error("Check-out Failed", {
        description: error instanceof Error ? error.message : "Failed to end trip",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle cancel
  const handleCancel = () => {
    navigate(-1);
  };

  // Helper function to safely get trip start time
  const getTripStartTime = () => {
    if (activeTrip && activeTrip.startLocation && activeTrip.startLocation.timestamp) {
      return new Date(activeTrip.startLocation.timestamp).toLocaleTimeString();
    }
    return "Unknown time";
  };

  return (
    <MainLayout title={activeTrip ? "Trip in Progress" : "Start Your Trip"}>
      <div className="max-w-lg mx-auto p-4">
        <Card className="bg-gray-900 border-gray-700 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-600/20 to-transparent border-b border-gray-700">
            <CardTitle className="flex items-center text-white">
              {activeTrip ? (
                <Navigation className="mr-2 h-5 w-5 text-orange-400" />
              ) : (
                <MapPin className="mr-2 h-5 w-5 text-orange-400" />
              )}
              {activeTrip ? "Trip in Progress" : "Start Trip"}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {activeTrip 
                ? "You're currently on a trip. Check-out when you reach your destination." 
                : "Tap check-in to start your journey"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-4 bg-gray-900">
            {!isAuthenticated && (
              <div className="mb-4 p-3 bg-amber-900/50 border border-amber-600 rounded-md text-amber-200 text-sm">
                <p>Please log in to use this feature</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="py-8 text-center">
                <Loader2 className="animate-spin h-8 w-8 text-orange-400 mx-auto" />
                <p className="mt-4 text-gray-300">Getting your location...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <X className="h-12 w-12 text-red-400 mx-auto" />
                <p className="mt-2 text-red-400 font-medium">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4 bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={handleCancel}
                >
                  Go Back
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-block p-3 bg-gray-800 rounded-full">
                    {activeTrip ? (
                      <Navigation className="h-8 w-8 text-orange-400" />
                    ) : (
                      <MapPin className="h-8 w-8 text-orange-400" />
                    )}
                  </div>
                  
                  <h3 className="mt-2 font-semibold text-lg text-white">
                    {activeTrip ? "Trip in Progress" : "Ready to Start"}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mt-1">
                    {activeTrip
                      ? `Trip started at ${getTripStartTime()}`
                      : "Your location has been detected"}
                  </p>
                  
                  {location && (
                    <p className="text-xs text-gray-500 mt-2 font-mono">
                      Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
                
                {activeTrip ? (
                  <div className="p-3 bg-green-900/50 border border-green-600 rounded-md">
                    <p className="text-sm text-green-200">
                      Trip started at {getTripStartTime()}.
                      Check out when you reach your destination.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
          
          <CardFooter className="bg-gray-800/50 flex justify-between border-t border-gray-700">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
              className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancel
            </Button>
            
            <Button
              variant={activeTrip ? "destructive" : "default"}
              className={activeTrip ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}
              onClick={activeTrip ? handleCheckOut : handleCheckIn}
              disabled={isLoading || !!error || isProcessing || !isAuthenticated}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Processing...
                </span>
              ) : activeTrip ? (
                <span className="flex items-center">
                  <Check className="mr-2 h-4 w-4" />
                  Check Out
                </span>
              ) : (
                <span className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4" />
                  Check In
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default QRScanPage;
