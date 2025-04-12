import { useState, useContext } from "react";
import { UserContext } from "@/App";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AspectRatio } from "@/components/ui/aspect-ratio";

type EquipmentCardProps = {
  equipment: {
    id: number;
    name: string;
    description: string;
    image?: string;
    isAvailable: boolean;
    organizationId: number;
    organization?: {
      id: number;
      name: string;
      avatar?: string;
    };
  };
};

export default function EquipmentCard({ equipment }: EquipmentCardProps) {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [borrowMessage, setBorrowMessage] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const borrowEquipmentMutation = useMutation({
    mutationFn: () => 
      apiRequest('POST', '/api/equipment-borrowings', {
        equipmentId: equipment.id,
        borrowerId: user?.id,
        status: 'pending',
        message: borrowMessage
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/equipment-borrowings'] });
      toast({
        title: "Request sent",
        description: "Your equipment borrowing request has been sent successfully.",
      });
      setIsDialogOpen(false);
      setBorrowMessage("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send borrowing request. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleBorrowEquipment = () => {
    borrowEquipmentMutation.mutate();
  };

  // Check if this is the user's own equipment
  const isOwnEquipment = equipment.organizationId === user?.id;

  // Default image if none provided
  const imageUrl = equipment.image || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-300">
      <AspectRatio ratio={16 / 9} className="bg-gray-200">
        <img 
          src={imageUrl} 
          alt={equipment.name} 
          className="object-cover w-full h-full"
        />
      </AspectRatio>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium text-gray-900">{equipment.name}</h3>
          <Badge variant={equipment.isAvailable ? "available" : "reserved"}>
            {equipment.isAvailable ? "Available" : "Reserved"}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-gray-500">{equipment.description}</p>
        <div className="mt-3 flex items-center text-xs text-gray-500">
          <AvatarWithFallback
            src={equipment.organization?.avatar}
            name={equipment.organization?.name}
            className="h-6 w-6 mr-2"
          />
          {equipment.organization?.name}
        </div>
        <div className="mt-4">
          {isOwnEquipment ? (
            <Button variant="secondary" className="w-full" disabled>
              Your Equipment
            </Button>
          ) : !equipment.isAvailable ? (
            <Button variant="outline" className="w-full" disabled>
              Currently Reserved
            </Button>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="secondary" 
                  className="w-full bg-secondary-600 hover:bg-secondary-700 text-white"
                >
                  Request to Borrow
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Borrow Equipment</DialogTitle>
                  <DialogDescription>
                    Send a request to borrow this equipment. Please include when you need it and for how long.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <h3 className="font-medium mb-2">{equipment.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">Owned by {equipment.organization?.name}</p>
                  <Textarea
                    value={borrowMessage}
                    onChange={(e) => setBorrowMessage(e.target.value)}
                    placeholder="When do you need it? For how long? Any other details..."
                    className="w-full min-h-[100px]"
                  />
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button 
                    onClick={handleBorrowEquipment}
                    disabled={borrowEquipmentMutation.isPending}
                  >
                    {borrowEquipmentMutation.isPending ? "Sending..." : "Send Request"}
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
