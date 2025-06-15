
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, Navigation, MapPin, Clock } from 'lucide-react';
import { useUser } from "@/context/UserContext";
import UserQRCode from "@/components/wallet/UserQRCode";
import WalletCard from "@/components/wallet/WalletCard";
import { getUserTrips } from "@/services/tripService";
import { useToast } from "@/components/ui/use-toast";
import { useAuthService } from "@/services/authService";

const WalletPage = () => {
  const { userId, isAuthenticated } = useUser();
  const { toast } = useToast();
  const { getAuthToken } = useAuthService();
  const [trips, setTrips] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchTrips = async () => {
      if (!userId || !isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const authToken = await getAuthToken();
        if (authToken) {
          const userTrips = await getUserTrips(userId, authToken);
          setTrips(userTrips);
        }
      } catch (error) {
        console.error("Error fetching trips:", error);
        toast({
          title: "Error",
          description: "Failed to load trip history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTrips();
    
    // Refresh trips every 30 seconds
    const intervalId = setInterval(fetchTrips, 30000);
    
    return () => clearInterval(intervalId);
  }, [userId, isAuthenticated, getAuthToken, toast]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <MainLayout title="My Wallet">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-heading">Transit Wallet</h1>
          <p className="text-muted-foreground mt-2">Manage your funds and track your trips</p>
        </div>
        
        {!isAuthenticated ? (
          <Card className="bg-white shadow-md mb-6">
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-xl font-medium mb-2">Please Login</h3>
                <p className="text-muted-foreground">
                  You need to be logged in to use the wallet features
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              {/* QR Code Card */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5 text-transit-orange" />
                  Your Travel Pass
                </h3>
                <UserQRCode />
              </div>
              
              {/* Wallet Card */}
              <div>
                <h3 className="text-lg font-medium mb-3 flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-transit-orange" />
                  Your Balance
                </h3>
                <WalletCard />
              </div>
            </div>
            
            {/* Trip History */}
            <div className="md:col-span-2">
              <Card className="bg-white shadow-md h-full">
                <CardHeader className="bg-gradient-to-r from-transit-orange/10 to-transparent">
                  <CardTitle className="flex items-center">
                    <Navigation className="mr-2 h-5 w-5 text-transit-orange" />
                    Trip History
                  </CardTitle>
                  <CardDescription>
                    Your recent travel and payments
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-transit-orange border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading your trips...</p>
                    </div>
                  ) : trips.length === 0 ? (
                    <div className="py-8 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="mt-4 text-muted-foreground">No trip history found</p>
                      <p className="text-sm text-muted-foreground">
                        Use your QR code to start a trip
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trips.map((trip) => (
                        <Card key={trip._id} className="bg-white shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center mb-1">
                                  <Badge 
                                    variant={trip.status === 'completed' ? "default" : "outline"}
                                    className={trip.status === 'completed' ? "bg-transit-green" : ""}
                                  >
                                    {trip.status === 'completed' ? 'Completed' : 'In Progress'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatDate(trip.createdAt)}
                                  </span>
                                </div>
                                
                                <div className="mt-2">
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-3 w-3 mr-1 text-transit-orange" />
                                    <span>
                                      Start: {trip.startLocation.lat.toFixed(6)}, {trip.startLocation.lng.toFixed(6)}
                                    </span>
                                  </div>
                                  
                                  {trip.endLocation && (
                                    <div className="flex items-center text-sm mt-1">
                                      <MapPin className="h-3 w-3 mr-1 text-transit-orange" />
                                      <span>
                                        End: {trip.endLocation.lat.toFixed(6)}, {trip.endLocation.lng.toFixed(6)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                {trip.status === 'completed' && (
                                  <>
                                    <p className="text-sm font-medium">
                                      Distance: {trip.distance} km
                                    </p>
                                    <p className="text-lg font-bold text-transit-orange">
                                      ₹{trip.fare}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default WalletPage;
