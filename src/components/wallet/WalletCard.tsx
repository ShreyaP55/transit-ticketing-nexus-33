
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, CreditCard, IndianRupee, History } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useWallet } from "@/services/walletService";
import { useAuthService } from "@/services/authService";
import { toast } from "sonner";

const WalletCard: React.FC = () => {
  const { userId } = useUser();
  const { getAuthToken } = useAuthService();
  const [addAmount, setAddAmount] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { wallet, isLoading, addFunds, isAddingFunds, refetchWallet } = useWallet(
    userId || "",
    getAuthToken() || undefined
  );

  const handleAddFunds = async () => {
    const amount = parseFloat(addAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    try {
      setIsAdding(true);
      await addFunds(amount);
      toast.success(`₹${amount} added to wallet successfully!`);
      setAddAmount("");
      // Force immediate refetch
      setTimeout(() => refetchWallet(), 500);
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error("Failed to add funds. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-blue-400 border-t-transparent rounded-full"></div>
            <span className="ml-2 text-gray-400">Loading wallet...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-gray-700">
        <CardTitle className="flex items-center text-white">
          <CreditCard className="mr-2 h-5 w-5 text-blue-400" />
          Digital Wallet
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Balance Display */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center text-3xl font-bold text-green-400 mb-2">
            <IndianRupee className="h-6 w-6 mr-1" />
            {wallet?.balance?.toFixed(2) || "0.00"}
          </div>
          <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
            Available Balance
          </Badge>
        </div>

        {/* Add Funds Section */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Enter amount"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              step="0.01"
              min="1"
            />
            <Button
              onClick={handleAddFunds}
              disabled={isAddingFunds || isAdding || !addAmount}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isAddingFunds || isAdding ? (
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {/* Quick Add Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => setAddAmount(amount.toString())}
                className="bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                ₹{amount}
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        {wallet?.transactions && wallet.transactions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center text-sm text-gray-400 mb-3">
              <History className="h-4 w-4 mr-2" />
              Recent Transactions
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {wallet.transactions.slice(-3).reverse().map((transaction, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-300 truncate">
                    {transaction.description}
                  </span>
                  <span className={`font-medium ${
                    transaction.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WalletCard;
