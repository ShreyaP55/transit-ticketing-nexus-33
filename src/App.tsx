
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
import NotFound from "./pages/NotFound";
import StationManagementPage from "./pages/StationManagementPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";
import { LoginPage, SignupPage } from "./pages/AuthPages";

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
              <Route path="/" element={<Index />} />
              <Route path="/tickets" element={<TicketsPage />} />
              <Route path="/pass" element={<PassPage />} />
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/stations" element={<StationManagementPage />} />
              <Route path="/tracking" element={<LiveTrackingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  </ClerkProvider>
);

export default App;
