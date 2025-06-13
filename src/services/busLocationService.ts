
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface BusLocation {
  busId: string;
  coords: {
    lat: number;
    lng: number;
  };
  updatedAt: string;
}

export interface UpdateLocationRequest {
  busId: string;
  coords: {
    lat: number;
    lng: number;
  };
}

// Helper function for API calls
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP ${response.status}`);
  }

  return response.json();
}

export const busLocationService = {
  // Update bus location (for admin/driver)
  updateLocation: async (data: UpdateLocationRequest): Promise<{ success: boolean; location: BusLocation }> => {
    return fetchAPI('/bus-locations/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get all bus locations
  getAllLocations: async (): Promise<{ locations: BusLocation[] }> => {
    return fetchAPI('/bus-locations/all');
  },

  // Get specific bus location
  getBusLocation: async (busId: string): Promise<{ location: BusLocation }> => {
    return fetchAPI(`/bus-locations/${busId}`);
  },

  // Start location tracking for a bus (browser geolocation)
  startLocationTracking: (busId: string, onLocationUpdate?: (location: BusLocation) => void) => {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        try {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          const result = await busLocationService.updateLocation({ busId, coords });
          
          if (onLocationUpdate) {
            onLocationUpdate(result.location);
          }
        } catch (error) {
          console.error('Error updating location:', error);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return {
      stop: () => navigator.geolocation.clearWatch(watchId),
      watchId,
    };
  },
};
