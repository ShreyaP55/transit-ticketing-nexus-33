
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Map, Bus, MapPin } from "lucide-react";
import { routesAPI, busesAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IBus, IRoute } from "@/types";

const RoutesPage = () => {
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  
  // Fetch routes
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll
  });
  
  // Fetch buses based on selected route
  const { data: buses = [], isLoading: isLoadingBuses } = useQuery({
    queryKey: ["buses", selectedRoute],
    queryFn: () => selectedRoute ? busesAPI.getAll(selectedRoute) : Promise.resolve([]),
    enabled: !!selectedRoute
  });
  
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
  };

  return (
    <MainLayout title="Routes & Buses">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-transit-blue text-white mr-3">
            <Map size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Transit Routes & Buses</h1>
            <p className="text-muted-foreground">
              Explore available routes and buses in our network
            </p>
          </div>
        </div>
        
        <Tabs defaultValue="routes">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="buses">Buses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routes" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Available Routes</CardTitle>
                <CardDescription>
                  Click on a route to see the buses that operate on it
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {isLoadingRoutes ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">Loading routes...</div>
                  </div>
                ) : routes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No routes available</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Origin</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Fare</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {routes.map((route: IRoute) => (
                        <TableRow
                          key={route._id}
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleRouteSelect(route._id)}
                        >
                          <TableCell className="font-medium">{route.start}</TableCell>
                          <TableCell>{route.end}</TableCell>
                          <TableCell>${route.fare.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="buses" className="animate-fade-in">
            <Card>
              <CardHeader>
                <CardTitle>Available Buses</CardTitle>
                <CardDescription>
                  Select a route to see buses operating on that route
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {!selectedRoute ? (
                  <div className="border rounded-lg p-6 text-center bg-muted/10">
                    <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium mb-1">No route selected</h3>
                    <p className="text-muted-foreground mb-4">
                      Please select a route from the Routes tab to view buses
                    </p>
                  </div>
                ) : isLoadingBuses ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">Loading buses...</div>
                  </div>
                ) : buses.length === 0 ? (
                  <div className="text-center py-8">
                    <Bus className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No buses available for this route</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-transit-blue font-medium">
                        Showing buses for route: {routes.find(r => r._id === selectedRoute)?.start} - {routes.find(r => r._id === selectedRoute)?.end}
                      </p>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bus Name</TableHead>
                          <TableHead>Capacity</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {buses.map((bus: IBus) => (
                          <TableRow key={bus._id}>
                            <TableCell className="font-medium">{bus.name}</TableCell>
                            <TableCell>{bus.capacity} seats</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default RoutesPage;
