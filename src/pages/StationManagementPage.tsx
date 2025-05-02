
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { routesAPI, busesAPI, stationsAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bus, Plus, Edit, Trash } from "lucide-react";
import { IStation } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import StationForm from "@/components/stations/StationForm";

const StationManagementPage = () => {
  const queryClient = useQueryClient();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState<IStation | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  
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

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this station?")) {
      deleteMutation.mutate(id);
    }
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Route Selection */}
          <Card className="md:col-span-1 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-transit-blue flex items-center">
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
                          ? "border-transit-blue bg-transit-blue text-white shadow-md" 
                          : "hover:border-transit-blue bg-white shadow-sm"}`}
                    >
                      <span className="font-medium">{route.start} - {route.end}</span>
                      <Badge variant={selectedRouteId === route._id ? "secondary" : "outline"}>
                        ₹{route.fare}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Station Listing */}
          <Card className="md:col-span-2 h-fit">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl font-bold">Stations</CardTitle>
                <CardDescription>
                  {selectedRouteId ? "Manage stations for the selected route" : "Please select a route to view stations"}
                </CardDescription>
              </div>
              {selectedRouteId && (
                <Button onClick={() => setIsFormOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Add Station
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!selectedRouteId ? (
                <div className="text-center p-8 text-muted-foreground">
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
                <div className="text-center p-8 border rounded-lg border-dashed">
                  <MapPin className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No stations found for this route</p>
                  <Button variant="outline" className="mt-4" onClick={() => setIsFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Station
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Bus</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Fare</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stations?.map(station => (
                        <TableRow key={station._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{station.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Bus className="h-4 w-4 mr-1 text-transit-blue" />
                              <span>{station.busId.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">₹{station.fare}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(station)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleDelete(station._id)}>
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
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
      </div>
    </MainLayout>
  );
};

export default StationManagementPage;
