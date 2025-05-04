import { IRoute, IBus, IStation, ITicket, IPass, IPassUsage } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const getUserId = () => localStorage.getItem("userId");

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const userId = getUserId();
  
  const headers = {
    "Content-Type": "application/json",
    ...(userId ? { "Authorization": `Bearer ${userId}` } : {}),
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
    return fetchAPI("/routes", {
      method: "PUT",
      body: JSON.stringify(route),
    });
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    return fetchAPI("/routes", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    });
  },
};

// Buses API
export const busesAPI = {
  getAll: async (routeId?: string): Promise<IBus[]> => {
    try {
      return fetchAPI(`/buses${routeId ? `?routeId=${routeId}` : ""}`);
    } catch (error) {
      console.error("Error fetching buses:", error);
      throw error;
    }
  },
    
  create: async (bus: Omit<IBus, "_id" | "route"> & { route: string }): Promise<IBus> => {
    try {
      return fetchAPI("/buses", {
        method: "POST",
        body: JSON.stringify(bus),
      });
    } catch (error) {
      console.error("Error creating bus:", error);
      throw error;
    }
  },
    
  update: async (bus: Omit<IBus, "route"> & { route: string }): Promise<IBus> => {
    try {
      return fetchAPI("/buses", {
        method: "PUT",
        body: JSON.stringify(bus),
      });
    } catch (error) {
      console.error("Error updating bus:", error);
      throw error;
    }
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      return fetchAPI("/buses", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Error deleting bus:", error);
      throw error;
    }
  },
};

// Stations API
export const stationsAPI = {
  getAll: async (params?: { routeId?: string; busId?: string }): Promise<IStation[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.routeId) queryParams.append("routeId", params.routeId);
      if (params?.busId) queryParams.append("busId", params.busId);
        
      return fetchAPI(`/stations?${queryParams.toString()}`);
    } catch (error) {
      console.error("Error fetching stations:", error);
      throw error;
    }
  },
  
  create: async (station: Omit<IStation, "_id" | "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    try {
      return fetchAPI("/stations", {
        method: "POST",
        body: JSON.stringify(station),
      });
    } catch (error) {
      console.error("Error creating station:", error);
      throw error;
    }
  },
    
  update: async (station: Omit<IStation, "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    try {
      return fetchAPI("/stations", {
        method: "PUT",
        body: JSON.stringify(station),
      });
    } catch (error) {
      console.error("Error updating station:", error);
      throw error;
    }
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      return fetchAPI("/stations", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
    } catch (error) {
      console.error("Error deleting station:", error);
      throw error;
    }
  },
};

// Tickets API
export const ticketsAPI = {
  getByUserId: (): Promise<ITicket[]> => {
    const userId = getUserId();
    return fetchAPI(`/tickets?userId=${userId}`);
  },
    
  create: (ticket: { sessionId: string; stationId: string; busId: string }): Promise<{ success: boolean; ticket: ITicket }> =>
    fetchAPI("/tickets", {
      method: "POST",
      body: JSON.stringify({
        ...ticket,
        userId: getUserId(),
      }),
    }),
};

// Passes API
export const passesAPI = {
  getActivePass: (): Promise<IPass> => {
    const userId = getUserId();
    return fetchAPI(`/passes?userId=${userId}`);
  },
    
  createPass: (pass: { routeId: string; fare: number; sessionId: string }): Promise<{ success: boolean; pass: IPass }> =>
    fetchAPI("/passes", {
      method: "POST",
      body: JSON.stringify({
        ...pass,
        userId: getUserId(),
      }),
    }),
    
  confirmPassPayment: (sessionId: string): Promise<{ success: boolean; pass: IPass }> =>
    fetchAPI("/payments", {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        userId: getUserId()
      }),
    }),
    
  getPassUsage: (): Promise<IPassUsage[]> => {
    const userId = getUserId();
    return fetchAPI(`/pass-usage?userId=${userId}`);
  },
    
  recordPassUsage: (passId: string, location: string): Promise<{ message: string; usage: IPassUsage }> =>
    fetchAPI("/pass-usage", {
      method: "POST",
      body: JSON.stringify({
        userId: getUserId(),
        passId,
        location
      }),
    }),
};

// Payment API with Stripe integration
export const paymentAPI = {
  createTicketCheckoutSession: async (stationId: string, busId: string, amount: number): Promise<{ url: string }> => {
    try {
      const response = await fetch(`${API_URL}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getUserId() ? { "Authorization": `Bearer ${getUserId()}` } : {})
        },
        body: JSON.stringify({
          station: { id: stationId, fare: amount },
          bus: { id: busId },
          userId: getUserId()
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error creating checkout session");
      }
      
      return response.json();
    } catch (error) {
      console.error("Stripe checkout error:", error);
      throw error;
    }
  },
  
  createPassCheckoutSession: async (routeId: string, amount: number): Promise<{ url: string }> => {
    try {
      const response = await fetch(`${API_URL}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(getUserId() ? { "Authorization": `Bearer ${getUserId()}` } : {})
        },
        body: JSON.stringify({
          type: 'pass',
          userId: getUserId(),
          routeId,
          fare: amount
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error creating checkout session");
      }
      
      return response.json();
    } catch (error) {
      console.error("Stripe checkout error:", error);
      throw error;
    }
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
