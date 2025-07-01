import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { routesAPI, busesAPI } from "@/services/api";
import { IRoute, IBus } from "@/types";
import { Bus, MapPin } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import LiveMap from "@/components/map/LiveMap";

const LiveTrackingPage = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: () => routesAPI.getAll(),
  });
  const { data: buses = [] } = useQuery({
    queryKey: ["buses", selectedRouteId],
    queryFn: () => busesAPI.getAll(selectedRouteId),
    enabled: !!selectedRouteId,
    refetchInterval: 5000, // Poll every 5 seconds
  });

  const selectedRoute = routes.find((route) => route._id === selectedRouteId);

  const handleRouteChange = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  return (
    <MainLayout title="Live Bus Tracking">
      <div className="h-[calc(100vh-4rem)] bg-gray-100 text-gray-900">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full p-4">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Route
                </label>
                <Select value={selectedRouteId} onValueChange={handleRouteChange}>
                  <SelectTrigger className="w-full bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="Choose a route" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {isLoadingRoutes ? (
                      <SelectItem value="loading" disabled className="text-gray-500">
                        Loading routes...
                      </SelectItem>
                    ) : routes.length > 0 ? (
                      routes.map((route) => (
                        <SelectItem key={route._id} value={route._id} className="text-gray-900 hover:bg-blue-50">
                          <div className="flex flex-col">
                            <span className="font-medium">{route.start} → {route.end}</span>
                            <span className="text-xs text-gray-500">₹{route.fare}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-gray-500">
                        No routes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedRoute && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h3 className="font-semibold text-blue-900 mb-2">Route Details</h3>
                  <div className="space-y-1 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>From:</span>
                      <span className="font-medium">{selectedRoute.start}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>To:</span>
                      <span className="font-medium">{selectedRoute.end}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fare:</span>
                      <span className="font-medium">₹{selectedRoute.fare}</span>
                    </div>
                  </div>
                </div>
              )}

              {buses.length > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h3 className="font-semibold text-green-900 mb-2">Active Buses ({buses.length})</h3>
                  <div className="space-y-2">
                    {buses.map((bus) => (
                      <div
                        key={bus._id}
                        className="flex items-center justify-between p-2 bg-white rounded border border-green-200"
                      >
                        <div className="flex items-center">
                          <Bus className="h-4 w-4 text-green-600 mr-2" />
                          <div>
                            <div className="font-medium text-green-900">{bus.name}</div>
                            <div className="text-xs text-green-600">Capacity: {bus.capacity}</div>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedRouteId && (
                <div className="text-center p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <Bus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Select a route to view live bus locations</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <div className="h-full relative">
              {buses.length > 0 && selectedRoute ? (
                <LiveMap buses={buses} selectedRoute={selectedRoute} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {!selectedRouteId ? "Select a Route" : "No Active Buses"}
                    </h3>
                    <p className="text-gray-500">
                      {!selectedRouteId
                        ? "Choose a route from the panel to see live bus tracking"
                        : "There are no active buses on this route right now"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LiveTrackingPage;
