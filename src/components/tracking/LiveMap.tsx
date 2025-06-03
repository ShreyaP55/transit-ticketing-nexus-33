
import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Bus, Navigation } from "lucide-react";
import { IBus } from "@/types";

interface BusLocation {
  lat: number;
  lng: number;
  updatedAt: Date;
  speed?: number;
  heading?: number;
}

interface LiveMapProps {
  buses: IBus[];
  busLocations: { [busId: string]: BusLocation };
  selectedBusId?: string;
  onSelectBus: (busId: string) => void;
}

const defaultCenter = { lat: 15.4909, lng: 73.8278 }; // Goa
const defaultZoom = 13;

export const LiveMap: React.FC<LiveMapProps> = ({
  buses = [],
  busLocations = {},
  selectedBusId,
  onSelectBus,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [busMarkers, setBusMarkers] = useState<{ [busId: string]: google.maps.Marker }>({});
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
          center: defaultCenter,
          zoom: defaultZoom,
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

  // Update bus markers
  useEffect(() => {
    if (!map || !buses.length) return;

    // Clear old markers
    Object.values(busMarkers).forEach(marker => marker.setMap(null));
    const newMarkers: { [busId: string]: google.maps.Marker } = {};

    // Create markers for buses with locations
    buses.forEach(bus => {
      const location = busLocations[bus._id];
      if (!location) return;

      const marker = new google.maps.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: selectedBusId === bus._id ? 12 : 8,
          fillColor: selectedBusId === bus._id ? "#FF5722" : "#2196F3",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF",
        },
        title: bus.name,
      });

      marker.addListener("click", () => {
        onSelectBus(bus._id);
        map.panTo({ lat: location.lat, lng: location.lng });
        map.setZoom(15);
      });

      newMarkers[bus._id] = marker;
    });

    setBusMarkers(newMarkers);
  }, [map, buses, busLocations, selectedBusId, onSelectBus]);

  const centerOnSelectedBus = () => {
    if (!map || !selectedBusId || !busLocations[selectedBusId]) return;
    
    const location = busLocations[selectedBusId];
    map.panTo({ lat: location.lat, lng: location.lng });
    map.setZoom(15);
  };

  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div ref={mapRef} className="w-full h-full rounded-lg shadow-md" />
      
      {selectedBusId && busLocations[selectedBusId] && (
        <div className="absolute bottom-4 right-4 z-10">
          <Button 
            variant="default"
            className="bg-white text-transit-orange hover:bg-transit-orange hover:text-white"
            onClick={centerOnSelectedBus}
          >
            <Navigation className="mr-2 h-4 w-4" />
            Center on Bus
          </Button>
        </div>
      )}
    </div>
  );
};

export default LiveMap;
