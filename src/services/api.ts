import { IRoute, IBus, IStation, ITicket, IPass, IPassUsage, IRide } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Get auth token for API calls
const getAuthToken = () => {
  return localStorage.getItem("userId") || localStorage.getItem("authToken");
};

// Helper function for API calls with better error handling
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authToken = getAuthToken();
  
  const headers = {
    "Content-Type": "application/json",
    ...(authToken ? { "Authorization": `Bearer ${authToken}` } : {}),
    ...(options.headers || {})
  };

  try {
    console.log(`Making API call to: ${API_URL}${endpoint}`);
    console.log('Request headers:', headers);
    console.log('Request body:', options.body);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    console.log(`API Response status: ${response.status}`);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error response: ${errorText}`);
      
      if (response.status === 404) {
        throw new Error(`Resource not found: ${endpoint}`);
      }
      
      let error;
      try {
        error = JSON.parse(errorText);
      } catch (e) {
        error = { error: `HTTP ${response.status}: ${response.statusText}` };
      }
      
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const responseData = await response.json();
    console.log('API Response data:', responseData);
    return responseData;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network error - server may not be running');
      throw new Error("Server is not running. Please start the backend server on port 3000.");
    }
    console.error(`API Error (${endpoint}):`, error);
    throw error;
  }
}

// Routes API
export const routesAPI = {
  getAll: async (): Promise<IRoute[]> => {
    return fetchAPI("/routes");
  },
  
  create: async (route: Omit<IRoute, "_id">): Promise<IRoute> => {
    return fetchAPI("/routes", {
      method: "POST",
      body: JSON.stringify(route),
    });
  },
    
  update: async (route: IRoute): Promise<IRoute> => {
    return fetchAPI(`/routes/${route._id}`, {
      method: "PUT",
      body: JSON.stringify(route),
    });
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    return fetchAPI(`/routes/${id}`, {
      method: "DELETE",
    });
  },
};

// Buses API
export const busesAPI = {
  getAll: async (routeId?: string): Promise<IBus[]> => {
    try {
      return await fetchAPI(`/buses${routeId ? `?routeId=${routeId}` : ""}`);
    } catch (error) {
      console.error("busesAPI.getAll error:", error);
      // Return empty array on error
      return [];
    }
  },
    
  create: async (bus: Omit<IBus, "_id" | "route"> & { route: string }): Promise<IBus> => {
    try {
      // Must send "route" not "routeId"
      const res = await fetchAPI("/buses", {
        method: "POST",
        body: JSON.stringify({
          name: bus.name,
          route: bus.route,
          capacity: bus.capacity,
        }),
      });
      return res as IBus;
    } catch (error) {
      console.error("busesAPI.create error:", error);
      throw error;
    }
  },
    
  update: async (bus: Omit<IBus, "route"> & { route: string }): Promise<IBus> => {
    try {
      // Must send "route" not "routeId"
      const res = await fetchAPI(`/buses/${bus._id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: bus.name,
          route: bus.route,
          capacity: bus.capacity,
        }),
      });
      return res as IBus;
    } catch (error) {
      console.error("busesAPI.update error:", error);
      throw error;
    }
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const res = await fetchAPI(`/buses/${id}`, {
        method: "DELETE",
      });
      // Ensure the return value always has a `message` property
      if (res && typeof res === 'object' && 'message' in res) {
        return res as { message: string };
      }
      return { message: "Bus deleted (fallback, but no message from API)" };
    } catch (error) {
      console.error("busesAPI.delete error:", error);
      // Fallback for error
      return { message: "Failed to delete bus" };
    }
  },
};

// Stations API
export const stationsAPI = {
  getAll: async (params?: { routeId?: string; busId?: string }): Promise<IStation[]> => {
    const queryParams = new URLSearchParams();
    if (params?.routeId) queryParams.append("routeId", params.routeId);
    if (params?.busId) queryParams.append("busId", params.busId);

    try {
      return await fetchAPI(`/stations?${queryParams.toString()}`);
    } catch (error) {
      console.error("stationsAPI.getAll error:", error);
      return [];
    }
  },
  
  create: async (station: Omit<IStation, "_id" | "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    console.log('Creating station with data:', station);
    return fetchAPI("/stations", {
      method: "POST",
      body: JSON.stringify({
        routeId: station.routeId,
        busId: station.busId,
        name: station.name,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        fare: Number(station.fare),
        location: station.location || station.name
      }),
    });
  },
    
  update: async (station: Omit<IStation, "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    console.log('Updating station with data:', station);
    return fetchAPI(`/stations/${station._id}`, {
      method: "PUT",
      body: JSON.stringify({
        routeId: station.routeId,
        busId: station.busId,
        name: station.name,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        fare: Number(station.fare),
        location: station.location || station.name
      }),
    });
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    return fetchAPI(`/stations/${id}`, {
      method: "DELETE",
    });
  },
};

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

// Rides API
export const ridesAPI = {
  getHistory: (userId: string): Promise<IRide[]> => {
    return fetchAPI(`/rides/history/${userId}`);
  },
};

// Tickets API
export const ticketsAPI = {
  getByUserId: (): Promise<ITicket[]> => {
    return fetchAPI("/tickets");
  },
    
  create: (ticket: { sessionId: string; stationId: string; busId: string }): Promise<{ success: boolean; ticket: ITicket }> =>
    fetchAPI("/tickets", {
      method: "POST",
      body: JSON.stringify(ticket),
    }),
};

// Passes API
export const passesAPI = {
  getActivePass: (): Promise<IPass> => {
    const userId = getAuthToken();
    return fetchAPI(`/passes?userId=${userId}`);
  },
    
  createPass: (pass: { routeId: string; fare: number; sessionId: string }): Promise<{ success: boolean; pass: IPass }> => {
    const userId = getAuthToken();
    return fetchAPI("/passes", {
      method: "POST",
      body: JSON.stringify({ ...pass, userId }),
    });
  },
    
  confirmPassPayment: (sessionId: string): Promise<{ success: boolean; pass: IPass }> => {
    const userId = getAuthToken();
    return fetchAPI("/payments", {
      method: "POST",
      body: JSON.stringify({ sessionId, userId }),
    });
  },
    
  getPassUsage: (): Promise<IPassUsage[]> => {
    const userId = getAuthToken();
    return fetchAPI(`/pass-usage?userId=${userId}`);
  },
    
  recordPassUsage: (passId: string, location: string): Promise<{ message: string; usage: IPassUsage }> =>
    fetchAPI("/pass-usage", {
      method: "POST",
      body: JSON.stringify({ passId, location }),
    }),
};

// Payment API with Stripe integration
export const paymentAPI = {
  createTicketCheckoutSession: async (
    stationId: string,
    busId: string,
    amount: number
  ): Promise<{ url: string }> => {
    try {
      const userId = getAuthToken();
      return await fetchAPI("/checkout", {
        method: "POST",
        body: JSON.stringify({
          userId,
          station: { id: stationId, fare: amount },
          bus: { id: busId },
        }),
      });
    } catch (error) {
      console.error("paymentAPI.createTicketCheckoutSession error:", error);
      throw error;
    }
  },
  createPassCheckoutSession: async (routeId: string, amount: number): Promise<{ url: string }> => {
    try {
      const userId = getAuthToken();
      return await fetchAPI("/checkout", {
        method: "POST",
        body: JSON.stringify({
          userId,
          type: 'pass',
          routeId,
          fare: amount
        }),
      });
    } catch (error) {
      console.error("paymentAPI.createPassCheckoutSession error:", error);
      throw error;
    }
  }
};

// Admin API
export const adminAPI = {
  checkAdminStatus: (): Promise<{ isAdmin: boolean }> => fetchAPI("/admin/check-status"),
  
  getSystemStats: (): Promise<{ 
    userCount: number, 
    activePassCount: number, 
    routeCount: number,
    totalRevenue: number 
  }> => fetchAPI("/admin/stats"),
};
