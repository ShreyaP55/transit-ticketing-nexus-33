
import React, { useState } from "react";
import { IBus, IRoute } from "@/types";
import { BusLocations, MapStation, defaultCenter, defaultZoom } from "./types";
import { useLocationTracking } from "./hooks/useLocationTracking";
import { useMapInitialization } from "./hooks/useMapInitialization";
import MapControls from "./components/MapControls";
import MapMarkers from "./components/MapMarkers";

interface LiveMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  buses?: IBus[];
  selectedRoute?: IRoute;
  busLocations?: BusLocations;
  busPosition?: { lat: number; lng: number };
  stations?: MapStation[];
  onBusSelect?: (busId: string) => void;
  onSelectBus?: (busId: string) => void;
  selectedBusId?: string;
  className?: string;
}

const LiveMap: React.FC<LiveMapProps> = ({
  center = defaultCenter,
  zoom = defaultZoom,
  buses = [],
  selectedRoute,
  busLocations = {},
  busPosition,
  stations = [],
  onBusSelect,
  onSelectBus,
  selectedBusId,
  className = ""
}) => {
  const { mapRef, map } = useMapInitialization(center, zoom);
  const { userLocation, isTracking, toggleLocationTracking } = useLocationTracking();
  
  const [busMarkers, setBusMarkers] = useState<{ [busId: string]: google.maps.Marker }>({});
  const [userMarker, setUserMarker] = useState<google.maps.Marker | null>(null);
  const [stationMarkers, setStationMarkers] = useState<google.maps.Marker[]>([]);

  const handleBusSelect = onBusSelect || onSelectBus;

  return (
    <div className={`relative w-full h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-md"
      />
      
      <MapMarkers
        map={map}
        buses={buses}
        selectedRoute={selectedRoute}
        busLocations={busLocations}
        busPosition={busPosition}
        stations={stations}
        userLocation={userLocation}
        selectedBusId={selectedBusId}
        onBusSelect={handleBusSelect}
        busMarkers={busMarkers}
        setBusMarkers={setBusMarkers}
        userMarker={userMarker}
        setUserMarker={setUserMarker}
        stationMarkers={stationMarkers}
        setStationMarkers={setStationMarkers}
      />
      
      <MapControls
        userLocation={userLocation}
        isTracking={isTracking}
        busPosition={busPosition}
        buses={buses}
        selectedBusId={selectedBusId}
        busLocations={busLocations}
        map={map}
        onToggleTracking={toggleLocationTracking}
      />

      {isTracking && (
        <div className="absolute top-4 left-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
          📍 Live Location Active
        </div>
      )}
    </div>
  );
};

export default LiveMap;
