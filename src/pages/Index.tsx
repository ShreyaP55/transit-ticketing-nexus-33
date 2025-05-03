
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Bus, Calendar, Navigation, Ticket } from "lucide-react";
import { routesAPI, busesAPI } from "@/services/api";
import { IRoute, IBus } from "@/types";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [selectedBus, setSelectedBus] = useState<string>("");
  
  // Fetch routes
  const { 
    data: routes = [], 
    isLoading: isLoadingRoutes,
    error: routesError
  } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll
  });
  
  // Fetch buses based on selected route
  const {
    data: buses = [],
    isLoading: isLoadingBuses,
    refetch: refetchBuses
  } = useQuery({
    queryKey: ["buses", selectedRoute],
    queryFn: () => selectedRoute ? busesAPI.getAll(selectedRoute) : Promise.resolve([]),
    enabled: !!selectedRoute
  });
  
  // Reset bus selection when route changes
  useEffect(() => {
    setSelectedBus("");
    if (selectedRoute) {
      refetchBuses();
    }
  }, [selectedRoute, refetchBuses]);
  
  // Filter routes based on search term
  const filteredRoutes = routes.filter(route => 
    route.start.toLowerCase().includes(searchTerm.toLowerCase()) || 
    route.end.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
  };
  
  const handleProceed = () => {
    if (!selectedRoute || !selectedBus) {
      toast.error("Please select both a route and a bus");
      return;
    }
    navigate(`/booking?routeId=${selectedRoute}&busId=${selectedBus}`);
  };
  
  if (routesError) {
    return (
      <MainLayout title="Home">
        <div className="flex flex-col items-center justify-center h-full">
          <h3 className="text-xl font-medium text-red-500">Failed to load routes</h3>
          <p className="text-muted-foreground">Please try again later</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Book Your Transit Ticket">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-transit-orange-dark">Welcome to TransitNexus</h1>
          <p className="text-muted-foreground text-lg">Find your route and book tickets easily</p>
        </div>
        
        <div className="mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 text-transit-orange-light h-5 w-5" />
            <Input
              type="text"
              placeholder="Search routes by origin or destination"
              className="pl-10 py-6 text-lg border-transit-orange-light focus:border-transit-orange focus:ring-transit-orange"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid gap-4">
            <Card className="border-transit-orange-light bg-gradient-to-br from-white to-transit-orange/5 shadow-md">
              <CardContent className="p-6">
                <div className="grid gap-6">
                  <div>
                    <Label htmlFor="route" className="text-lg text-transit-orange-dark">Select Route</Label>
                    <Select 
                      value={selectedRoute} 
                      onValueChange={handleRouteSelect}
                    >
                      <SelectTrigger id="route" className="mt-2 border-transit-orange-light">
                        <SelectValue placeholder="Select a route" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingRoutes ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          filteredRoutes.map((route) => (
                            <SelectItem key={route._id} value={route._id}>
                              {route.start} - {route.end} (₹{route.fare})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedRoute && (
                    <div>
                      <Label htmlFor="bus" className="text-lg text-transit-orange-dark">Select Bus</Label>
                      <Select 
                        value={selectedBus} 
                        onValueChange={setSelectedBus}
                      >
                        <SelectTrigger id="bus" className="mt-2 border-transit-orange-light">
                          <SelectValue placeholder="Select a bus" />
                        </SelectTrigger>
                        <SelectContent>
                          {isLoadingBuses ? (
                            <SelectItem value="loading" disabled>
                              Loading...
                            </SelectItem>
                          ) : buses.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No buses available
                            </SelectItem>
                          ) : (
                            buses.map((bus) => (
                              <SelectItem key={bus._id} value={bus._id}>
                                {bus.name} (Capacity: {bus.capacity})
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {selectedRoute && selectedBus && (
          <div className="flex justify-end">
            <Button 
              onClick={handleProceed} 
              className="px-8 py-6 text-lg orangeGradient hover:bg-transit-orange-dark"
            >
              Proceed to Booking
            </Button>
          </div>
        )}
        
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <Card className="orangeGradient text-white border-none shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <MapPin size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-medium ml-3">Popular Routes</h3>
              </div>
              <ul className="space-y-3">
                {routes.slice(0, 4).map((route: IRoute) => (
                  <li 
                    key={route._id}
                    className="p-3 hover:bg-white/10 rounded-md cursor-pointer transition-all"
                    onClick={() => handleRouteSelect(route._id)}
                  >
                    <div className="font-medium">{route.start} → {route.end}</div>
                    <div className="text-sm text-white/80">₹{route.fare}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="purpleGradient text-white border-none shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <Bus size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-medium ml-3">Featured Buses</h3>
              </div>
              <div className="space-y-3">
                {buses.slice(0, 4).map((bus: IBus) => (
                  <div 
                    key={bus._id}
                    className="p-3 hover:bg-white/10 rounded-md cursor-pointer transition-all"
                    onClick={() => setSelectedBus(bus._id)}
                  >
                    <div className="font-medium">{bus.name}</div>
                    <div className="text-sm text-white/80">
                      Capacity: {bus.capacity} seats
                    </div>
                  </div>
                ))}
                {buses.length === 0 && !isLoadingBuses && (
                  <div className="p-3 text-white/80">
                    Select a route to see available buses
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-transit-orange-light bg-gradient-to-br from-white to-transit-orange/5 shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full orangeGradient mb-4">
                <Ticket size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-transit-orange-dark mb-2">Tickets</h3>
              <p className="text-center text-muted-foreground">Book single journey tickets for any route</p>
              <Button variant="outline" className="mt-4 border-transit-orange text-transit-orange hover:bg-transit-orange hover:text-white" onClick={() => navigate('/tickets')}>
                View Tickets
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-transit-purple-light bg-gradient-to-br from-white to-transit-purple/5 shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full purpleGradient mb-4">
                <Calendar size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-transit-purple-dark mb-2">Monthly Pass</h3>
              <p className="text-center text-muted-foreground">Get unlimited rides with our monthly passes</p>
              <Button variant="outline" className="mt-4 border-transit-purple text-transit-purple hover:bg-transit-purple hover:text-white" onClick={() => navigate('/pass')}>
                View Passes
              </Button>
            </CardContent>
          </Card>
          
          <Card className="border-transit-light-blue bg-gradient-to-br from-white to-transit-light-blue/5 shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-gradient-to-r from-transit-light-blue to-transit-blue mb-4">
                <Navigation size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-transit-blue mb-2">Live Tracking</h3>
              <p className="text-center text-muted-foreground">Track your bus in real-time with our tracking system</p>
              <Button variant="outline" className="mt-4 border-transit-blue text-transit-blue hover:bg-transit-blue hover:text-white" onClick={() => navigate('/tracking')}>
                Track Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
