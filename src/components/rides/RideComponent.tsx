
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QrCode, MapPin, Clock, CreditCard, Navigation } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';

interface Ride {
  _id: string;
  userId: string;
  userName: string;
  busId: string;
  busName: string;
  startLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  active: boolean;
  distance?: number;
  fare?: number;
  duration?: number;
  createdAt: string;
}

const RideComponent = () => {
  const { user } = useUser();
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);

  // Fetch user's active ride
  const { data: activeRide, refetch: refetchActiveRide } = useQuery({
    queryKey: ['activeRide', user?.id],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rides/active/${user?.id}`);
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!user?.id,
    refetchInterval: 5000, // Refetch every 5 seconds
  });

  // Fetch user's ride history
  const { data: rideHistory } = useQuery({
    queryKey: ['rideHistory', user?.id],
    queryFn: async () => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/rides/user/${user?.id}`);
      if (!response.ok) throw new Error('Failed to fetch ride history');
      return response.json();
    },
    enabled: !!user?.id,
  });

  useEffect(() => {
    setCurrentRide(activeRide);
  }, [activeRide]);

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000 / 60);
    return `${duration} min`;
  };

  const formatDistance = (distance?: number) => {
    if (!distance) return 'N/A';
    return `${distance.toFixed(2)} km`;
  };

  return (
    <div className="space-y-6">
      {/* Current Ride Status */}
      <Card className="bg-gradient-to-br from-white to-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-transit-orange">
            <Navigation className="h-5 w-5" />
            Current Ride Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentRide ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className="bg-transit-green text-white">Active</Badge>
                  <span className="font-medium">Bus {currentRide.busName}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Duration</div>
                  <div className="font-medium">{formatDuration(currentRide.startLocation.timestamp)}</div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-transit-green" />
                    <span className="text-sm font-medium">Boarding Point</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentRide.startLocation.latitude.toFixed(4)}, {currentRide.startLocation.longitude.toFixed(4)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(currentRide.startLocation.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-transit-orange" />
                    <span className="text-sm font-medium">Started At</span>
                  </div>
                  <div className="text-sm">
                    {new Date(currentRide.startLocation.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
              
              <div className="bg-transit-orange/10 p-3 rounded-lg">
                <p className="text-sm text-transit-orange font-medium">
                  🚌 You're currently on board! Present your QR code when exiting the bus.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No active ride</p>
              <p className="text-sm text-muted-foreground mt-1">
                Present your QR code to the driver when boarding a bus
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Ride History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Rides
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rideHistory && rideHistory.length > 0 ? (
            <div className="space-y-3">
              {rideHistory.slice(0, 5).map((ride: Ride) => (
                <div key={ride._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-transit-green"></div>
                    <div>
                      <div className="font-medium">Bus {ride.busName}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(ride.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium">₹{ride.fare?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDistance(ride.distance)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No ride history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RideComponent;
