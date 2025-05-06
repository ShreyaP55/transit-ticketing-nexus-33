
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { busesAPI, routesAPI } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash, Bus as BusIcon, Route, QrCode } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import BusForm from "@/components/buses/BusForm";
import BusQRCode from "@/components/buses/BusQRCode";
import { useUser } from "@/context/UserContext";
import { IBus, IRoute } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const BusesPage = () => {
  const { isAdmin } = useUser();
  const queryClient = useQueryClient();
  const [isBusFormOpen, setIsBusFormOpen] = useState(false);
  const [selectedBus, setSelectedBus] = useState<IBus | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingBusId, setDeletingBusId] = useState<string>("");
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [busForQR, setBusForQR] = useState<IBus | null>(null);

  // Fetch routes for filter
  const { 
    data: routes,
    isLoading: isLoadingRoutes,
    error: routesError 
  } = useQuery({
    queryKey: ['routes'],
    queryFn: routesAPI.getAll
  });

  // Fetch buses data
  const { 
    data: buses, 
    isLoading,
    error: busesError 
  } = useQuery({
    queryKey: ['buses', selectedRouteId],
    queryFn: () => busesAPI.getAll(selectedRouteId),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: busesAPI.delete,
    onSuccess: () => {
      toast.success("Bus deleted successfully");
      queryClient.invalidateQueries({ queryKey: ['buses'] });
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Handle QR code generation
  const handleGenerateQR = (bus: IBus) => {
    setBusForQR(bus);
    setIsQRDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeletingBusId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteMutation.mutate(deletingBusId);
    setDeleteDialogOpen(false);
  };

  const handleEdit = (bus: IBus) => {
    setSelectedBus(bus);
    setIsBusFormOpen(true);
  };

  const handleBusFormClose = () => {
    setIsBusFormOpen(false);
    setSelectedBus(null);
  };

  const handleBusFormSuccess = () => {
    setIsBusFormOpen(false);
    setSelectedBus(null);
    queryClient.invalidateQueries({ queryKey: ['buses'] });
    toast.success(`Bus ${selectedBus ? 'updated' : 'created'} successfully`);
  };

  const handleRouteFilter = (routeId: string) => {
    setSelectedRouteId(routeId === selectedRouteId ? "" : routeId);
  };

  // Display data fetching errors
  if (routesError || busesError) {
    toast.error(`Error loading data: ${(routesError || busesError as Error).message}`);
  }

  return (
    <MainLayout title="Bus Management">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white neonText flex items-center">
              <BusIcon className="mr-2 h-6 w-6 text-transit-orange" />
              Bus Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage buses for your transit network
            </p>
          </div>
          {isAdmin && (
            <Button 
              onClick={() => setIsBusFormOpen(true)} 
              className="bg-transit-orange hover:bg-transit-orange-dark text-white shadow-[0_0_10px_rgba(255,126,29,0.5)]"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Bus
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Route Filter */}
          <Card className="md:col-span-1 bg-gradient-to-br from-card to-background border-transit-orange/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold text-transit-orange flex items-center neonText">
                <Route className="mr-2 h-5 w-5" /> 
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

          {/* Bus Listing */}
          <Card className="md:col-span-3 h-fit border-transit-orange/20 bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
              <div>
                <CardTitle className="text-xl font-bold text-white">Buses</CardTitle>
                <CardDescription>
                  {selectedRouteId ? 
                    "Buses for the selected route" : 
                    "All buses in the system"
                  }
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-2">
                  {Array(3).fill(0).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : buses?.length === 0 ? (
                <div className="text-center p-8 border rounded-lg border-dashed border-border bg-background/20">
                  <BusIcon className="mx-auto h-12 w-12 mb-2 text-muted-foreground/50" />
                  <p className="text-muted-foreground">No buses found</p>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      className="mt-4 border-transit-orange/40 hover:border-transit-orange hover:bg-transit-orange/10 text-transit-orange-light hover:text-transit-orange-light" 
                      onClick={() => setIsBusFormOpen(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add First Bus
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
                        <TableHead>Capacity</TableHead>
                        <TableHead className="w-[150px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {buses?.map(bus => (
                        <TableRow key={bus._id} className="hover:bg-transit-orange/5">
                          <TableCell className="font-medium text-white">{bus.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Route className="h-4 w-4 mr-1 text-transit-orange" />
                              <span>{bus.route.start} - {bus.route.end}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-accent/20 text-primary-foreground border-transit-orange/20">
                              {bus.capacity} seats
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-8 p-2 text-transit-orange border-transit-orange/20 hover:bg-transit-orange/10" 
                                onClick={() => handleGenerateQR(bus)}
                              >
                                <QrCode className="h-4 w-4 mr-1" /> QR
                              </Button>
                              
                              {isAdmin && (
                                <>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-transit-orange" onClick={() => handleEdit(bus)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive" onClick={() => handleDeleteClick(bus._id)}>
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
        </div>

        {/* Bus Form Dialog */}
        {isBusFormOpen && (
          <BusForm
            isOpen={isBusFormOpen}
            onClose={handleBusFormClose}
            onSuccess={handleBusFormSuccess}
            bus={selectedBus}
            selectedRouteId={selectedRouteId}
          />
        )}

        {/* QR Code Dialog */}
        <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
          <DialogContent className="bg-card max-w-sm">
            <DialogHeader>
              <DialogTitle>QR Code for Bus</DialogTitle>
            </DialogHeader>
            {busForQR && <BusQRCode bus={busForQR} />}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-card border-destructive/30">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the bus. This action cannot be undone.
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

export default BusesPage;
