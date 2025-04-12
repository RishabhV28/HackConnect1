import { useContext } from "react";
import { UserContext } from "@/App";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStats() {
  const { user } = useContext(UserContext);
  
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['/api/connections'],
    enabled: !!user,
  });
  
  const { data: unreadMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ['/api/unread-messages'],
    enabled: !!user,
  });
  
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/organizations', user?.id, 'services'],
    enabled: !!user,
  });
  
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['/api/organizations', user?.id, 'equipment'],
    enabled: !!user,
  });

  // Calculate active connections (accepted status)
  const activeConnections = connections?.filter(
    (connection: any) => connection.status === 'accepted'
  )?.length || 0;

  // Count of active services
  const activeServicesCount = services?.length || 0;
  
  // Count of shared equipment
  const sharedEquipmentCount = equipment?.length || 0;

  return (
    <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Active Connections</dt>
          {isLoadingConnections ? (
            <Skeleton className="h-9 w-12 mt-1" />
          ) : (
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{activeConnections}</dd>
          )}
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Unread Messages</dt>
          {isLoadingMessages ? (
            <Skeleton className="h-9 w-12 mt-1" />
          ) : (
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{unreadMessages?.count || 0}</dd>
          )}
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Active Services</dt>
          {isLoadingServices ? (
            <Skeleton className="h-9 w-12 mt-1" />
          ) : (
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{activeServicesCount}</dd>
          )}
        </div>
      </div>
      
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Shared Equipment</dt>
          {isLoadingEquipment ? (
            <Skeleton className="h-9 w-12 mt-1" />
          ) : (
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{sharedEquipmentCount}</dd>
          )}
        </div>
      </div>
    </div>
  );
}
