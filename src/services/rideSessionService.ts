
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export interface RideSession {
  _id: string;
  userId: string;
  busId: string;
  routeId: string;
  startCoords: { lat: number; lng: number };
  endCoords?: { lat: number; lng: number };
  startTime: string;
  endTime?: string;
  fare: number;
  totalDistance: number;
  status: 'active' | 'completed';
}

export interface StartRideRequest {
  userId: string;
  busId: string;
  routeId: string;
  startCoords: { lat: number; lng: number };
}

export interface EndRideRequest {
  userId: string;
  rideToken: string;
  endCoords: { lat: number; lng: number };
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

export const rideSessionService = {
  // Start a new ride session
  startRide: async (data: StartRideRequest): Promise<{ success: boolean; rideToken: string; ride: RideSession }> => {
    return fetchAPI('/ride-sessions/start', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // End an active ride session
  endRide: async (data: EndRideRequest): Promise<{ success: boolean; fare: number; distance: string; remainingBalance: number }> => {
    return fetchAPI('/ride-sessions/end', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get user's ride history
  getRideHistory: async (userId: string): Promise<{ rides: RideSession[] }> => {
    return fetchAPI(`/ride-sessions/history/${userId}`);
  },

  // Get all active rides (admin)
  getActiveRides: async (): Promise<{ activeRides: RideSession[] }> => {
    return fetchAPI('/ride-sessions/active');
  },

  // Get user's active ride
  getActiveRide: async (userId: string): Promise<{ hasActiveRide: boolean; ride?: RideSession }> => {
    return fetchAPI(`/ride-sessions/active/${userId}`);
  },
};
