import { useState, useContext } from "react";
import { UserContext } from "@/App";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { AvatarWithFallback } from "@/components/ui/avatar-with-fallback";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

type ServiceCardProps = {
  service: {
    id: number;
    title: string;
    description: string;
    isFree: boolean;
    serviceType: string;
    availability: string;
    organizationId: number;
    organization?: {
      id: number;
      name: string;
      avatar?: string;
    };
  };
};

export default function ServiceCard({ service }: ServiceCardProps) {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requestMessage, setRequestMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const requestServiceMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', '/api/service-requests', {
        serviceId: service.id,
        requesterId: user?.id,
        status: 'pending',
        message: requestMessage
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-requests'] });
      toast({
        title: "Request sent",
        description: "Your service request has been sent successfully.",
      });
      setIsDialogOpen(false);
      setRequestMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send service request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleRequestService = () => {
    requestServiceMutation.mutate();
  };

  // Check if this is the user's own service
  const isOwnService = service.organizationId === user?.id;

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AvatarWithFallback
              src={service.organization?.avatar}
              name={service.organization?.name}
              className="h-10 w-10"
            />
            <div className="ml-3">
              <h3 className="text-base font-medium text-gray-900">{service.organization?.name}</h3>
              <p className="text-xs text-gray-500">Service Provider</p>
            </div>
          </div>
          <Badge variant={service.isFree ? "free" : "paid"}>
            {service.isFree ? "Free" : "Paid"}
          </Badge>
        </div>
      </div>
      <div className="px-4 py-4">
        <h4 className="text-lg font-medium">{service.title}</h4>
        <p className="mt-1 text-sm text-gray-600">{service.description}</p>
        <div className="mt-3 flex items-center text-sm text-gray-500">
          <Calendar className="h-5 w-5 mr-1 text-gray-400" />
          {service.availability}
        </div>
        <div className="mt-4">
          {isOwnService ? (
            <Button variant="secondary" className="w-full" disabled>
              Your Service
            </Button>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  Request Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Service</DialogTitle>
                  <DialogDescription>
                    Send a request to use this service. Please include any details about your needs.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <h3 className="font-medium mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">Provided by {service.organization?.name}</p>
                  <Textarea
                    value={requestMessage}
                    onChange={(e) => setRequestMessage(e.target.value)}
                    placeholder="Describe your needs and any specific requirements..."
                    className="w-full min-h-[100px]"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleRequestService}
                    disabled={requestServiceMutation.isPending}
                  >
                    {requestServiceMutation.isPending ? "Sending..." : "Send Request"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </div>
  );
}
