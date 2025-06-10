
const API_BASE = '/api/bus-location';

export interface BusLocationData {
  busId: string;
  busName: string;
  location: {
    latitude: number;
    longitude: number;
  };
  speed: number;
  heading: number;
  accuracy?: number;
  isActive: boolean;
  driverId?: string;
  activeRides: string[];
  lastUpdated: string;
}

export interface UpdateLocationRequest {
  busId: string;
  busName: string;
  location: {
    lat: number;
    lng: number;
  };
  speed?: number;
  heading?: number;
  accuracy?: number;
  driverId?: string;
}

// Update bus location (for admin/driver)
export const updateBusLocation = async (data: UpdateLocationRequest): Promise<void> => {
  const response = await fetch(`${API_BASE}/update`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update bus location');
  }
};

// Get all bus locations
export const getAllBusLocations = async (): Promise<BusLocationData[]> => {
  const response = await fetch(`${API_BASE}/all`);

  if (!response.ok) {
    throw new Error('Failed to get bus locations');
  }

  return response.json();
};

// Get specific bus location
export const getBusLocation = async (busId: string): Promise<BusLocationData> => {
  const response = await fetch(`${API_BASE}/${busId}`);

  if (!response.ok) {
    throw new Error('Failed to get bus location');
  }

  return response.json();
};

// Get nearby buses
export const getNearbyBuses = async (
  lat: number, 
  lng: number, 
  radius = 5
): Promise<BusLocationData[]> => {
  const response = await fetch(`${API_BASE}/nearby`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ lat, lng, radius }),
  });

  if (!response.ok) {
    throw new Error('Failed to get nearby buses');
  }

  return response.json();
};

// Deactivate bus
export const deactivateBus = async (busId: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/${busId}/deactivate`, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to deactivate bus');
  }
};
