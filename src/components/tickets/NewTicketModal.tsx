
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { routesAPI, busesAPI, stationsAPI } from "@/services/api";
import { stripeService } from "@/services/stripeService";
import { toast } from "sonner";
import { MapPin, Bus, Navigation, AlertCircle, CreditCard } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate();
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Data
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);

  // Load routes on open
  useEffect(() => {
    if (open) {
      setLoadingRoutes(true);
      routesAPI.getAll().then(r => setRoutes(r)).finally(() => setLoadingRoutes(false));
      setSelectedRouteId("");
      setSelectedBusId("");
      setSelectedStationId("");
    }
  }, [open]);

  // Load buses when route changes
  useEffect(() => {
    if (selectedRouteId) {
      setLoadingBuses(true);
      busesAPI.getAll(selectedRouteId).then(b => setBuses(b)).finally(() => setLoadingBuses(false));
      setSelectedBusId("");
      setSelectedStationId("");
    }
  }, [selectedRouteId]);

  // Load stations when bus (and route) changes
  useEffect(() => {
    if (selectedRouteId && selectedBusId) {
      setLoadingStations(true);
      stationsAPI.getAll({ routeId: selectedRouteId, busId: selectedBusId }).then(s => setStations(s)).finally(() => setLoadingStations(false));
      setSelectedStationId("");
    }
  }, [selectedBusId, selectedRouteId]);

  const selectedRoute = routes.find(r => r._id === selectedRouteId);
  const selectedBus = buses.find(b => b._id === selectedBusId);
  const selectedStation = stations.find(s => s._id === selectedStationId);

  // Booking
  const handleProceedToBuy = async () => {
    if (!selectedRouteId || !selectedBusId || !selectedStationId) return;

    try {
      setIsProcessing(true);
      toast.info("Redirecting to payment...");

      // Create Stripe session
      const response = await stripeService.createTicketCheckoutSession(
        selectedStationId,
        selectedBusId,
        selectedStation.fare
      );
      if (response && response.url) {
        // Redirect to Stripe checkout
        await stripeService.redirectToCheckout(response.url);
      } else {
        toast.error("Failed to create checkout session.");
      }
    } catch (error) {
      console.error("Stripe error:", error);
      toast.error("Failed to initiate payment");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-0 overflow-visible">
        <form
          className="bg-white rounded-lg shadow overflow-hidden"
          onSubmit={e => {
            e.preventDefault();
            handleProceedToBuy();
          }}>
          <DialogHeader className="bg-gradient-to-r from-primary/10 to-transparent px-6 py-4 border-b">
            <DialogTitle className="flex items-center text-lg sm:text-xl">
              <MapPin className="mr-2 text-primary h-5 w-5" />
              Book a New Ticket
            </DialogTitle>
            <DialogDescription>Select route, bus, and station to proceed</DialogDescription>
          </DialogHeader>
          {/* Form fields */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block mb-1 text-sm font-medium">Route</label>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId} disabled={loadingRoutes}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  {loadingRoutes ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    routes.length
                      ? routes.map(route =>
                        <SelectItem key={route._id} value={route._id}>
                          {route.start} - {route.end} (₹{route.fare})
                        </SelectItem>)
                      : <SelectItem value="none" disabled>No routes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Bus</label>
              <Select 
                value={selectedBusId} 
                onValueChange={setSelectedBusId} 
                disabled={!selectedRouteId || loadingBuses}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!selectedRouteId ? "Select a route first" : "Select a bus"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingBuses ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    buses.length 
                      ? buses.map(bus => 
                        <SelectItem key={bus._id} value={bus._id}>
                          {bus.name} <Badge className="ml-2" variant="outline">cap: {bus.capacity}</Badge>
                        </SelectItem>
                      )
                      : <SelectItem value="none" disabled>No buses available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium">Station</label>
              <Select
                value={selectedStationId}
                onValueChange={setSelectedStationId}
                disabled={!selectedBusId || loadingStations}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!selectedBusId ? "Select a bus first" : "Select a station"} />
                </SelectTrigger>
                <SelectContent>
                  {loadingStations ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    stations.length
                      ? stations.map(station =>
                        <SelectItem key={station._id} value={station._id}>
                          {station.name} <Badge className="ml-2" variant="outline">₹{station.fare}</Badge>
                        </SelectItem>)
                      : <SelectItem value="none" disabled>No stations available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t p-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!selectedRouteId || !selectedBusId || !selectedStationId || isProcessing}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing ? "Processing..." : "Proceed to Buy"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
