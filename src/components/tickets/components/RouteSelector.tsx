
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface Route {
  _id: string;
  start: string;
  end: string;
}

interface RouteSelectorProps {
  routes: Route[];
  selectedRouteId: string;
  onRouteChange: (routeId: string) => void;
  isLoading: boolean;
}

export const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedRouteId,
  onRouteChange,
  isLoading,
}) => {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-white">Route</label>
      <Select value={selectedRouteId} onValueChange={onRouteChange} disabled={isLoading}>
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder="Select a route" />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : routes.length ? (
            routes.map(route => (
              <SelectItem key={route._id} value={route._id} className="text-white">
                {route.start} - {route.end}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No routes available</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
