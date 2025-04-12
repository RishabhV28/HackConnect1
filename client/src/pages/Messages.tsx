import { useContext, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserContext } from "@/App";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import MessageForm from "@/components/forms/MessageForm";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export default function Messages() {
  const { user } = useContext(UserContext);
  const queryClient = useQueryClient();
  const [selectedOrg, setSelectedOrg] = useState<number | null>(null);

  // Get all organizations for the contact list
  const { data: organizations, isLoading: isLoadingOrgs } = useQuery({
    queryKey: ['/api/organizations'],
    enabled: !!user,
  });

  // Get all the user's connections
  const { data: connections, isLoading: isLoadingConnections } = useQuery({
    queryKey: ['/api/connections'],
    enabled: !!user,
  });

  // Get conversation with selected organization
  const { data: conversation, isLoading: isLoadingConversation } = useQuery({
    queryKey: ['/api/messages', selectedOrg],
    enabled: !!user && !!selectedOrg,
  });

  // Mutation to mark messages as read
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => 
      apiRequest('PATCH', `/api/messages/${messageId}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedOrg] });
      queryClient.invalidateQueries({ queryKey: ['/api/unread-messages'] });
    },
  });

  // Filter organizations to only show those with accepted connections
  const connectedOrgs = organizations?.filter((org: any) => {
    if (org.id === user?.id) return false;
    
    return connections?.some((conn: any) => 
      ((conn.requesterId === user?.id && conn.receiverId === org.id) || 
       (conn.requesterId === org.id && conn.receiverId === user?.id)) && 
      conn.status === 'accepted'
    );
  }) || [];

  // Handle sending a message
  const handleSendMessage = () => {
    // The actual sending is handled in the MessageForm component
    // But we need to invalidate the queries here
    queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedOrg] });
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with other organizations</p>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 h-[70vh]">
          {/* Contact list */}
          <div className="border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">Contacts</h2>
            </div>
            <ScrollArea className="h-[calc(70vh-61px)]">
              {isLoadingOrgs || isLoadingConnections ? (
                <div className="space-y-2 p-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center p-2 space-x-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : connectedOrgs.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    No connections yet. Connect with organizations to chat with them.
                  </p>
                </div>
              ) : (
                <div>
                  {connectedOrgs.map((org: any) => (
                    <div
                      key={org.id}
                      className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition ${
                        selectedOrg === org.id ? 'bg-gray-50' : ''
                      }`}
                      onClick={() => setSelectedOrg(org.id)}
                    >
                      <AvatarWithFallback
                        src={org.avatar}
                        name={org.name}
                        className="h-10 w-10"
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{org.name}</p>
                        <p className="text-xs text-gray-500 truncate">{org.description?.substring(0, 30) || "No description"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Chat area */}
          <div className="col-span-2 flex flex-col">
            {!selectedOrg ? (
              <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <h3 className="text-lg font-medium text-gray-900">Select a contact</h3>
                <p className="text-gray-500 mt-1">Choose a contact to start messaging</p>
              </div>
            ) : (
              <>
                {/* Chat header */}
                <div className="p-4 border-b border-gray-200">
                  {isLoadingOrgs ? (
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-3">
                        <Skeleton className="h-5 w-32" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <AvatarWithFallback
                        src={organizations?.find((org: any) => org.id === selectedOrg)?.avatar}
                        name={organizations?.find((org: any) => org.id === selectedOrg)?.name}
                        className="h-10 w-10"
                      />
                      <h2 className="ml-3 text-lg font-medium">
                        {organizations?.find((org: any) => org.id === selectedOrg)?.name}
                      </h2>
                    </div>
                  )}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {isLoadingConversation ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-3 rounded-lg ${i % 2 === 0 ? 'bg-primary-100' : 'bg-gray-100'}`}>
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-24 mt-1" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : !conversation || conversation.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {conversation.map((message: any) => {
                        const isSender = message.senderId === user?.id;
                        const timestamp = new Date(message.createdAt);
                        const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
                        
                        return (
                          <div key={message.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-3 rounded-lg ${isSender ? 'bg-primary-100' : 'bg-gray-100'}`}>
                              <p className="text-sm">{message.content}</p>
                              <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Message input */}
                <div className="p-4 border-t border-gray-200">
                  <MessageForm 
                    receiverId={selectedOrg} 
                    onMessageSent={handleSendMessage} 
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
