
import { fetchAPI } from "./base";

// Trips API for QR Scanner
export const tripsAPI = {
  startTrip: async (userId: string, latitude: number, longitude: number): Promise<any> => {
    return fetchAPI("/trips/start", {
      method: "POST",
      body: JSON.stringify({ userId, latitude, longitude }),
    });
  },

  endTrip: async (tripId: string, latitude: number, longitude: number): Promise<any> => {
    return fetchAPI(`/trips/${tripId}/end`, {
      method: "PUT",
      body: JSON.stringify({ latitude, longitude }),
    });
  },

  getActiveTrip: async (userId: string): Promise<any> => {
    try {
      const response: any = await fetchAPI(`/trips/active/${userId}`);
      return (response && typeof response === 'object' && response.active) ? response.trip : null;
    } catch (error) {
      return null;
    }
  },

  getUserTrips: async (userId: string): Promise<any[]> => {
    try {
      return await fetchAPI(`/trips/user/${userId}`);
    } catch (error) {
      return [];
    }
  },
};
