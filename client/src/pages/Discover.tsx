import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ServiceFilters from "@/components/discover/ServiceFilters";
import ServiceCard from "@/components/discover/ServiceCard";
import EquipmentCard from "@/components/discover/EquipmentCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AddEquipmentForm from "@/components/forms/AddEquipmentForm";
import AddServiceForm from "@/components/forms/AddServiceForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";

export default function Discover() {
  const [filters, setFilters] = useState({
    serviceType: "All Types",
    cost: "All",
    availability: "Any time"
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("services");
  const [showAddEquipmentForm, setShowAddEquipmentForm] = useState(false);
  const [showAddServiceForm, setShowAddServiceForm] = useState(false);
  
  const { data: services, isLoading: isLoadingServices } = useQuery({
    queryKey: ['/api/services'],
  });
  
  const { data: equipment, isLoading: isLoadingEquipment } = useQuery({
    queryKey: ['/api/equipment'],
  });
  
  const { data: organizations } = useQuery({
    queryKey: ['/api/organizations'],
  });
  
  // Apply filters and search to services
  const filteredServices = services?.filter((service: any) => {
    // Apply category filter
    if (filters.serviceType !== "All Types" && service.serviceType !== filters.serviceType) return false;
    
    // Apply cost filter
    if (filters.cost !== "All") {
      const isFree = filters.cost === "Free";
      if (service.isFree !== isFree) return false;
    }
    
    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        service.title.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.serviceType.toLowerCase().includes(query)
      );
    }
    
    return true;
  }) || [];

  // Apply search to equipment
  const filteredEquipment = equipment?.filter((item: any) => {
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  // Get organization data for each service
  const servicesWithOrgs = filteredServices.map((service: any) => {
    const org = organizations?.find((o: any) => o.id === service.organizationId);
    return {
      ...service,
      organization: org
    };
  });

  // Get organization data for each equipment
  const equipmentWithOrgs = filteredEquipment.map((item: any) => {
    const org = organizations?.find((o: any) => o.id === item.organizationId);
    return {
      ...item,
      organization: org
    };
  }) || [];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Discover Resources</h1>
        
        {/* Search and Action Buttons */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Search for services or equipment..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Dialog open={showAddServiceForm} onOpenChange={setShowAddServiceForm}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-700">
                  <Plus className="h-5 w-5 mr-1" />
                  List Service
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                </DialogHeader>
                <AddServiceForm onSuccess={() => setShowAddServiceForm(false)} />
              </DialogContent>
            </Dialog>
            
            <Dialog open={showAddEquipmentForm} onOpenChange={setShowAddEquipmentForm}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary-700">
                  <Plus className="h-5 w-5 mr-1" />
                  List Equipment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>List New Equipment</DialogTitle>
                </DialogHeader>
                <AddEquipmentForm onSuccess={() => setShowAddEquipmentForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Tabs for Services and Equipment */}
        <Tabs defaultValue="services" className="w-full" onValueChange={(value) => setActiveTab(value)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="mt-0">
            {/* Service Filters */}
            <ServiceFilters filters={filters} setFilters={setFilters} />
            
            {/* Service Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {isLoadingServices ? (
                // Loading skeletons
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="px-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <div className="ml-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-20 mt-1" />
                          </div>
                        </div>
                        <Skeleton className="h-5 w-12" />
                      </div>
                    </div>
                    <div className="px-4 py-4">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-full mt-1" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                      <Skeleton className="h-4 w-28 mt-3" />
                      <Skeleton className="h-9 w-full mt-4" />
                    </div>
                  </div>
                ))
              ) : servicesWithOrgs.length > 0 ? (
                servicesWithOrgs.map((service: any) => (
                  <ServiceCard key={service.id} service={service} />
                ))
              ) : (
                <div className="col-span-3 text-center py-10">
                  <p className="text-gray-500">No services found matching your criteria.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="equipment" className="mt-0">
            {/* Equipment Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {isLoadingEquipment ? (
                // Loading skeletons
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <Skeleton className="h-full w-full" />
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-full mt-1" />
                      <Skeleton className="h-4 w-28 mt-3" />
                      <Skeleton className="h-9 w-full mt-4" />
                    </div>
                  </div>
                ))
              ) : equipmentWithOrgs.length > 0 ? (
                equipmentWithOrgs.map((item: any) => (
                  <EquipmentCard key={item.id} equipment={item} />
                ))
              ) : (
                <div className="col-span-4 text-center py-10">
                  <p className="text-gray-500">No equipment found matching your search.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
