import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ClerkProvider, useUser } from "@clerk/clerk-react";
import { HomePage } from "./pages/HomePage";
import WalletPage from "./pages/WalletPage";
import TicketsPage from "./pages/TicketsPage";
import PassesPage from "./pages/PassesPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import BusManagementPage from "./pages/BusManagementPage";
import RouteManagementPage from "./pages/RouteManagementPage";
import StationManagementPage from "./pages/StationManagementPage";
import AdminLiveTrackingPage from "./pages/AdminLiveTrackingPage";
import AdminRideTrackerPage from "./pages/AdminRideTrackerPage";
import QRScannerPage from "./pages/QRScannerPage";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { UserProvider } from "./context/UserContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin, isLoading } = useUser();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <div>Unauthorized</div>;
  }

  return <>{children}</>;
};

function App() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <QueryClientProvider client={new QueryClient()}>
        <UserProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Toaster />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/passes" element={<PassesPage />} />
                <Route path="/qr-scanner" element={<QRScannerPage />} />
                <Route path="/live-tracking" element={<LiveTrackingPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                <Route path="/admin/buses" element={<AdminRoute><BusManagementPage /></AdminRoute>} />
                <Route path="/admin/routes" element={<AdminRoute><RouteManagementPage /></AdminRoute>} />
                <Route path="/admin/stations" element={<AdminRoute><StationManagementPage /></AdminRoute>} />
                <Route path="/admin/live-tracking" element={<AdminRoute><AdminLiveTrackingPage /></AdminRoute>} />
                <Route path="/admin/ride-tracker" element={<AdminRoute><AdminRideTrackerPage /></AdminRoute>} />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
