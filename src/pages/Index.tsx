
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Bus, Calendar, Navigation } from "lucide-react";
import { routesAPI, busesAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { useUser } from "@/context/UserContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, userDetails } = useUser();

  // Fetch routes & buses for display (optional, only admin might use)
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
  });

  const { data: buses = [], isLoading: isLoadingBuses } = useQuery({
    queryKey: ["buses-summary"],
    queryFn: () => busesAPI.getAll(),
  });

  // Render avatar and welcome message if user is logged in
  const renderWelcome = () => {
    if (!isAuthenticated || !userDetails) return null;
    return (
      <div className="flex items-center mb-8 space-x-4 justify-center">
        <Avatar>
          <AvatarImage
            src={userDetails.imageUrl}
            alt={userDetails.firstName || "User"}
          />
          <AvatarFallback>
            {userDetails.firstName?.charAt(0)}
            {userDetails.lastName?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <span className="text-xl md:text-2xl font-semibold text-primary">
          Welcome {userDetails.firstName ?? "User"}!
        </span>
      </div>
    );
  };

  return (
    <MainLayout title="Home">
      <div className="max-w-3xl mx-auto my-8 px-2 sm:px-4">
        {renderWelcome()}

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-primary">
            Welcome to TransitNexus
          </h1>
          <p className="text-muted-foreground text-lg">
            The modern way to travel. Discover routes, track buses, and manage tickets all in one place.
          </p>
        </div>

        {/* Optionally show admin quick stats */}
        {isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <Card className="bg-primary text-white border-none shadow-lg overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                    <MapPin size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">Routes</h3>
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
                        <div className="font-medium">
                          {route.start} → {route.end}
                        </div>
                        <div className="text-sm text-white/80">
                          ₹{route.fare}
                        </div>
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
                  <h3 className="text-xl font-medium ml-3">Buses</h3>
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
                        <div className="text-sm text-white/80">
                          Capacity: {bus.capacity} seats
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
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
