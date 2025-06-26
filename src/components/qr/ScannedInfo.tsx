
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
        <p className="font-semibold text-high-contrast">User ID:</p>
        <p className="text-sm text-muted-high-contrast font-mono">{userId?.substring(0, 12)}...</p>
        {location && (
          <div className="mt-2">
            <p className="font-semibold text-high-contrast">Current Location:</p>
            <p className="text-xs text-muted-high-contrast font-mono">
              {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
            </p>
          </div>
        )}
        {activeTrip && (
          <div className="mt-4 p-3 bg-orange-900/50 border border-orange-600 rounded-md">
            <p className="text-sm text-orange-200">
              <span className="font-medium text-orange-100">Trip started:</span> {new Date(activeTrip.startLocation.timestamp).toLocaleTimeString()}
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
            className="bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            {isLoading ? "Processing..." : "Check Out"}
          </Button>
        ) : (
          <Button
            onClick={onCheckIn}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold"
          >
            {isLoading ? "Processing..." : "Check In"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={onReset}
          disabled={isLoading}
          className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 font-semibold"
        >
          {isLoading ? "Wait..." : "Cancel"}
        </Button>
      </div>
    </div>
  );
};
