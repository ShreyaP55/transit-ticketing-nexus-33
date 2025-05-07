
import { IWallet } from "@/types";
import { useUser } from "@/context/UserContext";

// In-memory wallet store (would be a database in production)
let walletStore: { [userId: string]: IWallet } = {};

// Get default wallet for a user
const getDefaultWallet = (userId: string): IWallet => ({
  _id: `wallet_${userId}`,
  userId,
  balance: 0,
  updatedAt: new Date().toISOString()
});

// Get wallet balance
export const getWallet = async (userId: string): Promise<IWallet> => {
  try {
    // In a real app, this would be a database query
    if (!walletStore[userId]) {
      walletStore[userId] = getDefaultWallet(userId);
    }
    
    return walletStore[userId];
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return getDefaultWallet(userId);
  }
};

// Add funds to wallet
export const addFunds = async (userId: string, amount: number): Promise<IWallet> => {
  try {
    // Get current wallet or create new one
    const wallet = await getWallet(userId);
    
    // Update balance and timestamp
    wallet.balance += amount;
    wallet.updatedAt = new Date().toISOString();
    
    // Save updated wallet
    walletStore[userId] = wallet;
    
    console.log(`Added ${amount} to wallet for user ${userId}`);
    
    return wallet;
  } catch (error) {
    console.error("Error adding funds to wallet:", error);
    throw new Error("Failed to add funds to wallet");
  }
};

// Deduct funds from wallet
export const deductFunds = async (userId: string, amount: number): Promise<IWallet> => {
  try {
    // Get current wallet
    const wallet = await getWallet(userId);
    
    // Check if wallet has sufficient balance
    if (wallet.balance < amount) {
      throw new Error("Insufficient funds");
    }
    
    // Update balance and timestamp
    wallet.balance -= amount;
    wallet.updatedAt = new Date().toISOString();
    
    // Save updated wallet
    walletStore[userId] = wallet;
    
    console.log(`Deducted ${amount} from wallet for user ${userId}`);
    
    return wallet;
  } catch (error) {
    console.error("Error deducting funds from wallet:", error);
    throw error;
  }
};

// React hook for wallet
export const useWallet = () => {
  const { userId } = useUser();
  
  const getBalance = async (): Promise<number> => {
    if (!userId) return 0;
    const wallet = await getWallet(userId);
    return wallet.balance;
  };
  
  return { getBalance, addFunds, deductFunds };
};
