import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Navigation, Bus, Route as RouteIcon, MapPin, Search } from 'lucide-react';
import { routesAPI, busesAPI } from "@/services/api";
import LiveMap from "@/components/tracking/LiveMap";
import BusInfoPanel from "@/components/tracking/BusInfoPanel";
import { useTrackBuses } from "@/services/liveTrackingService";
import { IBus } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const LiveTrackingPage = () => {
  const { toast } = useToast();
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  
  // Google Maps script loader
  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setGoogleMapsLoaded(true);
      return;
    }
    
    // Create script element
    const googleMapScript = document.createElement('script');
    googleMapScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAFSdBkOwNVSZenjRSAFuPZynGbsNLeBgM&libraries=places`;
    googleMapScript.async = true;
    googleMapScript.defer = true;
    
    // Set up callback when script loads
    googleMapScript.addEventListener('load', () => {
      setGoogleMapsLoaded(true);
      console.log('Google Maps API loaded successfully');
    });
    
    // Handle errors
    googleMapScript.addEventListener('error', (e) => {
      console.error('Error loading Google Maps API:', e);
      toast({
        title: "Error Loading Map",
        description: "Could not load Google Maps. Please try refreshing the page.",
        variant: "destructive",
      });
    });
    
    // Append script to document
    document.body.appendChild(googleMapScript);
    
    // Cleanup function
    return () => {
      document.body.removeChild(googleMapScript);
    };
  }, []);
  
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

  // Get bus IDs for tracking
  const busIds = buses ? buses.map(bus => bus._id) : [];
  
  // Use our custom hook for real-time bus tracking
  const busLocations = useTrackBuses(busIds);
  
  // Notify when new buses are detected
  useEffect(() => {
    if (buses && buses.length > 0) {
      const activeBuses = buses.filter(bus => busLocations[bus._id]);
      if (activeBuses.length > 0 && !selectedBus) {
        toast({
          title: "Live Tracking Active",
          description: `${activeBuses.length} buses are now being tracked in real-time.`,
          variant: "default",
        });
      }
    }
  }, [buses, busLocations, selectedBus]);

  // Filter buses by search query
  const filteredBuses = buses?.filter(bus => 
    searchQuery === "" || 
    bus.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout title="Live Bus Tracking">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Route Selection */}
            <Card className="bg-gradient-to-br from-white to-blue-50 overflow-hidden">
              <CardHeader className="pb-3 bg-gradient-to-r from-transit-orange to-transit-orange-dark text-white">
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
                          setSearchQuery("");
                        }}
                        className={`p-3 border rounded-lg cursor-pointer transition-all
                          ${selectedRouteId === route._id 
                            ? "border-transit-orange bg-transit-orange text-white shadow-md" 
                            : "hover:border-transit-orange bg-white shadow-sm"}`}
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
                <CardHeader className="pb-3 bg-gradient-to-r from-transit-orange to-transit-orange-dark text-white">
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
                  ) : (
                    <>
                      <div className="relative mb-4">
                        <Input
                          placeholder="Search buses..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-8"
                        />
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      {filteredBuses?.length === 0 ? (
                        <p className="text-center py-4 text-muted-foreground">
                          {buses?.length === 0 
                            ? "No buses available for this route" 
                            : "No buses match your search"}
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                          {filteredBuses?.map(bus => {
                            const isActive = !!busLocations[bus._id];
                            return (
                              <div
                                key={bus._id}
                                onClick={() => setSelectedBus(bus)}
                                className={`p-3 border rounded-lg cursor-pointer transition-all
                                  ${selectedBus?._id === bus._id 
                                    ? "border-transit-orange bg-transit-orange text-white shadow-md" 
                                    : "hover:border-transit-orange bg-white shadow-sm"}`}
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{bus.name}</span>
                                  <Badge variant={selectedBus?._id === bus._id ? "secondary" : "outline"}
                                    className={isActive ? "bg-transit-green text-white" : ""}>
                                    {isActive ? "Active" : "Inactive"}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
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
              {!googleMapsLoaded ? (
                <div className="h-full w-full flex items-center justify-center bg-blue-50">
                  <div className="text-center">
                    <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading Google Maps...</p>
                  </div>
                </div>
              ) : (
                <LiveMap 
                  buses={buses || []} 
                  busLocations={busLocations} 
                  selectedBusId={selectedBus?._id} 
                  onSelectBus={(busId) => {
                    const bus = buses?.find(b => b._id === busId);
                    if (bus) {
                      setSelectedBus(bus);
                      toast({
                        title: `Selected ${bus.name}`,
                        description: "Now tracking this bus in real-time.",
                        duration: 3000,
                      });
                    }
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default LiveTrackingPage;
