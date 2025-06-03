
import { IWallet, ITransaction } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const walletService = {
  getBalance: async (userId: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userId') || 'guest'}`,
        },
      });
      
      if (!response.ok) {
        // Return default wallet structure if not found
        return {
          _id: `wallet_${userId}`,
          userId,
          balance: 0,
          transactions: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      
      const wallet = await response.json();
      return {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return {
        _id: `wallet_${userId}`,
        userId,
        balance: 0,
        transactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  },

  addFunds: async (userId: string, amount: number): Promise<IWallet> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/${userId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userId') || 'guest'}`,
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add funds');
      }
      
      const wallet = await response.json();
      return {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  },

  deductFunds: async (userId: string, amount: number, description: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/${userId}/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userId') || 'guest'}`,
        },
        body: JSON.stringify({ amount, description }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to deduct funds');
      }
      
      const wallet = await response.json();
      return {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error deducting funds:', error);
      throw error;
    }
  },

  getTransactions: async (userId: string): Promise<ITransaction[]> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/wallet/${userId}/transactions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('userId') || 'guest'}`,
        },
      });
      
      if (!response.ok) {
        return [];
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }
};

export const useWallet = (userId: string) => {
  const queryClient = useQueryClient();

  const { data: wallet, isLoading, error } = useQuery({
    queryKey: ['wallet', userId],
    queryFn: () => walletService.getBalance(userId),
    enabled: !!userId,
  });

  const addFundsMutation = useMutation({
    mutationFn: (amount: number) => walletService.addFunds(userId, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
    },
  });

  const deductFundsMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) => 
      walletService.deductFunds(userId, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
    },
  });

  return {
    wallet,
    isLoading,
    error,
    addFunds: addFundsMutation.mutate,
    deductFunds: deductFundsMutation.mutate,
    isAddingFunds: addFundsMutation.isPending,
    isDeductingFunds: deductFundsMutation.isPending,
  };
};

export const deductFunds = walletService.deductFunds;
