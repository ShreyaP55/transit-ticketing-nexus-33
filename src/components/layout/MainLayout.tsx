
import React from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import { SignInButton, SignOutButton, UserButton } from "@clerk/clerk-react";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const { isAuthenticated, isAdmin, userDetails } = useUser();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          {/* Header with login/logout buttons */}
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 px-4 border-b bg-white">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              {title && (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-px bg-sidebar-border" />
                  <h1 className="text-lg font-semibold">{title}</h1>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      Admin
                    </Badge>
                  )}
                  <span className="text-sm text-gray-600">
                    Welcome, {userDetails?.firstName}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                  <SignOutButton>
                    <Button variant="outline" size="sm">
                      Logout
                    </Button>
                  </SignOutButton>
                </div>
              ) : (
                <SignInButton mode="modal">
                  <Button variant="default" size="sm">
                    Login
                  </Button>
                </SignInButton>
              )}
            </div>
          </header>
          
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
