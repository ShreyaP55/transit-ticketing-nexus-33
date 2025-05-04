
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { routesAPI, busesAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Bus as BusIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import RouteForm from "@/components/routes/RouteForm";
import BusForm from "@/components/buses/BusForm";
import { useUser } from "@/context/UserContext";
import { IRoute } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const RoutesPage = () => {
  const { isAdmin } = useUser();
  const queryClient = useQueryClient();
  const [isRouteFormOpen, setIsRouteFormOpen] = useState(false);
  const [isBusFormOpen, setIsBusFormOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<IRoute | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRouteId, setDeletingRouteId] = useState<string>("");

  // Fetch routes data
  const { data: routes, isLoading } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: routesAPI.delete,
    onSuccess: () => {
      toast.success("Route deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['routes'] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleDeleteClick = (id: string) => {
    setDeletingRouteId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deletingRouteId);
    setDeleteDialogOpen(false);
  };

  const handleEdit = (route: IRoute) => {
    setSelectedRoute(route);
    setIsRouteFormOpen(true);
  };

  const handleRouteFormClose = () => {
    setIsRouteFormOpen(false);
    setSelectedRoute(null);
  };

  const handleAddBus = (route: IRoute) => {
    setSelectedRoute(route);
    setIsBusFormOpen(true);
  };

  const handleBusFormClose = () => {
    setIsBusFormOpen(false);
    setSelectedRoute(null);
  };

  const handleFormSuccess = () => {
    setIsRouteFormOpen(false);
    setSelectedRoute(null);
    queryClient.invalidateQueries({ queryKey: ['routes'] });
    toast.success(`Route ${selectedRoute ? 'updated' : 'created'} successfully`);
  };

  const handleBusFormSuccess = () => {
    setIsBusFormOpen(false);
    setSelectedRoute(null);
    queryClient.invalidateQueries({ queryKey: ['buses'] });
    toast.success(`Bus added successfully`);
  };

  return (
    <MainLayout title="Routes Management">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white neonText">Routes Management</h1>
          {isAdmin && (
            <Button onClick={() => setIsRouteFormOpen(true)} className="bg-primary hover:bg-primary/80 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Route
            </Button>
          )}
        </div>

        <Card className="bg-card border-primary/20">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="text-white">Transit Routes</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isLoading ? (
              <div className="space-y-2">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : routes?.length === 0 ? (
              <div className="text-center p-8 border rounded-lg border-dashed border-border">
                <p className="text-muted-foreground">No routes found</p>
                {isAdmin && (
                  <Button variant="outline" className="mt-4 border-primary/40 hover:border-primary hover:bg-primary/10" onClick={() => setIsRouteFormOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Add First Route
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border border-border overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Route Name</TableHead>
                      <TableHead>Fare</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {routes?.map(route => (
                      <TableRow key={route._id} className="hover:bg-primary/5">
                        <TableCell className="font-medium">{route.start} - {route.end}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-accent/20 text-primary-foreground border-primary/20">₹{route.fare}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={() => handleAddBus(route)}
                              className="h-8 px-3 bg-purple-700 hover:bg-purple-800 text-white"
                            >
                              <BusIcon className="mr-1 h-3.5 w-3.5" /> Add Bus
                            </Button>
                            {isAdmin && (
                              <>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-primary" onClick={() => handleEdit(route)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteClick(route._id)}>
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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

        {isRouteFormOpen && (
          <RouteForm
            isOpen={isRouteFormOpen}
            onClose={handleRouteFormClose}
            onSuccess={handleFormSuccess}
            route={selectedRoute}
          />
        )}

        {isBusFormOpen && selectedRoute && (
          <BusForm
            isOpen={isBusFormOpen}
            onClose={handleBusFormClose}
            onSuccess={handleBusFormSuccess}
            bus={null}
            selectedRouteId={selectedRoute._id}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-destructive/30">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the route. This action cannot be undone.
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
