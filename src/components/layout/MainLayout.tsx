
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Menu, X, User, Ticket, Map, Calendar, Bus, MapPin, Navigation } from "lucide-react";
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
  const { isAuthenticated, logout } = useUser();

  const navItems = [
    { name: "Home", icon: <Map size={20} />, path: "/" },
    { name: "My Tickets", icon: <Ticket size={20} />, path: "/tickets" },
    { name: "Monthly Pass", icon: <Calendar size={20} />, path: "/pass" },
    { name: "Routes & Buses", icon: <Bus size={20} />, path: "/routes" },
    { name: "Stations", icon: <MapPin size={20} />, path: "/stations" },
    { name: "Live Tracking", icon: <Navigation size={20} />, path: "/tracking" },
  ];

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
          "fixed top-0 left-0 z-30 h-full w-64 transform transition-transform duration-200 ease-in-out bg-white border-r border-border shadow-sm lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link 
            to="/" 
            className="flex items-center gap-2 font-bold text-transit-blue text-xl"
            onClick={() => setSidebarOpen(false)}
          >
            <Bus className="h-6 w-6" />
            <span>TransitNexus</span>
          </Link>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-accent group"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="mr-3 text-transit-blue">{item.icon}</div>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-10 left-0 w-full px-4">
          {isAuthenticated ? (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleLogout}
            >
              <User className="mr-2 h-4 w-4" />
              Logout
            </Button>
          ) : (
            <Button 
              className="w-full" 
              onClick={() => navigate("/login")}
            >
              <User className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-full lg:pl-64">
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">{title || "TransitNexus"}</h1>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>

        <footer className="bg-white p-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TransitNexus. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default MainLayout;
