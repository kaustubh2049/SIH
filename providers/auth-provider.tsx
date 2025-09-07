import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadUser = useCallback(async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Failed to load user:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const mockUser: User = {
      id: "1",
      name: "Dr. Rajesh Kumar",
      email: email,
      organization: "Central Ground Water Board",
    };

    await AsyncStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string, organization: string) => {
    const mockUser: User = {
      id: "1",
      name: name,
      email: email,
      organization: organization,
    };

    await AsyncStorage.setItem("user", JSON.stringify(mockUser));
    setUser(mockUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("user");
    setUser(null);
  }, []);

  return useMemo(() => ({
    user,
    isLoading,
    login,
    signup,
    logout,
  }), [user, isLoading, login, signup, logout]);
});