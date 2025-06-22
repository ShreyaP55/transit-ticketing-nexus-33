
import { IWallet, ITransaction } from "@/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const walletService = {
  getBalance: async (userId: string, authToken?: string): Promise<IWallet> => {
    try {
      console.log('Fetching wallet balance for user:', userId);
      const response = await fetch(`${API_URL}/wallet/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          // Create wallet if not found
          const createResponse = await fetch(`${API_URL}/wallet/${userId}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
            },
            body: JSON.stringify({ initialBalance: 0 }),
          });
          
          if (createResponse.ok) {
            const newWallet = await createResponse.json();
            return newWallet.wallet || newWallet;
          }
          
          // Return default wallet if creation fails
          return {
            _id: `wallet_${userId}`,
            userId,
            balance: 0,
            transactions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      const wallet = result.wallet || result;
      const processedWallet = {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
        balance: typeof wallet.balance === 'number' ? wallet.balance : 0,
      };
      console.log('Fetched wallet data:', processedWallet);
      return processedWallet;
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // Return default wallet instead of throwing
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

  addFunds: async (userId: string, amount: number, authToken?: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${API_URL}/wallet/${userId}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add funds');
      }
      
      const result = await response.json();
      const wallet = result.wallet || result;
      return {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
        balance: typeof wallet.balance === 'number' ? wallet.balance : 0,
      };
    } catch (error) {
      console.error('Error adding funds:', error);
      throw error;
    }
  },

  deductFunds: async (userId: string, amount: number, description: string, authToken?: string): Promise<IWallet> => {
    try {
      const response = await fetch(`${API_URL}/wallet/${userId}/deduct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({ amount, description }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to deduct funds');
      }
      
      const result = await response.json();
      const wallet = result.wallet || result;
      return {
        ...wallet,
        transactions: wallet.transactions || [],
        createdAt: wallet.createdAt || new Date().toISOString(),
        balance: typeof wallet.balance === 'number' ? wallet.balance : 0,
      };
    } catch (error) {
      console.error('Error deducting funds:', error);
      throw error;
    }
  },
};

export const useWallet = (userId: string, authToken?: string) => {
  const queryClient = useQueryClient();

  const { data: wallet, isLoading, error, refetch } = useQuery({
    queryKey: ['wallet', userId],
    queryFn: () => walletService.getBalance(userId, authToken),
    enabled: !!userId,
    staleTime: 5000, // Consider data fresh for 5 seconds
    refetchInterval: 15000, // Refetch every 15 seconds
    refetchOnWindowFocus: true,
  });

  const addFundsMutation = useMutation({
    mutationFn: (amount: number) => walletService.addFunds(userId, amount, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      refetch();
    },
  });

  const deductFundsMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) => 
      walletService.deductFunds(userId, amount, description, authToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', userId] });
      refetch();
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
    refetchWallet: refetch,
  };
};

export const deductFunds = async (userId: string, amount: number, description: string, authToken?: string) => {
  return walletService.deductFunds(userId, amount, description, authToken);
};
