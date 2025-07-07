
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader } from "@/components/ui/sidebar"
import { Ticket, CreditCard, MapPin, Bus, Route, Users, Scan, Wallet, Settings } from "lucide-react"
import { Link } from "react-router-dom";
import { useUser } from "@/context/UserContext";

const AppSidebar = () => {
  const { isAdmin } = useUser();

  const userItems = [
    {
      title: "Live Tracking",
      url: "/tracking",
      icon: MapPin,
    },
    {
      title: "Buy Tickets",
      url: "/tickets",
      icon: Ticket,
    },
    {
      title: "Travel Pass",
      url: "/pass",
      icon: CreditCard,
    },
    {
      title: "Wallet",
      url: "/wallet",
      icon: Wallet,
    },
    {
      title: "Profile",
      url: "/profile",
      icon: Settings,
    }
  ];

  const adminItems = [
    {
      title: "Admin Dashboard",
      url: "/admin/dashboard",
      icon: Users,
    },
    {
      title: "QR Scanner",
      url: "/admin/qr-scanner",
      icon: Scan,
    },
    {
      title: "Admin Live Tracking",
      url: "/admin/live-tracking",
      icon: MapPin,
    },
    {
      title: "Routes",
      url: "/routes", 
      icon: Route,
    },
    {
      title: "Buses",
      url: "/buses",
      icon: Bus,
    },
    {
      title: "Stations",
      url: "/stations",
      icon: Users,
    }
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center space-x-2">
          <Bus className="h-8 w-8 text-orange-600" />
          <span className="text-xl font-bold text-gray-900">BusInn</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Travel</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link to={item.url} className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url} className="flex items-center space-x-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  )
}

export default AppSidebar;
