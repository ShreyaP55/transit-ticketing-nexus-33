
import { ITrip } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "An error occurred with status " + response.status);
    }

    return response.json();
  } catch (error) {
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

export const startTrip = async (userId: string, latitude: number, longitude: number): Promise<ITrip> => {
  try {
    const result = await fetchAPI<{ success: boolean; trip: ITrip }>('/trips/start', {
      method: 'POST',
      body: JSON.stringify({ userId, latitude, longitude }),
    });
    
    return result.trip;
  } catch (error) {
    console.error('Error starting trip:', error);
    throw error;
  }
};

export const endTrip = async (tripId: string, latitude: number, longitude: number): Promise<ITrip> => {
  try {
    const result = await fetchAPI<{ success: boolean; trip: ITrip }>(`/trips/${tripId}/end`, {
      method: 'PUT',
      body: JSON.stringify({ latitude, longitude }),
    });
    
    return result.trip;
  } catch (error) {
    console.error('Error ending trip:', error);
    throw error;
  }
};

export const getActiveTrip = async (userId: string): Promise<ITrip | null> => {
  try {
    const result = await fetchAPI<{ active: boolean; trip?: ITrip }>(`/trips/active/${userId}`);
    
    return result.active ? result.trip! : null;
  } catch (error) {
    console.error('Error getting active trip:', error);
    throw error;
  }
};

export const getTripHistory = async (userId: string): Promise<ITrip[]> => {
  try {
    return fetchAPI<ITrip[]>(`/trips/history/${userId}`);
  } catch (error) {
    console.error('Error getting trip history:', error);
    throw error;
  }
};
