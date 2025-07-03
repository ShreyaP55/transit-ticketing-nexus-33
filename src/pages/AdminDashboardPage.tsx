
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Users, Navigation, MapPin, Clock, Calendar } from "lucide-react";
import { format } from "date-fns";
import { passesAPI, tripsAPI } from "@/services/api";

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: passUsageHistory = [], isLoading: isLoadingUsage } = useQuery({
    queryKey: ["admin-pass-usage"],
    queryFn: () => passesAPI.getPassUsage(),
  });

  const { data: allTrips = [], isLoading: isLoadingTrips } = useQuery({
    queryKey: ["admin-all-trips"],
    queryFn: () => tripsAPI.getUserTrips("all"), // We'll need to modify this endpoint
  });

  const activeRiders = allTrips.filter(trip => trip.active);
  const completedRides = allTrips.filter(trip => !trip.active);

  const stats = {
    totalPassUsage: passUsageHistory.length,
    activeRiders: activeRiders.length,
    completedRides: completedRides.length,
    totalRevenue: completedRides.reduce((sum, trip) => sum + (trip.fare || 0), 0),
  };

  return (
    <MainLayout title="Admin Dashboard">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Validations</CardTitle>
              <Navigation className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPassUsage}</div>
              <p className="text-xs text-muted-foreground">Total pass scans</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Riders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRiders}</div>
              <p className="text-xs text-muted-foreground">Currently traveling</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Rides</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedRides}</div>
              <p className="text-xs text-muted-foreground">Total finished trips</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">From completed rides</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="pass-usage" className="flex-1">Pass Usage History</TabsTrigger>
            <TabsTrigger value="active-riders" className="flex-1">Active Riders</TabsTrigger>
            <TabsTrigger value="completed-rides" className="flex-1">Completed Rides</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Pass Validations</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingUsage ? (
                    <p>Loading...</p>
                  ) : passUsageHistory.slice(0, 5).map((usage) => (
                    <div key={usage._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">User: {usage.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          {usage.location || "Unknown Location"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{format(new Date(usage.scannedAt), "h:mm a")}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(usage.scannedAt), "MMM d")}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Active Trips</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingTrips ? (
                    <p>Loading...</p>
                  ) : activeRiders.slice(0, 5).map((trip) => (
                    <div key={trip._id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">User: {trip.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          Started: {format(new Date(trip.createdAt), "h:mm a")}
                        </p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="pass-usage">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Pass Usage History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {isLoadingUsage ? (
                    <p>Loading pass usage history...</p>
                  ) : passUsageHistory.map((usage) => (
                    <div key={usage._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-medium">User ID: {usage.userId}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {usage.location || "Unknown Location"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {format(new Date(usage.scannedAt), "h:mm a")}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(usage.scannedAt), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="active-riders">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Active Riders ({activeRiders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingTrips ? (
                    <p>Loading active riders...</p>
                  ) : activeRiders.map((trip) => (
                    <div key={trip._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">User: {trip.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          Trip started: {format(new Date(trip.createdAt), "MMM d, yyyy h:mm a")}
                        </p>
                        {trip.startLocation && (
                          <p className="text-xs text-muted-foreground">
                            Location: {trip.startLocation.latitude.toFixed(4)}, {trip.startLocation.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge className="bg-green-100 text-green-800 mb-2">Active</Badge>
                        <p className="text-xs text-muted-foreground">
                          Duration: {Math.floor((Date.now() - new Date(trip.createdAt).getTime()) / (1000 * 60))} min
                        </p>
                      </div>
                    </div>
                  ))}
                  {activeRiders.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No active riders at the moment</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed-rides">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Completed Rides ({completedRides.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {isLoadingTrips ? (
                    <p>Loading completed rides...</p>
                  ) : completedRides.map((trip) => (
                    <div key={trip._id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">User: {trip.userId}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(trip.createdAt), "MMM d, yyyy h:mm a")}
                        </p>
                        {trip.duration && (
                          <p className="text-xs text-muted-foreground">
                            Duration: {Math.floor(trip.duration / 60)} minutes
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-2">Completed</Badge>
                        {trip.fare && (
                          <p className="text-sm font-medium">₹{trip.fare.toFixed(2)}</p>
                        )}
                        {trip.distance && (
                          <p className="text-xs text-muted-foreground">
                            {trip.distance.toFixed(2)} km
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
