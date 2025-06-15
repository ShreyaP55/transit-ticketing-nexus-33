
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export const startTrip = async (userId: string, latitude: number, longitude: number, authToken: string) => {
  try {
    const response = await fetch(`${API_URL}/trips/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ userId, latitude, longitude }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start trip');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
    }
    throw error;
  }
};

export const endTrip = async (tripId: string, latitude: number, longitude: number, authToken: string) => {
  try {
    const response = await fetch(`${API_URL}/trips/${tripId}/end`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ latitude, longitude }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to end trip');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
    }
    throw error;
  }
};

export const getActiveTrip = async (userId: string, authToken: string) => {
  try {
    const response = await fetch(`${API_URL}/trips/active/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get active trip');
    }

    const data = await response.json();
    return (data && typeof data === 'object' && data.active) ? data.trip : null;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
    }
    console.error('Error getting active trip:', error);
    return null;
  }
};

export const getUserTrips = async (userId: string, authToken: string) => {
  try {
    const response = await fetch(`${API_URL}/trips/user/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to get user trips');
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
    }
    console.error('Error getting user trips:', error);
    return [];
  }
};
