
import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Navigation, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { IBus } from '@/types';
import { BusLocation } from '@/services/liveTrackingService';

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
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Track user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation not supported");
      return;
    }

    let watchId: number;
    
    try {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userLoc);
          
          // Update user marker if map is already initialized
          if (googleMapRef.current && markersRef.current['user']) {
            markersRef.current['user'].setPosition(userLoc);
          }
          
          setIsConnected(true);
        },
        (error) => {
          console.error("Error watching position:", error);
          setIsConnected(false);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 10000,  // Accept positions that are up to 10 seconds old
          timeout: 5000       // Wait up to 5 seconds for a position
        }
      );
    } catch (error) {
      console.error("Geolocation error:", error);
    }
    
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  // Initialize Google Maps
  useEffect(() => {
    // Check if Google Maps API is loaded
    if (!window.google || !window.google.maps) {
      setMapError("Google Maps API not loaded properly");
      return;
    }
    
    // Initialize info window
    if (!infoWindowRef.current) {
      infoWindowRef.current = new window.google.maps.InfoWindow();
    }
    
    // Default center - Delhi
    const defaultCenter = { lat: 28.7041, lng: 77.1025 };
    const mapCenter = userLocation || defaultCenter;
    
    // Initialize the map
    if (mapRef.current && !googleMapRef.current) {
      googleMapRef.current = new window.google.maps.Map(mapRef.current, {
        center: mapCenter,
        zoom: 14,
        streetViewControl: false,
        mapTypeControl: true,
        fullscreenControl: true,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "transit",
            elementType: "labels.icon",
            stylers: [{ visibility: "on" }],
          },
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }],
          },
        ],
      });
      
      // Add user location button
      const locationButton = document.createElement("button");
      locationButton.textContent = "📍";
      locationButton.classList.add("bg-white", "p-2", "rounded-full", "shadow-md", "hover:bg-gray-100");
      locationButton.title = "Go to your location";
      
      locationButton.addEventListener("click", () => {
        if (userLocation && googleMapRef.current) {
          googleMapRef.current.panTo(userLocation);
          googleMapRef.current.setZoom(16);
        }
      });
      
      googleMapRef.current.controls[window.google.maps.ControlPosition.TOP_RIGHT].push(locationButton);
    }
    
    // Add user marker if location is available
    if (userLocation && googleMapRef.current) {
      if (markersRef.current['user']) {
        markersRef.current['user'].setPosition(userLocation);
      } else {
        markersRef.current['user'] = new window.google.maps.Marker({
          position: userLocation,
          map: googleMapRef.current,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#4285F4",
            fillOpacity: 1,
            strokeColor: "#FFFFFF",
            strokeWeight: 2,
          },
          title: "Your Location",
          zIndex: 100,
        });
        
        // Add accuracy circle
        new window.google.maps.Circle({
          map: googleMapRef.current,
          center: userLocation,
          radius: 50, // in meters
          strokeColor: "#4285F4",
          strokeOpacity: 0.2,
          strokeWeight: 1,
          fillColor: "#4285F4",
          fillOpacity: 0.1,
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
      const heading = location.heading || 0;
      
      // Icon for bus with direction
      const createBusIcon = (isSelected: boolean, heading: number) => {
        const scale = isSelected ? 0.08 : 0.06;
        return {
          path: "M12.5,0 L21.125,19.25 L13.5,17.5 L12.5,21 L11.5,17.5 L3.875,19.25 L12.5,0 Z",
          fillColor: isSelected ? "#FF5F05" : "#F97316",
          fillOpacity: 1,
          scale: scale,
          strokeColor: 'white',
          strokeWeight: 1,
          rotation: heading,
          anchor: new window.google.maps.Point(12.5, 12.5),
        };
      };
      
      // Check if marker already exists
      if (markersRef.current[busId]) {
        // Update marker position
        markersRef.current[busId].setPosition(position);
        
        // Update icon with new heading and selected status
        markersRef.current[busId].setIcon(createBusIcon(isSelected, heading));
      } else {
        // Create new marker
        const marker = new window.google.maps.Marker({
          position,
          map: googleMapRef.current,
          icon: createBusIcon(isSelected, heading),
          title: bus?.name || `Bus ${busId}`,
          animation: window.google.maps.Animation.DROP,
          optimized: true,
        });
        
        // Add click handler
        marker.addListener("click", () => {
          if (infoWindowRef.current) {
            const speed = location.speed ? `${Math.round(location.speed)} km/h` : 'N/A';
            const timeSinceUpdate = Math.round((new Date().getTime() - new Date(location.updatedAt).getTime()) / 1000);
            const timeText = timeSinceUpdate < 60 ? `${timeSinceUpdate} seconds ago` : `${Math.floor(timeSinceUpdate / 60)} minutes ago`;
            
            infoWindowRef.current.setContent(`
              <div style="padding: 8px;">
                <h3 style="margin: 0; color: #F97316; font-weight: bold;">${bus?.name || `Bus ${busId}`}</h3>
                <p style="margin: 4px 0;">Speed: ${speed}</p>
                <p style="margin: 4px 0;">Updated: ${timeText}</p>
              </div>
            `);
            infoWindowRef.current.open(googleMapRef.current, marker);
          }
          onSelectBus(busId);
        });
        
        // Store reference to marker
        markersRef.current[busId] = marker;
      }
    });
    
    // Remove markers for buses that are no longer tracked
    Object.keys(markersRef.current).forEach((markerId) => {
      if (markerId !== 'user' && !busLocations[markerId]) {
        markersRef.current[markerId].setMap(null);
        delete markersRef.current[markerId];
      }
    });
    
    // Center on selected bus if available
    if (selectedBusId && busLocations[selectedBusId]) {
      const selectedLocation = busLocations[selectedBusId];
      googleMapRef.current.panTo({ 
        lat: selectedLocation.lat, 
        lng: selectedLocation.lng 
      });
      
      // Zoom in a bit
      if (googleMapRef.current.getZoom() < 15) {
        googleMapRef.current.setZoom(15);
      }
    }
    
  }, [busLocations, buses, selectedBusId, onSelectBus]);

  if (mapError) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-orange-50">
        <AlertCircle className="h-12 w-12 text-transit-orange mb-4" />
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
            <Wifi className="h-4 w-4 text-transit-orange mr-2" />
            <span className="text-xs font-medium text-transit-orange">Live Tracking Active</span>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-transit-red mr-2" />
            <span className="text-xs font-medium text-transit-red">Connection Lost</span>
          </>
        )}
      </div>
      
      {/* Map legend */}
      <div className="absolute bottom-2 left-2 z-20 bg-white/90 px-3 py-2 rounded-md shadow-md">
        <div className="text-xs font-medium mb-1 text-muted-foreground">Map Legend</div>
        <div className="flex items-center my-1">
          <div className="w-3 h-3 rounded-full bg-[#4285F4] border border-white mr-2"></div>
          <span className="text-xs">Your location</span>
        </div>
        <div className="flex items-center my-1">
          <div className="w-3 h-3 bg-transit-orange mr-2" style={{clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'}}></div>
          <span className="text-xs">Bus location</span>
        </div>
        <div className="flex items-center my-1">
          <div className="w-3 h-3 bg-[#FF5F05] mr-2" style={{clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)'}}></div>
          <span className="text-xs">Selected bus</span>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
