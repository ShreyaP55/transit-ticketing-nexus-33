
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Map, Bus, MapPin, Plus, Edit, Trash } from "lucide-react";
import { routesAPI, busesAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IBus, IRoute } from "@/types";
import { Button } from "@/components/ui/button";
import RouteForm from "@/components/routes/RouteForm";
import BusForm from "@/components/buses/BusForm";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/context/UserContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const RoutesPage = () => {
  const { isAdmin } = useUser();
  const queryClient = useQueryClient();
  const [selectedRoute, setSelectedRoute] = useState<string>("");
  const [isRouteFormOpen, setIsRouteFormOpen] = useState(false);
  const [isBusFormOpen, setIsBusFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<IRoute | null>(null);
  const [editingBus, setEditingBus] = useState<IBus | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string>("");
  const [deleteType, setDeleteType] = useState<"route" | "bus">("route");
  
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

  // Delete mutations
  const deleteRouteMutation = useMutation({
    mutationFn: routesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['routes'] });
      toast.success("Route deleted successfully");
      if (selectedRoute === deletingItemId) {
        setSelectedRoute("");
      }
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const deleteBusMutation = useMutation({
    mutationFn: busesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buses'] });
      toast.success("Bus deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });
  
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
  };

  const handleAddRoute = () => {
    setEditingRoute(null);
    setIsRouteFormOpen(true);
  };

  const handleEditRoute = (route: IRoute) => {
    setEditingRoute(route);
    setIsRouteFormOpen(true);
  };

  const handleAddBus = () => {
    setEditingBus(null);
    setIsBusFormOpen(true);
  };

  const handleEditBus = (bus: IBus) => {
    setEditingBus(bus);
    setIsBusFormOpen(true);
  };

  const handleDeleteClick = (id: string, type: "route" | "bus") => {
    setDeletingItemId(id);
    setDeleteType(type);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteType === "route") {
      deleteRouteMutation.mutate(deletingItemId);
    } else {
      deleteBusMutation.mutate(deletingItemId);
    }
    setDeleteDialogOpen(false);
  };

  const handleRouteFormClose = () => {
    setIsRouteFormOpen(false);
    setEditingRoute(null);
  };

  const handleBusFormClose = () => {
    setIsBusFormOpen(false);
    setEditingBus(null);
  };

  return (
    <MainLayout title="Routes & Buses">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary mr-3">
              <Map size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Transit Routes & Buses</h1>
              <p className="text-muted-foreground">
                Explore available routes and buses in our network
              </p>
            </div>
          </div>
          {isAdmin && (
            <Button onClick={handleAddRoute} className="bg-primary hover:bg-primary/80 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Route
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="routes" className="mb-8">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted">
            <TabsTrigger value="routes" className="data-[state=active]:bg-primary data-[state=active]:text-white">Routes</TabsTrigger>
            <TabsTrigger value="buses" className="data-[state=active]:bg-primary data-[state=active]:text-white">Buses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="routes" className="animate-fade-in">
            <Card className="border-primary/20 bg-card shadow-lg">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="text-white">Available Routes</CardTitle>
                <CardDescription>
                  Click on a route to see the buses that operate on it
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pt-6">
                {isLoadingRoutes ? (
                  <div className="text-center py-8">
                    <div className="animate-pulse">Loading routes...</div>
                  </div>
                ) : routes.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="mx-auto h-12 w-12 mb-3 text-muted-foreground/60" />
                    <p className="text-muted-foreground">No routes available</p>
                    {isAdmin && (
                      <Button 
                        onClick={handleAddRoute} 
                        variant="outline" 
                        className="mt-4 border-primary/40 hover:border-primary hover:bg-primary/10"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add your first route
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="rounded-md border border-border overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Origin</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>Fare</TableHead>
                          {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {routes.map((route: IRoute) => (
                          <TableRow
                            key={route._id}
                            className={`cursor-pointer hover:bg-primary/5 ${selectedRoute === route._id ? "bg-primary/10" : ""}`}
                            onClick={() => handleRouteSelect(route._id)}
                          >
                            <TableCell className="font-medium text-white">{route.start}</TableCell>
                            <TableCell>{route.end}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-accent/20 text-primary-foreground border-primary/20">
                                ₹{route.fare.toFixed(2)}
                              </Badge>
                            </TableCell>
                            {isAdmin && (
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 text-primary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditRoute(route);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    className="h-8 w-8 p-0 text-destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(route._id, "route");
                                    }}
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="buses" className="animate-fade-in">
            <Card className="border-primary/20 bg-card shadow-lg">
              <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Available Buses</CardTitle>
                  <CardDescription>
                    Select a route to see buses operating on that route
                  </CardDescription>
                </div>
                {isAdmin && selectedRoute && (
                  <Button onClick={handleAddBus} className="bg-primary hover:bg-primary/80 text-white">
                    <Plus className="mr-2 h-4 w-4" /> Add Bus
                  </Button>
                )}
              </CardHeader>
              
              <CardContent className="pt-6">
                {!selectedRoute ? (
                  <div className="border rounded-lg p-6 text-center bg-background/30">
                    <MapPin className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                    <h3 className="font-medium mb-1 text-white">No route selected</h3>
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
                    <Bus className="mx-auto h-12 w-12 mb-3 text-muted-foreground/60" />
                    <p className="text-muted-foreground">No buses available for this route</p>
                    {isAdmin && (
                      <Button 
                        onClick={handleAddBus} 
                        variant="outline" 
                        className="mt-4 border-primary/40 hover:border-primary hover:bg-primary/10"
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add your first bus
                      </Button>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm text-primary font-medium">
                        Showing buses for route: {routes.find(r => r._id === selectedRoute)?.start} - {routes.find(r => r._id === selectedRoute)?.end}
                      </p>
                    </div>
                    <div className="rounded-md border border-border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted/30">
                          <TableRow>
                            <TableHead>Bus Name</TableHead>
                            <TableHead>Capacity</TableHead>
                            {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {buses.map((bus: IBus) => (
                            <TableRow key={bus._id} className="hover:bg-primary/5">
                              <TableCell className="font-medium text-white">
                                <div className="flex items-center">
                                  <Bus className="mr-2 h-4 w-4 text-primary" /> {bus.name}
                                </div>
                              </TableCell>
                              <TableCell>{bus.capacity} seats</TableCell>
                              {isAdmin && (
                                <TableCell>
                                  <div className="flex gap-2">
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 text-primary"
                                      onClick={() => handleEditBus(bus)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="ghost" 
                                      className="h-8 w-8 p-0 text-destructive"
                                      onClick={() => handleDeleteClick(bus._id, "bus")}
                                    >
                                      <Trash className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Route Form Dialog */}
        {isRouteFormOpen && (
          <RouteForm
            isOpen={isRouteFormOpen}
            onClose={handleRouteFormClose}
            onSuccess={handleRouteFormClose}
            route={editingRoute}
          />
        )}

        {/* Bus Form Dialog */}
        {isBusFormOpen && (
          <BusForm
            isOpen={isBusFormOpen}
            onClose={handleBusFormClose}
            onSuccess={handleBusFormClose}
            bus={editingBus}
            selectedRouteId={selectedRoute}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-destructive/30">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the {deleteType}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-destructive hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default RoutesPage;
