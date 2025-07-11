
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { routesAPI, busesAPI, stationsAPI, paymentAPI } from "@/services/api";
import { toast } from "sonner";
import { MapPin, Bus, CreditCard, Wallet, AlertTriangle, Clock } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@/services/walletService";
import { FareBreakdownDisplay } from "@/components/concession/FareBreakdownDisplay";
import { calculateDiscountedFare } from "@/services/fareCalculationService";

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
}

export const NewTicketModal: React.FC<NewTicketModalProps> = ({ open, onOpenChange }) => {
  const { userId, userDetails } = useUser();
  const queryClient = useQueryClient();
  const { wallet, isLoading: isWalletLoading, refetchWallet } = useWallet(userId || "");
  
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [selectedBusId, setSelectedBusId] = useState("");
  const [selectedStationId, setSelectedStationId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userConcessionData, setUserConcessionData] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'stripe'>('wallet');

  // Data
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [stations, setStations] = useState<any[]>([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [loadingStations, setLoadingStations] = useState(false);

  // Fetch user concession data
  useEffect(() => {
    if (open && userId) {
      fetchUserConcessionData();
    }
  }, [open, userId]);

  const fetchUserConcessionData = async () => {
    try {
      const response = await fetch(`/api/verification/status/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserConcessionData(data);
      }
    } catch (error) {
      console.error('Error fetching user concession data:', error);
    }
  };

  const selectedRoute = routes.find(r => r._id === selectedRouteId);
  const selectedBus = buses.find(b => b._id === selectedBusId);
  const selectedStation = stations.find(s => s._id === selectedStationId);
  const baseFare = selectedStation?.fare || 0;
  
  // Calculate discounted fare
  const fareBreakdown = baseFare && userConcessionData ? 
    calculateDiscountedFare(baseFare, userConcessionData) : 
    {
      originalFare: baseFare,
      discountAmount: 0,
      discountPercentage: 0,
      finalFare: baseFare,
      concessionType: 'general',
      isEligible: false
    };

  const finalPrice = fareBreakdown.finalFare;
  const walletBalance = wallet?.balance || 0;
  const hasSufficientFunds = walletBalance >= finalPrice;

  useEffect(() => {
    if (open) {
      setLoadingRoutes(true);
      routesAPI.getAll().then(r => setRoutes(r)).finally(() => setLoadingRoutes(false));
      setSelectedRouteId("");
      setSelectedBusId("");
      setSelectedStationId("");
      setPaymentMethod('wallet');
    }
  }, [open]);

  useEffect(() => {
    if (selectedRouteId) {
      setLoadingBuses(true);
      busesAPI.getAll(selectedRouteId).then(b => setBuses(b)).finally(() => setLoadingBuses(false));
      setSelectedBusId("");
      setSelectedStationId("");
    }
  }, [selectedRouteId]);

  useEffect(() => {
    if (selectedRouteId && selectedBusId) {
      setLoadingStations(true);
      stationsAPI.getAll({ routeId: selectedRouteId, busId: selectedBusId }).then(s => setStations(s)).finally(() => setLoadingStations(false));
      setSelectedStationId("");
    }
  }, [selectedBusId, selectedRouteId]);

  const handleWalletPayment = async () => {
    if (!selectedRouteId || !selectedBusId || !selectedStationId || !userId) return;

    if (!hasSufficientFunds) {
      toast.error(`Insufficient funds! You need ₹${finalPrice} but only have ₹${walletBalance.toFixed(2)}`);
      return;
    }

    try {
      setIsProcessing(true);
      toast.info("Processing ticket purchase...");

      // First, deduct funds from wallet
      const { deductFunds } = useWallet(userId);
      await deductFunds({ 
        amount: finalPrice, 
        description: `Ticket: ${selectedStation?.name || 'Selected Station'}` 
      });

      // Create the ticket after successful wallet deduction
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          routeId: selectedRouteId,
          busId: selectedBusId,
          startStation: selectedStation?.name || "Selected Station",
          endStation: selectedStation?.name || "Selected Station",
          price: finalPrice,
          paymentIntentId: `wallet_${Date.now()}`,
          expiryDate: new Date(Date.now() + 12 * 60 * 60 * 1000)
        })
      });

      const result = await response.json();

      if (result.success) {
        const savedAmount = fareBreakdown.discountAmount;
        toast.success(
          savedAmount > 0 ? 
          `Ticket purchased! You saved ₹${savedAmount.toFixed(2)} with your ${fareBreakdown.concessionType} concession.` :
          `Ticket purchased successfully! ₹${finalPrice} deducted from wallet.`
        );
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

  const handleStripePayment = async () => {
    if (!selectedRouteId || !selectedBusId || !selectedStationId || !userId) return;

    try {
      setIsProcessing(true);
      toast.info("Redirecting to payment...");

      // Create Stripe checkout session
      const response = await paymentAPI.createTicketCheckoutSession(
        selectedStationId,
        selectedBusId,
        finalPrice
      );

      if (response.url) {
        // Open payment in new tab
        window.open(response.url, '_blank');
        toast.success("Payment page opened in new tab");
        onOpenChange(false);
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to create payment session");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProceedToBuy = () => {
    if (paymentMethod === 'wallet') {
      handleWalletPayment();
    } else {
      handleStripePayment();
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
            {/* Wallet Balance Display */}
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-400">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet Balance
                </div>
                <div className="text-lg font-bold text-green-400">
                  ₹{isWalletLoading ? "..." : walletBalance.toFixed(2)}
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-white">Route</label>
              <Select value={selectedRouteId} onValueChange={setSelectedRouteId} disabled={loadingRoutes}>
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {loadingRoutes ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    routes.length
                      ? routes.map(route =>
                        <SelectItem key={route._id} value={route._id} className="text-white">
                          {route.start} - {route.end}
                        </SelectItem>)
                      : <SelectItem value="none" disabled>No routes available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-white">Bus</label>
              <Select 
                value={selectedBusId} 
                onValueChange={setSelectedBusId} 
                disabled={!selectedRouteId || loadingBuses}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder={!selectedRouteId ? "Select a route first" : "Select a bus"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {loadingBuses ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    buses.length 
                      ? buses.map(bus => 
                        <SelectItem key={bus._id} value={bus._id} className="text-white">
                          {bus.name} <Badge className="ml-2 bg-gray-700" variant="outline">cap: {bus.capacity}</Badge>
                        </SelectItem>
                      )
                      : <SelectItem value="none" disabled>No buses available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium text-white">Station</label>
              <Select
                value={selectedStationId}
                onValueChange={setSelectedStationId}
                disabled={!selectedBusId || loadingStations}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue placeholder={!selectedBusId ? "Select a bus first" : "Select station"} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {loadingStations ? (
                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                  ) : (
                    stations.length
                      ? stations.map(station =>
                        <SelectItem key={station._id} value={station._id} className="text-white">
                          {station.name} <Badge className="ml-2 bg-gray-700" variant="outline">₹{station.fare}</Badge>
                        </SelectItem>)
                      : <SelectItem value="none" disabled>No stations available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {baseFare > 0 && (
              <div className="space-y-3">
                <FareBreakdownDisplay
                  originalFare={fareBreakdown.originalFare}
                  discountAmount={fareBreakdown.discountAmount}
                  finalFare={fareBreakdown.finalFare}
                  concessionType={fareBreakdown.concessionType}
                  discountPercentage={fareBreakdown.discountPercentage}
                  isEligible={fareBreakdown.isEligible}
                />

                {/* Payment Method Selection */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white">Payment Method</label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={paymentMethod === 'wallet' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('wallet')}
                      className="flex-1"
                      disabled={!hasSufficientFunds}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Wallet
                      {!hasSufficientFunds && <AlertTriangle className="h-4 w-4 ml-2 text-red-400" />}
                    </Button>
                    <Button
                      type="button"
                      variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                      onClick={() => setPaymentMethod('stripe')}
                      className="flex-1"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Card
                    </Button>
                  </div>
                </div>

                {paymentMethod === 'wallet' && !hasSufficientFunds && (
                  <div className="flex items-center mt-2 text-red-400 text-sm">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Insufficient wallet balance
                  </div>
                )}

                {/* Ticket Validity Info */}
                <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/50">
                  <div className="flex items-center text-sm text-blue-300">
                    <Clock className="h-4 w-4 mr-2" />
                    Ticket valid for 12 hours from purchase
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center border-t border-gray-700 p-4 bg-gray-800">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto bg-gray-700 border-gray-600 text-white hover:bg-gray-600">Cancel</Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={!selectedRouteId || !selectedBusId || !selectedStationId || isProcessing || (paymentMethod === 'wallet' && !hasSufficientFunds)}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50"
            >
              {paymentMethod === 'wallet' ? (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : `Pay from Wallet (₹${finalPrice})`}
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  {isProcessing ? "Processing..." : `Pay with Card (₹${finalPrice})`}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
