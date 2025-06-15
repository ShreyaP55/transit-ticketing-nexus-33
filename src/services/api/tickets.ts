
import { ITicket } from "@/types";
import { fetchAPI } from "./base";

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
