
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Ticket, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { passesAPI } from "@/services/api";
import { format } from "date-fns";

const PassQRCode: React.FC = () => {
  const { userId } = useUser();

  const { data: activePass, isLoading, error } = useQuery({
    queryKey: ["activePass", userId],
    queryFn: () => passesAPI.getActivePass(),
    enabled: !!userId,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
            <span className="ml-2 text-muted-foreground">Loading pass...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !activePass) {
    return (
      <Card className="bg-card border-border shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-card-foreground">
            <Ticket className="mr-2 h-5 w-5 text-primary" />
            Monthly Pass
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-1 text-card-foreground">No Active Pass</h3>
            <p className="text-muted-foreground">
              You don't have an active monthly pass. Purchase one to start using transit services.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isExpired = new Date(activePass.expiryDate) < new Date();
  const daysLeft = Math.max(
    0,
    Math.ceil(
      (new Date(activePass.expiryDate).getTime() - new Date().getTime()) / 
      (1000 * 3600 * 24)
    )
  );

  // Generate QR code data with pass information
  const qrData = JSON.stringify({
    type: "pass",
    passId: activePass._id,
    userId: activePass.userId,
    expiryDate: activePass.expiryDate,
    routeId: typeof activePass.routeId === 'object' ? activePass.routeId._id : activePass.routeId,
  });

  return (
    <Card className="bg-card border-border shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-card-foreground">
          <div className="flex items-center">
            <Ticket className="mr-2 h-5 w-5 text-primary" />
            Monthly Pass
          </div>
          <Badge 
            variant={isExpired ? "destructive" : "default"} 
            className={isExpired ? "" : "bg-green-100 text-green-800 border-green-300"}
          >
            {isExpired ? "Expired" : "Active"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* QR Code */}
        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-lg">
            <QRCodeSVG
              value={qrData}
              size={180}
              level="M"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Pass Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Route:</span>
            <span className="font-medium text-card-foreground">
              {typeof activePass.routeId === 'object' && activePass.routeId 
                ? `${activePass.routeId.start} → ${activePass.routeId.end}`
                : 'Route Information'
              }
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fare:</span>
            <span className="font-medium text-card-foreground">₹{activePass.fare}</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Expires:</span>
            <span className="font-medium text-card-foreground">
              {format(new Date(activePass.expiryDate), "MMM d, yyyy")}
            </span>
          </div>

          {!isExpired && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Days remaining:</span>
              <span className="font-medium text-primary">{daysLeft} days</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            <Calendar className="inline h-4 w-4 mr-2" />
            Show this QR code to bus staff for pass verification and usage tracking.
          </p>
        </div>

        <div className="text-xs text-muted-foreground text-center">
          Pass ID: {activePass._id.substring(0, 8)}...
        </div>
      </CardContent>
    </Card>
  );
};

export default PassQRCode;
