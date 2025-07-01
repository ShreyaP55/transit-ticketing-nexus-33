import React, { useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";

import MainLayout from "@/components/layout/MainLayout";
import WalletCard from "@/components/wallet/WalletCard";
import UserQRCode from "@/components/wallet/UserQRCode";
import RideHistory from "@/components/rides/RideHistory";
import { ActiveTripDisplay } from '@/components/trips/ActiveTripDisplay';
import { tripsAPI } from '@/services/api';

const WalletPage: React.FC = () => {
  const { userId, isSignedIn } = useUser();

  // Add active trip query
  const { data: activeTrip } = useQuery({
    queryKey: ['activeTrip', userId],
    queryFn: () => tripsAPI.getActiveTrip(userId),
    enabled: !!userId,
    retry: 1,
  });

  const {
    data: rideHistory,
    isLoading: isLoadingHistory,
    error: historyError,
    refetch: fetchHistory,
  } = useQuery({
    queryKey: ["rideHistory", userId],
    queryFn: () => {
      if (!userId) {
        return Promise.resolve([]);
      }
      return fetchHistoryForUser(userId);
    },
    enabled: isSignedIn,
    retry: 1,
  });

  useEffect(() => {
    if (userId && isSignedIn) {
      fetchHistory();
    }
  }, [userId, isSignedIn, fetchHistory]);

  const fetchHistoryForUser = async (userId: string) => {
    try {
      // Fetch ride history
      const rideHistory = await RideHistory.fetchRideHistory(userId);
      return rideHistory;
    } catch (error) {
      console.error("Error fetching ride history:", error);
      return [];
    }
  };

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
        
        {/* Ride History Section */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">Ride History</h2>
          {isLoadingHistory ? (
            <p>Loading ride history...</p>
          ) : historyError ? (
            <p>Error loading ride history: {historyError.message}</p>
          ) : (
            <RideHistory rides={rideHistory} />
          )}
        </section>
      </div>
    </MainLayout>
  );
};

export default WalletPage;
