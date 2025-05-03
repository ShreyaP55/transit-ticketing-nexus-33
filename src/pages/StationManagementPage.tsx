
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { routesAPI, busesAPI, stationsAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bus, Plus, Edit, Trash } from "lucide-react";
import { IStation } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import StationForm from "@/components/stations/StationForm";
import { useUser } from "@/context/UserContext";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const StationManagementPage = () => {
  const { isAdmin } = useUser();
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<IStation | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStationId, setDeletingStationId] = useState<string>("");
  
  const { 
    data: routes, 
    isLoading: isLoadingRoutes 
  } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });

  const { 
    data: stations, 
    isLoading: isLoadingStations 
  } = useQuery({
    queryKey: ['stations', selectedRouteId],
    queryFn: () => stationsAPI.getAll({ routeId: selectedRouteId }),
    enabled: !!selectedRouteId
  });

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
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedStation(null);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setSelectedStation(null);
    queryClient.invalidateQueries({ queryKey: ['stations'] });
    toast.success(`Station ${selectedStation ? 'updated' : 'created'} successfully`);
  };

  return (
    <MainLayout title="Station Management">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white neonText flex items-center">
            <MapPin className="mr-2 h-6 w-6 text-primary" />
            Station Management
          </h1>
          <p className="text-muted-foreground">
            Create and manage stations for your routes
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Route Selection */}
          <Card className="md:col-span-1 bg-gradient-to-br from-card to-background border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-primary flex items-center neonText">
                <MapPin className="mr-2 h-5 w-5" /> 
                Select Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingRoutes ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {routes?.map(route => (
                    <div
                      key={route._id}
                      onClick={() => setSelectedRouteId(route._id)}
                      className={`p-3 border rounded-lg cursor-pointer transition-all flex justify-between items-center
                        ${selectedRouteId === route._id 
                          ? "border-primary bg-primary/20 text-white shadow-md neonGlow" 
                          : "hover:border-primary/50 bg-background/50 border-border shadow-sm hover:bg-primary/5"}`}
                    >
                      <span className="font-medium">{route.start} - {route.end}</span>
                      <Badge variant={selectedRouteId === route._id ? "secondary" : "outline"} 
                        className={selectedRouteId === route._id ? "bg-primary/30 text-white border-primary/30" : ""}>
                        ₹{route.fare}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Station Listing */}
          <Card className="md:col-span-2 h-fit border-primary/20 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
              <div>
                <CardTitle className="text-xl font-bold text-white">Stations</CardTitle>
                <CardDescription>
                  {selectedRouteId ? "Manage stations for the selected route" : "Please select a route to view stations"}
                </CardDescription>
              </div>
              {isAdmin && selectedRouteId && (
                <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary/80 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add Station
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-6">
              {!selectedRouteId ? (
                <div className="text-center p-8 text-muted-foreground bg-background/20 rounded-lg">
                  <MapPin className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
                  <p>Please select a route from the left panel to view its stations</p>
                </div>
              ) : isLoadingStations ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : stations?.length === 0 ? (
                <div className="text-center p-8 border rounded-lg border-dashed border-border bg-background/20">
                  <MapPin className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No stations found for this route</p>
                  {isAdmin && (
                    <Button variant="outline" className="mt-4 border-primary/40 hover:border-primary hover:bg-primary/10" onClick={() => setIsFormOpen(true)}>
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
                        <TableHead>Bus</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Fare</TableHead>
                        {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stations?.map(station => (
                        <TableRow key={station._id} className="hover:bg-primary/5">
                          <TableCell className="font-medium text-white">{station.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Bus className="h-4 w-4 mr-1 text-primary" />
                              <span>{station.busId.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-accent/20 text-primary-foreground border-primary/20">₹{station.fare}</Badge>
                          </TableCell>
                          {isAdmin && (
                            <TableCell>
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-primary" onClick={() => handleEdit(station)}>
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
        {isFormOpen && (
          <StationForm 
            isOpen={isFormOpen}
            onClose={handleFormClose}
            onSuccess={handleFormSuccess}
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
