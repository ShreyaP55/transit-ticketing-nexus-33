
import React from "react";
import { useNavigate } from "react-router-dom";
import { Navigation, QrCode, Users, BarChart, Settings, Bus } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const UberLikeAdminDashboard = () => {
  const navigate = useNavigate();
  
  const adminModules = [
    {
      title: "Live Ride Management",
      description: "Monitor active rides, track passengers, and manage real-time operations",
      icon: <Navigation className="h-10 w-10 text-primary" />,
      path: "/admin/rides",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "QR Scanner",
      description: "Scan passenger QR codes for boarding and alighting with GPS tracking",
      icon: <QrCode className="h-10 w-10 text-primary" />,
      path: "/qr-scanner",
      color: "bg-gradient-to-br from-green-100 to-green-50 border-green-200"
    },
    {
      title: "Live Bus Tracking",
      description: "Monitor bus locations and fleet management in real-time",
      icon: <Bus className="h-10 w-10 text-primary" />,
      path: "/live-tracking",
      color: "bg-gradient-to-br from-blue-100 to-blue-50 border-blue-200"
    },
    {
      title: "User Management",
      description: "View user accounts, wallet balances, and ride history",
      icon: <Users className="h-10 w-10 text-primary" />,
      path: "/admin/users",
      color: "bg-gradient-to-br from-purple-100 to-purple-50 border-purple-200"
    },
    {
      title: "Analytics & Reports",
      description: "View revenue reports, usage statistics, and performance metrics",
      icon: <BarChart className="h-10 w-10 text-primary" />,
      path: "/admin/analytics",
      color: "bg-gradient-to-br from-orange-100 to-orange-50 border-orange-200"
    },
    {
      title: "System Settings",
      description: "Configure fare rates, bus settings, and system parameters",
      icon: <Settings className="h-10 w-10 text-primary" />,
      path: "/admin/settings",
      color: "bg-gradient-to-br from-gray-100 to-gray-50 border-gray-200"
    }
  ];

  return (
    <MainLayout title="UberBus Admin Dashboard">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white neonText">Uber-like Bus Admin</h1>
          <p className="text-muted-foreground">Manage your smart bus fleet with real-time tracking and fare collection</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6">
          {adminModules.map((module) => (
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
                  Manage
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default UberLikeAdminDashboard;
