import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrScanner } from "@/components/qr/QrScanner";
import { MapPin, Navigation, Clock, Users, AlertTriangle } from "lucide-react";
import { startRideSession, endRideSession, getActiveRide } from "@/services/rideSessionService";
import { updateBusLocation } from "@/services/busLocationService";
import { useUser } from "@/context/UserContext";

interface UberLikeRideScannerProps {
  busId: string;
  busName: string;
  isAdmin?: boolean;
}

const UberLikeRideScanner: React.FC<UberLikeRideScannerProps> = ({ 
  busId, 
  busName, 
  isAdmin = false 
}) => {
  const { toast } = useToast();
  const { userDetails } = useUser();
  const [scanned, setScanned] = useState(false);
  const [scannedUserId, setScannedUserId] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [locationTracking, setLocationTracking] = useState<NodeJS.Timeout | null>(null);

  // Get current location when component mounts
  useEffect(() => {
    getCurrentLocation();
    
    // Start location tracking for admin (bus driver)
    if (isAdmin) {
      startLocationTracking();
    }

    return () => {
      if (locationTracking) {
        clearInterval(locationTracking);
      }
    };
  }, [isAdmin]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get current location. Please enable location services.",
            variant: "destructive",
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  };

  const startLocationTracking = () => {
    if (!isAdmin) return;

    const interval = setInterval(() => {
      if (navigator.geolocation && currentLocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            setCurrentLocation(newLocation);

            // Update bus location in backend
            try {
              await updateBusLocation({
                busId,
                busName,
                location: newLocation,
                speed: position.coords.speed ? position.coords.speed * 3.6 : 0, // Convert m/s to km/h
                heading: position.coords.heading || 0,
                accuracy: position.coords.accuracy,
                driverId: userDetails?.id
              });
            } catch (error) {
              console.error('Failed to update bus location:', error);
            }
          },
          (error) => console.error("Location tracking error:", error),
          { enableHighAccuracy: true }
        );
      }
    }, 5000); // Update every 5 seconds

    setLocationTracking(interval);
  };

  const handleScan = async (data: string | null) => {
    if (data && !scanned && currentLocation) {
      setScanned(true);
      setScannedUserId(data);
      setIsLoading(true);
      
      try {
        // Check if user already has an active ride
        const existingRide = await getActiveRide(data);
        
        if (existingRide) {
          setActiveRide(existingRide);
          toast({
            title: "Active Ride Found",
            description: `User has an ongoing ride on ${existingRide.busName}`,
            variant: "default",
          });
        } else {
          toast({
            title: "User Ready for Boarding",
            description: `Scanned user: ${data.substring(0, 8)}...`,
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error checking active ride:", error);
        toast({
          title: "Error",
          description: "Failed to verify user status",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleStartRide = async () => {
    if (!scannedUserId || !currentLocation) return;
    
    setIsLoading(true);
    try {
      const newRide = await startRideSession({
        clerkId: scannedUserId,
        userName: `User ${scannedUserId.substring(0, 8)}`,
        busId,
        busName,
        startCoords: {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: 10
        }
      });
      
      setActiveRide(newRide);
      
      toast({
        title: "Ride Started",
        description: `Successfully started ride for user on ${busName}`,
        variant: "default",
      });

      // Reset for next scan after a delay
      setTimeout(resetScanner, 3000);
    } catch (error) {
      console.error("Start ride error:", error);
      toast({
        title: "Failed to Start Ride",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndRide = async () => {
    if (!activeRide || !currentLocation) return;
    
    setIsLoading(true);
    try {
      const endedRide = await endRideSession({
        rideId: activeRide.rideId,
        rideToken: activeRide.rideToken,
        endCoords: {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: 10
        }
      });
      
      toast({
        title: "Ride Completed",
        description: `Distance: ${endedRide.totalDistance}km, Fare: ₹${endedRide.totalFare}`,
        variant: "default",
      });

      // Reset for next scan after a delay
      setTimeout(resetScanner, 3000);
    } catch (error) {
      console.error("End ride error:", error);
      toast({
        title: "Failed to End Ride",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScannedUserId(null);
    setActiveRide(null);
  };

  const handleError = (error: any) => {
    console.error("QR Scan error:", error);
    toast({
      title: "Scan Error",
      description: "Failed to scan QR code. Please try again.",
      variant: "destructive",
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="bg-gradient-to-r from-transit-orange to-transit-orange-dark text-white">
        <CardTitle className="flex items-center">
          <Navigation className="mr-2 h-5 w-5" />
          {isAdmin ? "Bus QR Scanner" : "Ride Scanner"}
        </CardTitle>
        <div className="flex items-center justify-between text-sm">
          <span>{busName}</span>
          <Badge variant="secondary" className="bg-white/20">
            {busId}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        {!currentLocation ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 text-transit-orange mx-auto mb-2" />
            <p className="text-muted-foreground">Getting location...</p>
          </div>
        ) : !scanned ? (
          <div className="space-y-4">
            <QrScanner onScan={handleScan} onError={handleError} />
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Scan passenger QR code to start or end ride
              </p>
              {currentLocation && (
                <p className="text-xs text-muted-foreground mt-2">
                  Location: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <Users className="h-12 w-12 text-transit-orange mx-auto mb-2" />
              <h3 className="font-semibold">User Scanned</h3>
              <p className="text-sm text-muted-foreground">
                ID: {scannedUserId?.substring(0, 8)}...
              </p>
            </div>

            {activeRide ? (
              <div className="space-y-3">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-700">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      Ride active since {new Date(activeRide.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                
                <Button
                  variant="destructive"
                  onClick={handleEndRide}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? "Ending Ride..." : "End Ride & Calculate Fare"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center text-blue-700">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Ready to start new ride</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleStartRide}
                  disabled={isLoading}
                  className="w-full bg-transit-orange hover:bg-transit-orange-dark"
                >
                  {isLoading ? "Starting Ride..." : "Start Ride"}
                </Button>
              </div>
            )}
            
            <Button
              variant="outline"
              onClick={resetScanner}
              disabled={isLoading}
              className="w-full"
            >
              Scan Another User
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UberLikeRideScanner;
