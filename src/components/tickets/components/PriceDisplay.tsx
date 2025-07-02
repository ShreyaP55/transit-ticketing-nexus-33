
import React from "react";
import { AlertTriangle } from "lucide-react";

interface PriceDisplayProps {
  price: number;
  hasSufficientFunds: boolean;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  hasSufficientFunds,
}) => {
  if (price <= 0) return null;

  return (
    <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-400">Ticket Price</div>
        <div className="text-xl font-bold text-blue-400">₹{price}</div>
      </div>
      {!hasSufficientFunds && (
        <div className="flex items-center mt-2 text-red-400 text-sm">
          <AlertTriangle className="h-4 w-4 mr-1" />
          Insufficient wallet balance
        </div>
      )}
    </div>
  );
};
