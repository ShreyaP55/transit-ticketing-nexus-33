
import React from "react";
import { useNavigate } from "react-router-dom";
import { ShieldX } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import AdminInstructions from "@/components/admin/AdminInstructions";

const NotAuthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <MainLayout title="Not Authorized">
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
          <ShieldX className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          You don't have permission to access this page. Please contact an administrator if you believe this is a mistake.
        </p>
        
        <div className="max-w-md w-full mb-8">
          <AdminInstructions />
        </div>
        
        <div className="flex gap-4">
          <Button 
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
          <Button 
            onClick={() => navigate("/")}
          >
            Return Home
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default NotAuthorizedPage;
