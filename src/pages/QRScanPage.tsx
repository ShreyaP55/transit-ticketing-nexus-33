
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Check, X } from "lucide-react";
import { startTrip, getActiveTrip, endTrip } from "@/services/tripService";
import { useUser } from "@/context/UserContext";
import { deductFunds } from "@/services/walletService";

const QRScanPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated, userId: currentUserId } = useUser();

  // Get current location
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
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Failed to get your current location");
          setIsLoading(false);
        },
        { enableHighAccuracy: true }
      );
    };
    
    getLocation();
    
    // Check if there's an active trip
    const checkActiveTrip = async () => {
      try {
        if (userId) {
          const trip = await getActiveTrip(userId);
          setActiveTrip(trip);
        }
      } catch (error) {
        console.error("Error checking active trip:", error);
      }
    };
    
    checkActiveTrip();
  }, [userId]);
  
  // Handle check-in
  const handleCheckIn = async () => {
    if (!userId || !location) return;
    
    try {
      setIsProcessing(true);
      
      // Start a new trip
      const trip = await startTrip(userId, location.lat, location.lng);
      
      setActiveTrip(trip);
      
      toast({
        title: "Check-in Successful",
        description: `Your trip has started at ${new Date().toLocaleTimeString()}`,
        variant: "default",
      });
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in Failed",
        description: error instanceof Error ? error.message : "Failed to start trip",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle check-out
  const handleCheckOut = async () => {
    if (!userId || !location || !activeTrip) return;
    
    try {
      setIsProcessing(true);
      
      // End the trip
      const trip = await endTrip(activeTrip._id, location.lat, location.lng);
      
      // Deduct fare from wallet
      if (trip.fare) {
        try {
          await deductFunds(userId, trip.fare, "Bus ride fare");
          toast({
            title: "Fare Deducted",
            description: `₹${trip.fare} has been deducted from your wallet`,
            variant: "default",
          });
        } catch (error) {
          console.error("Error deducting funds:", error);
          toast({
            title: "Payment Error",
            description: "Failed to deduct fare from your wallet. Please add funds.",
            variant: "destructive",
          });
        }
      }
      
      setActiveTrip(null);
      
      toast({
        title: "Check-out Successful",
        description: `Your trip has ended. Distance: ${trip.distance}km, Fare: ₹${trip.fare}`,
        variant: "default",
      });
      
      // Navigate to wallet page after a delay
      setTimeout(() => {
        navigate(`/wallet`);
      }, 2000);
    } catch (error) {
      console.error("Check-out error:", error);
      toast({
        title: "Check-out Failed",
        description: error instanceof Error ? error.message : "Failed to end trip",
        variant: "destructive",
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
        <Card className="bg-white shadow-md border-primary overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
            <CardTitle className="flex items-center">
              {activeTrip ? (
                <Navigation className="mr-2 h-5 w-5" />
              ) : (
                <MapPin className="mr-2 h-5 w-5" />
              )}
              {activeTrip ? "Trip in Progress" : "Start Trip"}
            </CardTitle>
            <CardDescription className="text-white/80">
              {activeTrip 
                ? "You're currently on a trip. Check-out when you reach your destination." 
                : "Tap check-in to start your journey"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 pb-4">
            {!isAuthenticated && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm">
                <p>Please log in to use this feature</p>
              </div>
            )}
            
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Getting your location...</p>
              </div>
            ) : error ? (
              <div className="py-8 text-center">
                <X className="h-12 w-12 text-red-500 mx-auto" />
                <p className="mt-2 text-red-500">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleCancel}
                >
                  Go Back
                </Button>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="inline-block p-3 bg-muted rounded-full">
                    {activeTrip ? (
                      <Navigation className="h-8 w-8 text-primary" />
                    ) : (
                      <MapPin className="h-8 w-8 text-primary" />
                    )}
                  </div>
                  
                  <h3 className="mt-2 font-semibold text-lg">
                    {activeTrip ? "Trip in Progress" : "Ready to Start"}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {activeTrip
                      ? `Trip started at ${getTripStartTime()}`
                      : "Your location has been detected"}
                  </p>
                  
                  {location && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                    </p>
                  )}
                </div>
                
                {activeTrip ? (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-700">
                      Trip started at {getTripStartTime()}.
                      Check out when you reach your destination.
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </CardContent>
          
          <CardFooter className="bg-accent/50 flex justify-between">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              variant={activeTrip ? "destructive" : "default"}
              className={activeTrip ? "" : "bg-primary hover:bg-primary/90"}
              onClick={activeTrip ? handleCheckOut : handleCheckIn}
              disabled={isLoading || !!error || isProcessing || !isAuthenticated}
            >
              {isProcessing ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></span>
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
