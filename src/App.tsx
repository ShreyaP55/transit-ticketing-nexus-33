
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClerkProvider } from '@clerk/clerk-react';
import { UserProvider } from './context/UserContext';
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider } from "@/components/ui/sidebar";

// Import pages
import Index from './pages/Index';
import WalletPage from './pages/WalletPage';
import TicketsPage from './pages/TicketsPage';
import PassPage from './pages/PassPage';
import LiveTrackingPage from './pages/LiveTrackingPage';
import RoutesPage from './pages/RoutesPage';
import BusesPage from './pages/BusesPage';
import StationManagementPage from './pages/StationManagementPage';
import AdminRidesPage from './pages/AdminRidesPage';
import AdminLiveTrackingPage from './pages/AdminLiveTrackingPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AuthPages from './pages/AuthPages';
import NotFound from './pages/NotFound';

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
                  <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                  <Route path="/admin/routes" element={<RoutesPage />} />
                  <Route path="/admin/buses" element={<BusesPage />} />
                  <Route path="/admin/stations" element={<StationManagementPage />} />
                  <Route path="/admin/rides" element={<AdminRidesPage />} />
                  <Route path="/admin/live-tracking" element={<AdminLiveTrackingPage />} />
                  <Route path="/auth/*" element={<AuthPages />} />
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
