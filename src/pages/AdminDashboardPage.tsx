
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, CreditCard, MapPin, Calendar, Clock, CheckCircle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { fetchAPI } from "@/services/api/base";

interface PassUsage {
  _id: string;
  userId: string;
  userName: string;
  passId: string;
  usedAt: string;
  location: {
    latitude: number;
    longitude: number;
  };
  busId: string;
  busName: string;
}

interface Ride {
  _id: string;
  userId: string;
  userName: string;
  busId: string;
  busName: string;
  active: boolean;
  startLocation: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  endLocation?: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  distance?: number;
  duration?: number;
  fare?: number;
}

interface CompletedRidesResponse {
  rides: Ride[];
  totalPages: number;
  currentPage: number;
}

const AdminDashboardPage = () => {
  // Fetch pass usage history
  const { data: passUsages = [], isLoading: passUsagesLoading } = useQuery<PassUsage[]>({
    queryKey: ["admin-pass-usages"],
    queryFn: () => fetchAPI("/passes/usage-history"),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch active rides
  const { data: activeRides = [], isLoading: activeRidesLoading } = useQuery<Ride[]>({
    queryKey: ["admin-active-rides"],
    queryFn: () => fetchAPI("/rides/active"),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Fetch completed rides
  const { data: completedRidesData, isLoading: completedRidesLoading } = useQuery<CompletedRidesResponse>({
    queryKey: ["admin-completed-rides"],
    queryFn: () => fetchAPI("/rides/completed?limit=10"),
    refetchInterval: 60000, // Refresh every minute
  });

  const completedRides = completedRidesData?.rides || [];

  const stats = [
    {
      title: "Active Riders",
      value: activeRides.length,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Pass Usages Today",
      value: passUsages.filter((usage: PassUsage) => {
        const today = new Date().toDateString();
        return new Date(usage.usedAt).toDateString() === today;
      }).length,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Completed Rides",
      value: completedRides.length,
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
  ];

  return (
    <MainLayout title="Admin Dashboard">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 md:h-7 md:w-7 text-primary" />
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat) => (
            <Card key={stat.title} className="w-full">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl md:text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 md:h-6 md:w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Pass Usage History */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Recent Pass Usages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {passUsagesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : passUsages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No pass usages found</p>
              ) : (
                passUsages.slice(0, 10).map((usage: PassUsage) => (
                  <div key={usage._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-muted/50 rounded-lg gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{usage.userName}</p>
                        <Badge variant="outline" className="text-xs">Pass</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {usage.location.latitude.toFixed(4)}, {usage.location.longitude.toFixed(4)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Bus: {usage.busName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3 w-3" />
                      <span className="whitespace-nowrap">
                        {new Date(usage.usedAt).toLocaleDateString()}
                      </span>
                      <Clock className="h-3 w-3 ml-2" />
                      <span className="whitespace-nowrap">
                        {new Date(usage.usedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Active Rides */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg md:text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                Active Rides ({activeRides.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {activeRidesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : activeRides.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No active rides</p>
              ) : (
                activeRides.map((ride: Ride) => (
                  <div key={ride._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium truncate">{ride.userName}</p>
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200 text-xs">
                          Active
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">
                          {ride.startLocation.latitude.toFixed(4)}, {ride.startLocation.longitude.toFixed(4)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Bus: {ride.busName}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3 w-3" />
                      <span className="whitespace-nowrap">
                        {new Date(ride.startLocation.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Completed Rides */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Recent Completed Rides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {completedRidesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : completedRides.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No completed rides found</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {completedRides.map((ride: Ride) => (
                  <div key={ride._id} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">{ride.userName}</p>
                      <Badge variant="secondary" className="text-xs">Completed</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Bus: {ride.busName}</p>
                      {ride.distance && <p>Distance: {ride.distance.toFixed(2)} km</p>}
                      {ride.duration && <p>Duration: {Math.round(ride.duration)} min</p>}
                      {ride.fare && <p>Fare: ₹{ride.fare.toFixed(2)}</p>}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>
                        {ride.endLocation && new Date(ride.endLocation.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
