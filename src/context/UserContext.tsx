
import React, { createContext, useContext, useState, useEffect } from "react";
import { useUser as useClerkUser } from "@clerk/clerk-react";

type UserContextType = {
  isAuthenticated: boolean;
  userId: string | null;
  userDetails: any; // Replace with proper type
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  isAuthenticated: false,
  userId: null,
  userDetails: null,
  logout: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSignedIn, user } = useClerkUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<any>(null);

  // Update userId from Clerk when authentication state changes
  useEffect(() => {
    if (isSignedIn && user) {
      setUserId(user.id);
      
      // Store the basic user info
      setUserDetails({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.primaryEmailAddress?.emailAddress,
        imageUrl: user.imageUrl
      });
      
      // Store userId in localStorage for API calls
      localStorage.setItem("userId", user.id);
    } else {
      setUserId(null);
      setUserDetails(null);
      localStorage.removeItem("userId");
    }
  }, [isSignedIn, user]);

  const logout = async () => {
    try {
      if (user) {
        await user.signOut();
      }
      setUserId(null);
      setUserDetails(null);
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
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
