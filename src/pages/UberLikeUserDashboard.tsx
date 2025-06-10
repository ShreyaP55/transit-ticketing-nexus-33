
import React from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, QrCode, Navigation, MapPin, Bus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UberLikeUserDashboard = () => {
  const navigate = useNavigate();
  
  const userModules = [
    {
      title: "My Wallet",
      description: "View balance, top up funds, and manage payments for rides",
      icon: <Wallet className="h-10 w-10 text-primary" />,
      path: "/wallet",
      color: "bg-gradient-to-br from-green-100 to-green-50 border-green-200"
    },
    {
      title: "QR Code & Rides", 
      description: "Show your QR code and track current/past rides with live GPS",
      icon: <QrCode className="h-10 w-10 text-primary" />,
      path: "/rides",
      color: "bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200"
    },
    {
      title: "Live Bus Tracking",
      description: "Track buses in real-time and find nearby buses",
      icon: <Navigation className="h-10 w-10 text-primary" />,
      path: "/live-tracking",
      color: "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200"
    }
  ];

  return (
    <MainLayout title="UberBus Dashboard">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white neonText">My UberBus Dashboard</h1>
          <p className="text-muted-foreground">Manage your smart bus journey with real-time tracking and easy payments</p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userModules.map((module) => (
            <Card 
              key={module.title} 
              className={`hover:shadow-lg transition-all cursor-pointer ${module.color}`}
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <div className="mb-2">{module.icon}</div>
                <CardTitle className="text-gray-800">{module.title}</CardTitle>
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

export default UberLikeUserDashboard;
