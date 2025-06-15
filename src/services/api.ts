
import { IRoute, IBus, IStation, ITicket, IPass, IPassUsage } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

// Get auth token for API calls
const getAuthToken = () => {
  return localStorage.getItem("userId");
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
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Resource not found: ${endpoint}`);
      }
      const error = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(error.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Server is not running. Please start the backend server.");
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
    return fetchAPI(`/buses${routeId ? `?routeId=${routeId}` : ""}`);
  },
    
  create: async (bus: Omit<IBus, "_id" | "route"> & { route: string }): Promise<IBus> => {
    return fetchAPI("/buses", {
      method: "POST",
      body: JSON.stringify(bus),
    });
  },
    
  update: async (bus: Omit<IBus, "route"> & { route: string }): Promise<IBus> => {
    return fetchAPI(`/buses/${bus._id}`, {
      method: "PUT",
      body: JSON.stringify(bus),
    });
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    return fetchAPI(`/buses/${id}`, {
      method: "DELETE",
    });
  },
};

// Stations API
export const stationsAPI = {
  getAll: async (params?: { routeId?: string; busId?: string }): Promise<IStation[]> => {
    const queryParams = new URLSearchParams();
    if (params?.routeId) queryParams.append("routeId", params.routeId);
    if (params?.busId) queryParams.append("busId", params.busId);
      
    return fetchAPI(`/stations?${queryParams.toString()}`);
  },
  
  create: async (station: Omit<IStation, "_id" | "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    return fetchAPI("/stations", {
      method: "POST",
      body: JSON.stringify(station),
    });
  },
    
  update: async (station: Omit<IStation, "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    return fetchAPI(`/stations/${station._id}`, {
      method: "PUT",
      body: JSON.stringify(station),
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
    return fetchAPI("/passes");
  },
    
  createPass: (pass: { routeId: string; fare: number; sessionId: string }): Promise<{ success: boolean; pass: IPass }> =>
    fetchAPI("/passes", {
      method: "POST",
      body: JSON.stringify(pass),
    }),
    
  confirmPassPayment: (sessionId: string): Promise<{ success: boolean; pass: IPass }> =>
    fetchAPI("/payments", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    }),
    
  getPassUsage: (): Promise<IPassUsage[]> => {
    return fetchAPI("/pass-usage");
  },
    
  recordPassUsage: (passId: string, location: string): Promise<{ message: string; usage: IPassUsage }> =>
    fetchAPI("/pass-usage", {
      method: "POST",
      body: JSON.stringify({ passId, location }),
    }),
};

// Payment API with Stripe integration
export const paymentAPI = {
  createTicketCheckoutSession: async (stationId: string, busId: string, amount: number): Promise<{ url: string }> => {
    return fetchAPI("/checkout", {
      method: "POST",
      body: JSON.stringify({
        station: { id: stationId, fare: amount },
        bus: { id: busId },
      }),
    });
  },
  
  createPassCheckoutSession: async (routeId: string, amount: number): Promise<{ url: string }> => {
    return fetchAPI("/payments", {
      method: "POST",
      body: JSON.stringify({
        type: 'pass',
        routeId,
        fare: amount
      }),
    });
  },
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
