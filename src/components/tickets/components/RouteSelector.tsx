
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface RouteSelectorProps {
  routes: any[];
  selectedRouteId: string;
  onRouteChange: (value: string) => void;
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
      <Label className="text-sm font-medium text-gray-300 mb-2 block">
        <MapPin className="inline h-4 w-4 mr-1" />
        Select Route
      </Label>
      <Select value={selectedRouteId} onValueChange={onRouteChange} disabled={isLoading}>
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder={isLoading ? "Loading routes..." : "Choose a route"} />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {routes.filter(route => route._id && route.name).map((route) => (
            <SelectItem key={route._id} value={route._id} className="text-white hover:bg-gray-700">
              {route.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
