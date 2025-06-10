
import React, { useState } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import UberLikeRideScanner from "@/components/rides/UberLikeRideScanner";
import { Bus, Settings } from "lucide-react";

const QRScannerPage: React.FC = () => {
  const [busId, setBusId] = useState("BUS001");
  const [busName, setBusName] = useState("Route 1 Express");
  const [isConfigured, setIsConfigured] = useState(false);

  const handleConfigure = () => {
    if (busId.trim() && busName.trim()) {
      setIsConfigured(true);
    }
  };

  if (!isConfigured) {
    return (
      <MainLayout title="QR Scanner Setup">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="bg-gradient-to-r from-transit-orange to-transit-orange-dark text-white">
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Configure Bus Scanner
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="busId">Bus ID</Label>
                <Input
                  id="busId"
                  value={busId}
                  onChange={(e) => setBusId(e.target.value)}
                  placeholder="Enter bus ID (e.g., BUS001)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="busName">Bus Name</Label>
                <Input
                  id="busName"
                  value={busName}
                  onChange={(e) => setBusName(e.target.value)}
                  placeholder="Enter bus name (e.g., Route 1 Express)"
                />
              </div>
              
              <Button 
                onClick={handleConfigure}
                className="w-full bg-transit-orange hover:bg-transit-orange-dark"
                disabled={!busId.trim() || !busName.trim()}
              >
                <Bus className="mr-2 h-4 w-4" />
                Start Scanner
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="UberBus QR Scanner">
      <div className="space-y-6">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <div>
            <h2 className="text-lg font-semibold text-white">Active Scanner</h2>
            <p className="text-sm text-muted-foreground">{busName} ({busId})</p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsConfigured(false)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        
        <UberLikeRideScanner 
          busId={busId} 
          busName={busName} 
          isAdmin={true} 
        />
      </div>
    </MainLayout>
  );
};

export default QRScannerPage;
