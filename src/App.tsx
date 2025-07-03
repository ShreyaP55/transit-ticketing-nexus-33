
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { UserProvider } from './context/UserContext';
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useUser } from "@/context/UserContext";

// Import pages
import Index from "@/pages/Index";
import { LoginPage, SignupPage } from "@/pages/AuthPages";
import WalletPage from "@/pages/WalletPage";
import TicketsPage from "@/pages/TicketsPage";
import PassPage from "@/pages/PassPage";
import LiveTrackingPage from "@/pages/LiveTrackingPage";
import BusesPage from "@/pages/BusesPage";
import RoutesPage from "@/pages/RoutesPage";
import StationManagementPage from "@/pages/StationManagementPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminLiveTrackingPage from "@/pages/AdminLiveTrackingPage";
import AdminRidesPage from "@/pages/AdminRidesPage";
import NotFound from "@/pages/NotFound";
import AdminRoute from "@/components/auth/AdminRoute";

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!clerkPubKey) {
  throw new Error("Missing Clerk Publishable Key");
}

function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <QueryClientProvider client={queryClient}>
        <UserProvider>
          <SidebarProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  <Route path="/tickets" element={<TicketsPage />} />
                  <Route path="/pass" element={<PassPage />} />
                  <Route path="/live-tracking" element={<LiveTrackingPage />} />
                  <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
                  <Route path="/admin/routes" element={<AdminRoute><RoutesPage /></AdminRoute>} />
                  <Route path="/admin/buses" element={<AdminRoute><BusesPage /></AdminRoute>} />
                  <Route path="/admin/stations" element={<AdminRoute><StationManagementPage /></AdminRoute>} />
                  <Route path="/admin/rides" element={<AdminRoute><AdminRidesPage /></AdminRoute>} />
                  <Route path="/admin/live-tracking" element={<AdminRoute><AdminLiveTrackingPage /></AdminRoute>} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <Toaster />
              </div>
            </Router>
          </SidebarProvider>
        </UserProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default App;
