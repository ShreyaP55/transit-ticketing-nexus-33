
import React, { useState, useEffect } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/qr/QrScanner";
import { startTrip, endTrip, getActiveTrip } from "@/services/tripService";
import { toast } from "sonner";

type Mode = "scanning" | "checking-in" | "checking-out";

const QRScannerPage: React.FC = () => {
  const [mode, setMode] = useState<Mode>("scanning"); // "scanning", "checking-in", "checking-out"
  const [scannedUserId, setScannedUserId] = useState<string | null>(null);
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
        },
        (error) => {
          toast.error("Unable to get your current location. Please enable location services.");
        }
      );
    } else {
      toast.error("Geolocation is not supported by this browser.");
    }
  }, []);

  // Handle a successful QR scan
  const handleScan = async (data: string | null) => {
    if (!data || mode !== "scanning") return;
    setScannedUserId(data);
    setIsLoading(true);
    setConnectionError(false);
    // Defensive: don't repeat a scan if already acting
    try {
      if (!location) {
        toast.error("Unable to get current location. Please try again.");
        setIsLoading(false);
        setScannedUserId(null);
        return;
      }
      // Check for active trip
      const trip = await getActiveTrip(data);
      setActiveTrip(trip);
      if (trip) {
        toast.success("Active trip found. Checking out user...");
        setMode("checking-out");
        // Immediately check out
        handleCheckOut(data, trip);
      } else {
        toast.success("User scanned. Checking in...");
        setMode("checking-in");
        // Immediately check in
        handleCheckIn(data);
      }
    } catch (error: any) {
      if (error.message && error.message.includes("Server is not running")) {
        setConnectionError(true);
        toast.error("Backend server is not running. Please start the server first.");
      } else {
        toast.error("Failed to process scan. Please try again.");
      }
      // Reset so scanner is ready for a new scan
      resetScanner();
    } finally {
      setIsLoading(false);
    }
  };

  // Only show scan error if a real error occurs (not just "no QR found")
  const handleError = (error: any) => {
    if (typeof error === "string" && error.toLowerCase().includes("not found")) return;
    toast.error("Camera/device error: " + (error?.message || error));
  };

  // Check-in logic after scan
  const handleCheckIn = async (userId: string) => {
    setIsLoading(true);
    try {
      if (!location) throw new Error("Current location missing.");
      const result = await startTrip(userId, location.lat, location.lng);
      toast.success("Check-in successful! Trip started.");
    } catch (error: any) {
      if (error.message && error.message.includes("Server is not running")) {
        setConnectionError(true);
        toast.error("Backend server is not running. Please start the server first.");
      } else {
        toast.error(error.message || "Failed to check in user");
      }
    } finally {
      setIsLoading(false);
      setTimeout(resetScanner, 1200); // auto reset in 1.2s for next scan
    }
  };

  // Check-out logic after scan
  const handleCheckOut = async (userId: string, trip: any) => {
    setIsLoading(true);
    try {
      if (!location) throw new Error("Current location missing.");
      if (!trip || !trip._id) throw new Error("Active trip not found");
      const result = await endTrip(trip._id, location.lat, location.lng);
      if (result.success) {
        toast.success(`Check-out successful! Distance: ${result.trip?.distance || 0}km, Fare: ₹${result.trip?.fare || 0}`);
      } else {
        toast.success("Check-out successful!");
      }
    } catch (error: any) {
      if (error.message && error.message.includes("Server is not running")) {
        setConnectionError(true);
        toast.error("Backend server is not running. Please start the server first.");
      } else {
        toast.error(error.message || "Failed to check out user");
      }
    } finally {
      setIsLoading(false);
      setTimeout(resetScanner, 1600); // auto reset in 1.6s for next scan
    }
  };

  // Reset scanner for new scan
  const resetScanner = () => {
    setMode("scanning");
    setActiveTrip(null);
    setScannedUserId(null);
    setConnectionError(false);
    setIsLoading(false);
  };

  return (
    <MainLayout title="QR Scanner">
      <div className="max-w-md mx-auto p-4">
        <Card className="bg-white shadow-md border-transit-orange overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-transit-orange to-transit-orange-dark text-white">
            <CardTitle className="text-center">
              QR Code Scanner
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
            {mode === "scanning" && (
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
            )}

            {mode !== "scanning" && (
              <div className="flex flex-col items-center justify-center min-h-[150px]">
                <p className="mb-2 font-semibold text-lg">
                  {mode === "checking-in" ? "User is being checked in..." : "User is being checked out..."}
                </p>
                <div className="animate-spin border-4 border-transit-orange border-t-transparent rounded-full h-8 w-8 mb-3" />
                <p className="text-muted-foreground text-sm">
                  Please wait...
                </p>
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

