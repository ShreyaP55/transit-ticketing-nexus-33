
import React, { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/qr/QrScanner";
import { startTrip, endTrip, getActiveTrip } from "@/services/tripService";
import { toast } from "sonner";

const QRScannerPage: React.FC = () => {
  const [scanned, setScanned] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number; lng: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [connectionError, setConnectionError] = useState(false);

  // Get current location when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log("Location obtained:", position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get your current location. Please enable location services.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // Function to handle successful QR scan
  const handleScan = async (data: string | null) => {
    if (data && !scanned) {
      console.log("QR Code scanned:", data);
      setScanned(true);
      setConnectionError(false);
      
      // Parse the QR code data
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (error) {
        // If it's not JSON, treat it as a plain user ID
        parsedData = { userId: data };
      }
      
      const userId = parsedData.userId || data;
      setUserId(userId);
      
      if (!location) {
        toast.error("Unable to get current location. Please try again.");
        setScanned(false);
        setUserId(null);
        return;
      }

      setIsLoading(true);
      
      try {
        // Check if user already has an active trip
        const trip = await getActiveTrip(userId);
        setActiveTrip(trip);
        
        if (trip) {
          // User has an active trip, ready for check out
          toast.success(`Active trip found. Ready for check-out.`);
        } else {
          // No active trip, ready for check in
          toast.success(`User scanned successfully. Ready for check-in.`);
        }
      } catch (error: any) {
        console.error("Error checking trip status:", error);
        if (error.message.includes("Server is not running")) {
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
      const result = await startTrip(userId, location.lat, location.lng);
      
      toast.success("Check-in successful! Trip started.");
      
      // Reset for next scan
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 2000);
    } catch (error: any) {
      console.error("Check-in error:", error);
      if (error.message.includes("Server is not running")) {
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
      const result = await endTrip(activeTrip._id, location.lat, location.lng);
      
      if (result.success) {
        toast.success(`Check-out successful! Distance: ${result.trip?.distance || 0}km, Fare: ₹${result.trip?.fare || 0}`);
      } else {
        toast.success("Check-out successful!");
      }
      
      // Reset for next scan
      setTimeout(() => {
        setScanned(false);
        setUserId(null);
        setActiveTrip(null);
      }, 3000);
    } catch (error: any) {
      console.error("Check-out error:", error);
      if (error.message.includes("Server is not running")) {
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
            {connectionError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
                <p className="text-red-700 text-sm">
                  ⚠️ Backend server connection failed. Please ensure the server is running on port 3000.
                </p>
              </div>
            )}

            {!scanned ? (
              <div className="flex flex-col items-center">
                <div className="w-full max-w-xs mx-auto mb-4">
                  <QrScanner onScan={handleScan} onError={handleError} />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Position the QR code in the center of the camera view
                </p>
                {!location && (
                  <p className="text-xs text-amber-600 mt-2">
                    📍 Getting your location...
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4">
                  <p className="font-semibold">User ID:</p>
                  <p className="text-sm text-muted-foreground">{userId?.substring(0, 12)}...</p>
                  
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

        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-800">
            💡 <strong>How to use:</strong> Users should show their QR code from the wallet page to check in/out of trips.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default QRScannerPage;
