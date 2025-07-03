
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { IRoute } from "@/types";

interface BusFiltersProps {
  routes: IRoute[];
  isLoadingRoutes: boolean;
  selectedRouteId: string;
  onRouteFilter: (routeId: string) => void;
}

const BusFilters: React.FC<BusFiltersProps> = ({
  routes,
  isLoadingRoutes,
  selectedRouteId,
  onRouteFilter,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="route-filter" className="text-sm font-medium">
          Filter by Route
        </Label>
        <Select value={selectedRouteId} onValueChange={onRouteFilter}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="All routes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All routes</SelectItem>
            {routes.filter(route => route._id && route.start && route.end).map((route) => (
              <SelectItem key={route._id} value={route._id}>
                {route.start} - {route.end}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BusFilters;
