import { useContext, useState } from "react";
import { UserContext } from "@/App";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Plus, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddEquipmentForm from "@/components/forms/AddEquipmentForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function EquipmentList() {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddEquipmentForm, setShowAddEquipmentForm] = useState(false);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['/api/organizations', user?.id, 'equipment'],
    enabled: !!user,
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: (equipmentId: number) => apiRequest('DELETE', `/api/equipment/${equipmentId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', user?.id, 'equipment'] });
      toast({
        title: "Equipment deleted",
        description: "Your equipment has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete equipment. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Your Equipment</h2>
          <Skeleton className="h-10 w-36" />
        </div>
        {[1, 2].map((i) => (
          <Card key={i} className="mb-4">
            <CardContent className="p-0">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-5 w-16" />
                </div>
                <Skeleton className="h-4 w-full mt-2" />
                <Skeleton className="h-4 w-3/4 mt-1" />
                <div className="mt-5 flex justify-end space-x-3">
                  <Skeleton className="h-9 w-16" />
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Your Equipment</h2>
        <Dialog open={showAddEquipmentForm} onOpenChange={setShowAddEquipmentForm}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-700">
              <Plus className="h-5 w-5 mr-1" />
              Add New Equipment
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Equipment</DialogTitle>
            </DialogHeader>
            <AddEquipmentForm onSuccess={() => setShowAddEquipmentForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {equipment && equipment.length > 0 ? (
        equipment.map((item: any) => (
          <Card key={item.id} className="mb-4">
            <CardContent className="p-0">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                  <Badge variant={item.isAvailable ? "available" : "reserved"}>
                    {item.isAvailable ? "Available" : "Reserved"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600">{item.description}</p>
                <div className="mt-5 flex justify-end space-x-3">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="default" size="sm">
                    View Borrowing Requests
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">You haven't listed any equipment yet.</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => setShowAddEquipmentForm(true)}>
                <Plus className="h-5 w-5 mr-1" />
                Add your first equipment
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
