
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, CreditCard, AlertCircle } from "lucide-react";
import { routesAPI, passesAPI, paymentAPI } from "@/services/api";
import MainLayout from "@/components/layout/MainLayout";
import { PassCard } from "@/components/passes/PassCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const PassPage = () => {
  const navigate = useNavigate();
  const [selectedRouteId, setSelectedRouteId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Fetch routes
  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ["routes"],
    queryFn: routesAPI.getAll
  });
  
  // Fetch active pass
  const {
    data: activePass,
    isLoading: isLoadingPass,
    error: passError
  } = useQuery({
    queryKey: ["activePass"],
    queryFn: passesAPI.getActivePass,
    retry: (failureCount, error) => {
      // Don't retry if 404 (no active pass found)
      if (error.message.includes("404")) return false;
      return failureCount < 3;
    }
  });
  
  const selectedRoute = routes.find(r => r._id === selectedRouteId);
  
  const handlePurchasePass = async () => {
    if (!selectedRouteId) {
      toast.error("Please select a route");
      return;
    }
    
    if (!selectedRoute) {
      toast.error("Invalid route selected");
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // In a real app, this would redirect to Stripe
      const sessionId = await paymentAPI.createPassCheckoutSession(
        selectedRouteId,
        selectedRoute.fare * 20 // Monthly pass discount (assuming 20x the single fare)
      );
      
      // Create pass after successful payment
      const result = await passesAPI.createPass({
        routeId: selectedRouteId,
        fare: selectedRoute.fare * 20,
        sessionId
      });
      
      if (result.success) {
        toast.success("Monthly pass purchased successfully!");
        navigate(0); // Refresh the page to show the new pass
      }
    } catch (error) {
      toast.error("Failed to process payment");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <MainLayout title="Monthly Pass">
      <div className="max-w-3xl mx-auto">
        {isLoadingPass ? (
          <div className="text-center py-8">
            <div className="animate-pulse">Checking pass status...</div>
          </div>
        ) : activePass ? (
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">My Monthly Pass</h1>
            <PassCard pass={activePass} className="mb-8" />
            
            <Card>
              <CardHeader>
                <CardTitle>Pass Benefits</CardTitle>
                <CardDescription>
                  Enjoy unlimited travel on your selected route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Unlimited rides on the {activePass.routeId.start} - {activePass.routeId.end} route</li>
                  <li>Valid for a full month from date of purchase</li>
                  <li>More economical than buying individual tickets</li>
                  <li>No need to purchase tickets for every journey</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button variant="outline" onClick={() => navigate("/")}>
                  Explore Routes
                </Button>
              </CardFooter>
            </Card>
          </div>
        ) : (
          <div className="animate-fade-in">
            <div className="mb-8">
              <h1 className="text-2xl font-bold mb-2">Get Your Monthly Pass</h1>
              <p className="text-muted-foreground">
                Purchase a monthly pass for unlimited travel on your selected route
              </p>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Purchase Monthly Pass</CardTitle>
                <CardDescription>
                  Select a route to purchase a monthly transit pass
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="grid gap-6">
                  <div>
                    <label htmlFor="route" className="block text-sm font-medium mb-1">
                      Select Route
                    </label>
                    <Select
                      value={selectedRouteId}
                      onValueChange={setSelectedRouteId}
                    >
                      <SelectTrigger id="route">
                        <SelectValue placeholder="Choose a route" />
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingRoutes ? (
                          <SelectItem value="loading" disabled>
                            Loading...
                          </SelectItem>
                        ) : (
                          routes.map((route) => (
                            <SelectItem key={route._id} value={route._id}>
                              {route.start} - {route.end} (${route.fare})
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {selectedRouteId && selectedRoute && (
                    <div className="border rounded-lg p-4 bg-transit-blue bg-opacity-5">
                      <h3 className="font-medium mb-3 flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-transit-blue" />
                        Monthly Pass Details
                      </h3>
                      
                      <div className="space-y-2 text-sm">
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Route:</span>
                          <span>{selectedRoute.start} - {selectedRoute.end}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Regular fare:</span>
                          <span>${selectedRoute.fare.toFixed(2)} per trip</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Monthly pass price:</span>
                          <span className="font-medium">${(selectedRoute.fare * 20).toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-muted-foreground">Validity:</span>
                          <span>30 days from purchase</span>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-3 bg-white rounded flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-transit-yellow mt-0.5 flex-shrink-0" />
                        <p>
                          A monthly pass is perfect if you travel more than 20 times per month on this route,
                          giving you unlimited rides and saving you money.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handlePurchasePass}
                  disabled={!selectedRouteId || isProcessing}
                >
                  {isProcessing ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Purchase Pass
                    </span>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PassPage;
