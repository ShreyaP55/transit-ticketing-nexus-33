
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Bus as BusIcon, Route as RouteIcon } from "lucide-react";
import { routesAPI, busesAPI } from "@/services/api";

const BusFilterSection = () => {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("all");

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll,
    staleTime: 1000 * 60 * 2
  });

  const { data: buses, isLoading: isLoadingBuses } = useQuery({
    queryKey: ["buses", selectedRouteId],
    queryFn: () => busesAPI.getAll(selectedRouteId === "all" ? undefined : selectedRouteId),
    staleTime: 1000 * 60,
    enabled: true,
  });

  return (
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
              <SelectItem value="all">Show All Buses</SelectItem>
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
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {[0, 1, 2].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
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
                  Route: {typeof bus.route === "object" && bus.route ? `${bus.route.start} - ${bus.route.end}` : 'Unassigned'}
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
  );
};

export default BusFilterSection;
