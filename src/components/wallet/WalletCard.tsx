
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, CreditCard, Check } from 'lucide-react';
import { useWallet } from '@/services/walletService';
import { useUser } from '@/context/UserContext';
import { stripeService } from '@/services/stripeService';
import { useToast } from '@/components/ui/use-toast';

const WalletCard = () => {
  const { userId } = useUser();
  const { getBalance } = useWallet();
  const { toast } = useToast();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!userId) return;
      
      try {
        setIsLoading(true);
        const currentBalance = await getBalance();
        setBalance(currentBalance);
      } catch (error) {
        console.error("Error fetching balance:", error);
        toast({
          title: "Error",
          description: "Failed to fetch wallet balance",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBalance();
    
    // Set up polling to refresh balance every 10 seconds
    const intervalId = setInterval(fetchBalance, 10000);
    
    return () => clearInterval(intervalId);
  }, [userId]);

  const handleAddFunds = async (amount: number) => {
    if (!userId) return;
    
    try {
      setIsAdding(true);
      
      // Create Stripe checkout session for adding funds
      await stripeService.createTicketCheckoutSession(
        "wallet_topup", 
        "wallet", 
        amount * 100
      );
      
      toast({
        title: "Redirecting to payment",
        description: "You'll be redirected to complete your payment",
      });
    } catch (error) {
      console.error("Error adding funds:", error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment request",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-md border-transit-orange overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-transit-orange to-transit-orange-dark text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
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
      
      <CardContent className="pt-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Available Balance</p>
          {isLoading ? (
            <div className="h-8 w-28 bg-muted animate-pulse rounded mx-auto"></div>
          ) : (
            <h2 className="text-3xl font-bold text-transit-orange">₹{balance}</h2>
          )}
        </div>
        
        <div className="mt-6">
          <p className="text-sm font-medium mb-2">Add Funds:</p>
          <div className="grid grid-cols-3 gap-2">
            {[100, 200, 500].map((amount) => (
              <Button
                key={amount}
                variant="outline"
                className="border-transit-orange hover:bg-transit-orange hover:text-white"
                disabled={isAdding}
                onClick={() => handleAddFunds(amount)}
              >
                ₹{amount}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-accent/50 flex justify-between">
        <p className="text-xs text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-transit-orange hover:text-transit-orange-dark"
          onClick={() => setBalance(prevBalance => prevBalance)}
          disabled={isLoading}
        >
          <Check className="h-4 w-4 mr-1" />
          Refresh
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WalletCard;
