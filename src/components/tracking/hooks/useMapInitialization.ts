
import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { toast } from "sonner";
import { defaultCenter, defaultZoom } from "../types";

export const useMapInitialization = (center = defaultCenter, zoom = defaultZoom) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          console.error("Google Maps API key is missing");
          toast.error("Unable to load map. API key missing.");
          return;
        }

        const loader = new Loader({
          apiKey,
          version: "weekly"
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
              stylers: [{ visibility: "on" }]
            },
            {
              featureType: "transit.station.bus",
              elementType: "labels.icon",
              stylers: [{ visibility: "on" }]
            }
          ]
        });

        setMap(mapInstance);
      } catch (error) {
        console.error("Error initializing Google Maps:", error);
        toast.error("Failed to load the map. Please try again.");
      }
    };

    initMap();
  }, [center, zoom]);

  return { mapRef, map };
};
