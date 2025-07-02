
import React from "react";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin } from "lucide-react";
import { toast } from "sonner";
import { LocationData, BusLocations } from "../types";
import { IBus } from "@/types";

interface MapControlsProps {
  userLocation: LocationData | null;
  isTracking: boolean;
  busPosition?: { lat: number; lng: number };
  buses: IBus[];
  selectedBusId?: string;
  busLocations: BusLocations;
  map: google.maps.Map | null;
  onToggleTracking: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
  userLocation,
  isTracking,
  busPosition,
  buses,
  selectedBusId,
  busLocations,
  map,
  onToggleTracking
}) => {
  const centerOnUser = () => {
    if (!map || !userLocation) {
      toast.error("Current location not available");
      return;
    }
    map.panTo({
      lat: userLocation.lat,
      lng: userLocation.lng
    });
    map.setZoom(15);
  };

  const centerOnBus = () => {
    if (!map) {
      toast.error("Map not available");
      return;
    }

    if (selectedBusId && busLocations[selectedBusId]) {
      const location = busLocations[selectedBusId];
      map.panTo({ lat: location.latitude, lng: location.longitude });
      map.setZoom(15);
    } else if (busPosition) {
      map.panTo(busPosition);
      map.setZoom(15);
    } else if (buses.length > 0) {
      map.panTo({ lat: 15.4909, lng: 73.8278 });
      map.setZoom(14);
    } else {
      toast.error("Bus location not available");
    }
  };

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
      <Button
        variant="default"
        size="sm"
        className="bg-white text-primary hover:bg-primary hover:text-white shadow-lg"
        onClick={onToggleTracking}
      >
        <MapPin className="mr-1 h-4 w-4" />
        {isTracking ? "Stop Tracking" : "Track Location"}
      </Button>
      
      {userLocation && (
        <Button
          variant="default"
          size="sm"
          className="bg-white text-primary hover:bg-primary hover:text-white shadow-lg"
          onClick={centerOnUser}
        >
          <Navigation className="mr-1 h-4 w-4" />
          Center on Me
        </Button>
      )}
      
      {(busPosition || buses.length > 0) && (
        <Button
          variant="default" 
          size="sm"
          className="bg-white text-primary hover:bg-primary hover:text-white shadow-lg"
          onClick={centerOnBus}
        >
          <Navigation className="mr-1 h-4 w-4" />
          Center on Bus
        </Button>
      )}
    </div>
  );
};

export default MapControls;
