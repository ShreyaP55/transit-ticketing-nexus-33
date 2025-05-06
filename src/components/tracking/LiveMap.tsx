
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
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<{[key: string]: google.maps.Marker}>({});
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isConnected, setIsConnected] = useState(true);

  // Initialize Google Maps
  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      setMapError("Google Maps API not loaded properly");
      return;
    }

    // Get user's location
    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } catch (error) {
      console.error("Geolocation error:", error);
    }

    // Default center - Delhi
    const defaultCenter = { lat: 28.7041, lng: 77.1025 };
    const mapCenter = userLocation || defaultCenter;
    
    // Initialize the map
    if (mapRef.current && !googleMapRef.current) {
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 12,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        styles: [
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "on" }],
          },
        ],
      });

      // Add user marker if location is available
      if (userLocation) {
        new google.maps.Marker({
          position: userLocation,
          map: googleMapRef.current,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            scaledSize: new google.maps.Size(40, 40),
          },
          title: "Your Location",
        });
      }
    }
  }, [userLocation]);

  // Update bus markers whenever bus locations change
  useEffect(() => {
    if (!googleMapRef.current) return;
    
    // Update existing markers and create new ones
    Object.keys(busLocations).forEach((busId) => {
      const location = busLocations[busId];
      const bus = buses.find(b => b._id === busId);
      const isSelected = selectedBusId === busId;
      
      if (!location) return;
      
      const position = { lat: location.lat, lng: location.lng };
      
      // Check if marker already exists
      if (markersRef.current[busId]) {
        // Update marker position
        markersRef.current[busId].setPosition(position);
        
        // Update icon if selected status changed
        markersRef.current[busId].setIcon({
          url: isSelected 
            ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" 
            : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
          scaledSize: new google.maps.Size(isSelected ? 50 : 40, isSelected ? 50 : 40),
        });
      } else {
        // Create new marker
        const marker = new google.maps.Marker({
          position,
          map: googleMapRef.current,
          icon: {
            url: isSelected 
              ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png" 
              : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
            scaledSize: new google.maps.Size(isSelected ? 50 : 40, isSelected ? 50 : 40),
          },
          title: bus?.name || `Bus ${busId}`,
          animation: google.maps.Animation.DROP,
        });
        
        // Add click handler
        marker.addListener("click", () => {
          onSelectBus(busId);
        });
        
        // Store reference to marker
        markersRef.current[busId] = marker;
      }
    });
    
    // Remove markers for buses that are no longer tracked
    Object.keys(markersRef.current).forEach((busId) => {
      if (!busLocations[busId]) {
        markersRef.current[busId].setMap(null);
        delete markersRef.current[busId];
      }
    });
    
    // Center on selected bus if available
    if (selectedBusId && busLocations[selectedBusId]) {
      const selectedLocation = busLocations[selectedBusId];
      googleMapRef.current.panTo({ 
        lat: selectedLocation.lat, 
        lng: selectedLocation.lng 
      });
    }
    
  }, [busLocations, buses, selectedBusId, onSelectBus]);

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
    <div className="h-full w-full relative overflow-hidden">
      {/* Google Map Container */}
      <div ref={mapRef} className="h-full w-full"></div>
      
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
    </div>
  );
};

export default LiveMap;
