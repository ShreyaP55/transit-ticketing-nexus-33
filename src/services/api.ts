
import { IRoute, IBus, IStation, ITicket, IPass } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const USER_ID = localStorage.getItem("userId") || "12345"; // In a real app, this would come from auth

// Helper function for API calls
async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
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
  getByUserId: (): Promise<ITicket[]> => 
    fetchAPI(`/tickets?userId=${USER_ID}`),
    
  create: (ticket: { sessionId: string; stationId: string; busId: string }): Promise<{ success: boolean; ticket: ITicket }> =>
    fetchAPI("/tickets", {
      method: "POST",
      body: JSON.stringify({
        ...ticket,
        userId: USER_ID,
      }),
    }),
};

// Passes API
export const passesAPI = {
  getActivePass: (): Promise<IPass> => 
    fetchAPI(`/passes?userId=${USER_ID}`),
    
  createPass: (pass: { routeId: string; fare: number; sessionId: string }): Promise<{ success: boolean; pass: IPass }> =>
    fetchAPI("/passes", {
      method: "POST",
      body: JSON.stringify({
        ...pass,
        userId: USER_ID,
      }),
    }),
};

// Mock for stripe payments (in a real app, this would connect to Stripe)
export const paymentAPI = {
  createTicketCheckoutSession: async (stationId: string, busId: string, amount: number): Promise<string> => {
    // This is a mock function - in a real app, this would create a Stripe Checkout session
    console.log(`Creating ticket payment for station ${stationId}, bus ${busId}, amount ${amount}`);
    
    // Simulate a successful payment
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "cs_test_" + Math.random().toString(36).substring(2, 15);
  },
  
  createPassCheckoutSession: async (routeId: string, amount: number): Promise<string> => {
    // This is a mock function - in a real app, this would create a Stripe Checkout session
    console.log(`Creating pass payment for route ${routeId}, amount ${amount}`);
    
    // Simulate a successful payment
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return "cs_test_" + Math.random().toString(36).substring(2, 15);
  },
};
