
import React from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Bus {
  _id: string;
  name: string;
  capacity: number;
}

interface BusSelectorProps {
  buses: Bus[];
  selectedBusId: string;
  onBusChange: (busId: string) => void;
  selectedRouteId: string;
  isLoading: boolean;
}

export const BusSelector: React.FC<BusSelectorProps> = ({
  buses,
  selectedBusId,
  onBusChange,
  selectedRouteId,
  isLoading,
}) => {
  return (
    <div>
      <label className="block mb-1 text-sm font-medium text-white">Bus</label>
      <Select 
        value={selectedBusId} 
        onValueChange={onBusChange} 
        disabled={!selectedRouteId || isLoading}
      >
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder={!selectedRouteId ? "Select a route first" : "Select a bus"} />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {isLoading ? (
            <SelectItem value="loading" disabled>Loading...</SelectItem>
          ) : buses.length ? (
            buses.map(bus => (
              <SelectItem key={bus._id} value={bus._id} className="text-white">
                {bus.name} <Badge className="ml-2 bg-gray-700" variant="outline">cap: {bus.capacity}</Badge>
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No buses available</SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};
