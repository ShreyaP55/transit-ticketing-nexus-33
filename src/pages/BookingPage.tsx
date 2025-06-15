import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewTicketModal } from "@/components/tickets/NewTicketModal";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Bus, Navigation, AlertCircle, CreditCard } from "lucide-react";
import { routesAPI, busesAPI, stationsAPI } from "@/services/api";
import { stripeService } from "@/services/stripeService";
import { toast } from "sonner";
const BookingPage = () => {
  // For demo, mount modal from here
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // New state to hold after-pay params
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  
  // Handle payment status from URL params
  useEffect(() => {
    const status = searchParams.get("status");
    const sessionId = searchParams.get("session_id");
    if (status === "success" && sessionId) {
      // Only create the ticket after confirming payment!
      toast.success("Payment successful! Generating your ticket...");
      setPendingSessionId(sessionId);
    } else if (status === "cancel") {
      toast.error("Payment was cancelled.");
    }
  }, [searchParams, navigate]);
  
  // Get query parameters from URL
  const urlParams = new URLSearchParams(location.search);
  const routeIdParam = urlParams.get("routeId");
  const busIdParam = urlParams.get("busId");
  
  const [selectedRouteId, setSelectedRouteId] = useState(routeIdParam || "");
  const [selectedBusId, setSelectedBusId] = useState(busIdParam || "");
  const [selectedStationId, setSelectedStationId] = useState("");
  
  // Fetch routes
  const { 
    data: routes = [], 
    isLoading: isLoadingRoutes 
  } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });
  
  // Get selected route
  const selectedRoute = routes.find(route => route._id === selectedRouteId);
  
  // Fetch buses for selected route
  const { 
    data: buses = [], 
    isLoading: isLoadingBuses 
  } = useQuery({
    queryKey: ['buses', selectedRouteId],
    queryFn: () => busesAPI.getAll(selectedRouteId),
    enabled: !!selectedRouteId,
  });
  
  // Get selected bus
  const selectedBus = buses.find(bus => bus._id === selectedBusId);
  
  // Fetch stations for selected route and bus
  const { 
    data: stations = [], 
    isLoading: isLoadingStations 
  } = useQuery({
    queryKey: ['stations', selectedRouteId, selectedBusId],
    queryFn: () => stationsAPI.getAll({ 
      routeId: selectedRouteId, 
      busId: selectedBusId 
    }),
    enabled: !!selectedRouteId && !!selectedBusId,
  });
  
  // Reset bus selection when route changes
  useEffect(() => {
    if (!busIdParam || busIdParam !== selectedBusId) {
      setSelectedBusId("");
    }
  }, [selectedRouteId, busIdParam, selectedBusId]);
  
  useEffect(() => {
    setSelectedStationId("");
  }, [selectedBusId]);

  // Call the ticket creation API after successful Stripe payment
  useEffect(() => {
    if (pendingSessionId && selectedStationId && selectedBusId) {
      // Actually create ticket on our backend using the session id
      (async () => {
        try {
          // Call your ticket API endpoint (assuming it creates on sessionId)
          const result = await fetch("/api/ticket", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: pendingSessionId,
              stationId: selectedStationId,
              busId: selectedBusId,
            }),
          });
          const data = await result.json();
          if (result.ok && data.ticket) {
            toast.success("Ticket generated! Redirecting...");
            setTimeout(() => navigate("/tickets"), 2000);
          } else {
            toast.error(data.error || "Failed to create ticket after payment.");
          }
        } catch (error) {
          toast.error("Error generating ticket after payment.");
        }
      })();
    }
  // eslint-disable-next-line
  }, [pendingSessionId]);

  const handleBookTicket = async () => {
    if (!selectedStationId) {
      toast.error("Please select a station");
      return;
    }
    
    if (!selectedRouteId || !selectedBusId) {
      toast.error("Route and bus must be selected");
      return;
    }
    
    const station = stations?.find(s => s._id === selectedStationId);
    if (!station) {
      toast.error("Selected station not found");
      return;
    }
    
    try {
      setIsProcessing(true);
      toast.info("Redirecting to payment...");
      
      // Create a checkout session only (no booking to DB here)
      const response = await stripeService.createTicketCheckoutSession(
        selectedStationId,
        selectedBusId, 
        station.fare
      );
      
      if (response && response.url) {
        // Redirect to Stripe checkout
        await stripeService.redirectToCheckout(response.url);
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment processing failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout title="Book Ticket">
      <div className="container mx-auto py-4 space-y-6">
        <Card className="border-primary/20 bg-white shadow-md">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
            <CardTitle className="flex items-center text-lg sm:text-xl">
              <MapPin className="mr-2 text-primary h-5 w-5" />
              Book Your Ticket
            </CardTitle>
            <CardDescription>
              Select your route, bus and station to book a ticket
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-base sm:text-lg font-medium mb-2">Selected Route</h3>
                {isLoadingRoutes ? (
                  <Skeleton className="h-12 w-full" />
                ) : !selectedRoute ? (
                  <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200 flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">No route selected. Please <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/')}>go back</Button> and select a route.</span>
                  </div>
                ) : (
                  <div className="p-3 border rounded-md border-primary bg-primary/5">
                    <div className="flex justify-between items-center flex-wrap gap-2">
                      <span className="font-medium text-sm sm:text-base">{selectedRoute.start} - {selectedRoute.end}</span>
                      <Badge variant="outline" className="border-primary text-primary">₹{selectedRoute.fare}</Badge>
                    </div>
                  </div>
                )}
              </div>

              {selectedRouteId && (
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">Selected Bus</h3>
                  {isLoadingBuses ? (
                    <Skeleton className="h-12 w-full" />
                  ) : !selectedBus ? (
                    <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200 flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">No bus selected. Please <Button variant="link" className="p-0 h-auto text-primary" onClick={() => navigate('/')}>go back</Button> and select a bus.</span>
                    </div>
                  ) : (
                    <div className="p-3 border rounded-md border-primary bg-primary/5">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <span className="font-medium text-sm sm:text-base">{selectedBus.name}</span>
                        <Badge variant="outline" className="border-primary text-primary">Capacity: {selectedBus.capacity}</Badge>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedBusId && selectedRouteId && (
                <div>
                  <h3 className="text-base sm:text-lg font-medium mb-2">Select Station</h3>
                  {isLoadingStations ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full" />
                      <Skeleton className="h-12 w-full" />
                    </div>
                  ) : stations.length === 0 ? (
                    <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200 flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
                      <span className="text-sm">No stations available for this route and bus.</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stations.map(station => (
                        <div
                          key={station._id}
                          className={`p-3 border rounded-md cursor-pointer transition-all ${
                            selectedStationId === station._id 
                              ? "border-primary bg-primary/10" 
                              : "hover:border-primary border-gray-200"
                          }`}
                          onClick={() => setSelectedStationId(station._id)}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{station.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                              </p>
                            </div>
                            <Badge 
                              variant={selectedStationId === station._id ? "default" : "outline"} 
                              className={selectedStationId === station._id ? "bg-primary" : "border-primary text-primary"}
                            >
                              ₹{station.fare}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-3 p-4 sm:p-6">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Back
            </Button>
            <Button 
              onClick={handleBookTicket} 
              disabled={!selectedStationId || isProcessing}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Pay with Stripe"}
            </Button>
          </CardFooter>
        </Card>
      </div>
       <Button className="mb-8" onClick={() => setOpen(true)}>
        New Ticket
      </Button>
      <NewTicketModal open={open} onOpenChange={setOpen} />
    </MainLayout>
  );
};

export default BookingPage;
