
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, TicketX } from "lucide-react";
import { ticketsAPI } from "@/services/api";
import { ITicket } from "@/types";
import MainLayout from "@/components/layout/MainLayout";
import { TicketCard } from "@/components/tickets/TicketCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TicketsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("active");
  
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: ticketsAPI.getByUserId,
  });
  
  const activeTickets = tickets.filter(
    (ticket) => new Date(ticket.expiryDate) > new Date()
  );
  
  const expiredTickets = tickets.filter(
    (ticket) => new Date(ticket.expiryDate) <= new Date()
  );
  
  const handleNewTicket = () => {
    navigate("/");
  };

  return (
    <MainLayout title="My Tickets">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">My Tickets</h1>
          <Button onClick={handleNewTicket}>
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>
        
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="active">
              Active Tickets ({activeTickets.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired Tickets ({expiredTickets.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading tickets...</div>
              </div>
            ) : activeTickets.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-white">
                <TicketX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-1">No active tickets</h3>
                <p className="text-muted-foreground mb-4">
                  You don't have any active tickets at the moment
                </p>
                <Button onClick={handleNewTicket}>Book a Ticket</Button>
              </div>
            ) : (
              <div className="grid gap-6">
                {activeTickets.map((ticket: ITicket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="expired">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-pulse">Loading tickets...</div>
              </div>
            ) : expiredTickets.length === 0 ? (
              <div className="text-center py-12 border rounded-lg bg-white">
                <TicketX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No expired tickets</h3>
                <p className="text-muted-foreground">
                  You don't have any expired tickets
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {expiredTickets.map((ticket: ITicket) => (
                  <TicketCard key={ticket._id} ticket={ticket} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default TicketsPage;
