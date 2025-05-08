
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Bus, Navigation } from "lucide-react";

interface LiveMapProps {
  center?: google.maps.LatLngLiteral;
  zoom?: number;
  busPosition?: google.maps.LatLngLiteral;
  stations?: Array<{
    name: string;
    position: google.maps.LatLngLiteral;
  }>;
  onBusSelect?: (busId: string) => void;
  selectedBusId?: string;
}

const defaultCenter = { lat: 15.4909, lng: 73.8278 }; // Goa
const defaultZoom = 13;

export const LiveMap: React.FC<LiveMapProps> = ({
  center = defaultCenter,
  zoom = defaultZoom,
  busPosition,
  stations = [],
  onBusSelect,
  selectedBusId,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [busMarker, setBusMarker] = useState<google.maps.Marker | null>(null);
  const [stationMarkers, setStationMarkers] = useState<google.maps.Marker[]>([]);
  const [busPath, setBusPath] = useState<google.maps.Polyline | null>(null);
  const { toast } = useToast();

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error("Google Maps API key is missing");
          toast({
            title: "Map Error",
            description: "Unable to load map. API key missing.",
            variant: "destructive",
          });
          return;
        }

        const loader = new Loader({
          apiKey,
          version: "weekly",
        });

        const google = await loader.load();
        
        if (!mapRef.current) return;
        
        const mapInstance = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          styles: [
            {
              featureType: "transit",
              elementType: "all",
              stylers: [{ visibility: "on" }],
            },
            {
              featureType: "transit.station.bus",
              elementType: "labels.icon",
              stylers: [{ visibility: "on" }],
            },
          ],
        });
        
        setMap(mapInstance);
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
        toast({
          title: "Map Error",
          description: "Failed to load the map. Please try again.",
          variant: "destructive",
        });
      }
    };

    initMap();
  }, [toast]);

  // Create or update bus marker
  useEffect(() => {
    if (!map || !busPosition) return;
    
    if (busMarker) {
      busMarker.setPosition(busPosition);
    } else {
      const newBusMarker = new google.maps.Marker({
        position: busPosition,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#FF5722",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
        title: "Bus Location",
      });
      
      newBusMarker.addListener("click", () => {
        if (onBusSelect) {
          onBusSelect("bus-1");
        }
        
        map.panTo(busPosition);
        map.setZoom(15);
      });
      
      setBusMarker(newBusMarker);
    }
  }, [map, busPosition, busMarker, onBusSelect]);

  // Create or update station markers
  useEffect(() => {
    if (!map) return;
    
    // Clear old markers
    stationMarkers.forEach(marker => marker.setMap(null));
    setStationMarkers([]);
    
    // Create new markers
    const newMarkers = stations.map(station => {
      const marker = new google.maps.Marker({
        position: station.position,
        map,
        title: station.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 6,
          fillColor: "#6E59A5",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
      });
      
      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `<div><strong>${station.name}</strong></div>`,
      });
      
      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });
      
      return marker;
    });
    
    setStationMarkers(newMarkers);
  }, [map, stations]);

  // Create or update the bus path
  useEffect(() => {
    if (!map || !busPosition || stations.length === 0) return;
    
    if (busPath) {
      busPath.setMap(null);
    }
    
    const path = [
      busPosition,
      ...stations.map(station => station.position),
    ];
    
    const newPath = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: "#FF5722",
      strokeOpacity: 0.8,
      strokeWeight: 3,
    });
    
    newPath.setMap(map);
    setBusPath(newPath);
  }, [map, busPosition, stations]);

  const centerOnBus = () => {
    if (!map || !busPosition) return;
    
    map.panTo(busPosition);
    map.setZoom(15);
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-md" />
      
      <div className="absolute bottom-4 right-4 z-10">
        <Button 
          variant="default"
          className="bg-white text-transit-orange hover:bg-transit-orange hover:text-white"
          onClick={centerOnBus}
        >
          <Navigation className="mr-2 h-4 w-4" />
          Center on Bus
        </Button>
      </div>
    </div>
  );
};
