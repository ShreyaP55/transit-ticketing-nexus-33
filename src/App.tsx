
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import UserDashboardPage from "./pages/UserDashboardPage";
import RidesPage from "./pages/RidesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminRidesPage from "./pages/AdminRidesPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import NotAuthorizedPage from "./pages/NotAuthorizedPage";
import AdminRoute from "./components/auth/AdminRoute";
import WalletPage from "./pages/WalletPage";
import QRScannerPage from "./pages/QRScannerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App = () => (
  <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/rides" element={<RidesPage />} />
              <Route path="/live-tracking" element={<LiveTrackingPage />} />
              <Route path="/wallet" element={<WalletPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/unauthorized" element={<NotAuthorizedPage />} />
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/rides" element={<AdminRidesPage />} />
                <Route path="/qr-scanner" element={<QRScannerPage />} />
              </Route>
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
