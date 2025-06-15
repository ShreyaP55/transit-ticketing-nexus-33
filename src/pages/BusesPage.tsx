import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import MainLayout from "@/components/layout/MainLayout";
import { busesAPI, routesAPI, stationsAPI } from "@/services/api";
import BusForm from "@/components/buses/BusForm";
import BusQRCode from "@/components/buses/BusQRCode";
import BusFilters from "@/components/buses/BusFilters";
import BusTable from "@/components/buses/BusTable";
import { useUser } from "@/context/UserContext";
import { IBus } from "@/types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Bus as BusIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    queryFn: routesAPI.getAll,
    retry: 3,
    staleTime: 1000 * 60 * 2
  });

  // Fetch stations for mapping busId -> station
  const { data: stations, isLoading: isLoadingStations, error: stationsError } = useQuery({
    queryKey: ['stations'],
    queryFn: () => stationsAPI.getAll(),
    staleTime: 1000 * 60
  });

  // Do not pass routeId to API if blank to avoid erroneous filtering.
  const routeForApi = selectedRouteId && selectedRouteId !== "undefined" ? selectedRouteId : undefined;

  // Fetch buses data
  const { 
    data: buses, 
    isLoading,
    error: busesError 
  } = useQuery({
    queryKey: ['buses', routeForApi],
    queryFn: () => busesAPI.getAll(routeForApi),
    enabled: !!routes,
    retry: 2,
    staleTime: 1000 * 60,
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

  // QR code
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

  // Error Toast on load error
  React.useEffect(() => {
    if (routesError || busesError || stationsError) {
      const err = (routesError || busesError || stationsError) as Error;
      toast.error(`Error loading data: ${err?.message || "Unknown"}`);
    }
  }, [routesError, busesError, stationsError]);

  return (
    <MainLayout title="Bus Management">
      <div className="max-w-6xl mx-auto w-full px-2">
        <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-2">
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
              className="bg-transit-orange hover:bg-transit-orange-dark text-white shadow-[0_0_10px_rgba(255,126,29,0.5)] w-full md:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Bus
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap gap-4 w-full min-h-[300px]">
          <div className="flex-1 min-w-[250px]">
            <BusFilters
              routes={routes}
              isLoadingRoutes={isLoadingRoutes}
              selectedRouteId={selectedRouteId}
              onRouteFilter={handleRouteFilter}
            />
          </div>
          <div className="flex-[3] min-w-[350px]">
            <BusTable
              buses={buses}
              isLoading={isLoading}
              selectedRouteId={selectedRouteId}
              isAdmin={isAdmin}
              onAddBus={() => setIsBusFormOpen(true)}
              onEditBus={handleEdit}
              onDeleteBus={handleDeleteClick}
              onGenerateQR={handleGenerateQR}
              stations={stations}
              isLoadingStations={isLoadingStations}
              routes={routes}
            />
          </div>
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
