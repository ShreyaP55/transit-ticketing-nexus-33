
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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "An error occurred");
  }

  return response.json();
}

// Routes API
export const routesAPI = {
  getAll: (): Promise<IRoute[]> => fetchAPI("/routes"),
  
  create: (route: Omit<IRoute, "_id">): Promise<IRoute> =>
    fetchAPI("/routes", {
      method: "POST",
      body: JSON.stringify(route),
    }),
    
  update: (route: IRoute): Promise<IRoute> =>
    fetchAPI("/routes", {
      method: "PUT",
      body: JSON.stringify(route),
    }),
    
  delete: (id: string): Promise<{ message: string }> =>
    fetchAPI("/routes", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};

// Buses API
export const busesAPI = {
  getAll: (routeId?: string): Promise<IBus[]> =>
    fetchAPI(`/buses${routeId ? `?routeId=${routeId}` : ""}`),
    
  create: (bus: Omit<IBus, "_id" | "route"> & { route: string }): Promise<IBus> =>
    fetchAPI("/buses", {
      method: "POST",
      body: JSON.stringify(bus),
    }),
    
  update: (bus: Omit<IBus, "route"> & { route: string }): Promise<IBus> =>
    fetchAPI("/buses", {
      method: "PUT",
      body: JSON.stringify(bus),
    }),
    
  delete: (id: string): Promise<{ message: string }> =>
    fetchAPI("/buses", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
};

// Stations API
export const stationsAPI = {
  getAll: (params?: { routeId?: string; busId?: string }): Promise<IStation[]> => {
    const queryParams = new URLSearchParams();
    if (params?.routeId) queryParams.append("routeId", params.routeId);
    if (params?.busId) queryParams.append("busId", params.busId);
    
    return fetchAPI(`/stations?${queryParams.toString()}`);
  },
  
  create: (station: Omit<IStation, "_id" | "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> =>
    fetchAPI("/stations", {
      method: "POST",
      body: JSON.stringify(station),
    }),
    
  update: (station: Omit<IStation, "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> =>
    fetchAPI("/stations", {
      method: "PUT",
      body: JSON.stringify(station),
    }),
    
  delete: (id: string): Promise<{ message: string }> =>
    fetchAPI("/stations", {
      method: "DELETE",
      body: JSON.stringify({ id }),
    }),
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

// Payment API
export const paymentAPI = {
  createTicketCheckoutSession: async (stationId: string, busId: string, amount: number): Promise<{ url: string }> => {
    return fetchAPI("/checkout", {
      method: "POST",
      body: JSON.stringify({
        station: { id: stationId, fare: amount },
        bus: { id: busId },
        userId: getUserId()
      }),
    });
  },
  
  createPassCheckoutSession: async (routeId: string, amount: number): Promise<{ url: string }> => {
    return fetchAPI("/payments", {
      method: "POST",
      body: JSON.stringify({
        type: 'pass',
        userId: getUserId(),
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
