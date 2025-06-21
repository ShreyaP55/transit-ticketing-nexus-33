
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, Check, Plus, RefreshCw } from 'lucide-react';
import { useWallet } from '@/services/walletService';
import { useUser } from '@/context/UserContext';
import { stripeService } from '@/services/stripeService';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useAuthService } from '@/services/authService';

const WalletCard = () => {
  const { userId } = useUser();
  const { getAuthToken } = useAuthService();
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { wallet, addFunds, isLoading, refetchWallet } = useWallet(userId || 'guest', authToken || '');
  const [searchParams] = useSearchParams();
  const [isAdding, setIsAdding] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get auth token on component mount
  useEffect(() => {
    const fetchAuthToken = async () => {
      if (userId) {
        const token = await getAuthToken();
        setAuthToken(token);
      }
    };
    fetchAuthToken();
  }, [userId, getAuthToken]);

  useEffect(() => {
    // Handle successful wallet recharge
    const status = searchParams.get('status');
    const sessionId = searchParams.get('session_id');
    const amount = searchParams.get('amount');
    
    if (status === 'success' && sessionId && authToken && userId && amount) {
      // Only after payment confirmation, credit wallet
      (async () => {
        try {
          // Call your wallet top-up API endpoint
          const res = await fetch('/api/wallet/confirm-topup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, sessionId, amount: parseFloat(amount) }),
          });
          const data = await res.json();
          if (res.ok) {
            addFunds(parseFloat(amount));
            toast.success(`₹${amount} added to your wallet successfully!`);
          } else {
            toast.error(data.error || 'Failed to confirm wallet top-up.');
          }
        } catch (err) {
          toast.error('Failed to confirm wallet top-up (network).');
        }
      })();
    } else if (status === 'cancel') {
      toast.error('Wallet recharge was cancelled.');
    }
  }, [searchParams, userId, addFunds, authToken]);

  const handleAddFunds = async (amount: number) => {
    if (!userId || !authToken) {
      toast.error("Please login to add funds");
      return;
    }
    
    try {
      setIsAdding(true);
      
      // Create Stripe checkout session for wallet recharge
      const response = await stripeService.createWalletCheckoutSession(amount);
      
      if (response && response.url) {
        await stripeService.redirectToCheckout(response.url);
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error adding funds:", error);
      toast.error("Failed to process payment request");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRefresh = async () => {
    if (!authToken) return;
    setIsRefreshing(true);
    try {
      await refetchWallet();
      toast.success("Wallet balance updated");
    } catch (error) {
      toast.error("Failed to refresh wallet");
    } finally {
      setIsRefreshing(false);
    }
  };

  const currentBalance = wallet?.balance || 0;

  if (!authToken) {
    return (
      <Card className="w-full bg-gray-900 shadow-md border-orange-500/20 overflow-hidden">
        <CardContent className="p-6 text-center">
          <p className="text-gray-400">Please log in to view your wallet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-900 shadow-md border-orange-500/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-800 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Wallet className="mr-2 h-5 w-5" />
            <span>My Wallet</span>
          </CardTitle>
          <div className="rounded-full bg-white/20 px-2 py-1 text-xs">
            Transit Pay
          </div>
        </div>
        <CardDescription className="text-white/80">
          Pay for your trips seamlessly
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 bg-gray-900">
        <div className="text-center">
          <p className="text-sm text-gray-400 mb-2">Available Balance</p>
          {isLoading ? (
            <div className="h-8 w-28 bg-gray-700 animate-pulse rounded mx-auto"></div>
          ) : (
            <h2 className="text-2xl sm:text-3xl font-bold text-yellow-300">₹{currentBalance.toFixed(2)}</h2>
          )}
        </div>
        
        <div className="mt-6">
          <p className="text-sm font-medium mb-3 text-gray-300">Quick Add Funds:</p>
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="border-orange-500 hover:bg-orange-900/20 hover:text-orange-300 text-orange-400 text-xs sm:text-sm"
                disabled={isAdding}
                onClick={() => handleAddFunds(amount)}
              >
                <Plus className="mr-1 h-3 w-3" />
                ₹{amount}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="mt-4">
          <Button
            className="w-full bg-orange-600 hover:bg-orange-700 text-white"
            disabled={isAdding}
            onClick={() => handleAddFunds(1000)}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isAdding ? "Processing..." : "Add Custom Amount"}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-800 flex justify-between items-center p-3">
        <p className="text-xs text-gray-400">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-orange-400 hover:text-orange-300 text-xs"
          disabled={isLoading || isRefreshing}
          onClick={handleRefresh}
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletCard;
