
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Bus, Calendar, Navigation, Ticket, Search } from "lucide-react";
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
    <div className="flex min-h-screen">
      {/* Sidebar */}
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
                <MapPin className="mr-2 h-5 w-5" />
                Home
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/20"
                onClick={() => navigate('/tickets')}
              >
                <Ticket className="mr-2 h-5 w-5" />
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
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/20"
                onClick={() => navigate('/routes')}
              >
                <Bus className="mr-2 h-5 w-5" />
                Routes & Buses
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/20"
                onClick={() => navigate('/stations')}
              >
                <MapPin className="mr-2 h-5 w-5" />
                Stations
              </Button>
            </li>
            <li>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:bg-white/20"
                onClick={() => navigate('/tracking')}
              >
                <Navigation className="mr-2 h-5 w-5" />
                Live Tracking
              </Button>
            </li>
          </ul>
        </nav>
        
        <div className="absolute bottom-4 w-64 px-4">
          <Button 
            variant="outline" 
            className="w-full text-white border-white hover:bg-white hover:text-[#FF5722]"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 bg-[#FFF9F4]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3 text-[#FF5722]">Welcome to TransitNexus</h1>
            <p className="text-muted-foreground text-lg">Find your route and book tickets easily</p>
          </div>
          
          <div className="mb-8">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 text-[#FF5722] h-5 w-5" />
              <Input
                type="text"
                placeholder="Search routes by origin or destination"
                className="pl-10 py-6 text-lg border-[#FF5722] focus:border-[#FF5722] focus:ring-[#FF5722]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid gap-4">
              <Card className="border-[#FF5722]/20 bg-white shadow-md">
                <CardContent className="p-6">
                  <div className="grid gap-6">
                    <div>
                      <Label htmlFor="route" className="text-lg text-[#FF5722]">Select Route</Label>
                      <Select 
                        value={selectedRoute} 
                        onValueChange={handleRouteSelect}
                      >
                        <SelectTrigger id="route" className="mt-2 border-[#FF5722]/20">
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
                        <Label htmlFor="bus" className="text-lg text-[#FF5722]">Select Bus</Label>
                        <Select 
                          value={selectedBus} 
                          onValueChange={setSelectedBus}
                        >
                          <SelectTrigger id="bus" className="mt-2 border-[#FF5722]/20">
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
                className="px-8 py-6 text-lg bg-[#FF5722] hover:bg-[#E64A19]"
              >
                Proceed to Booking
              </Button>
            </div>
          )}
          
          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <Card className="bg-[#FF5722] text-white border-none shadow-lg overflow-hidden">
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
            
            <Card className="bg-[#673AB7] text-white border-none shadow-lg overflow-hidden">
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
            <Card className="border-[#FF5722]/20 bg-white shadow-md">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-[#FF5722] mb-4">
                  <Ticket size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-medium text-[#FF5722] mb-2">Tickets</h3>
                <p className="text-center text-muted-foreground">Book single journey tickets for any route</p>
                <Button variant="outline" className="mt-4 border-[#FF5722] text-[#FF5722] hover:bg-[#FF5722] hover:text-white" onClick={() => navigate('/tickets')}>
                  View Tickets
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-[#673AB7]/20 bg-white shadow-md">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-[#673AB7] mb-4">
                  <Calendar size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-medium text-[#673AB7] mb-2">Monthly Pass</h3>
                <p className="text-center text-muted-foreground">Get unlimited rides with our monthly passes</p>
                <Button variant="outline" className="mt-4 border-[#673AB7] text-[#673AB7] hover:bg-[#673AB7] hover:text-white" onClick={() => navigate('/pass')}>
                  View Passes
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-[#2196F3]/20 bg-white shadow-md">
              <CardContent className="p-6 flex flex-col items-center">
                <div className="h-14 w-14 flex items-center justify-center rounded-full bg-[#2196F3] mb-4">
                  <Navigation size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-medium text-[#2196F3] mb-2">Live Tracking</h3>
                <p className="text-center text-muted-foreground">Track your bus in real-time with our tracking system</p>
                <Button variant="outline" className="mt-4 border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3] hover:text-white" onClick={() => navigate('/tracking')}>
                  Track Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
