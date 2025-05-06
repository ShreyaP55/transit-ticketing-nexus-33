
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { routesAPI, stationsAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Bus, MapPin } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import StationForm from "@/components/stations/StationForm";
import { useUser } from "@/context/UserContext";
import { IStation } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const StationManagementPage = () => {
  const { isAdmin } = useUser();
  const queryClient = useQueryClient();
  const [isStationFormOpen, setIsStationFormOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<IStation | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStationId, setDeletingStationId] = useState<string>("");

  // Fetch routes for filter
  const { 
    data: routes,
    isLoading: isLoadingRoutes,
    error: routesError 
  } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });

  // Fetch stations data
  const { 
    data: stations, 
    isLoading: isLoadingStations,
    error: stationsError
  } = useQuery({
    queryKey: ['stations', selectedRouteId],
    queryFn: () => stationsAPI.getAll({ routeId: selectedRouteId }),
    enabled: true,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: stationsAPI.delete,
    onSuccess: () => {
      toast.success("Station deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['stations'] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleDeleteClick = (id: string) => {
    setDeletingStationId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deletingStationId);
    setDeleteDialogOpen(false);
  };

  const handleEdit = (station: IStation) => {
    setSelectedStation(station);
    setIsStationFormOpen(true);
  };

  const handleStationFormClose = () => {
    setIsStationFormOpen(false);
    setSelectedStation(null);
  };

  const handleStationFormSuccess = () => {
    setIsStationFormOpen(false);
    setSelectedStation(null);
    queryClient.invalidateQueries({ queryKey: ['stations'] });
    toast.success(`Station ${selectedStation ? 'updated' : 'created'} successfully`);
  };

  const handleRouteFilter = (routeId: string) => {
    setSelectedRouteId(routeId === selectedRouteId ? "" : routeId);
  };

  // Display data fetching errors
  if (routesError || stationsError) {
    toast.error(`Error loading data: ${(routesError || stationsError as Error).message}`);
  }

  return (
    <MainLayout title="Station Management">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white neonText flex items-center">
              <MapPin className="mr-2 h-6 w-6 text-primary" />
              Station Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage stations for your transit network
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setIsStationFormOpen(true)} 
              className="bg-transit-orange hover:bg-transit-orange-dark text-white shadow-[0_0_10px_rgba(255,126,29,0.5)]"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Station
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Route Filter */}
          <Card className="md:col-span-1 bg-gradient-to-br from-card to-background border-transit-orange/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-transit-orange flex items-center neonText">
                <Bus className="mr-2 h-5 w-5" /> 
                Filter by Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {isLoadingRoutes ? (
                  Array(4).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))
                ) : routes?.map(route => (
                  <div
                    key={route._id}
                    onClick={() => handleRouteFilter(route._id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all flex justify-between items-center
                      ${selectedRouteId === route._id 
                        ? "border-transit-orange bg-transit-orange/20 text-white shadow-md" 
                        : "hover:border-transit-orange/50 bg-background/50 border-border shadow-sm hover:bg-transit-orange/5"}`}
                  >
                    <span className="font-medium">{route.start} - {route.end}</span>
                    <Badge variant={selectedRouteId === route._id ? "secondary" : "outline"} 
                      className={selectedRouteId === route._id ? "bg-transit-orange/30 text-white border-transit-orange/30" : ""}>
                      ₹{route.fare}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Station Listing */}
          <Card className="md:col-span-3 h-fit border-transit-orange/20 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
              <div>
                <CardTitle className="text-xl font-bold text-white">Stations</CardTitle>
                <CardDescription>
                  {selectedRouteId ? 
                    "Stations for the selected route" : 
                    "All stations in the system"
                  }
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoadingStations ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : stations?.length === 0 ? (
                <div className="text-center p-8 border rounded-lg border-dashed border-border bg-background/20">
                  <MapPin className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No stations found</p>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      className="mt-4 border-transit-orange/40 hover:border-transit-orange hover:bg-transit-orange/10 text-transit-orange-light hover:text-transit-orange-light" 
                      onClick={() => setIsStationFormOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add First Station
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Route</TableHead>
                        <TableHead>Address</TableHead>
                        {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stations?.map(station => (
                        <TableRow key={station._id} className="hover:bg-transit-orange/5">
                          <TableCell className="font-medium text-white">{station.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Bus className="h-4 w-4 mr-1 text-transit-orange" />
                              {station.routeId && typeof station.routeId === 'object' && 'start' in station.routeId ? (
                                <span>{station.routeId.start} - {station.routeId.end}</span>
                              ) : (
                                <span className="text-muted-foreground">Route data unavailable</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1 text-transit-orange" />
                              <span>{station.location || "Location not available"}</span>
                            </div>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-transit-orange" onClick={() => handleEdit(station)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteClick(station._id)}>
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
        </div>

        {/* Station Form Dialog */}
        {isStationFormOpen && (
          <StationForm
            isOpen={isStationFormOpen}
            onClose={handleStationFormClose}
            onSuccess={handleStationFormSuccess}
            station={selectedStation}
            selectedRouteId={selectedRouteId}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-destructive/30">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the station. This action cannot be undone.
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

export default StationManagementPage;
