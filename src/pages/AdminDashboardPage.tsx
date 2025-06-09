
import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Bus, MapPin, QrCode, Users, Navigation, BarChart } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  
  const adminModules = [
    {
      title: "Ride Management",
      description: "Track active rides, monitor passengers, and view ride history",
      icon: <Navigation className="h-10 w-10 text-primary" />,
      path: "/admin/rides",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "QR Code Scanner",
      description: "Scan passenger QR codes for boarding and alighting",
      icon: <QrCode className="h-10 w-10 text-primary" />,
      path: "/qr-scan",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "Routes & Buses",
      description: "Manage transit routes and assign buses to routes",
      icon: <Bus className="h-10 w-10 text-primary" />,
      path: "/routes",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "Station Management",
      description: "Add, edit and delete stations on routes",
      icon: <MapPin className="h-10 w-10 text-primary" />,
      path: "/stations",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "User Management",
      description: "View user accounts, wallet balances, and transaction history",
      icon: <Users className="h-10 w-10 text-primary" />,
      path: "/admin/users",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "Live Bus Tracking",
      description: "Monitor bus locations and fleet management",
      icon: <Navigation className="h-10 w-10 text-primary" />,
      path: "/live-tracking",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "Analytics & Reports",
      description: "View revenue reports, usage statistics, and performance metrics",
      icon: <BarChart className="h-10 w-10 text-primary" />,
      path: "/admin/analytics",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and parameters",
      icon: <Settings className="h-10 w-10 text-primary" />,
      path: "/settings",
      color: "bg-gradient-to-br from-primary/20 to-primary/10 border-primary/30"
    }
  ];

  return (
    <MainLayout title="Admin Dashboard">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white neonText">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all aspects of your transit system</p>
        </header>

        <div className="grid md:grid-cols-4 gap-6">
          {adminModules.map((module) => (
            <Card 
              key={module.title} 
              className={`hover:shadow-lg transition-all cursor-pointer ${module.color} bg-card`}
              onClick={() => navigate(module.path)}
            >
              <CardHeader>
                <div className="mb-2">{module.icon}</div>
                <CardTitle className="text-white text-sm">{module.title}</CardTitle>
                <CardDescription className="text-xs">{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  size="sm"
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

export default AdminDashboardPage;
