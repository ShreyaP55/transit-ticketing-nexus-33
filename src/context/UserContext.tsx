
import React, { createContext, useState, useContext, useEffect } from "react";

interface UserContextType {
  userId: string;
  setUserId: (id: string) => void;
  isAuthenticated: boolean;
  login: (id: string) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userId, setUserId] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check local storage on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (id: string) => {
    setUserId(id);
    setIsAuthenticated(true);
    localStorage.setItem("userId", id);
  };

  const logout = () => {
    setUserId("");
    setIsAuthenticated(false);
    localStorage.removeItem("userId");
  };

  return (
    <UserContext.Provider
      value={{
        userId,
        setUserId,
        isAuthenticated,
        login,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
