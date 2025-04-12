import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { BadgeStatus } from "@/components/ui/badge-status";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Search, UserPlus } from "lucide-react";
import { Organization, networkConnectionStatusEnum } from "@shared/schema";

export default function Network() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [connectionMessage, setConnectionMessage] = useState("");

  // Fetch network connections
  const { data: connections = [], isLoading: isLoadingConnections } = useQuery({
    queryKey: ["/api/network-connections"],
    enabled: !!user,
  });

  // Fetch all organizations
  const { data: organizations = [], isLoading: isLoadingOrgs } = useQuery<Organization[]>({
    queryKey: ["/api/organizations"],
    enabled: !!user,
  });

  // Create connection mutation
  const createConnectionMutation = useMutation({
    mutationFn: async ({ targetId, message }: { targetId: number; message: string }) => {
      const res = await apiRequest("POST", "/api/network-connections", {
        targetId,
        message,
        status: "pending"
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection Request Sent",
        description: "Your connection request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network-connections"] });
      setIsConnectDialogOpen(false);
      setConnectionMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update connection mutation
  const updateConnectionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: "connected" | "rejected" }) => {
      const res = await apiRequest("PUT", `/api/network-connections/${id}`, { status });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Connection Updated",
        description: "The connection has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/network-connections"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleConnectRequest = (org: Organization) => {
    setSelectedOrganization(org);
    setIsConnectDialogOpen(true);
  };

  const handleSendConnectionRequest = () => {
    if (!selectedOrganization) return;
    
    createConnectionMutation.mutate({
      targetId: selectedOrganization.id,
      message: connectionMessage
    });
  };

  const handleAcceptConnection = (connectionId: number) => {
    updateConnectionMutation.mutate({ id: connectionId, status: "connected" });
  };

  const handleRejectConnection = (connectionId: number) => {
    updateConnectionMutation.mutate({ id: connectionId, status: "rejected" });
  };

  const handleMessage = (orgId: number) => {
    navigate(`/messages/${orgId}`);
  };

  // Filter organizations that are not the current user and not already connected
  const filteredOrganizations = organizations.filter((org) => {
    if (org.id === user?.id) return false;
    
    // Don't show organizations that already have a connection
    const alreadyConnected = connections.some(
      (conn) => (conn.organization.id === org.id)
    );
    if (alreadyConnected) return false;
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        org.name.toLowerCase().includes(term) || 
        org.description?.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  // Separate connections by status
  const pendingIncomingConnections = connections.filter(
    (conn) => conn.connection.targetId === user?.id && conn.connection.status === "pending"
  );
  
  const pendingOutgoingConnections = connections.filter(
    (conn) => conn.connection.requestorId === user?.id && conn.connection.status === "pending"
  );
  
  const activeConnections = connections.filter(
    (conn) => conn.connection.status === "connected"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 sm:text-3xl">
            Network
          </h1>
        </div>
      </div>

      {/* Active Connections */}
      <div className="mb-8">
        <h2 className="text-lg font-heading font-medium text-neutral-900 mb-4">
          Your Connections ({activeConnections.length})
        </h2>
        
        {isLoadingConnections ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : activeConnections.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeConnections.map((conn) => (
              <Card key={conn.connection.id} className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-white">
                        {conn.organization.avatar || conn.organization.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-neutral-900">
                        {conn.organization.name}
                      </h3>
                      <p className="text-sm text-neutral-500 truncate">
                        {conn.organization.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                    {conn.organization.description || "No description provided."}
                  </p>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2" 
                      onClick={() => navigate(`/organizations/${conn.organization.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleMessage(conn.organization.id)}
                    >
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No connections yet</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Start connecting with other organizations to build your network
            </p>
          </div>
        )}
      </div>

      {/* Pending Connection Requests */}
      {pendingIncomingConnections.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-heading font-medium text-neutral-900 mb-4">
            Pending Connection Requests ({pendingIncomingConnections.length})
          </h2>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-neutral-200">
              {pendingIncomingConnections.map((conn) => (
                <li key={conn.connection.id} className="hover:bg-neutral-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary-light text-white">
                            {conn.organization.avatar || conn.organization.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">
                            {conn.organization.name}
                          </div>
                          <div className="text-sm text-neutral-500">
                            Wants to connect with you
                          </div>
                        </div>
                      </div>
                      <BadgeStatus variant="pending" label="Pending" />
                    </div>
                    {conn.connection.message && (
                      <div className="mt-2 text-sm text-neutral-600 bg-neutral-50 p-2 rounded">
                        "{conn.connection.message}"
                      </div>
                    )}
                    <div className="mt-2 flex justify-end space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleRejectConnection(conn.connection.id)}
                      >
                        Decline
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleAcceptConnection(conn.connection.id)}
                      >
                        Accept
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Find Organizations */}
      <div className="mb-8">
        <h2 className="text-lg font-heading font-medium text-neutral-900 mb-4">
          Find Organizations
        </h2>
        
        <div className="mb-6 flex">
          <div className="flex items-center relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search organizations..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoadingOrgs ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredOrganizations.map((org) => (
              <Card key={org.id} className="hover:shadow-md transition-shadow duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-white">
                        {org.avatar || org.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-neutral-900">
                        {org.name}
                      </h3>
                      <p className="text-sm text-neutral-500 truncate">
                        {org.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-neutral-500 mb-4 line-clamp-2">
                    {org.description || "No description provided."}
                  </p>
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mr-2" 
                      onClick={() => navigate(`/organizations/${org.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleConnectRequest(org)}
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white shadow rounded-lg">
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No organizations found</h3>
            <p className="text-sm text-neutral-500">
              {searchTerm ? "Try adjusting your search term" : "All organizations are already connected"}
            </p>
          </div>
        )}
      </div>

      {/* Sent Connection Requests */}
      {pendingOutgoingConnections.length > 0 && (
        <div>
          <h2 className="text-lg font-heading font-medium text-neutral-900 mb-4">
            Sent Connection Requests ({pendingOutgoingConnections.length})
          </h2>
          
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-neutral-200">
              {pendingOutgoingConnections.map((conn) => (
                <li key={conn.connection.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-secondary-light text-white">
                          {conn.organization.avatar || conn.organization.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-neutral-900">
                          {conn.organization.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          You sent a connection request
                        </div>
                      </div>
                    </div>
                    <BadgeStatus variant="pending" label="Pending" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Connect Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect with {selectedOrganization?.name}</DialogTitle>
            <DialogDescription>
              Send a connection request to start collaborating with this organization.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Message (Optional)
            </label>
            <Textarea
              placeholder="Add a message to introduce yourself or explain why you want to connect..."
              value={connectionMessage}
              onChange={(e) => setConnectionMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConnectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSendConnectionRequest} 
              disabled={createConnectionMutation.isPending}
            >
              Send Connection Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
