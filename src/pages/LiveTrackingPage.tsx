
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { routesAPI, busesAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import LeafletMap from "@/components/tracking/LeafletMap";
import { IRoute, IBus } from "@/types";
import { MapPin, Bus, Navigation, RefreshCw, Users, AlertCircle } from "lucide-react";
import { useTrackBuses } from "@/hooks/useTrackBuses";

const LiveTrackingPage = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [selectedBusId, setSelectedBusId] = useState<string>("");

  const { 
    data: routes = [], 
    isLoading: routesLoading, 
    error: routesError,
    refetch: refetchRoutes 
  } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
    retry: 3,
    retryDelay: 1000,
  });

  const { 
    data: buses = [], 
    isLoading: busesLoading, 
    error: busesError,
    refetch: refetchBuses 
  } = useQuery({
    queryKey: ["buses", selectedRouteId],
    queryFn: () => busesAPI.getByRoute(selectedRouteId),
    enabled: !!selectedRouteId,
    retry: 3,
    retryDelay: 1000,
  });

  // Get bus IDs for tracking
  const busIds = selectedBusId 
    ? [selectedBusId] 
    : buses.map(bus => bus._id);

  // Use tracking hook
  const busLocations = useTrackBuses(busIds, selectedRouteId, buses, routes);

  const selectedRoute = routes.find((route: IRoute) => route._id === selectedRouteId);
  const filteredBuses = selectedBusId 
    ? buses.filter((bus: IBus) => bus._id === selectedBusId)
    : buses;

  const handleRefresh = () => {
    refetchRoutes();
    refetchBuses();
  };

  // Show API connection status
  const showConnectionError = routesError || busesError;

  return (
    <MainLayout title="Live Bus Tracking">
      <div className="container mx-auto p-4 space-y-6">
        {/* Connection Status Alert */}
        {showConnectionError && (
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Having trouble connecting to the server. The backend might be starting up. 
              <Button 
                variant="link" 
                className="p-0 h-auto ml-2 text-amber-600 underline" 
                onClick={handleRefresh}
              >
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Header Section */}
        <Card className="bg-white shadow-lg border border-gray-200">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center text-xl font-bold">
              <Navigation className="mr-3 h-6 w-6" />
              Real-Time Bus Tracking
            </CardTitle>
            <p className="text-blue-100 mt-1">Track buses in real-time across all routes</p>
          </CardHeader>
          
          <CardContent className="p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              {/* Route Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  <MapPin className="inline h-4 w-4 mr-1 text-blue-600" />
                  Select Route
                </label>
                <Select 
                  value={selectedRouteId} 
                  onValueChange={(value) => {
                    setSelectedRouteId(value);
                    setSelectedBusId("");
                  }}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 font-medium">
                    <SelectValue placeholder="Choose a route..." />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {routesLoading ? (
                      <SelectItem value="loading" disabled className="text-gray-500">
                        Loading routes...
                      </SelectItem>
                    ) : routes.length > 0 ? (
                      routes.map((route: IRoute) => (
                        <SelectItem 
                          key={route._id} 
                          value={route._id}
                          className="text-gray-900 font-medium hover:bg-blue-50"
                        >
                          {route.start} → {route.end}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-routes" disabled className="text-gray-500">
                        No routes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Bus Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-800">
                  <Bus className="inline h-4 w-4 mr-1 text-green-600" />
                  Filter by Bus
                </label>
                <Select 
                  value={selectedBusId} 
                  onValueChange={setSelectedBusId}
                  disabled={!selectedRouteId}
                >
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 font-medium disabled:bg-gray-100 disabled:text-gray-500">
                    <SelectValue placeholder={selectedRouteId ? "All buses" : "Select route first"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    <SelectItem value="" className="text-gray-900 font-medium hover:bg-green-50">
                      All Buses
                    </SelectItem>
                    {busesLoading ? (
                      <SelectItem value="loading" disabled className="text-gray-500">
                        Loading buses...
                      </SelectItem>
                    ) : buses.length > 0 ? (
                      buses.map((bus: IBus) => (
                        <SelectItem 
                          key={bus._id} 
                          value={bus._id}
                          className="text-gray-900 font-medium hover:bg-green-50"
                        >
                          {bus.name}
                          <Badge className="ml-2 bg-green-100 text-green-800 text-xs">
                            <Users className="h-3 w-3 mr-1" />
                            {bus.capacity}
                          </Badge>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-buses" disabled className="text-gray-500">
                        No buses available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-transparent">
                  Refresh
                </label>
                <Button 
                  onClick={handleRefresh}
                  disabled={routesLoading || busesLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-gray-300 disabled:text-gray-500"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${(routesLoading || busesLoading) ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Route Info Display */}
            {selectedRoute && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-blue-900 text-lg">
                      {selectedRoute.start} → {selectedRoute.end}
                    </h3>
                    <p className="text-blue-700 text-sm mt-1">
                      Fare: ₹{selectedRoute.fare}
                    </p>
                  </div>
                  <Badge className="bg-blue-600 text-white px-3 py-1 text-sm font-medium">
                    {filteredBuses.length} {filteredBuses.length === 1 ? 'Bus' : 'Buses'} Active
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Section */}
        <Card className="bg-white shadow-lg border border-gray-200 overflow-hidden">
          <CardHeader className="bg-gray-50 border-b border-gray-200 py-3">
            <CardTitle className="flex items-center text-gray-800">
              <MapPin className="mr-2 h-5 w-5 text-red-500" />
              Live Map View
              {Object.keys(busLocations).length > 0 && (
                <Badge className="ml-auto bg-green-100 text-green-800 font-medium">
                  {Object.keys(busLocations).length} Live Tracking Active
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-0 bg-white">
            <div className="h-[500px] w-full">
              {selectedRoute ? (
                <LeafletMap 
                  buses={filteredBuses} 
                  busLocations={busLocations}
                  selectedBusId={selectedBusId}
                  onSelectBus={setSelectedBusId}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                  <div className="text-center p-8">
                    <MapPin className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      Select a Route to Start Tracking
                    </h3>
                    <p className="text-gray-500 max-w-sm mx-auto">
                      Choose a route from the dropdown above to view real-time bus locations on the map.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bus Status Cards */}
        {selectedRoute && filteredBuses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBuses.map((bus: IBus) => {
              const location = busLocations[bus._id];
              const isLive = !!location;
              
              return (
                <Card key={bus._id} className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-lg">{bus.name}</h4>
                      <Badge className={isLive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-500"}>
                        {isLive ? "Live" : "Offline"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-700">
                        <Users className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="font-medium">Capacity:</span>
                        <span className="ml-1 font-bold text-blue-600">{bus.capacity} passengers</span>
                      </div>
                      
                      {location && (
                        <>
                          <div className="flex items-center text-gray-700">
                            <Navigation className="h-4 w-4 mr-2 text-orange-600" />
                            <span className="font-medium">Speed:</span>
                            <span className="ml-1 text-gray-900 font-medium">
                              {Math.round(location.speed || 0)} km/h
                            </span>
                          </div>
                          
                          <div className="flex items-center text-gray-700">
                            <MapPin className="h-4 w-4 mr-2 text-red-600" />
                            <span className="font-medium">Updated:</span>
                            <span className="ml-1 text-gray-900 font-medium text-xs">
                              {new Date(location.updatedAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex items-center text-gray-700">
                        <Bus className="h-4 w-4 mr-2 text-green-600" />
                        <span className="font-medium">Route:</span>
                        <span className="ml-1 text-gray-900 font-medium">
                          {selectedRoute.start} → {selectedRoute.end}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default LiveTrackingPage;
