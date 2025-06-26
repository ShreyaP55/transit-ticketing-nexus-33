
import React from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQRScanner } from '@/hooks/useQRScanner';
import { StatusDisplay } from '@/components/qr/StatusDisplay';
import { ScannerView } from '@/components/qr/ScannerView';
import { ScannedInfo } from '@/components/qr/ScannedInfo';

const QRScannerPage: React.FC = () => {
  const {
    scanned,
    userId,
    location,
    isLoadingLocation,
    isLoading,
    activeTrip,
    connectionError,
    locationError,
    handleScan,
    handleError,
    handleCheckIn,
    handleCheckOut,
    handleReset,
  } = useQRScanner();

  const hasErrorOrIsLoading = !!locationError || isLoadingLocation;

  return (
    <MainLayout title="QR Scanner">
      <div className="max-w-md mx-auto p-4">
        <Card className="bg-gray-900 shadow-lg border-gray-700 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-orange-600/20 to-transparent border-b border-gray-700">
            <CardTitle className="text-center text-high-contrast">
              {scanned ? "User QR Scanned" : "Scan User QR Code"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-gray-900">
            {connectionError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded-md">
                <p className="text-error-high-contrast text-sm">
                  ⚠️ Backend server connection failed. Please ensure the server is running on port 3001.
                </p>
              </div>
            )}
            {hasErrorOrIsLoading ? (
              <StatusDisplay
                connectionError={false} // Handled separately above
                locationError={locationError}
                isLoadingLocation={isLoadingLocation}
              />
            ) : (
              <>
                {!scanned ? (
                  <ScannerView
                    location={location}
                    onScan={handleScan}
                    onError={handleError}
                  />
                ) : (
                  <ScannedInfo
                    userId={userId}
                    location={location}
                    activeTrip={activeTrip}
                    isLoading={isLoading}
                    onCheckIn={handleCheckIn}
                    onCheckOut={handleCheckOut}
                    onReset={handleReset}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
        <div className="mt-4 p-3 bg-blue-900/50 border border-blue-600 rounded-md">
          <p className="text-sm text-blue-200">
            💡 <strong className="text-blue-100">How to use:</strong> Users should show their QR code from the wallet page to check in/out of trips.
          </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default QRScannerPage;
