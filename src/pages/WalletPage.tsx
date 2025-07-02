
import React from "react";

import MainLayout from "@/components/layout/MainLayout";
import WalletCard from "@/components/wallet/WalletCard";
import UserQRCode from "@/components/wallet/UserQRCode";
import { ActiveTripDisplay } from '@/components/trips/ActiveTripDisplay';
import { tripsAPI } from '@/services/api';
import { useUser } from "@/context/UserContext";
import { useQuery } from "@tanstack/react-query";

const WalletPage: React.FC = () => {
  const { userId } = useUser();

  // Add active trip query
  const { data: activeTrip } = useQuery({
    queryKey: ['activeTrip', userId],
    queryFn: () => tripsAPI.getActiveTrip(userId!),
    enabled: !!userId,
    retry: 1,
  });

  return (
    <MainLayout title="Wallet">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Active Trip Display */}
        {activeTrip && (
          <ActiveTripDisplay activeTrip={activeTrip} />
        )}
        
        {/* Wallet Card */}
        <WalletCard />
        
        {/* User QR Code */}
        <UserQRCode />
      </div>
    </MainLayout>
  );
};

export default WalletPage;
