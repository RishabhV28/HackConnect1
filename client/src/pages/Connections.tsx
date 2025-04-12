import { useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { MessageSquare, Check, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";

export default function Connections() {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all organizations
  const { data: organizations, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['/api/organizations'],
    enabled: !!user,
  });

  // Get all the user's connections
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['/api/connections'],
    enabled: !!user,
  });

  // Mutations for connection actions
  const acceptConnectionMutation = useMutation({
    mutationFn: (connectionId: number) => 
      apiRequest('PUT', `/api/connections/${connectionId}/status`, { status: 'accepted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: "Connection accepted",
        description: "You have successfully accepted the connection request."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to accept connection request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const rejectConnectionMutation = useMutation({
    mutationFn: (connectionId: number) => 
      apiRequest('PUT', `/api/connections/${connectionId}/status`, { status: 'rejected' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: "Connection rejected",
        description: "You have successfully rejected the connection request."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reject connection request. Please try again.",
        variant: "destructive"
      });
    }
  });

  const connectMutation = useMutation({
    mutationFn: (receiverId: number) => 
      apiRequest('POST', '/api/connections', {
        requesterId: user?.id,
        receiverId,
        status: 'pending'
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/connections'] });
      toast({
        title: "Request sent",
        description: "Your connection request has been sent successfully."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Filter connections based on status and user's role
  const pendingIncoming = connections?.filter(
    (conn: any) => conn.status === 'pending' && conn.receiverId === user?.id
  ) || [];

  const pendingOutgoing = connections?.filter(
    (conn: any) => conn.status === 'pending' && conn.requesterId === user?.id
  ) || [];

  const activeConnections = connections?.filter(
    (conn: any) => conn.status === 'accepted' &&
    (conn.receiverId === user?.id || conn.requesterId === user?.id)
  ) || [];

  // Potential connections (organizations not connected with)
  const potentialConnections = organizations?.filter((org: any) => {
    // Skip current user
    if (org.id === user?.id) return false;
    
    // Skip organizations that already have a connection
    const alreadyConnected = connections?.some(
      (conn: any) => 
        (conn.requesterId === user?.id && conn.receiverId === org.id) ||
        (conn.requesterId === org.id && conn.receiverId === user?.id)
    );
    
    return !alreadyConnected;
  }) || [];

  // Helper to get organization details
  const getOrganization = (id: number) => {
    return organizations?.find((org: any) => org.id === id);
  };

  const isLoading = isLoadingOrgs || isLoadingConnections;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
        <p className="text-gray-600 mt-1">Manage your network of organizations</p>
      </div>

      <Tabs defaultValue="active">
        <TabsList className="mb-6">
          <TabsTrigger value="active">Active Connections</TabsTrigger>
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="discover">Discover Organizations</TabsTrigger>
        </TabsList>

        {/* Active Connections */}
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="ml-3 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                    <div className="mt-4 flex justify-end">
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : activeConnections.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">You don't have any active connections yet.</p>
                <Button 
                  variant="link" 
                  onClick={() => document.querySelector('[data-value="discover"]')?.click()}
                >
                  Discover organizations to connect with
                </Button>
              </div>
            ) : (
              activeConnections.map((connection: any) => {
                const connectedOrgId = connection.requesterId === user?.id 
                  ? connection.receiverId 
                  : connection.requesterId;
                const org = getOrganization(connectedOrgId);
                
                if (!org) return null;
                
                return (
                  <Card key={connection.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <AvatarWithFallback 
                          src={org.avatar} 
                          name={org.name} 
                          className="h-12 w-12" 
                        />
                        <div className="ml-3">
                          <h3 className="text-lg font-medium">{org.name}</h3>
                          <Badge variant="free">Connected</Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                        {org.description || "No description available"}
                      </p>
                      <div className="flex justify-end">
                        <Link href={`/messages?org=${org.id}`}>
                          <Button size="sm" className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            Message
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </TabsContent>

        {/* Pending Requests */}
        <TabsContent value="pending">
          <div className="space-y-6">
            {/* Incoming requests */}
            <Card>
              <CardHeader>
                <CardTitle>Incoming Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-3">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48 mt-1" />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Skeleton className="h-9 w-24" />
                          <Skeleton className="h-9 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : pendingIncoming.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending incoming requests</p>
                ) : (
                  <div className="space-y-4">
                    {pendingIncoming.map((connection: any) => {
                      const org = getOrganization(connection.requesterId);
                      if (!org) return null;
                      
                      return (
                        <div key={connection.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AvatarWithFallback 
                              src={org.avatar} 
                              name={org.name} 
                              className="h-10 w-10" 
                            />
                            <div className="ml-3">
                              <h3 className="text-base font-medium">{org.name}</h3>
                              <p className="text-sm text-gray-500">Wants to connect with you</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => rejectConnectionMutation.mutate(connection.id)}
                              disabled={rejectConnectionMutation.isPending}
                            >
                              <X className="h-4 w-4 mr-1" />
                              Decline
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => acceptConnectionMutation.mutate(connection.id)}
                              disabled={acceptConnectionMutation.isPending}
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Accept
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outgoing requests */}
            <Card>
              <CardHeader>
                <CardTitle>Outgoing Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-3">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-48 mt-1" />
                          </div>
                        </div>
                        <Badge variant="outline">
                          <Skeleton className="h-4 w-16" />
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : pendingOutgoing.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No pending outgoing requests</p>
                ) : (
                  <div className="space-y-4">
                    {pendingOutgoing.map((connection: any) => {
                      const org = getOrganization(connection.receiverId);
                      if (!org) return null;
                      
                      return (
                        <div key={connection.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <AvatarWithFallback 
                              src={org.avatar} 
                              name={org.name} 
                              className="h-10 w-10" 
                            />
                            <div className="ml-3">
                              <h3 className="text-base font-medium">{org.name}</h3>
                              <p className="text-sm text-gray-500">Request sent, awaiting response</p>
                            </div>
                          </div>
                          <Badge variant="outline">Pending</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Discover Organizations */}
        <TabsContent value="discover">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="ml-3 flex-1">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24 mt-1" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-1" />
                    <div className="mt-4 flex justify-end">
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : potentialConnections.length === 0 ? (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">You're connected with all available organizations!</p>
              </div>
            ) : (
              potentialConnections.map((org: any) => (
                <Card key={org.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <AvatarWithFallback 
                        src={org.avatar} 
                        name={org.name} 
                        className="h-12 w-12" 
                      />
                      <div className="ml-3">
                        <h3 className="text-lg font-medium">{org.name}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {org.description || "No description available"}
                    </p>
                    <div className="flex justify-end">
                      <Button 
                        size="sm"
                        onClick={() => connectMutation.mutate(org.id)}
                        disabled={connectMutation.isPending}
                      >
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
