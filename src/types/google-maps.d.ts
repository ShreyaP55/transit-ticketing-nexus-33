
declare global {
  interface Window {
    google: typeof google;
  }
}

// Google Maps JavaScript API type definitions
declare namespace google {
  namespace maps {
    class Map {
      constructor(mapDiv: Element, options?: MapOptions);
      setCenter(latLng: LatLng): void;
      setZoom(zoom: number): void;
      panTo(latLng: LatLng): void;
    }

    class Marker {
      constructor(opts?: MarkerOptions);
      setPosition(latLng: LatLng): void;
      setMap(map: Map | null): void;
      setIcon(icon: string | Icon | Symbol): void;
      setRotation(rotation: number): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      lat(): number;
      lng(): number;
      toJSON(): { lat: number; lng: number };
    }

    interface MapOptions {
      center?: LatLng;
      zoom?: number;
      disableDefaultUI?: boolean;
      zoomControl?: boolean;
      mapTypeId?: string;
      styles?: any[];
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      title?: string;
      icon?: string | Icon | Symbol;
      draggable?: boolean;
    }

    interface Icon {
      url: string;
      size?: Size;
      scaledSize?: Size;
      origin?: Point;
      anchor?: Point;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class Symbol {
      constructor(opts: SymbolOptions);
    }

    interface SymbolOptions {
      path: string;
      fillColor?: string;
      fillOpacity?: number;
      scale?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeWeight?: number;
    }
  }
}

export {};
