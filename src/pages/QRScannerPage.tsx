
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/qr/QrScanner";
import { startTrip, endTrip, getActiveTrip } from "@/services/tripService";

const QRScannerPage: React.FC = () => {
  const { toast } = useToast();
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState<any>(null);

  // Get current location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your current location. Please enable location services.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser.",
        variant: "destructive",
      });
    }
  }, []);

  // Function to handle successful QR scan
  const handleScan = async (data: string | null) => {
    if (data && !scanned) {
      setScanned(true);
      setUserId(data);
      
      if (!location) {
        toast({
          title: "Location Error",
          description: "Unable to get current location. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      
      try {
        // Check if user already has an active trip
        const trip = await getActiveTrip(data);
        setActiveTrip(trip);
        
        if (trip) {
          // User has an active trip, confirm check out
          toast({
            title: "Active Trip Found",
            description: `User has an active trip started at ${new Date(trip.startLocation.timestamp).toLocaleTimeString()}`,
            variant: "default",
          });
        } else {
          // No active trip, initiate check in
          toast({
            title: "User ID Scanned",
            description: `Ready to check in user: ${data.substring(0, 8)}...`,
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error checking trip status:", error);
        toast({
          title: "Error",
          description: "Failed to check trip status. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleError = (error: any) => {
    console.error("QR Scan error:", error);
    toast({
      title: "Scan Error",
      description: "Failed to scan QR code. Please try again.",
      variant: "destructive",
    });
  };

  const handleCheckIn = async () => {
    if (!userId || !location) return;
    
    setIsLoading(true);
    try {
      await startTrip(userId, location.lat, location.lng);
      
      toast({
        title: "Check-in Successful",
        description: "User has been checked in successfully.",
        variant: "default",
      });
      
      // Reset for next scan
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 2000);
    } catch (error) {
      console.error("Check-in error:", error);
      toast({
        title: "Check-in Failed",
        description: error instanceof Error ? error.message : "Failed to check in user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!userId || !location || !activeTrip) return;
    
    setIsLoading(true);
    try {
      const trip = await endTrip(activeTrip._id, location.lat, location.lng);
      
      toast({
        title: "Check-out Successful",
        description: `Trip completed. Distance: ${trip.distance}km, Fare: ₹${trip.fare}`,
        variant: "default",
      });
      
      // Reset for next scan
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 3000);
    } catch (error) {
      console.error("Check-out error:", error);
      toast({
        title: "Check-out Failed",
        description: error instanceof Error ? error.message : "Failed to check out user",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setUserId(null);
    setActiveTrip(null);
  };

  return (
    <MainLayout title="QR Scanner">
      <div className="max-w-md mx-auto p-4">
        <Card className="bg-white shadow-md border-transit-orange overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-transit-orange to-transit-orange-dark text-white">
            <CardTitle className="text-center">
              {scanned ? "User QR Scanned" : "Scan User QR Code"}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-4">
            {!scanned ? (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-xs mx-auto mb-4">
                  <QrScanner onScan={handleScan} onError={handleError} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Position the QR code in the center of the camera view
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <p className="font-semibold">User ID:</p>
                  <p className="text-sm text-muted-foreground">{userId?.substring(0, 8)}...</p>
                  
                  {location && (
                    <div className="mt-2">
                      <p className="font-semibold">Current Location:</p>
                      <p className="text-xs text-muted-foreground">
                        {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                      </p>
                    </div>
                  )}
                  
                  {activeTrip && (
                    <div className="mt-4 p-3 bg-transit-orange/10 rounded-md">
                      <p className="text-sm">
                        <span className="font-medium">Trip started:</span> {new Date(activeTrip.startLocation.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-center space-x-2 mt-4">
                  {activeTrip ? (
                    <Button
                      variant="destructive"
                      onClick={handleCheckOut}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Check Out"}
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="bg-transit-orange hover:bg-transit-orange-dark"
                      onClick={handleCheckIn}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : "Check In"}
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    {isLoading ? "Wait..." : "Cancel"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default QRScannerPage;
