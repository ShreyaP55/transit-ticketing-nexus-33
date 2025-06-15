
import React from 'react';
import { Button } from "@/components/ui/button";

interface ScannedInfoProps {
  userId: string | null;
  location: { lat: number; lng: number } | null;
  activeTrip: any;
  isLoading: boolean;
  onCheckIn: () => void;
  onCheckOut: () => void;
  onReset: () => void;
}

export const ScannedInfo: React.FC<ScannedInfoProps> = ({
  userId,
  location,
  activeTrip,
  isLoading,
  onCheckIn,
  onCheckOut,
  onReset,
}) => {
  return (
    <div className="text-center">
      <div className="mb-4">
        <p className="font-semibold">User ID:</p>
        <p className="text-sm text-muted-foreground">{userId?.substring(0, 12)}...</p>
        {location && (
          <div className="mt-2">
            <p className="font-semibold">Current Location:</p>
            <p className="text-xs text-muted-foreground">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
        )}
        {activeTrip && (
          <div className="mt-4 p-3 bg-transit-orange/10 rounded-md">
            <p className="text-sm">
              <span className="font-medium">Trip started:</span> {new Date(activeTrip.startLocation.timestamp).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>
      <div className="flex justify-center space-x-2 mt-4">
        {activeTrip ? (
          <Button
            variant="destructive"
            onClick={onCheckOut}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Check Out"}
          </Button>
        ) : (
          <Button
            variant="default"
            className="bg-transit-orange hover:bg-transit-orange-dark"
            onClick={onCheckIn}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Check In"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isLoading}
        >
          {isLoading ? "Wait..." : "Cancel"}
        </Button>
      </div>
    </div>
  );
};
