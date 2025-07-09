
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser as useClerkUser, useClerk } from "@clerk/clerk-react";

type UserRole = "user" | "admin";

interface UserProfile {
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string;
  concessionType: string;
  dateOfBirth?: string;
  gender?: string;
  governmentIdType?: string;
  governmentIdNumber?: string;
  verificationStatus: string;
  verificationDate?: string;
  documentExpiryDate?: string;
  verificationNotes?: string;
  verificationHistory: any[];
  statistics: {
    totalRides: number;
    totalAmount: number;
    totalSavings: number;
    totalDistance: number;
    averageRideDistance: number;
    averageFare: number;
  };
  latestVerification?: any;
}

type UserContextType = {
  isAuthenticated: boolean;
  userId: string | null;
  userDetails: any;
  userProfile: UserProfile | null;
  isAdmin: boolean;
  userRole: UserRole;
  logout: () => void;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType>({
  isAuthenticated: false,
  userId: null,
  userDetails: null,
  userProfile: null,
  isAdmin: false,
  userRole: "user",
  logout: () => {},
  isLoading: true,
  refreshProfile: async () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useClerkUser();
  const { signOut } = useClerk();
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRole, setUserRole] = useState<UserRole>("user");

  const fetchUserProfile = async (clerkId: string) => {
    try {
      console.log('Fetching user profile for:', clerkId);
      const response = await fetch(`/api/users/profile/${clerkId}`);
      
      if (response.ok) {
        const profileData = await response.json();
        console.log('User profile fetched:', profileData);
        setUserProfile(profileData);
        
        // Also create/update user in MongoDB if needed
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            clerkId: user?.id,
            email: user?.primaryEmailAddress?.emailAddress,
            firstName: user?.firstName,
            lastName: user?.lastName,
            username: user?.username,
            avatar: user?.imageUrl
          })
        });
      } else {
        console.error('Failed to fetch user profile:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshProfile = async () => {
    if (userId) {
      await fetchUserProfile(userId);
    }
  };

  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to load
    
    if (isSignedIn && user) {
      setUserId(user.id);
      
      // Get role from user metadata (secure way)
      const role = (user.publicMetadata?.role as UserRole) || "user";
      setUserRole(role);
      
      setUserDetails({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl,
        role: role
      });
      
      // Fetch comprehensive profile from MongoDB
      fetchUserProfile(user.id);
      
      // Store only user ID for API calls (not sensitive data)
      localStorage.setItem("userId", user.id);
    } else {
      setUserId(null);
      setUserDetails(null);
      setUserProfile(null);
      setUserRole("user");
      localStorage.removeItem("userId");
    }
  }, [isLoaded, isSignedIn, user]);

  const logout = async () => {
    try {
      await signOut();
      setUserId(null);
      setUserDetails(null);
      setUserProfile(null);
      localStorage.removeItem("userId");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      isAuthenticated: !!userId, 
      userId, 
      userDetails,
      userProfile,
      isAdmin: userRole === "admin",
      userRole,
      logout,
      isLoading: !isLoaded,
      refreshProfile
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
