
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Bus, Clock, CalendarDays, CreditCard } from "lucide-react";
import { routesAPI, busesAPI, stationsAPI, paymentAPI, ticketsAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const BookingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeId = searchParams.get("routeId") || "";
  const busId = searchParams.get("busId") || "";
  
  const [selectedStationId, setSelectedStationId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Redirect if no routeId or busId
  useEffect(() => {
    if (!routeId || !busId) {
      navigate("/");
    }
  }, [routeId, busId, navigate]);
  
  // Fetch route details
  const { data: route } = useQuery({
    queryKey: ["route", routeId],
    queryFn: async () => {
      const routes = await routesAPI.getAll();
      return routes.find(r => r._id === routeId);
    },
    enabled: !!routeId
  });
  
  // Fetch bus details
  const { data: bus } = useQuery({
    queryKey: ["bus", busId],
    queryFn: async () => {
      const buses = await busesAPI.getAll(routeId);
      return buses.find(b => b._id === busId);
    },
    enabled: !!busId && !!routeId
  });
  
  // Fetch stations for the selected route
  const { data: stations = [] } = useQuery({
    queryKey: ["stations", routeId, busId],
    queryFn: () => stationsAPI.getAll({ routeId, busId }),
    enabled: !!routeId && !!busId
  });
  
  const selectedStation = stations.find(s => s._id === selectedStationId);
  
  const handleBookTicket = async () => {
    if (!selectedStationId) {
      toast.error("Please select a station");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // In a real app, this would redirect to Stripe
      const stationFare = selectedStation?.fare || 0;
      const sessionId = await paymentAPI.createTicketCheckoutSession(selectedStationId, busId, stationFare);
      
      // Create ticket after successful payment
      const result = await ticketsAPI.create({
        sessionId,
        stationId: selectedStationId,
        busId
      });
      
      if (result.success) {
        toast.success("Ticket purchased successfully!");
        navigate("/tickets");
      }
    } catch (error) {
      toast.error("Failed to process payment");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (!route || !bus) {
    return (
      <MainLayout title="Loading...">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse text-lg">Loading booking details...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Book Ticket">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Booking</CardTitle>
            <CardDescription>
              Select your station and complete the booking process
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-transit-blue" />
                  <span className="font-medium">Route:</span> 
                  <span>{route.start} - {route.end}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Bus className="h-5 w-5 text-transit-blue" />
                  <span className="font-medium">Bus:</span> 
                  <span>{bus.name} (Capacity: {bus.capacity})</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-transit-blue" />
                  <span className="font-medium">Validity:</span> 
                  <span>24 hours from purchase</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-transit-blue" />
                  <span className="font-medium">Date:</span> 
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-2">
                <h3 className="text-md font-medium mb-2">Select Your Station:</h3>
                
                <Select 
                  value={selectedStationId}
                  onValueChange={setSelectedStationId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a station" />
                  </SelectTrigger>
                  <SelectContent>
                    {stations.length === 0 ? (
                      <SelectItem value="none" disabled>
                        No stations available
                      </SelectItem>
                    ) : (
                      stations.map((station) => (
                        <SelectItem key={station._id} value={station._id}>
                          {station.name} - ${station.fare}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedStationId && (
                <div className="bg-transit-blue bg-opacity-10 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Fare Summary</h4>
                  <div className="flex justify-between">
                    <span>Station fare</span>
                    <span>${selectedStation?.fare.toFixed(2)}</span>
                  </div>
                  <div className="border-t mt-2 pt-2 font-medium flex justify-between">
                    <span>Total</span>
                    <span>${selectedStation?.fare.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="mr-2"
              disabled={isProcessing}
            >
              Back
            </Button>
            <Button 
              onClick={handleBookTicket} 
              disabled={!selectedStationId || isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Pay & Book Ticket
                </span>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
};

export default BookingPage;
