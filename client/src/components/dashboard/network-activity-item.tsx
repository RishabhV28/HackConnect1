import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Organization, NetworkConnection } from "@shared/schema";

interface NetworkActivityItemProps {
  organization: Organization;
  activity: {
    type: "request" | "connection" | "endorsement";
    description: string;
    timestamp: Date;
  };
  onViewProfile: (org: Organization) => void;
  onMessage: (org: Organization) => void;
  onViewRequest?: () => void;
}

export function NetworkActivityItem({
  organization,
  activity,
  onViewProfile,
  onMessage,
  onViewRequest
}: NetworkActivityItemProps) {
  function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    
    return "just now";
  }

  return (
    <li className="hover:bg-neutral-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Avatar className="h-10 w-10">
              <AvatarFallback className={`${
                activity.type === "request" 
                  ? "bg-primary-light" 
                  : activity.type === "connection" 
                    ? "bg-secondary-light"
                    : "bg-accent-light"
              } text-white`}>
                {organization.avatar || organization.name?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4">
              <div className="text-sm font-medium text-neutral-900">
                {organization.name}
              </div>
              <div className="text-sm text-neutral-500">
                {activity.description}
              </div>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <span className="text-xs text-neutral-500">
              {getTimeAgo(activity.timestamp)}
            </span>
          </div>
        </div>
        <div className="mt-2 flex justify-end space-x-2">
          {onViewRequest && (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-primary bg-primary-light bg-opacity-10 hover:bg-opacity-20 border-none" 
              onClick={onViewRequest}
            >
              View Request
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="text-primary bg-primary-light bg-opacity-10 hover:bg-opacity-20 border-none" 
            onClick={() => onViewProfile(organization)}
          >
            View Profile
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={() => onMessage(organization)}
          >
            Message
          </Button>
        </div>
      </div>
    </li>
  );
}

export default NetworkActivityItem;
