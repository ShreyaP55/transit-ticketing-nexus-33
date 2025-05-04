import { IRoute, IBus, IStation, ITicket, IPass, IPassUsage } from "@/types";
import clientPromise from './mongoConnect';

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

// MongoDB connection and collections
async function getCollection(collectionName: string) {
  const client = await clientPromise;
  const db = client.db();
  return db.collection(collectionName);
}

// Routes API
export const routesAPI = {
  getAll: async (): Promise<IRoute[]> => {
    try {
      const collection = await getCollection("routes");
      const routes = await collection.find({}).toArray();
      return routes as IRoute[];
    } catch (error) {
      console.error("Error fetching routes:", error);
      return fetchAPI("/routes");
    }
  },
  
  create: async (route: Omit<IRoute, "_id">): Promise<IRoute> => {
    try {
      const collection = await getCollection("routes");
      const result = await collection.insertOne(route as any);
      return { ...route, _id: result.insertedId.toString() } as IRoute;
    } catch (error) {
      console.error("Error creating route:", error);
      return fetchAPI("/routes", {
        method: "POST",
        body: JSON.stringify(route),
      });
    }
  },
    
  update: async (route: IRoute): Promise<IRoute> => {
    try {
      const collection = await getCollection("routes");
      const { _id, ...updateData } = route;
      await collection.updateOne({ _id }, { $set: updateData });
      return route;
    } catch (error) {
      console.error("Error updating route:", error);
      return fetchAPI("/routes", {
        method: "PUT",
        body: JSON.stringify(route),
      });
    }
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const collection = await getCollection("routes");
      await collection.deleteOne({ _id: id });
      return { message: "Route deleted successfully" };
    } catch (error) {
      console.error("Error deleting route:", error);
      return fetchAPI("/routes", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
    }
  },
};

// Buses API
export const busesAPI = {
  getAll: async (routeId?: string): Promise<IBus[]> => {
    try {
      const collection = await getCollection("buses");
      const query = routeId ? { "route._id": routeId } : {};
      const buses = await collection.find(query).toArray();
      return buses as IBus[];
    } catch (error) {
      console.error("Error fetching buses:", error);
      return fetchAPI(`/buses${routeId ? `?routeId=${routeId}` : ""}`);
    }
  },
    
  create: async (bus: Omit<IBus, "_id" | "route"> & { route: string }): Promise<IBus> => {
    try {
      const routesCollection = await getCollection("routes");
      const route = await routesCollection.findOne({ _id: bus.route });
      
      if (!route) throw new Error("Route not found");
      
      const collection = await getCollection("buses");
      const busData = { ...bus, route };
      const result = await collection.insertOne(busData as any);
      return { ...busData, _id: result.insertedId.toString() } as unknown as IBus;
    } catch (error) {
      console.error("Error creating bus:", error);
      return fetchAPI("/buses", {
        method: "POST",
        body: JSON.stringify(bus),
      });
    }
  },
    
  update: async (bus: Omit<IBus, "route"> & { route: string }): Promise<IBus> => {
    try {
      const routesCollection = await getCollection("routes");
      const route = await routesCollection.findOne({ _id: bus.route });
      
      if (!route) throw new Error("Route not found");
      
      const collection = await getCollection("buses");
      const { _id, ...updateData } = bus;
      const busData = { ...updateData, route };
      await collection.updateOne({ _id }, { $set: busData });
      return { ...bus, route } as unknown as IBus;
    } catch (error) {
      console.error("Error updating bus:", error);
      return fetchAPI("/buses", {
        method: "PUT",
        body: JSON.stringify(bus),
      });
    }
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const collection = await getCollection("buses");
      await collection.deleteOne({ _id: id });
      return { message: "Bus deleted successfully" };
    } catch (error) {
      console.error("Error deleting bus:", error);
      return fetchAPI("/buses", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
    }
  },
};

// Stations API - Similar pattern
export const stationsAPI = {
  getAll: async (params?: { routeId?: string; busId?: string }): Promise<IStation[]> => {
    try {
      const collection = await getCollection("stations");
      const query: any = {};
      
      if (params?.routeId) query["routeId._id"] = params.routeId;
      if (params?.busId) query["busId._id"] = params.busId;
      
      const stations = await collection.find(query).toArray();
      return stations as IStation[];
    } catch (error) {
      console.error("Error fetching stations:", error);
      const queryParams = new URLSearchParams();
      if (params?.routeId) queryParams.append("routeId", params.routeId);
      if (params?.busId) queryParams.append("busId", params.busId);
      
      return fetchAPI(`/stations?${queryParams.toString()}`);
    }
  },
  
  create: async (station: Omit<IStation, "_id" | "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    try {
      const routesCollection = await getCollection("routes");
      const busesCollection = await getCollection("buses");
      
      const route = await routesCollection.findOne({ _id: station.routeId });
      const bus = await busesCollection.findOne({ _id: station.busId });
      
      if (!route || !bus) throw new Error("Route or Bus not found");
      
      const collection = await getCollection("stations");
      const stationData = { ...station, routeId: route, busId: bus };
      const result = await collection.insertOne(stationData as any);
      
      return { ...stationData, _id: result.insertedId.toString() } as unknown as IStation;
    } catch (error) {
      console.error("Error creating station:", error);
      return fetchAPI("/stations", {
        method: "POST",
        body: JSON.stringify(station),
      });
    }
  },
    
  update: async (station: Omit<IStation, "routeId" | "busId"> & { routeId: string; busId: string }): Promise<IStation> => {
    try {
      const routesCollection = await getCollection("routes");
      const busesCollection = await getCollection("buses");
      
      const route = await routesCollection.findOne({ _id: station.routeId });
      const bus = await busesCollection.findOne({ _id: station.busId });
      
      if (!route || !bus) throw new Error("Route or Bus not found");
      
      const collection = await getCollection("stations");
      const { _id, ...updateData } = station;
      const stationData = { ...updateData, routeId: route, busId: bus };
      await collection.updateOne({ _id }, { $set: stationData });
      
      return { ...station, routeId: route, busId: bus } as unknown as IStation;
    } catch (error) {
      console.error("Error updating station:", error);
      return fetchAPI("/stations", {
        method: "PUT",
        body: JSON.stringify(station),
      });
    }
  },
    
  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const collection = await getCollection("stations");
      await collection.deleteOne({ _id: id });
      return { message: "Station deleted successfully" };
    } catch (error) {
      console.error("Error deleting station:", error);
      return fetchAPI("/stations", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
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
