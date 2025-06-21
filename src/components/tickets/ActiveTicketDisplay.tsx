
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ticket, Calendar, MapPin, Bus } from 'lucide-react';
import { ticketsAPI, passesAPI } from '@/services/api';
import { useUser } from '@/context/UserContext';

const ActiveTicketDisplay: React.FC = () => {
  const { userId } = useUser();

  const { data: tickets = [], isLoading: ticketsLoading } = useQuery({
    queryKey: ["tickets", userId],
    queryFn: () => ticketsAPI.getByUserId(userId || ""),
    enabled: !!userId,
  });

  const { data: passes = [], isLoading: passesLoading } = useQuery({
    queryKey: ["passes", userId],
    queryFn: () => passesAPI.getByUserId(userId || ""),
    enabled: !!userId,
  });

  const activeTickets = tickets.filter(
    (ticket) => new Date(ticket.expiryDate) > new Date()
  );

  const activePasses = passes.filter(
    (pass) => new Date(pass.expiryDate) > new Date()
  );

  const isLoading = ticketsLoading || passesLoading;

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
            <span className="ml-2 text-muted-foreground">Loading active tickets...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (activeTickets.length === 0 && activePasses.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Ticket className="mr-2 h-5 w-5 text-primary" />
            Active Tickets & Passes
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No active tickets or passes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center text-card-foreground">
          <Ticket className="mr-2 h-5 w-5 text-primary" />
          Active Tickets & Passes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeTickets.map((ticket) => (
          <div key={ticket._id} className="bg-secondary/50 rounded-lg p-4 border border-border">
            <div className="flex justify-between items-start mb-2">
              <Badge className="bg-primary text-primary-foreground">
                Single Ticket
              </Badge>
              <span className="text-sm text-muted-foreground">
                Expires: {new Date(ticket.expiryDate).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-card-foreground">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                <span>{ticket.startStation} → {ticket.endStation}</span>
              </div>
              <div className="flex items-center text-sm text-card-foreground">
                <Bus className="h-4 w-4 mr-2 text-primary" />
                <span>Price: ₹{ticket.price}</span>
              </div>
            </div>
          </div>
        ))}

        {activePasses.map((pass) => (
          <div key={pass._id} className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex justify-between items-start mb-2">
              <Badge className="bg-primary text-primary-foreground">
                Monthly Pass
              </Badge>
              <span className="text-sm text-muted-foreground">
                Expires: {new Date(pass.expiryDate).toLocaleDateString()}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-card-foreground">
                <Calendar className="h-4 w-4 mr-2 text-primary" />
                <span>Monthly Pass - Route {pass.routeId}</span>
              </div>
              <div className="flex items-center text-sm text-card-foreground">
                <Bus className="h-4 w-4 mr-2 text-primary" />
                <span>Price: ₹{pass.fare}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ActiveTicketDisplay;
