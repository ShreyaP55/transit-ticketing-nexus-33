
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import Hero from "@/components/home/Hero";
import { Calendar, Navigation, MapPin } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, userDetails } = useUser();

  return (
    <MainLayout title="Home">
      <div className="w-full relative mb-10">
        {/* Hero banner with avatar top right when authenticated */}
        <div className="absolute top-8 right-8 z-20">
          {isAuthenticated && userDetails && (
            <Avatar>
              <AvatarImage src={userDetails.imageUrl} alt={userDetails.firstName || "User"} />
              <AvatarFallback>
                {userDetails.firstName && userDetails.firstName[0]}
                {userDetails.lastName && userDetails.lastName[0]}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <Hero userFirstName={isAuthenticated && userDetails ? userDetails.firstName : undefined} />
      </div>
      {/* Quick links/cards section as before */}
      <div className="max-w-5xl mx-auto px-2 sm:px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-primary/20 bg-white shadow-md hover-scale">
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
          <Card className="border-[#2196F3]/20 bg-white shadow-md hover-scale">
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
          <Card className="border-primary/20 bg-white shadow-md hover-scale">
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
        {/* Admin panel remains for admins */}
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
