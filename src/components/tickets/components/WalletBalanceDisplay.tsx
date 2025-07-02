
import React from "react";
import { Wallet } from "lucide-react";

interface WalletBalanceDisplayProps {
  balance: number;
  isLoading: boolean;
}

export const WalletBalanceDisplay: React.FC<WalletBalanceDisplayProps> = ({
  balance,
  isLoading,
}) => {
  return (
    <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-400">
          <Wallet className="h-4 w-4 mr-2" />
          Wallet Balance
        </div>
        <div className="text-lg font-bold text-green-400">
          ₹{isLoading ? "..." : balance.toFixed(2)}
        </div>
      </div>
    </div>
  );
};
