
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, Check, Plus } from 'lucide-react';
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
  const { wallet, addFunds, isLoading } = useWallet(userId || 'guest', authToken || '');
  const [searchParams] = useSearchParams();
  const [isAdding, setIsAdding] = useState(false);

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
    const amount = searchParams.get('amount');
    
    if (status === 'success' && amount && authToken) {
      const rechargeAmount = parseFloat(amount);
      if (userId) {
        addFunds(rechargeAmount);
        toast.success(`₹${rechargeAmount} added to your wallet successfully!`);
      }
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

  const currentBalance = wallet?.balance || 0;

  if (!authToken) {
    return (
      <Card className="w-full bg-white shadow-md border-primary/20 overflow-hidden">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">Please log in to view your wallet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-white shadow-md border-primary/20 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-white">
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
      
      <CardContent className="p-4 sm:p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
          {isLoading ? (
            <div className="h-8 w-28 bg-muted animate-pulse rounded mx-auto"></div>
          ) : (
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">₹{currentBalance.toFixed(2)}</h2>
          )}
        </div>
        
        <div className="mt-6">
          <p className="text-sm font-medium mb-3">Quick Add Funds:</p>
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                className="border-primary hover:bg-primary hover:text-white text-xs sm:text-sm"
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
            className="w-full bg-primary hover:bg-primary/90"
            disabled={isAdding}
            onClick={() => handleAddFunds(1000)}
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isAdding ? "Processing..." : "Add Custom Amount"}
          </Button>
        </div>
      </CardContent>
      
      <CardFooter className="bg-accent/50 flex justify-between items-center p-3">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 text-xs"
          disabled={isLoading}
        >
          <Check className="h-3 w-3 mr-1" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletCard;
