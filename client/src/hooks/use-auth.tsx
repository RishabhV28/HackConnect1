import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Organization, Login, InsertOrganization } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Define the shape of the auth context
interface AuthContextType {
  user: Organization | null;
  isLoading: boolean;
  login: (credentials: Login) => Promise<Organization>;
  register: (userData: InsertOrganization) => Promise<Organization>;
  logout: () => Promise<void>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Organization | null>(null);
  const { toast } = useToast();
  
  // Query to fetch current user
  const { data, isLoading } = useQuery<Organization | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async ({ queryKey }) => {
      try {
        const res = await fetch(queryKey[0] as string, {
          credentials: "include",
        });
        
        if (res.status === 401) {
          return null;
        }
        
        if (!res.ok) {
          const error = await res.text();
          throw new Error(error);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: Login) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return await res.json();
    },
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Welcome back!",
        description: `Logged in as ${data.name}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (userData: InsertOrganization) => {
      const res = await apiRequest("POST", "/api/auth/register", userData);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Account Created!",
        description: "Please log in with your credentials",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout", {});
    },
    onSuccess: () => {
      setUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Update user when data changes
  useEffect(() => {
    if (data) {
      setUser(data);
    }
  }, [data]);
  
  // Auth methods
  const login = async (credentials: Login) => {
    return await loginMutation.mutateAsync(credentials);
  };
  
  const register = async (userData: InsertOrganization) => {
    return await registerMutation.mutateAsync(userData);
  };
  
  const logout = async () => {
    await logoutMutation.mutateAsync();
  };
  
  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Wrap the useAuth hook to provide the context automatically
export default function AuthWrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
