import React, { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Discover from "@/pages/Discover";
import Messages from "@/pages/Messages";
import Connections from "@/pages/Connections";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Landing from "@/pages/Landing";
import MainLayout from "@/layouts/MainLayout";
import { apiRequest } from "./lib/queryClient";
import { type Organization } from "@shared/schema";
import { AuthProvider } from "@/hooks/use-auth";

export type UserContextType = {
  user: Organization | null;
  setUser: (user: Organization | null) => void;
  loading: boolean;
};

// Create user context
export const UserContext = React.createContext<UserContextType>({
  user: null,
  setUser: () => {},
  loading: true,
});

function Router() {
  const [user, setUser] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();

  // Check if user is logged in
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/me', {
          credentials: 'include',
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  // Redirect to login if not authenticated on protected routes
  function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [location] = useLocation();
    
    useEffect(() => {
      if (!loading && !user && !location.startsWith('/login') && !location.startsWith('/register')) {
        setLocation('/login');
      }
    }, [user, loading, location]);
    
    if (loading) return <div>Loading...</div>;
    if (!user) return null;
    
    return <>{children}</>;
  }

  // Public routes accessible without authentication
  function PublicRoute({ children }: { children: React.ReactNode }) {
    const [location] = useLocation();
    
    useEffect(() => {
      if (!loading && user && (location === '/login' || location === '/register')) {
        setLocation('/dashboard');
      }
    }, [user, loading, location]);
    
    if (loading) return <div>Loading...</div>;
    
    return <>{children}</>;
  }

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      <Switch>
        <Route path="/login">
          <PublicRoute>
            <Login />
          </PublicRoute>
        </Route>
        <Route path="/register">
          <PublicRoute>
            <Register />
          </PublicRoute>
        </Route>
        
        <Route path="/">
          <Landing />
        </Route>
        
        <Route path="/dashboard">
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        
        <Route path="/discover">
          <ProtectedRoute>
            <MainLayout>
              <Discover />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        
        <Route path="/messages">
          <ProtectedRoute>
            <MainLayout>
              <Messages />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        
        <Route path="/connections">
          <ProtectedRoute>
            <MainLayout>
              <Connections />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        
        <Route path="/profile">
          <ProtectedRoute>
            <MainLayout>
              <Profile />
            </MainLayout>
          </ProtectedRoute>
        </Route>
        
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </UserContext.Provider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
