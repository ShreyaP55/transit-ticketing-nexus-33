
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import MainLayout from "@/components/layout/MainLayout";
import { PassCard } from "@/components/passes/PassCard";
import { PassBenefitsCard } from "@/components/passes/PassBenefitsCard";
import PassQRCode from "@/components/passes/PassQRCode";
import { PassPurchaseForm } from "@/components/passes/PassPurchaseForm";
import { usePassManagement } from "@/hooks/usePassManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PassPage = () => {
  const {
    routes,
    activePass,
    selectedRouteId,
    setSelectedRouteId,
    selectedRoute,
    isProcessing,
    isLoadingRoutes,
    isLoadingPass,
    handlePurchasePass,
    refetchPass
  } = usePassManagement();

  return (
    <MainLayout title="Monthly Pass">
      <div className="max-w-4xl mx-auto">
        {isLoadingPass ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-32" />
          </div>
        ) : activePass ? (
          <div className="animate-fade-in">
            <Tabs defaultValue="current" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="current" className="flex-1">Current Pass</TabsTrigger>
                <TabsTrigger value="qr" className="flex-1">QR Code</TabsTrigger>
              </TabsList>
              
              <TabsContent value="current" className="space-y-6">
                <PassCard pass={activePass} className="mb-8" />
                <PassBenefitsCard activePass={activePass} onRefresh={refetchPass} />
              </TabsContent>
              
              <TabsContent value="qr">
                <PassQRCode activePass={activePass} />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="animate-fade-in">
            <PassPurchaseForm
              routes={routes}
              selectedRouteId={selectedRouteId}
              setSelectedRouteId={setSelectedRouteId}
              selectedRoute={selectedRoute}
              isLoadingRoutes={isLoadingRoutes}
              isProcessing={isProcessing}
              onPurchase={handlePurchasePass}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default PassPage;
