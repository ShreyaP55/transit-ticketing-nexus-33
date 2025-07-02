
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { routesAPI, busesAPI, stationsAPI, ticketsAPI } from "@/services/api";
import { toast } from "sonner";
import { MapPin } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/services/walletService";

// Component imports
import { WalletBalanceDisplay } from "./components/WalletBalanceDisplay";
import { RouteSelector } from "./components/RouteSelector";
import { BusSelector } from "./components/BusSelector";
import { StationSelector } from "./components/StationSelector";
import { PriceDisplay } from "./components/PriceDisplay";
import { TicketModalActions } from "./components/TicketModalActions";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ open, onOpenChange }) => {
  const { userId } = useUser();
  const queryClient = useQueryClient();
  const { wallet, isLoading: isWalletLoading, deductFunds, refetchWallet } = useWallet(userId || "");
  
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

  // Load stations when bus changes
  useEffect(() => {
    if (selectedRouteId && selectedBusId) {
      setLoadingStations(true);
      stationsAPI.getAll({ routeId: selectedRouteId, busId: selectedBusId }).then(s => setStations(s)).finally(() => setLoadingStations(false));
      setSelectedStationId("");
    }
  }, [selectedBusId, selectedRouteId]);

  const selectedStation = stations.find(s => s._id === selectedStationId);
  const price = selectedStation?.fare || 0;
  const walletBalance = wallet?.balance || 0;
  const hasSufficientFunds = walletBalance >= price;
  const isFormValid = selectedRouteId && selectedBusId && selectedStationId && userId;

  const handleProceedToBuy = async () => {
    if (!isFormValid) return;

    if (!hasSufficientFunds) {
      toast.error(`Insufficient funds! You need ₹${price} but only have ₹${walletBalance.toFixed(2)}`);
      return;
    }

    try {
      setIsProcessing(true);
      toast.info("Processing ticket purchase...");

      // First, deduct funds from wallet
      await deductFunds({ 
        amount: price, 
        description: `Ticket: ${selectedStation?.name || 'Selected Station'}` 
      });

      // Create the ticket with 12-hour expiry
      const response = await ticketsAPI.create({
        userId,
        routeId: selectedRouteId,
        busId: selectedBusId,
        startStation: selectedStation?.name || "Selected Station",
        endStation: selectedStation?.name || "Selected Station",
        price,
        paymentIntentId: `wallet_${Date.now()}`,
        expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000) // 12 hours
      });

      if (response.success) {
        toast.success(`Ticket purchased successfully! ₹${price} deducted from wallet.`);
        queryClient.invalidateQueries({ queryKey: ["tickets", userId] });
        await refetchWallet();
        onOpenChange(false);
      } else {
        toast.error("Failed to create ticket");
      }
    } catch (error) {
      console.error("Ticket creation error:", error);
      toast.error("Failed to purchase ticket");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg w-[95vw] p-0 overflow-visible bg-gray-900 border-gray-700">
        <form
          className="bg-gray-900 rounded-lg shadow overflow-hidden"
          onSubmit={e => {
            e.preventDefault();
            handleProceedToBuy();
          }}>
          <DialogHeader className="bg-gradient-to-r from-blue-600/20 to-transparent px-6 py-4 border-b border-gray-700">
            <DialogTitle className="flex items-center text-lg sm:text-xl text-white">
              <MapPin className="mr-2 text-blue-400 h-5 w-5" />
              Purchase Ticket
            </DialogTitle>
            <DialogDescription className="text-gray-400">Select route, bus, and station</DialogDescription>
          </DialogHeader>
          
          <div className="p-6 space-y-4">
            <WalletBalanceDisplay balance={walletBalance} isLoading={isWalletLoading} />
            
            <RouteSelector
              routes={routes}
              selectedRouteId={selectedRouteId}
              onRouteChange={setSelectedRouteId}
              isLoading={loadingRoutes}
            />

            <BusSelector
              buses={buses}
              selectedBusId={selectedBusId}
              onBusChange={setSelectedBusId}
              selectedRouteId={selectedRouteId}
              isLoading={loadingBuses}
            />

            <StationSelector
              stations={stations}
              selectedStationId={selectedStationId}
              onStationChange={setSelectedStationId}
              selectedBusId={selectedBusId}
              isLoading={loadingStations}
            />

            <PriceDisplay price={price} hasSufficientFunds={hasSufficientFunds} />
          </div>

          <TicketModalActions
            isFormValid={!!isFormValid}
            isProcessing={isProcessing}
            hasSufficientFunds={hasSufficientFunds}
            price={price}
            onSubmit={handleProceedToBuy}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
};
