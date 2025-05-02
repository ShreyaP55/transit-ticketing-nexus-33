
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, Bus, Navigation } from "lucide-react";
import { routesAPI, busesAPI, stationsAPI, paymentAPI } from "@/services/api";

const BookingPage = () => {
  const navigate = useNavigate();
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");
  
  // Fetch routes
  const { 
    data: routes, 
    isLoading: isLoadingRoutes 
  } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });
  
  // Fetch buses for selected route
  const { 
    data: buses, 
    isLoading: isLoadingBuses 
  } = useQuery({
    queryKey: ['buses', selectedRouteId],
    queryFn: () => busesAPI.getAll(selectedRouteId),
    enabled: !!selectedRouteId,
  });
  
  // Fetch stations for selected route and bus
  const { 
    data: stations, 
    isLoading: isLoadingStations 
  } = useQuery({
    queryKey: ['stations', selectedRouteId, selectedBusId],
    queryFn: () => stationsAPI.getAll({ 
      routeId: selectedRouteId, 
      busId: selectedBusId 
    }),
    enabled: !!selectedRouteId && !!selectedBusId,
  });
  
  // Reset selections when dependencies change
  useEffect(() => {
    setSelectedBusId("");
  }, [selectedRouteId]);
  
  useEffect(() => {
    setSelectedStationId("");
  }, [selectedBusId]);

  const handleBookTicket = async () => {
    if (!selectedStationId) return;
    
    const station = stations?.find(s => s._id === selectedStationId);
    if (!station) return;
    
    try {
      const response = await paymentAPI.createTicketCheckoutSession(
        selectedStationId,
        selectedBusId,
        station.fare
      );
      
      if (response && response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error("Payment error:", error);
    }
  };

  return (
    <MainLayout title="Book Tickets">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Map className="mr-2 text-transit-blue" />
              Book Your Ticket
            </CardTitle>
            <CardDescription>
              Select your route, bus and station to book a ticket
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Select Route</h3>
                {isLoadingRoutes ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {routes?.map(route => (
                      <div
                        key={route._id}
                        className={`p-3 border rounded-md cursor-pointer transition-all ${
                          selectedRouteId === route._id 
                            ? "border-transit-blue bg-transit-blue/10" 
                            : "hover:border-transit-blue"
                        }`}
                        onClick={() => setSelectedRouteId(route._id)}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{route.start} - {route.end}</span>
                          <Badge variant="outline">₹{route.fare}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedRouteId && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Bus</h3>
                  {isLoadingBuses ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {buses?.map(bus => (
                        <div
                          key={bus._id}
                          className={`p-3 border rounded-md cursor-pointer transition-all ${
                            selectedBusId === bus._id 
                              ? "border-transit-blue bg-transit-blue/10" 
                              : "hover:border-transit-blue"
                          }`}
                          onClick={() => setSelectedBusId(bus._id)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{bus.name}</span>
                            <Badge variant="outline">Capacity: {bus.capacity}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedBusId && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Select Station</h3>
                  {isLoadingStations ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {stations?.map(station => (
                        <div
                          key={station._id}
                          className={`p-3 border rounded-md cursor-pointer transition-all ${
                            selectedStationId === station._id 
                              ? "border-transit-blue bg-transit-blue/10" 
                              : "hover:border-transit-blue"
                          }`}
                          onClick={() => setSelectedStationId(station._id)}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium">{station.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                              </p>
                            </div>
                            <Badge variant="outline">₹{station.fare}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button 
              onClick={handleBookTicket} 
              disabled={!selectedStationId}
            >
              <Bus className="mr-2 h-4 w-4" />
              Book Ticket
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BookingPage;
