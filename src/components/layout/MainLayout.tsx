
import React, { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Menu, X, User, Ticket, Map, Calendar, Bus, MapPin, Navigation, Settings, QrCode, Wallet, Route, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { UserButton } from "@clerk/clerk-react";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
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

  const currentNavItem = navItems.find(item => {
    if (item.path.includes(":")) {
        const basePath = item.path.split("/:")[0];
        return location.pathname.startsWith(basePath);
    }
    return location.pathname === item.path;
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full transitBg">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <header className="h-14 sm:h-16 bg-white shadow-md flex items-center justify-between px-3 sm:px-6 sticky top-0 z-10">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <SidebarTrigger className="lg:hidden flex-shrink-0" />
              {currentNavItem && React.cloneElement(currentNavItem.icon as React.ReactElement, { className: "text-transit-orange-dark h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" })}
              <h1 className="text-sm sm:text-xl font-semibold text-transit-orange-dark truncate">
                {title || "TransitNexus"}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {isAdmin && (
                <span className="bg-amber-100 text-amber-800 px-2 sm:px-3 py-1 rounded-full text-xs font-medium hidden sm:inline">
                  Admin Access
                </span>
              )}
              {isAdmin && (
                <span className="bg-amber-100 text-amber-800 px-1 py-1 rounded-full text-xs font-medium sm:hidden">
                  A
                </span>
              )}
              {isAuthenticated && (
                <div className="flex items-center h-8 sm:h-10">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary shadow"
                      }
                    }}
                    userProfileMode="modal"
                  />
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 p-2 sm:p-4 md:p-6 min-w-0">{children}</main>
          <footer className="bg-white p-3 sm:p-4 text-center text-xs sm:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} BusInn. All rights reserved.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
