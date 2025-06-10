
const API_BASE = '/api/ride-sessions';

export interface StartRideRequest {
  clerkId: string;
  userName: string;
  busId: string;
  busName: string;
  startCoords: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  busQRToken?: string;
}

export interface EndRideRequest {
  rideId: string;
  rideToken: string;
  endCoords: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  busPath?: Array<{
    lat: number;
    lng: number;
    timestamp: string;
    speed?: number;
    heading?: number;
  }>;
}

export interface RideSession {
  rideId: string;
  clerkId: string;
  userName: string;
  busId: string;
  busName: string;
  rideToken: string;
  status: 'active' | 'completed' | 'cancelled';
  startLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
    accuracy?: number;
  };
  totalDistance?: number;
  totalFare?: number;
  duration?: number;
  startTime: string;
  endTime?: string;
  paymentStatus: 'pending' | 'completed' | 'failed';
  currentBusLocation?: {
    latitude: number;
    longitude: number;
  };
}

// Start a new ride session
export const startRideSession = async (data: StartRideRequest): Promise<RideSession> => {
  const response = await fetch(`${API_BASE}/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to start ride');
  }

  const result = await response.json();
  return result.ride;
};

// End a ride session
export const endRideSession = async (data: EndRideRequest): Promise<RideSession> => {
  const response = await fetch(`${API_BASE}/end`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to end ride');
  }

  const result = await response.json();
  return result.ride;
};

// Get active ride for user
export const getActiveRide = async (clerkId: string): Promise<RideSession | null> => {
  const response = await fetch(`${API_BASE}/active/${clerkId}`);

  if (!response.ok) {
    throw new Error('Failed to get active ride');
  }

  const result = await response.json();
  return result.active ? result.ride : null;
};

// Get ride history for user
export const getRideHistory = async (clerkId: string, page = 1, limit = 20) => {
  const response = await fetch(`${API_BASE}/history/${clerkId}?page=${page}&limit=${limit}`);

  if (!response.ok) {
    throw new Error('Failed to get ride history');
  }

  return response.json();
};

// Update user location during ride
export const updateUserLocation = async (
  rideId: string, 
  rideToken: string, 
  location: { lat: number; lng: number; accuracy?: number; speed?: number }
): Promise<void> => {
  const response = await fetch(`${API_BASE}/update-location`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      rideId,
      rideToken,
      location,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update location');
  }
};

// Get all active rides (admin)
export const getAllActiveRides = async (): Promise<RideSession[]> => {
  const response = await fetch(`${API_BASE}/active`);

  if (!response.ok) {
    throw new Error('Failed to get active rides');
  }

  return response.json();
};
