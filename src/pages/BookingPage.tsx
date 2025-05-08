
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Map, Bus, Navigation, AlertCircle } from "lucide-react";
import { routesAPI, busesAPI, stationsAPI } from "@/services/api";
import { stripeService } from "@/services/stripeService";
import { toast } from "sonner";

const BookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get query parameters from URL
  const searchParams = new URLSearchParams(location.search);
  const routeIdParam = searchParams.get("routeId");
  const busIdParam = searchParams.get("busId");
  
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
      toast.info("Processing your payment...");
      
      // Get userId from localStorage or context
      const userId = localStorage.getItem("userId") || "guest-user";
      
      // Create a checkout session
      const response = await stripeService.createTicketCheckoutSession(
        selectedStationId,
        selectedBusId, 
        station.fare
      );
      
      if (response && response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
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
    <div className="flex min-h-screen">
      {/* Sidebar - similar to Index page */}
      <div className="w-64 bg-[#FF5722] text-white">
        <div className="p-4 flex items-center">
          <Bus className="mr-2" />
          <h1 className="text-2xl font-bold">TransitNexus</h1>
        </div>
        
        <nav className="mt-8">
          <ul className="space-y-2">
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/20"
                onClick={() => navigate('/')}
              >
                <Map className="mr-2 h-5 w-5" />
                Home
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/20"
                onClick={() => navigate('/tickets')}
              >
                <Bus className="mr-2 h-5 w-5" />
                My Tickets
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/20"
                onClick={() => navigate('/pass')}
              >
                <Calendar className="mr-2 h-5 w-5" />
                Monthly Pass
              </Button>
            </li>
            {/* Additional nav items */}
          </ul>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 bg-[#FFF9F4]">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="border-[#FF5722]/20 bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="mr-2 text-[#FF5722]" />
                Book Your Ticket
              </CardTitle>
              <CardDescription>
                Select your route, bus and station to book a ticket
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Selected Route</h3>
                  {isLoadingRoutes ? (
                    <Skeleton className="h-12 w-full" />
                  ) : !selectedRoute ? (
                    <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200 flex items-center">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                      <span>No route selected. Please <Button variant="link" className="p-0 h-auto text-[#FF5722]" onClick={() => navigate('/')}>go back</Button> and select a route.</span>
                    </div>
                  ) : (
                    <div className="p-3 border rounded-md border-[#FF5722] bg-[#FF5722]/5">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{selectedRoute.start} - {selectedRoute.end}</span>
                        <Badge variant="outline" className="border-[#FF5722] text-[#FF5722]">₹{selectedRoute.fare}</Badge>
                      </div>
                    </div>
                  )}
                </div>

                {selectedRouteId && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Selected Bus</h3>
                    {isLoadingBuses ? (
                      <Skeleton className="h-12 w-full" />
                    ) : !selectedBus ? (
                      <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200 flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span>No bus selected. Please <Button variant="link" className="p-0 h-auto text-[#FF5722]" onClick={() => navigate('/')}>go back</Button> and select a bus.</span>
                      </div>
                    ) : (
                      <div className="p-3 border rounded-md border-[#FF5722] bg-[#FF5722]/5">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{selectedBus.name}</span>
                          <Badge variant="outline" className="border-[#FF5722] text-[#FF5722]">Capacity: {selectedBus.capacity}</Badge>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedBusId && selectedRouteId && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Select Station</h3>
                    {isLoadingStations ? (
                      <div className="space-y-2">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ) : stations.length === 0 ? (
                      <div className="p-3 border rounded-md bg-yellow-50 border-yellow-200 flex items-center">
                        <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span>No stations available for this route and bus.</span>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {stations.map(station => (
                          <div
                            key={station._id}
                            className={`p-3 border rounded-md cursor-pointer transition-all ${
                              selectedStationId === station._id 
                                ? "border-[#FF5722] bg-[#FF5722]/10" 
                                : "hover:border-[#FF5722] border-gray-200"
                            }`}
                            onClick={() => setSelectedStationId(station._id)}
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium">{station.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {station.latitude.toFixed(6)}, {station.longitude.toFixed(6)}
                                </p>
                              </div>
                              <Badge variant={selectedStationId === station._id ? "default" : "outline"} className={selectedStationId === station._id ? "bg-[#FF5722]" : "border-[#FF5722] text-[#FF5722]"}>₹{station.fare}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate(-1)}
                disabled={isProcessing}
              >
                Back
              </Button>
              <Button 
                onClick={handleBookTicket} 
                disabled={!selectedStationId || isProcessing}
                className="bg-[#FF5722] hover:bg-[#E64A19]"
              >
                <Bus className="mr-2 h-4 w-4" />
                {isProcessing ? "Processing..." : "Book Ticket"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
