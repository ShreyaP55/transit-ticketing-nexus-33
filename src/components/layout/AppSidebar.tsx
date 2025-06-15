
import React from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Bus, Map, Ticket, Calendar, Navigation, QrCode, Wallet, Settings, Route, ScanLine, MapPin } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";

export const AppSidebar: React.FC = () => {
  const { isAuthenticated, logout, isAdmin } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const publicNavItems = [
    { name: "Home", shortName: "Home", icon: Map, path: "/" },
    { name: "My Tickets", shortName: "Tickets", icon: Ticket, path: "/tickets" },
    { name: "Monthly Pass", shortName: "Pass", icon: Calendar, path: "/pass" },
    { name: "Live Tracking", shortName: "Tracking", icon: Navigation, path: "/tracking" },
    { name: "QR", shortName: "QR", icon: QrCode, path: "/qr-scan/:userId" },
    { name: "Wallet", shortName: "Wallet", icon: Wallet, path: "/wallet" },
  ];

  const adminNavItems = [
    { name: "Routes", shortName: "Routes", icon: Route, path: "/routes" },
    { name: "Buses", shortName: "Buses", icon: Bus, path: "/buses" },
    { name: "Stations", shortName: "Stations", icon: MapPin, path: "/stations" },
    { name: "Scanner", shortName: "Scanner", icon: ScanLine, path: "/qr-scanner" },
    { name: "Admin Live Tracking", shortName: "Admin Track", icon: Navigation, path: "/admin/live-tracking" },
  ];

  const navItems = [...publicNavItems, ...(isAdmin ? adminNavItems : [])];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="flex items-center gap-2 font-bold text-transit-orange-dark text-lg sm:text-xl">
              <Bus className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="hidden sm:inline">BusInn</span>
              <span className="sm:hidden">BI</span>
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path || (item.path.includes(":userId") && location.pathname.startsWith("/qr-scan"))}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Link to={item.path.replace(":userId", "me")}>
                      <item.icon className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                      <span className="truncate text-xs sm:text-sm">{item.shortName}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {isAuthenticated ? (
          <Button
            variant="outline"
            className="w-full mt-2 text-xs sm:text-sm"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        ) : (
          <Button
            className="w-full mt-2 text-xs sm:text-sm"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
