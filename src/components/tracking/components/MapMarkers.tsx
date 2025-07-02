
import { useEffect } from "react";
import { IBus, IRoute } from "@/types";
import { BusLocations, MapStation, defaultCenter } from "../types";
import { LocationData } from "@/services/locationService";

interface MapMarkersProps {
  map: google.maps.Map | null;
  buses: IBus[];
  selectedRoute?: IRoute;
  busLocations: BusLocations;
  busPosition?: { lat: number; lng: number };
  stations: MapStation[];
  userLocation: LocationData | null;
  selectedBusId?: string;
  onBusSelect?: (busId: string) => void;
  busMarkers: { [busId: string]: google.maps.Marker };
  setBusMarkers: (markers: { [busId: string]: google.maps.Marker }) => void;
  userMarker: google.maps.Marker | null;
  setUserMarker: (marker: google.maps.Marker | null) => void;
  stationMarkers: google.maps.Marker[];
  setStationMarkers: (markers: google.maps.Marker[]) => void;
}

const MapMarkers: React.FC<MapMarkersProps> = ({
  map,
  buses,
  selectedRoute,
  busLocations,
  busPosition,
  stations,
  userLocation,
  selectedBusId,
  onBusSelect,
  busMarkers,
  setBusMarkers,
  userMarker,
  setUserMarker,
  stationMarkers,
  setStationMarkers
}) => {
  // User location marker
  useEffect(() => {
    if (!map || !userLocation) return;

    if (userMarker) {
      userMarker.setPosition({
        lat: userLocation.lat,
        lng: userLocation.lng
      });
    } else {
      const newUserMarker = new google.maps.Marker({
        position: {
          lat: userLocation.lat,
          lng: userLocation.lng
        },
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#4285F4",
          fillOpacity: 1,
          strokeWeight: 3,
          strokeColor: "#FFFFFF"
        },
        title: "Your Location"
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>Your Current Location</strong><br/>
                  Accuracy: ${userLocation.accuracy?.toFixed(0)}m</div>`
      });

      newUserMarker.addListener("click", () => {
        infoWindow.open(map, newUserMarker);
      });

      setUserMarker(newUserMarker);
    }
  }, [map, userLocation, userMarker, setUserMarker]);

  // Bus markers
  useEffect(() => {
    if (!map || buses.length === 0) return;

    Object.values(busMarkers).forEach(marker => marker.setMap(null));
    setBusMarkers({});

    const newMarkers: { [busId: string]: google.maps.Marker } = {};
    
    buses.forEach((bus) => {
      const mockLocation = {
        lat: defaultCenter.lat + (Math.random() - 0.5) * 0.02,
        lng: defaultCenter.lng + (Math.random() - 0.5) * 0.02
      };

      const marker = new google.maps.Marker({
        position: mockLocation,
        map,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: selectedBusId === bus._id ? "#4CAF50" : "#FF5722",
          fillOpacity: 1,
          strokeWeight: 2,
          strokeColor: "#FFFFFF"
        },
        title: `Bus ${bus.name}`
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2">
          <strong>Bus ${bus.name}</strong><br/>
          Capacity: ${bus.capacity}<br/>
          ${selectedRoute ? `Route: ${selectedRoute.start} → ${selectedRoute.end}` : ''}
        </div>`
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
        if (onBusSelect) {
          onBusSelect(bus._id);
        }
        map.panTo(mockLocation);
        map.setZoom(15);
      });

      newMarkers[bus._id] = marker;
    });

    setBusMarkers(newMarkers);
  }, [map, buses, selectedRoute, selectedBusId, onBusSelect, busMarkers, setBusMarkers]);

  // Legacy bus position marker
  useEffect(() => {
    if (!map || !busPosition || buses.length > 0) return;

    const legacyBusMarker = new google.maps.Marker({
      position: busPosition,
      map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#FF5722",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF"
      },
      title: "Bus Location"
    });

    legacyBusMarker.addListener("click", () => {
      if (onBusSelect) {
        onBusSelect("legacy-bus");
      }
      map.panTo(busPosition);
      map.setZoom(15);
    });

    return () => {
      legacyBusMarker.setMap(null);
    };
  }, [map, busPosition, buses, onBusSelect]);

  // Station markers
  useEffect(() => {
    if (!map) return;

    stationMarkers.forEach(marker => marker.setMap(null));
    setStationMarkers([]);

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
          strokeColor: "#FFFFFF"
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `<div class="p-2"><strong>${station.name}</strong></div>`
      });

      marker.addListener("click", () => {
        infoWindow.open(map, marker);
      });

      return marker;
    });

    setStationMarkers(newMarkers);
  }, [map, stations, stationMarkers, setStationMarkers]);

  return null;
};

export default MapMarkers;
