
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import WalletPage from "./pages/WalletPage";
import TicketsPage from "./pages/TicketsPage";
import PassPage from "./pages/PassPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import AdminLiveTrackingPage from "./pages/AdminLiveTrackingPage";
import AdminRidesPage from "./pages/AdminRidesPage";
import BusesPage from "./pages/BusesPage";
import RoutesPage from "./pages/RoutesPage";
import StationManagementPage from "./pages/StationManagementPage";
import { QueryClient } from "@tanstack/react-query";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import { UserProvider, useUser } from "./context/UserContext";

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
                <Route path="/" element={<Index />} />
                <Route path="/wallet" element={<WalletPage />} />
                <Route path="/tickets" element={<TicketsPage />} />
                <Route path="/passes" element={<PassPage />} />
                <Route path="/live-tracking" element={<LiveTrackingPage />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminRidesPage /></AdminRoute>} />
                <Route path="/admin/buses" element={<AdminRoute><BusesPage /></AdminRoute>} />
                <Route path="/admin/routes" element={<AdminRoute><RoutesPage /></AdminRoute>} />
                <Route path="/admin/stations" element={<AdminRoute><StationManagementPage /></AdminRoute>} />
                <Route path="/admin/live-tracking" element={<AdminRoute><AdminLiveTrackingPage /></AdminRoute>} />
                <Route path="/admin/ride-tracker" element={<AdminRoute><AdminRidesPage /></AdminRoute>} />
              </Routes>
            </div>
          </Router>
        </UserProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
