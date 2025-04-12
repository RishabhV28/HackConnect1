import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Service } from "@shared/schema";
import ServiceCard from "@/components/dashboard/service-card";
import ServiceForm from "@/components/forms/service-form";
import { PlusIcon, Search } from "lucide-react";

export default function Services() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const [pricingFilter, setPricingFilter] = useState("all");

  // Fetch user's services
  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: [`/api/organizations/${user?.id}/services`],
    enabled: !!user,
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/services/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Service Deleted",
        description: "Your service has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${user?.id}/services`] });
      setDeletingService(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsServiceFormOpen(true);
  };

  const handleDelete = (service: Service) => {
    setDeletingService(service);
  };

  const handleConfirmDelete = () => {
    if (deletingService) {
      deleteMutation.mutate(deletingService.id);
    }
  };

  const handleAddNewService = () => {
    setEditingService(null);
    setIsServiceFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsServiceFormOpen(false);
    setEditingService(null);
  };

  // Filter and search services
  const filteredServices = services.filter((service) => {
    // Filter by type
    if (filter !== "all" && service.type !== filter) {
      return false;
    }
    
    // Filter by pricing
    if (pricingFilter !== "all" && service.pricing !== pricingFilter) {
      return false;
    }
    
    // Search by title or description
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        service.title.toLowerCase().includes(term) || 
        service.description.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 sm:text-3xl">
            Services
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={handleAddNewService}>
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search services..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="workshop">Workshop</SelectItem>
              <SelectItem value="consultation">Consultation</SelectItem>
              <SelectItem value="mentorship">Mentorship</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="photography">Photography</SelectItem>
              <SelectItem value="videography">Videography</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={pricingFilter} onValueChange={setPricingFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by pricing" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pricing</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Services List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewDetails={() => {}}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No services found</h3>
          <p className="text-sm text-neutral-500">
            {searchTerm || filter !== "all" || pricingFilter !== "all"
              ? "Try adjusting your filters or search term"
              : "Add your first service by clicking the button above"}
          </p>
        </div>
      )}

      {/* Service Form Modal */}
      <ServiceForm
        isOpen={isServiceFormOpen}
        onClose={handleCloseForm}
        mode={editingService ? "edit" : "create"}
        service={editingService || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingService} onOpenChange={() => setDeletingService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the service "{deletingService?.title}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
