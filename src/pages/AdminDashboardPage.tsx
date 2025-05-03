
import React from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Bus, MapPin } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  
  const adminModules = [
    {
      title: "Routes & Buses Management",
      description: "Manage transit routes and assign buses to routes",
      icon: <Bus className="h-10 w-10 text-transit-orange-light" />,
      path: "/routes",
      color: "bg-gradient-to-br from-transit-orange/10 to-transit-orange/20 border-transit-orange-light"
    },
    {
      title: "Station Management",
      description: "Add, edit and delete stations on routes",
      icon: <MapPin className="h-10 w-10 text-transit-purple" />,
      path: "/stations",
      color: "bg-gradient-to-br from-transit-purple/10 to-transit-purple/20 border-transit-purple-light"
    },
    {
      title: "System Settings",
      description: "Configure system-wide settings and parameters",
      icon: <Settings className="h-10 w-10 text-transit-blue" />,
      path: "/settings",
      color: "bg-gradient-to-br from-transit-blue/10 to-transit-blue/20 border-transit-light-blue"
    }
  ];

  return (
    <MainLayout title="Admin Dashboard">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-transit-orange-dark">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage all aspects of your transit system</p>
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
                <CardTitle>{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
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
