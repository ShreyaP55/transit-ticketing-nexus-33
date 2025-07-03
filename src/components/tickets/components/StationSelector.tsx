
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin } from "lucide-react";

interface StationSelectorProps {
  stations: any[];
  selectedStationId: string;
  onStationChange: (value: string) => void;
  selectedBusId: string;
  isLoading: boolean;
}

export const StationSelector: React.FC<StationSelectorProps> = ({
  stations,
  selectedStationId,
  onStationChange,
  selectedBusId,
  isLoading,
}) => {
  if (!selectedBusId) return null;

  return (
    <div>
      <Label className="text-sm font-medium text-gray-300 mb-2 block">
        <MapPin className="inline h-4 w-4 mr-1" />
        Select Station
      </Label>
      <Select value={selectedStationId} onValueChange={onStationChange} disabled={isLoading}>
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder={isLoading ? "Loading stations..." : "Choose a station"} />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {stations.filter(station => station._id && station.name).map((station) => (
            <SelectItem key={station._id} value={station._id} className="text-white hover:bg-gray-700">
              {station.name} - ₹{station.fare}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
