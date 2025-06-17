
import { fetchAPI, getAuthToken } from "./base";

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
