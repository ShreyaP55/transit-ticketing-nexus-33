
export interface LocationData {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp: number;
}

export interface BusLocations {
  [busId: string]: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
}

export interface MapStation {
  _id: string;
  name: string;
  position: { lat: number; lng: number };
}

export const defaultCenter = {
  lat: 15.4909,
  lng: 73.8278
}; // Goa

export const defaultZoom = 13;
