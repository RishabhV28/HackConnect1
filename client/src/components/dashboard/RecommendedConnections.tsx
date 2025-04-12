import { useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function RecommendedConnections() {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all organizations
  const { data: organizations, isLoading: isLoadingOrganizations } = useQuery({
    queryKey: ['/api/organizations'],
    enabled: !!user,
  });
  
  // Get existing connections
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['/api/connections'],
    enabled: !!user,
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
        title: "Connection request sent",
        description: "Your connection request has been sent successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send connection request. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const isLoading = isLoadingOrganizations || isLoadingConnections;
  
  // Filter out current user and connected organizations
  const recommendedOrganizations = organizations?.filter((org: any) => {
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
  
  // Limit to 2 recommendations
  const limitedRecommendations = recommendedOrganizations.slice(0, 2);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200 p-4">
        <CardTitle className="text-lg">Recommended Connections</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="divide-y divide-gray-200">
            {[1, 2].map((i) => (
              <div key={i} className="px-4 py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24 mt-1" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : limitedRecommendations.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {limitedRecommendations.map((org: any) => (
              <li key={org.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AvatarWithFallback
                      src={org.avatar}
                      name={org.name}
                      className="h-10 w-10"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{org.name}</p>
                      <p className="text-xs text-gray-500">Suggested connection</p>
                    </div>
                  </div>
                  <Button 
                    className="ml-2 inline-flex items-center px-2.5 py-1.5 text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    variant="ghost"
                    size="sm"
                    onClick={() => connectMutation.mutate(org.id)}
                    disabled={connectMutation.isPending}
                  >
                    Connect
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500">No recommendations available at the moment.</p>
          </div>
        )}
        
        <div className="px-4 py-3 text-center border-t border-gray-200">
          <a href="/connections" className="text-sm font-medium text-primary hover:text-primary-500">
            View all recommendations
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
