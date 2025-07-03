
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
    { name: "Live Tracking", icon: <Navigation size={20} />, path: "/live-tracking" },
    { name: "Wallet", icon: <Wallet size={20} />, path: "/wallet" },
  ];

  const adminNavItems = [
    { name: "Admin Dashboard", icon: <Settings size={20} />, path: "/admin/dashboard" },
    { name: "Routes", icon: <Route size={20} />, path: "/admin/routes" },
    { name: "Buses", icon: <Bus size={20} />, path: "/admin/buses" },
    { name: "Stations", icon: <MapPin size={20} />, path: "/admin/stations" },
    { name: "Admin Live Tracking", icon: <Navigation size={20} />, path: "/admin/live-tracking" },
    { name: "Admin Rides", icon: <ScanLine size={20} />, path: "/admin/rides" },
  ];

  const navItems = [...publicNavItems, ...(isAdmin ? adminNavItems : [])];

  const currentNavItem = navItems.find(item => {
    if (item.path.includes(":")) {
        const basePath = item.path.split("/:")[0];
        return location.pathname.startsWith(basePath);
    }
    return location.pathname === item.path;
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          {/* Header - Fully responsive */}
          <header className="h-14 md:h-16 bg-card border-b border-border flex items-center justify-between px-4 md:px-6 lg:px-8 sticky top-0 z-50">
            <div className="flex items-center gap-2 md:gap-3 min-w-0 flex-1">
              <SidebarTrigger className="lg:hidden flex-shrink-0 h-6 w-6 md:h-7 md:w-7" />
              {currentNavItem && React.cloneElement(currentNavItem.icon as React.ReactElement, { 
                className: "text-primary h-4 w-4 md:h-5 md:w-5 flex-shrink-0", 
                size: undefined 
              })}
              <h1 className="text-sm md:text-lg lg:text-xl font-semibold text-foreground truncate">
                {title || "TransitNexus"}
              </h1>
            </div>
            <div className="flex items-center gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
              {isAdmin && (
                <span className="bg-amber-100 text-amber-800 px-2 md:px-3 py-1 rounded-full text-xs font-medium">
                  <span className="hidden sm:inline">Admin</span>
                  <span className="sm:hidden">A</span>
                </span>
              )}
              {isAuthenticated && (
                <div className="flex items-center h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10">
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8 md:h-9 md:w-9 lg:h-10 lg:w-10 border border-primary shadow"
                      }
                    }}
                    userProfileMode="modal"
                  />
                </div>
              )}
            </div>
          </header>

          {/* Main Content - Responsive padding and layout */}
          <main className="flex-1 p-4 md:p-6 lg:p-8 xl:p-10 min-w-0 w-full max-w-full overflow-x-hidden">
            <div className="w-full max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          {/* Footer - Responsive */}
          <footer className="bg-card border-t border-border p-3 md:p-4 text-center text-xs md:text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TransitNexus. All rights reserved.
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
