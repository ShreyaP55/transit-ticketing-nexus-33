
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Bus } from "lucide-react";
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
          <h1 className="text-3xl font-bold mb-2">Welcome to TransitNexus</h1>
          <p className="text-muted-foreground">Find your route and book tickets easily</p>
        </div>
        
        <div className="mb-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search routes by origin or destination"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="route">Select Route</Label>
                    <Select 
                      value={selectedRoute} 
                      onValueChange={handleRouteSelect}
                    >
                      <SelectTrigger id="route" className="mt-1">
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
                              {route.start} - {route.end} (${route.fare})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedRoute && (
                    <div>
                      <Label htmlFor="bus">Select Bus</Label>
                      <Select 
                        value={selectedBus} 
                        onValueChange={setSelectedBus}
                      >
                        <SelectTrigger id="bus" className="mt-1">
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
              className="px-8"
            >
              Proceed to Booking
            </Button>
          </div>
        )}
        
        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <Card className="bg-transit-blue bg-opacity-5 border-none">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-transit-blue text-white">
                  <MapPin size={20} />
                </div>
                <h3 className="text-lg font-medium ml-3">Popular Routes</h3>
              </div>
              <ul className="space-y-2">
                {routes.slice(0, 4).map((route: IRoute) => (
                  <li 
                    key={route._id}
                    className="p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => handleRouteSelect(route._id)}
                  >
                    <div className="font-medium">{route.start} → {route.end}</div>
                    <div className="text-sm text-muted-foreground">${route.fare}</div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="bg-transit-green bg-opacity-5 border-none">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-transit-green text-white">
                  <Bus size={20} />
                </div>
                <h3 className="text-lg font-medium ml-3">Featured Buses</h3>
              </div>
              <div className="space-y-2">
                {buses.slice(0, 4).map((bus: IBus) => (
                  <div 
                    key={bus._id}
                    className="p-2 hover:bg-accent rounded-md cursor-pointer"
                    onClick={() => setSelectedBus(bus._id)}
                  >
                    <div className="font-medium">{bus.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Capacity: {bus.capacity} seats
                    </div>
                  </div>
                ))}
                {buses.length === 0 && !isLoadingBuses && (
                  <div className="p-2 text-muted-foreground">
                    Select a route to see available buses
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
