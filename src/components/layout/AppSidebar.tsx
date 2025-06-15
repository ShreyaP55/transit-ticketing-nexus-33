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
    { name: "Home", icon: Map, path: "/" },
    { name: "My Tickets", icon: Ticket, path: "/tickets" },
    { name: "Monthly Pass", icon: Calendar, path: "/pass" },
    { name: "Live Tracking", icon: Navigation, path: "/tracking" },
    { name: "QR", icon: QrCode, path: "/qr-scan/:userId" },
    { name: "wallet", icon: Wallet, path: "/wallet" },
  ];

  const adminNavItems = [
    { name: "Routes", icon: Route, path: "/routes" },
    { name: "Buses", icon: Bus, path: "/buses" },
    { name: "Stations", icon: MapPin, path: "/stations" },
    { name: "Scanner", icon: ScanLine, path: "/qr-scanner" },
    { name: "Admin Live Tracking", icon: Navigation, path: "/admin/live-tracking" },
  ];

  const navItems = [...publicNavItems, ...(isAdmin ? adminNavItems : [])];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <span className="flex items-center gap-2 font-bold text-transit-orange-dark text-xl">
              <Bus className="h-6 w-6" />
              <span>BusInn</span>
            </span>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.name}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path || (item.path.includes(":userId") && location.pathname.startsWith("/qr-scan"))}
                  >
                    <Link to={item.path.replace(":userId", "me")}>
                      <item.icon className="mr-2" />
                      <span>{item.name}</span>
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
            className="w-full mt-2"
            onClick={() => {
              logout();
              navigate("/login");
            }}
          >
            Logout
          </Button>
        ) : (
          <Button
            className="w-full mt-2"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
};
