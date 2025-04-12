import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import Equipment from "@/pages/equipment";
import Network from "@/pages/network";
import Messages from "@/pages/messages";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";

function Router() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Protected route logic
  const isAuthPage = location.startsWith("/auth");
  
  if (isLoading) {
    // Show loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!isAuthPage && <Navbar />}
      <main className="flex-grow">
        <Switch>
          <Route path="/auth/login" component={Login} />
          <Route path="/auth/register" component={Register} />
          
          {/* Protected routes - redirect to login if not authenticated */}
          {user ? (
            <>
              <Route path="/" component={Dashboard} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/services" component={Services} />
              <Route path="/equipment" component={Equipment} />
              <Route path="/network" component={Network} />
              <Route path="/messages" component={Messages} />
              <Route path="/messages/:id" component={Messages} />
              <Route path="/profile" component={Profile} />
            </>
          ) : (
            <Route>
              {(params) => {
                if (!isAuthPage) {
                  window.location.href = "/auth/login";
                  return null;
                }
                return <NotFound />;
              }}
            </Route>
          )}
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      {!isAuthPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
