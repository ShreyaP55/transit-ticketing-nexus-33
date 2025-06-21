
import { IWallet, ITransaction } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const walletService = {
  getBalance: async (userId: string, authToken: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${API_URL}/wallet/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
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
        throw new Error('Failed to fetch wallet');
      }
      
      const wallet = await response.json();
      return {
        ...wallet.wallet || wallet,
        transactions: (wallet.wallet || wallet).transactions || [],
        createdAt: (wallet.wallet || wallet).createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      throw error;
    }
  },

  addFunds: async (userId: string, amount: number, authToken: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${API_URL}/wallet/${userId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add funds');
      }
      
      const result = await response.json();
      return {
        ...result.wallet,
        transactions: result.wallet.transactions || [],
        createdAt: result.wallet.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  },

  deductFunds: async (userId: string, amount: number, description: string, authToken: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${API_URL}/wallet/${userId}/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ amount, description }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deduct funds');
      }
      
      const result = await response.json();
      return {
        ...result.wallet,
        transactions: result.wallet.transactions || [],
        createdAt: result.wallet.createdAt || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error deducting funds:', error);
      throw error;
    }
  },

  getTransactions: async (userId: string, authToken: string): Promise<ITransaction[]> => {
    try {
      const response = await fetch(`${API_URL}/wallet/${userId}/transactions`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
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

export const useWallet = (userId: string, authToken: string) => {
  const queryClient = useQueryClient();

  const { data: wallet, isLoading, error } = useQuery({
    queryKey: ['wallet', userId],
    queryFn: () => walletService.getBalance(userId, authToken || "dummy-auth-token"),
    enabled: !!userId,
  });

  const addFundsMutation = useMutation({
    mutationFn: (amount: number) => walletService.addFunds(userId, amount, authToken || "dummy-auth-token"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
    },
  });

  const deductFundsMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) => 
      walletService.deductFunds(userId, amount, description, authToken || "dummy-auth-token"),
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

export const deductFunds = async (userId: string, amount: number, description: string, authToken: string) => {
  return walletService.deductFunds(userId, amount, description, authToken || "dummy-auth-token");
};
