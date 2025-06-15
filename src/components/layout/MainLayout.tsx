
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, User, Ticket, Map, Calendar, Bus, MapPin, Navigation, Settings, QrCode, Wallet, Route, ScanLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

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
    { name: "Wallet", icon: <Wallet size={20} />, path: "/wallet" },
  ];

  const adminNavItems = [
    { name: "Admin Dashboard", icon: <Settings size={20} />, path: "/admin" },
    { name: "Routes", icon: <Route size={20} />, path: "/routes" },
    { name: "Buses", icon: <Bus size={20} />, path: "/buses" },
    { name: "Stations", icon: <MapPin size={20} />, path: "/stations" },
    { name: "Scanner", icon: <ScanLine size={20} />, path: "/qr-scanner" },
    { name: "Admin Rides", icon: <Bus size={20} />, path: "/admin/rides" },
    { name: "Admin Live Tracking", icon: <Navigation size={20} />, path: "/admin/live-tracking" },
  ];

  // Combine navigation for admin if needed
  const navItems = isAdmin ? [...publicNavItems, ...adminNavItems] : publicNavItems;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen transitBg">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-40 lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </Button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed top-0 left-0 z-30 h-full w-64 transform transition-transform duration-200 ease-in-out bg-sidebar shadow-lg border-r border-sidebar-border flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* top spacing */}
        <div className="flex-1 flex flex-col justify-center">
          <nav className="flex flex-col items-center space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center px-4 py-3 text-sm font-medium rounded-md hover:bg-sidebar-accent group text-sidebar-foreground w-11/12 justify-center"
                onClick={() => setSidebarOpen(false)}
              >
                <div className="mr-3 text-transit-orange-light">{item.icon}</div>
                <span className="font-semibold">{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
        {/* bottom: BusInn and auth */}
        <div className="flex flex-col items-end pr-3 pb-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-transit-orange-dark text-lg mb-2"
            onClick={() => setSidebarOpen(false)}
          >
            <Bus className="h-6 w-6" />
            <span>BusInn</span>
          </Link>
          <div className="w-full px-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                className="w-full bg-sidebar-accent text-sidebar-foreground border-sidebar-border hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
                onClick={handleLogout}
              >
                <User className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Button
                className="w-full bg-transit-orange hover:bg-transit-orange-dark"
                onClick={() => navigate("/login")}
              >
                <User className="mr-2 h-4 w-4" />
                Login
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-full lg:pl-64">
        <header className="h-16 bg-white shadow-md flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold text-transit-orange-dark">{title || "TransitNexus"}</h1>
          {isAdmin && (
            <div className="flex items-center">
              <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-medium">
                Admin Access
              </span>
            </div>
          )}
        </header>
        <main className="flex-1 p-6">{children}</main>
        <footer className="bg-white p-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TransitNexus. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
