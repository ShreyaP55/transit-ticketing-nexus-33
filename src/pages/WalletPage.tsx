
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, CreditCard, Navigation, MapPin, Clock } from 'lucide-react';
import { useUser } from "@/context/UserContext";
import UserQRCode from "@/components/wallet/UserQRCode";
import WalletCard from "@/components/wallet/WalletCard";
import { ridesAPI } from "@/services/api";
import { IRide } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const WalletPage = () => {
  const { userId, isAuthenticated } = useUser();
  const { toast } = useToast();
  const [rides, setRides] = useState<IRide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId || !isAuthenticated) return;
      
      try {
        setIsLoading(true);
        const userRides = await ridesAPI.getHistory(userId);
        setRides(userRides);
      } catch (error) {
        console.error("Error fetching ride history:", error);
        toast({
          title: "Error",
          description: "Failed to load ride history",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
    
    // Refresh history every 30 seconds
    const intervalId = setInterval(fetchHistory, 30000);
    
    return () => clearInterval(intervalId);
  }, [userId, isAuthenticated, toast]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <MainLayout title="My Wallet">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold gradient-heading">Transit Wallet</h1>
          <p className="text-muted-foreground mt-2">Manage your funds and track your rides</p>
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
          <div className="flex flex-wrap gap-6">
            <div className="flex-1 min-w-[280px]">
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
            
            {/* Ride History */}
            <div className="flex-[2] min-w-[400px]">
              <Card className="bg-white shadow-md h-full">
                <CardHeader className="bg-gradient-to-r from-transit-orange/10 to-transparent">
                  <CardTitle className="flex items-center">
                    <Navigation className="mr-2 h-5 w-5 text-transit-orange" />
                    Ride History
                  </CardTitle>
                  <CardDescription>
                    Your recent travel and payments
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {isLoading ? (
                    <div className="py-8 text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-transit-orange border-t-transparent rounded-full mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading your rides...</p>
                    </div>
                  ) : rides.length === 0 ? (
                    <div className="py-8 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto" />
                      <p className="mt-4 text-muted-foreground">No ride history found</p>
                      <p className="text-sm text-muted-foreground">
                        Use your QR code to start a ride
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rides.map((ride) => (
                        <Card key={ride._id} className="bg-white shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center mb-1">
                                  <Badge 
                                    variant={!ride.active ? "default" : "outline"}
                                    className={!ride.active ? "bg-transit-green" : ""}
                                  >
                                    {!ride.active ? 'Completed' : 'In Progress'}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground ml-2">
                                    {formatDate(ride.createdAt)}
                                  </span>
                                </div>
                                
                                <div className="mt-2">
                                  <div className="flex items-center text-sm">
                                    <MapPin className="h-3 w-3 mr-1 text-transit-orange" />
                                    <span>
                                      Start: {ride.startLocation.latitude.toFixed(6)}, {ride.startLocation.longitude.toFixed(6)}
                                    </span>
                                  </div>
                                  
                                  {ride.endLocation && (
                                    <div className="flex items-center text-sm mt-1">
                                      <MapPin className="h-3 w-3 mr-1 text-transit-orange" />
                                      <span>
                                        End: {ride.endLocation.latitude.toFixed(6)}, {ride.endLocation.longitude.toFixed(6)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="text-right">
                                {!ride.active && ride.distance && ride.fare && (
                                  <>
                                    <p className="text-sm font-medium">
                                      Distance: {ride.distance.toFixed(2)} km
                                    </p>
                                    <p className="text-lg font-bold text-transit-orange">
                                      ₹{ride.fare}
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
