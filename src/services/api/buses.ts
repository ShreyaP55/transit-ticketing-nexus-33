
import { IBus } from "@/types";
import { fetchAPI } from "./base";

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
