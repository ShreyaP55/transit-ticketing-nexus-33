
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Bus, Calendar, Navigation } from "lucide-react";
import { routesAPI, busesAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useUser();

  // Fetch routes & buses for display of summary/popular (but no search or buy on homepage)
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll
  });

  const {
    data: buses = [],
    isLoading: isLoadingBuses,
  } = useQuery({
    queryKey: ["buses-summary"],
    queryFn: () => busesAPI.getAll(),
  });

  return (
    <MainLayout title="Home">
      <div className="max-w-5xl mx-auto my-8 px-2 sm:px-4">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary">Welcome to TransitNexus</h1>
          <p className="text-muted-foreground text-lg">
            The modern way to travel. Discover routes, track buses, and manage tickets all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <Card className="bg-primary text-white border-none shadow-lg overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <MapPin size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-medium ml-3">Popular Routes</h3>
              </div>
              <ul className="space-y-3">
                {isLoadingRoutes ? (
                  <li>Loading...</li>
                ) : (
                  routes.slice(0, 4).map((route) => (
                    <li 
                      key={route._id}
                      className="p-3 hover:bg-white/10 rounded-md cursor-pointer transition-all"
                    >
                      <div className="font-medium">{route.start} → {route.end}</div>
                      <div className="text-sm text-white/80">₹{route.fare}</div>
                    </li>
                  ))
                )}
                {routes.length === 0 && !isLoadingRoutes && (
                  <li className="text-white/70">No routes available</li>
                )}
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
                {isLoadingBuses ? (
                  <div>Loading buses...</div>
                ) : buses.length === 0 ? (
                  <div className="text-white/70">No buses available</div>
                ) : (
                  buses.slice(0, 4).map((bus) => (
                    <div 
                      key={bus._id}
                      className="p-3 hover:bg-white/10 rounded-md transition-all"
                    >
                      <div className="font-medium">{bus.name}</div>
                      <div className="text-sm text-white/80">Capacity: {bus.capacity} seats</div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-primary mb-4">
                <Calendar size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-2">Monthly Pass</h3>
              <p className="text-center text-muted-foreground">Get unlimited rides with our monthly passes</p>
              <Button
                variant="outline"
                className="mt-4 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate('/pass')}
              >
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
              <Button
                variant="outline"
                className="mt-4 border-[#2196F3] text-[#2196F3] hover:bg-[#2196F3] hover:text-white"
                onClick={() => navigate('/tracking')}
              >
                Track Now
              </Button>
            </CardContent>
          </Card>
          <Card className="border-primary/20 bg-white shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="h-14 w-14 flex items-center justify-center rounded-full bg-primary mb-4">
                <MapPin size={28} className="text-white" />
              </div>
              <h3 className="text-xl font-medium text-primary mb-2">My Tickets</h3>
              <p className="text-center text-muted-foreground">All your single journey tickets in one place</p>
              <Button
                variant="outline"
                className="mt-4 border-primary text-primary hover:bg-primary hover:text-white"
                onClick={() => navigate('/tickets')}
              >
                View Tickets
              </Button>
            </CardContent>
          </Card>
        </div>

        {isAdmin && (
          <div className="mt-12 mb-4">
            <h2 className="text-xl font-semibold mb-4 text-center text-primary">Admin Panel</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                className="bg-primary hover:bg-primary/80 text-white"
                onClick={() => navigate('/admin')}
              >
                Admin Dashboard
              </Button>
              <Button
                className="bg-primary hover:bg-primary/80 text-white"
                onClick={() => navigate('/routes')}
              >
                Manage Routes
              </Button>
              <Button
                className="bg-primary hover:bg-primary/80 text-white"
                onClick={() => navigate('/buses')}
              >
                Manage Buses
              </Button>
              <Button
                className="bg-primary hover:bg-primary/80 text-white"
                onClick={() => navigate('/stations')}
              >
                Manage Stations
              </Button>
              <Button
                className="bg-primary hover:bg-primary/80 text-white"
                onClick={() => navigate('/admin/live-tracking')}
              >
                Admin Live Bus Tracking
              </Button>
            </div>
          </div>
        )}

        <div className="mt-16 text-center text-muted-foreground text-xs">
          &copy; {new Date().getFullYear()} TransitNexus. All rights reserved.
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
