
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import { ClerkProvider } from "@clerk/clerk-react";
import Index from "./pages/Index";
import TicketsPage from "./pages/TicketsPage";
import PassPage from "./pages/PassPage";
import BookingPage from "./pages/BookingPage";
import RoutesPage from "./pages/RoutesPage";
import BusesPage from "./pages/BusesPage";
import NotFound from "./pages/NotFound";
import StationManagementPage from "./pages/StationManagementPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import NotAuthorizedPage from "./pages/NotAuthorizedPage";
import AdminRoute from "./components/auth/AdminRoute";

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
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/pass" element={<PassPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/tracking" element={<LiveTrackingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/unauthorized" element={<NotAuthorizedPage />} />
              
              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/routes" element={<RoutesPage />} />
                <Route path="/buses" element={<BusesPage />} />
                <Route path="/stations" element={<StationManagementPage />} />
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
