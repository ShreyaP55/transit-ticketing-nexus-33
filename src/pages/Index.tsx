
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import MainLayout from "@/components/layout/MainLayout";
import { CheckCircle, ClipboardCheck, Calendar, Bus as BusIcon, MapPin, User, Route as RouteIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { routesAPI, busesAPI } from "@/services/api";
import { IBus, IRoute } from "@/types";

const featureCards = [
  {
    icon: <Calendar size={32} className="text-primary" />,
    title: "Monthly Pass",
    desc: "Unlimited city rides with a digital monthly pass. Never stand in lines again."
  },
  {
    icon: <MapPin size={32} className="text-primary" />,
    title: "Live Tracking",
    desc: "Track your bus in real time and plan stress-free journeys from anywhere."
  },
  {
    icon: <ClipboardCheck size={32} className="text-primary" />,
    title: "Your Tickets",
    desc: "Access and manage your bookings anytime—no paper needed."
  },
];

const steps = [
  {
    icon: <User size={28} className="text-primary" />,
    title: "Sign Up",
    desc: "Create your profile in seconds."
  },
  {
    icon: <BusIcon size={28} className="text-primary" />,
    title: "Select Trip",
    desc: "Choose your route or get a monthly pass."
  },
  {
    icon: <CheckCircle size={28} className="text-primary" />,
    title: "Ride",
    desc: "Board, scan & travel with ease."
  },
];

// Bus image for hero section
const heroImg = "https://images.unsplash.com/photo-1570125909232-eb263c186f72?auto=format&fit=crop&w=900&q=80"; // Modern bus

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, userDetails } = useUser();

  // State to hold selected route
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");

  // Fetch all routes
  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
    staleTime: 1000 * 60 * 2
  });

  // Fetch buses for selected route (or all if none selected)
  const { data: buses, isLoading: isLoadingBuses } = useQuery({
    queryKey: ["buses", selectedRouteId],
    queryFn: () => busesAPI.getAll(selectedRouteId || undefined),
    staleTime: 1000 * 60,
    enabled: true, // always enabled so we see all buses if not filtered
  });

  return (
    <MainLayout title="Home">
      <div className="relative w-full max-w-5xl mx-auto my-8 px-2 sm:px-4">
        {/* Decorative BG */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl z-0 animate-fade-in" />
        <div className="absolute top-1/2 -left-24 w-64 h-32 bg-secondary/50 rounded-full blur-3xl z-0 animate-fade-in" />

        {/* Hero Section */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 py-8 mb-12">
          {/* Hero Text */}
          <div className="flex-1 text-center md:text-left space-y-4 animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 gradient-heading">
              {isAuthenticated && userDetails?.firstName
                ? `Welcome, ${userDetails.firstName}!`
                : "TransitNexus – Smart City Transit"}
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Experience simple, modern travel. Book tickets, renew your pass, track buses—everything at your fingertips.
            </p>
            <div className="mt-5 flex gap-4 justify-center md:justify-start">
              <Button size="lg" className="animate-scale-in"
                onClick={() => navigate("/pass")}>
                Get a Pass
              </Button>
              <Button size="lg" variant="outline"
                onClick={() => navigate("/tickets")}>
                My Tickets
              </Button>
            </div>
          </div>
          {/* Hero Image */}
          <div className="flex-1 flex items-center justify-center animate-fade-in">
            <div className="shadow-2xl rounded-xl overflow-hidden w-[320px] h-[220px] relative group hover:scale-105 transition-transform duration-200">
              <img
                src={heroImg}
                alt="Modern city bus"
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <div className="absolute top-3 right-3 bg-white/85 px-3 py-1 rounded-full flex items-center gap-2 shadow animate-fade-in">
                <BusIcon size={20} className="text-primary" />
                <span className="font-bold text-sm text-primary">
                  Green Route
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 animate-fade-in">
          {featureCards.map((feat, idx) => (
            <div
              className="bg-white border border-primary/20 p-6 rounded-xl text-center shadow-lg hover:scale-105 transition-all duration-300 flex flex-col items-center gap-3 animate-scale-in"
              key={idx}
              style={{ animationDelay: `${idx * 120}ms` }}
            >
              <div className="mb-2">{feat.icon}</div>
              <h3 className="text-lg font-semibold text-primary">{feat.title}</h3>
              <p className="text-muted-foreground">{feat.desc}</p>
            </div>
          ))}
        </div>
        
        {/* --- Bus Filter and Assigned Route's Buses --- */}
        <Card className="mb-12 border-primary/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <RouteIcon className="h-5 w-5 text-transit-orange" />
                <CardTitle className="text-lg font-bold">
                  Assigned Buses for Selected Route
                </CardTitle>
              </div>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId}>
                <SelectTrigger className="min-w-[220px]">
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Show All Buses</SelectItem>
                  {isLoadingRoutes ? (
                    <SelectItem value="loading" disabled>
                      Loading routes...
                    </SelectItem>
                  ) : (
                    routes?.map(route => (
                      <SelectItem key={route._id} value={route._id}>
                        {route.start} - {route.end}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <CardDescription>
              View buses assigned to a particular route or see all.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingBuses ? (
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <Skeleton key={i} className="h-16 w-1/3 min-w-[180px]" />
                ))}
              </div>
            ) : buses?.length === 0 ? (
              <div className="text-muted-foreground text-center py-8">
                <BusIcon className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                No buses found for this route.
              </div>
            ) : (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                {buses?.map(bus => (
                  <Card key={bus._id} className="flex flex-col items-start p-4 border border-border bg-background/80 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-2 mb-2">
                      <BusIcon className="h-5 w-5 text-transit-orange" />
                      <span className="font-bold text-primary text-xl">{bus.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RouteIcon className="h-4 w-4" />
                      Route: {typeof bus.route === "object" && bus.route ? `${bus.route.start} - ${bus.route.end}` : bus.route || 'Unknown'}
                    </div>
                    <Badge variant="outline" className="mt-2 bg-accent/20 text-primary border-transit-orange/20">
                      {bus.capacity} seats
                    </Badge>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* How It Works */}
        <div className="mt-8 mb-16 px-1 py-8 bg-white/90 rounded-2xl shadow-md animate-fade-in">
          <h2 className="text-2xl font-bold text-primary text-center mb-8">How it works</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {steps.map((step, idx) => (
              <div
                className={`flex flex-col items-center flex-1 max-w-xs transition-all duration-200 animate-fade-in hover:scale-105`}
                style={{ animationDelay: `${idx * 120}ms` }}
                key={idx}
              >
                <div className="w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 mb-3 border border-primary/10">{step.icon}</div>
                <div className="text-xl font-medium text-primary text-center">{step.title}</div>
                <div className="text-muted-foreground text-center">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
