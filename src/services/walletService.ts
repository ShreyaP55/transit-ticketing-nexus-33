
import { IWallet, ITransaction } from "@/types";

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
