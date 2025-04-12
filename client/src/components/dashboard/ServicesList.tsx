import { useContext, useState } from "react";
import { UserContext } from "@/App";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import AddServiceForm from "@/components/forms/AddServiceForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function ServicesList() {
  const { user } = useContext(UserContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ['/api/organizations', user?.id, 'services'],
    enabled: !!user,
  });

  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId: number) => apiRequest('DELETE', `/api/services/${serviceId}`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/organizations', user?.id, 'services'] });
      toast({
        title: "Service deleted",
        description: "Your service has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete service. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Your Services</h2>
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
                <Skeleton className="h-4 w-32 mt-4" />
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
        <h2 className="text-lg font-semibold">Your Services</h2>
        <Dialog open={showAddServiceForm} onOpenChange={setShowAddServiceForm}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-700">
              <Plus className="h-5 w-5 mr-1" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <AddServiceForm onSuccess={() => setShowAddServiceForm(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {services && services.length > 0 ? (
        services.map((service: any) => (
          <Card key={service.id} className="mb-4">
            <CardContent className="p-0">
              <div className="px-6 py-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">{service.title}</h3>
                  <Badge variant={service.isFree ? "free" : "paid"}>
                    {service.isFree ? "Free" : "Paid"}
                  </Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600">{service.description}</p>
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <Calendar className="h-5 w-5 mr-1 text-gray-400" />
                  {service.availability}
                </div>
                <div className="mt-5 flex justify-end space-x-3">
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button variant="default" size="sm">
                    View Requests
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">You haven't created any services yet.</p>
            <div className="mt-4 flex justify-center">
              <Button onClick={() => setShowAddServiceForm(true)}>
                <Plus className="h-5 w-5 mr-1" />
                Add your first service
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
