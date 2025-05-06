
import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { IBus } from '@/types';

interface BusLocation {
  lat: number;
  lng: number;
  updatedAt: Date;
}

interface LiveMapProps {
  buses: IBus[];
  busLocations: { [key: string]: BusLocation };
  selectedBusId?: string;
  onSelectBus: (busId: string) => void;
}

const LiveMap: React.FC<LiveMapProps> = ({ 
  buses, 
  busLocations, 
  selectedBusId,
  onSelectBus 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  
  // Watch user's location
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    let watchId: number;
    
    try {
      // Get user's location once
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setMapError("Could not access your location");
        }
      );
      
      // Then watch for changes
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsConnected(true);
        },
        (error) => {
          console.error("Error watching location:", error);
          setIsConnected(false);
        }
      );
    } catch (error) {
      console.error("Geolocation error:", error);
    }
    
    // In a real implementation, we'd initialize an actual map library here
    
    return () => {
      // Cleanup resources
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const renderBusMarker = (busId: string, index: number) => {
    const location = busLocations[busId];
    if (!location) return null;
    
    const bus = buses.find(b => b._id === busId);
    const isSelected = selectedBusId === busId;
    
    // In a real app, these would be actual map markers
    return (
      <div 
        key={busId}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
        style={{ 
          left: `${((location.lng - 77.05) / 0.1) * 100}%`, 
          top: `${((28.75 - location.lat) / 0.1) * 100}%`,
          zIndex: isSelected ? 10 : 1
        }}
        onClick={() => onSelectBus(busId)}
      >
        <div className={`
          flex flex-col items-center
          ${isSelected ? 'scale-110' : ''}
        `}>
          <div className={`
            p-2 rounded-full 
            ${isSelected ? 'bg-transit-orange text-white' : 'bg-white text-transit-orange'}
            shadow-lg border-2
            ${isSelected ? 'border-white' : 'border-transit-orange'}
            transition-all duration-300
          `}>
            <Navigation className={`h-5 w-5 ${isSelected ? 'animate-pulse' : ''}`} />
          </div>
          <div className={`
            mt-1 px-2 py-1 text-xs font-bold rounded-md shadow
            ${isSelected ? 'bg-transit-orange text-white' : 'bg-white text-transit-orange'}
          `}>
            {bus?.name || `Bus ${index + 1}`}
          </div>
        </div>
      </div>
    );
  };

  if (mapError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-100">
        <AlertCircle className="h-12 w-12 text-transit-red mb-4" />
        <h3 className="text-lg font-semibold">Map Error</h3>
        <p className="text-muted-foreground">{mapError}</p>
      </div>
    );
  }

  return (
    <div ref={mapContainerRef} className="h-full w-full relative bg-blue-50 overflow-hidden">
      {/* Simulated map background with grid lines */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzhlOWZhZiIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')]" />
      
      {/* Connection status indicator */}
      <div className="absolute top-2 left-2 z-20 bg-white/80 px-2 py-1 rounded-md shadow-md flex items-center">
        {isConnected ? (
          <>
            <Wifi className="h-4 w-4 text-transit-green mr-2" />
            <span className="text-xs font-medium text-transit-green">Live Tracking Active</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-transit-red mr-2" />
            <span className="text-xs font-medium text-transit-red">Connection Lost</span>
          </>
        )}
      </div>
      
      {/* User location marker */}
      {userLocation && (
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ 
            left: `${((userLocation.lng - 77.05) / 0.1) * 100}%`, 
            top: `${((28.75 - userLocation.lat) / 0.1) * 100}%` 
          }}
        >
          <div className="flex flex-col items-center">
            <div className="p-2 rounded-full bg-transit-blue text-white shadow-lg animate-pulse">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="mt-1 px-2 py-1 text-xs font-bold bg-transit-blue text-white rounded-md shadow">
              You
            </div>
          </div>
        </div>
      )}
      
      {/* Bus markers */}
      {Object.keys(busLocations).map((busId, index) => renderBusMarker(busId, index))}
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col space-y-2">
        <button className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50">
          <Navigation className="h-5 w-5 text-transit-orange" />
        </button>
        <button className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50">+</button>
        <button className="p-2 bg-white rounded-md shadow-md hover:bg-gray-50">-</button>
      </div>
      
      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground bg-white/80 px-2 py-1 rounded">
        Interactive Map Simulation
      </div>
    </div>
  );
};

export default LiveMap;
