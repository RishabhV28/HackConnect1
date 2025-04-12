import { useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function RecentActivity() {
  const { user } = useContext(UserContext);
  
  // This is a placeholder query until we have a proper activity endpoint
  const { data: serviceRequests, isLoading: isLoadingRequests } = useQuery({
    queryKey: ['/api/service-requests'],
    enabled: !!user,
  });
  
  const { data: borrowings, isLoading: isLoadingBorrowings } = useQuery({
    queryKey: ['/api/equipment-borrowings'],
    enabled: !!user,
  });
  
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['/api/connections'],
    enabled: !!user,
  });
  
  const isLoading = isLoadingRequests || isLoadingBorrowings || isLoadingConnections;

  // Combine and sort activities
  const activities = [];
  
  // This is a placeholder. In a real implementation, you would get organizations 
  // and merge the data appropriately

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50 border-b border-gray-200 p-4">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="divide-y divide-gray-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="px-4 py-4 flex space-x-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-10" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : activities && activities.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <li key={activity.id} className="px-4 py-4">
                <div className="flex space-x-3">
                  <AvatarWithFallback
                    src={activity.organizationAvatar}
                    name={activity.organizationName}
                    className="h-10 w-10"
                  />
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">{activity.organizationName}</h3>
                      <p className="text-xs text-gray-500">{activity.timeAgo}</p>
                    </div>
                    <p className="text-sm text-gray-600">{activity.description}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-gray-500">No recent activity to display.</p>
          </div>
        )}
        
        <div className="px-4 py-3 text-center border-t border-gray-200">
          <a href="#" className="text-sm font-medium text-primary hover:text-primary-500">
            View all activity
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
