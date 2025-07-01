import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { routesAPI, busesAPI } from '@/services/api';
import { IRoute, IBus } from '@/types';
import { Bus, MapPin } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { LiveMap } from '@/components/maps/LiveMap';

const AdminLiveTrackingPage = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);
  const [buses, setBuses] = useState<IBus[]>([]);

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: () => routesAPI.getAll(),
  });

  useEffect(() => {
    if (selectedRouteId && routes) {
      const route = routes.find((r: IRoute) => r._id === selectedRouteId);
      setSelectedRoute(route || null);
    } else {
      setSelectedRoute(null);
    }
  }, [selectedRouteId, routes]);

  useEffect(() => {
    if (selectedRouteId) {
      busesAPI.getAll(selectedRouteId)
        .then(buses => setBuses(buses))
        .catch(error => console.error("Error fetching buses:", error));
    } else {
      setBuses([]);
    }
  }, [selectedRouteId]);

  const handleRouteChange = (routeId: string) => {
    setSelectedRouteId(routeId);
  };

  return (
    <MainLayout title="Admin Live Tracking">
      <div className="h-[calc(100vh-4rem)] bg-gray-900 text-white">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full p-4">
          {/* Control Panel */}
          <div className="lg:col-span-1 space-y-4 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Select Route
                </label>
                <Select value={selectedRouteId} onValueChange={handleRouteChange}>
                  <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring-blue-400">
                    <SelectValue placeholder="Choose a route" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {isLoadingRoutes ? (
                      <SelectItem value="loading" disabled className="text-gray-400">
                        Loading routes...
                      </SelectItem>
                    ) : routes.length > 0 ? (
                      routes.map((route) => (
                        <SelectItem key={route._id} value={route._id} className="text-white hover:bg-gray-600">
                          <div className="flex flex-col">
                            <span className="font-medium">{route.start} → {route.end}</span>
                            <span className="text-xs text-gray-300">₹{route.fare}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled className="text-gray-400">
                        No routes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedRoute && (
                <div className="bg-blue-900/50 border border-blue-600 rounded-lg p-3">
                  <h3 className="font-semibold text-blue-200 mb-2">Route Details</h3>
                  <div className="space-y-1 text-sm text-blue-100">
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
                <div className="bg-green-900/50 border border-green-600 rounded-lg p-3">
                  <h3 className="font-semibold text-green-200 mb-2">Active Buses ({buses.length})</h3>
                  <div className="space-y-2">
                    {buses.map((bus) => (
                      <div
                        key={bus._id}
                        className="flex items-center justify-between p-2 bg-gray-700 rounded border border-green-600"
                      >
                        <div className="flex items-center">
                          <Bus className="h-4 w-4 text-green-400 mr-2" />
                          <div>
                            <div className="font-medium text-green-200">{bus.name}</div>
                            <div className="text-xs text-green-300">Capacity: {bus.capacity}</div>
                          </div>
                        </div>
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!selectedRouteId && (
                <div className="text-center p-4 bg-gray-700 border border-gray-600 rounded-lg">
                  <Bus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-300">Select a route to view live bus locations</p>
                </div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
            <div className="h-full relative">
              {buses.length > 0 && selectedRoute ? (
                <LiveMap buses={buses} selectedRoute={selectedRoute} />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-700">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-200 mb-2">
                      {!selectedRouteId ? "Select a Route" : "No Active Buses"}
                    </h3>
                    <p className="text-gray-400">
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

export default AdminLiveTrackingPage;
