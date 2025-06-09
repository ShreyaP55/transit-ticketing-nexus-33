
import React from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, QrCode, Navigation, Clock, MapPin, Bus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UserDashboardPage = () => {
  const navigate = useNavigate();
  
  const userModules = [
    {
      title: "My Wallet",
      description: "View balance, top up funds, and manage payment methods",
      icon: <Wallet className="h-10 w-10 text-primary" />,
      path: "/wallet",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "QR Code & Rides", 
      description: "Show your QR code and track current/past rides",
      icon: <QrCode className="h-10 w-10 text-primary" />,
      path: "/rides",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "Live Bus Tracking",
      description: "Track buses in real-time and plan your journey",
      icon: <Navigation className="h-10 w-10 text-primary" />,
      path: "/live-tracking",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "My Tickets",
      description: "View purchased tickets and booking history",
      icon: <Clock className="h-10 w-10 text-primary" />,
      path: "/tickets",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "Route Information",
      description: "Browse available routes and bus schedules",
      icon: <MapPin className="h-10 w-10 text-primary" />,
      path: "/routes",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "Bus Pass",
      description: "Purchase and manage your bus passes",
      icon: <Bus className="h-10 w-10 text-primary" />,
      path: "/pass",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    }
  ];

  return (
    <MainLayout title="User Dashboard">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white neonText">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your transit experience</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {userModules.map((module) => (
            <Card 
              key={module.title} 
              className={`hover:shadow-lg transition-all cursor-pointer ${module.color} bg-card`}
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <div className="mb-2">{module.icon}</div>
                <CardTitle className="text-white">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-primary/30 hover:border-primary hover:bg-primary/20 text-primary"
                  onClick={() => navigate(module.path)}
                >
                  Open
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default UserDashboardPage;
