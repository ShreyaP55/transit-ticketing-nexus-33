
import { ITicket } from "@/types";
import { fetchAPI } from "./base";

// Tickets API
export const ticketsAPI = {
  getByUserId: (userId: string): Promise<ITicket[]> => {
    if (!userId) {
      return Promise.resolve([]);
    }
    return fetchAPI(`/tickets?userId=${userId}`);
  },
    
  create: (ticket: { sessionId: string; stationId: string; busId: string; userId: string }): Promise<{ success: boolean; ticket: ITicket }> =>
    fetchAPI("/tickets", {
      method: "POST",
      body: JSON.stringify(ticket),
    }),
};
