
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import { QRScanCard } from "@/components/qr/QRScanCard";
import { useQRScanPageLogic } from "@/hooks/useQRScanPageLogic";

const QRScanPage = () => {
  const {
    userId,
    isLoading,
    location,
    error,
    activeTrip,
    isProcessing,
    isAuthenticated,
    handleCheckIn,
    handleCheckOut,
    handleCancel,
  } = useQRScanPageLogic();

  return (
    <MainLayout title={activeTrip ? "Trip in Progress" : "Start Your Trip"}>
      <div className="max-w-lg mx-auto p-4">
        <QRScanCard
          userId={userId}
          activeTrip={activeTrip}
          location={location}
          isLoading={isLoading}
          error={error}
          isProcessing={isProcessing}
          isAuthenticated={isAuthenticated}
          onCheckIn={handleCheckIn}
          onCheckOut={handleCheckOut}
          onCancel={handleCancel}
        />
      </div>
    </MainLayout>
  );
};

export default QRScanPage;
