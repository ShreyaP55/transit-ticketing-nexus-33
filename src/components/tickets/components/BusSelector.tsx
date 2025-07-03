
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Bus } from "lucide-react";

interface BusSelectorProps {
  buses: any[];
  selectedBusId: string;
  onBusChange: (value: string) => void;
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
  if (!selectedRouteId) return null;

  return (
    <div>
      <Label className="text-sm font-medium text-gray-300 mb-2 block">
        <Bus className="inline h-4 w-4 mr-1" />
        Select Bus
      </Label>
      <Select value={selectedBusId} onValueChange={onBusChange} disabled={isLoading}>
        <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
          <SelectValue placeholder={isLoading ? "Loading buses..." : "Choose a bus"} />
        </SelectTrigger>
        <SelectContent className="bg-gray-800 border-gray-600">
          {buses.filter(bus => bus._id && bus.name).map((bus) => (
            <SelectItem key={bus._id} value={bus._id} className="text-white hover:bg-gray-700">
              {bus.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
