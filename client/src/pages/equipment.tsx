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
import { Equipment } from "@shared/schema";
import EquipmentCard from "@/components/dashboard/equipment-card";
import EquipmentForm from "@/components/forms/equipment-form";
import { PlusIcon, Search } from "lucide-react";

export default function EquipmentPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [deletingEquipment, setDeletingEquipment] = useState<Equipment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch user's equipment
  const { data: equipment = [], isLoading } = useQuery<Equipment[]>({
    queryKey: [`/api/organizations/${user?.id}/equipment`],
    enabled: !!user,
  });

  // Delete equipment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/equipment/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Equipment Deleted",
        description: "Your equipment has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/organizations/${user?.id}/equipment`] });
      setDeletingEquipment(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: Equipment) => {
    setEditingEquipment(item);
    setIsEquipmentFormOpen(true);
  };

  const handleDelete = (item: Equipment) => {
    setDeletingEquipment(item);
  };

  const handleConfirmDelete = () => {
    if (deletingEquipment) {
      deleteMutation.mutate(deletingEquipment.id);
    }
  };

  const handleAddNewEquipment = () => {
    setEditingEquipment(null);
    setIsEquipmentFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsEquipmentFormOpen(false);
    setEditingEquipment(null);
  };

  // Filter and search equipment
  const filteredEquipment = equipment.filter((item) => {
    // Filter by status
    if (statusFilter !== "all" && item.status !== statusFilter) {
      return false;
    }
    
    // Search by name or description
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 sm:text-3xl">
            Equipment
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button onClick={handleAddNewEquipment}>
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            Add New Equipment
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="flex items-center relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search equipment..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="borrowed">Borrowed</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Equipment List */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : filteredEquipment.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEquipment.map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onViewDetails={() => {}}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No equipment found</h3>
          <p className="text-sm text-neutral-500">
            {searchTerm || statusFilter !== "all"
              ? "Try adjusting your filters or search term"
              : "Add your first equipment by clicking the button above"}
          </p>
        </div>
      )}

      {/* Equipment Form Modal */}
      <EquipmentForm
        isOpen={isEquipmentFormOpen}
        onClose={handleCloseForm}
        mode={editingEquipment ? "edit" : "create"}
        equipment={editingEquipment || undefined}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingEquipment} onOpenChange={() => setDeletingEquipment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the equipment "{deletingEquipment?.name}".
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
