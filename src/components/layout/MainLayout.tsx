
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, User, Ticket, Map, Calendar, Bus, MapPin, Navigation, Settings, QrCode, Wallet, Route, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
// Remove explicit Avatar import, we'll use Clerk's UserButton instead
// import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { UserButton } from "@clerk/clerk-react";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, logout, isAdmin, userDetails } = useUser();

  const publicNavItems = [
    { name: "Home", icon: <Map size={20} />, path: "/" },
    { name: "My Tickets", icon: <Ticket size={20} />, path: "/tickets" },
    { name: "Monthly Pass", icon: <Calendar size={20} />, path: "/pass" },
    { name: "Live Tracking", icon: <Navigation size={20} />, path: "/tracking" },
    { name: "QR", icon: <QrCode size={20} />, path: "/qr-scan/:userId" },
    { name: "wallet", icon: <Wallet size={20} />, path: "/wallet" },
  ];

  const adminNavItems = [
    { name: "Admin Dashboard", icon: <Settings size={20} />, path: "/admin" },
    { name: "Routes", icon: <Route size={20} />, path: "/routes" },
    { name: "Buses", icon: <Bus size={20} />, path: "/buses" },
    { name: "Stations", icon: <MapPin size={20} />, path: "/stations" },
    { name: "Scanner", icon: <ScanLine size={20} />, path: "/qr-scanner" },
    { name: "Admin Live Tracking", icon: <Navigation size={20} />, path: "/admin/live-tracking" },
  ];

  const navItems = [...publicNavItems, ...(isAdmin ? adminNavItems : [])];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full transitBg">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="h-16 bg-white shadow-md flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-xl font-semibold text-transit-orange-dark">{title || "TransitNexus"}</h1>
            </div>
            <div className="flex items-center gap-4">
              {isAdmin && (
                <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                  Admin Access
                </span>
              )}
              {isAuthenticated && (
                // Clerk UserButton (shows avatar, and clicking it opens the profile/settings dropdown)
                <div className="flex items-center h-10">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-10 w-10 border-2 border-primary shadow"
                      }
                    }}
                    userProfileMode="modal"
                  />
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">{children}</main>
          <footer className="bg-white p-4 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TransitNexus. All rights reserved.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
