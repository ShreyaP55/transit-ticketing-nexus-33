
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation, Bus, Route as RouteIcon, MapPin } from "lucide-react";
import { routesAPI, busesAPI } from "@/services/api";
import LiveMap from "@/components/tracking/LiveMap";
import BusInfoPanel from "@/components/tracking/BusInfoPanel";
import { IBus } from "@/types";

const LiveTrackingPage = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null);
  
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

  // Simulate bus movement for demo purposes
  const [busLocations, setBusLocations] = useState<{[key: string]: {lat: number, lng: number, updatedAt: Date}}>({});
  
  useEffect(() => {
    if (!buses || buses.length === 0) return;
    
    // Initialize bus locations with random positions around Delhi
    const initialLocations: {[key: string]: {lat: number, lng: number, updatedAt: Date}} = {};
    buses.forEach(bus => {
      initialLocations[bus._id] = {
        lat: 28.7041 + (Math.random() - 0.5) * 0.05,
        lng: 77.1025 + (Math.random() - 0.5) * 0.05,
        updatedAt: new Date()
      };
    });
    setBusLocations(initialLocations);
    
    // Update bus locations every 3 seconds for simulation
    const interval = setInterval(() => {
      setBusLocations(prevLocations => {
        const newLocations = {...prevLocations};
        Object.keys(newLocations).forEach(busId => {
          newLocations[busId] = {
            lat: newLocations[busId].lat + (Math.random() - 0.5) * 0.001,
            lng: newLocations[busId].lng + (Math.random() - 0.5) * 0.001,
            updatedAt: new Date()
          };
        });
        return newLocations;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [buses]);

  return (
    <MainLayout title="Live Bus Tracking">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Route Selection */}
            <Card className="bg-gradient-to-br from-white to-blue-50 overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-transit-blue to-transit-dark-blue text-white">
                <CardTitle className="text-lg font-semibold flex items-center">
                  <RouteIcon className="mr-2 h-5 w-5" />
                  Select Route
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoadingRoutes ? (
                  <div className="space-y-2">
                    {Array(4).fill(0).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {routes?.map(route => (
                      <div
                        key={route._id}
                        onClick={() => {
                          setSelectedRouteId(route._id);
                          setSelectedBus(null);
                        }}
                        className={`p-3 border rounded-lg cursor-pointer transition-all
                          ${selectedRouteId === route._id 
                            ? "border-transit-blue bg-transit-blue text-white shadow-md" 
                            : "hover:border-transit-blue bg-white shadow-sm"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{route.start} - {route.end}</span>
                          <Badge variant={selectedRouteId === route._id ? "secondary" : "outline"}>
                            ₹{route.fare}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bus Selection */}
            {selectedRouteId && (
              <Card className="bg-gradient-to-br from-white to-blue-50">
                <CardHeader className="pb-3 bg-gradient-to-r from-transit-blue to-transit-dark-blue text-white">
                  <CardTitle className="text-lg font-semibold flex items-center">
                    <Bus className="mr-2 h-5 w-5" />
                    Select Bus
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {isLoadingBuses ? (
                    <div className="space-y-2">
                      {Array(3).fill(0).map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : buses?.length === 0 ? (
                    <p className="text-center py-4 text-muted-foreground">No buses available for this route</p>
                  ) : (
                    <div className="space-y-2">
                      {buses?.map(bus => (
                        <div
                          key={bus._id}
                          onClick={() => setSelectedBus(bus)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all
                            ${selectedBus?._id === bus._id 
                              ? "border-transit-green bg-transit-green text-white shadow-md" 
                              : "hover:border-transit-green bg-white shadow-sm"}`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{bus.name}</span>
                            <Badge variant={selectedBus?._id === bus._id ? "outline" : "secondary"}>
                              {busLocations[bus._id] ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Selected Bus Info */}
            {selectedBus && busLocations[selectedBus._id] && (
              <BusInfoPanel 
                bus={selectedBus} 
                location={busLocations[selectedBus._id]} 
                route={routes?.find(r => r._id === selectedRouteId)} 
              />
            )}
          </div>

          {/* Map Area */}
          <Card className="md:col-span-3 overflow-hidden border-none shadow-xl">
            <CardContent className="p-0 h-[70vh]">
              <LiveMap 
                buses={buses || []} 
                busLocations={busLocations} 
                selectedBusId={selectedBus?._id} 
                onSelectBus={(busId) => {
                  const bus = buses?.find(b => b._id === busId);
                  if (bus) setSelectedBus(bus);
                }}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default LiveTrackingPage;
