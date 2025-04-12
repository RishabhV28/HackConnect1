import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { 
  Service, 
  Equipment,
  Organization
} from "@shared/schema";
import StatsCard from "@/components/dashboard/stats-card";
import ServiceCard from "@/components/dashboard/service-card";
import EquipmentCard from "@/components/dashboard/equipment-card";
import NetworkActivityItem from "@/components/dashboard/network-activity-item";
import ServiceForm from "@/components/forms/service-form";
import EquipmentForm from "@/components/forms/equipment-form";

import { 
  PlusIcon, 
  BriefcaseBusiness, 
  Wrench,
  Share2, 
  MessageSquare 
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [isServiceFormOpen, setIsServiceFormOpen] = useState(false);
  const [isEquipmentFormOpen, setIsEquipmentFormOpen] = useState(false);

  // Fetch dashboard stats
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    enabled: !!user,
  });

  // Fetch user's services
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: [`/api/organizations/${user?.id}/services`],
    enabled: !!user,
  });

  // Fetch user's equipment
  const { data: equipment = [] } = useQuery<Equipment[]>({
    queryKey: [`/api/organizations/${user?.id}/equipment`],
    enabled: !!user,
  });

  // Fetch network connections for activity
  const { data: networkData = [] } = useQuery<{ connection: any; organization: Organization }[]>({
    queryKey: ["/api/network-connections"],
    enabled: !!user,
  });

  // Generate mock activities based on real network data for display
  const activities = networkData.slice(0, 3).map((item) => {
    const randomType = ["request", "connection", "endorsement"][Math.floor(Math.random() * 3)] as "request" | "connection" | "endorsement";
    
    let description = "";
    if (randomType === "request") {
      description = "Requested your equipment";
    } else if (randomType === "connection") {
      description = "Connected with you";
    } else {
      description = "Endorsed your service";
    }

    return {
      organization: item.organization,
      activity: {
        type: randomType,
        description,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000))
      }
    };
  });

  const handleViewServiceDetails = (service: Service) => {
    // Navigate to service details page
    navigate(`/services/${service.id}`);
  };

  const handleViewEquipmentDetails = (equipment: Equipment) => {
    // Navigate to equipment details page
    navigate(`/equipment/${equipment.id}`);
  };

  const handleViewOrganizationProfile = (org: Organization) => {
    // Would navigate to organization profile, but for now just alert
    navigate(`/organizations/${org.id}`);
  };

  const handleMessageOrganization = (org: Organization) => {
    navigate(`/messages/${org.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-heading font-bold text-neutral-900 sm:text-3xl">
            Dashboard
          </h1>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Button 
            className="ml-3" 
            onClick={() => setIsServiceFormOpen(true)}
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" />
            Add New Service
          </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Active Services" 
          value={stats?.activeServices || 0} 
          icon={BriefcaseBusiness} 
          bgColor="bg-primary-light"
        />
        <StatsCard 
          title="Equipment Listed" 
          value={stats?.equipmentCount || 0} 
          icon={Wrench} 
          bgColor="bg-secondary-light"
        />
        <StatsCard 
          title="Network Connections" 
          value={stats?.networkConnections || 0} 
          icon={Share2} 
          bgColor="bg-accent-light"
        />
        <StatsCard 
          title="Unread Messages" 
          value={stats?.unreadMessages || 0} 
          icon={MessageSquare} 
          bgColor="bg-neutral-400"
        />
      </div>

      {/* Your Services Section */}
      <div className="mt-8">
        <h2 className="text-lg font-heading font-medium text-neutral-900 mb-4">
          Your Services
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 3).map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onViewDetails={handleViewServiceDetails}
            />
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="text-primary border-primary hover:bg-primary-light hover:text-white"
            onClick={() => navigate("/services")}
          >
            View All Services
          </Button>
        </div>
      </div>

      {/* Your Equipment Section */}
      <div className="mt-8">
        <h2 className="text-lg font-heading font-medium text-neutral-900 mb-4">
          Your Equipment
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipment.slice(0, 3).map((item) => (
            <EquipmentCard
              key={item.id}
              equipment={item}
              onViewDetails={handleViewEquipmentDetails}
            />
          ))}
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="outline" 
            className="text-primary border-primary hover:bg-primary-light hover:text-white"
            onClick={() => navigate("/equipment")}
          >
            View All Equipment
          </Button>
        </div>
      </div>

      {/* Network Activity Section */}
      <div className="mt-8">
        <h2 className="text-lg font-heading font-medium text-neutral-900 mb-4">
          Recent Network Activity
        </h2>
        
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-neutral-200">
            {activities.map((activity, index) => (
              <NetworkActivityItem
                key={index}
                organization={activity.organization}
                activity={activity.activity}
                onViewProfile={handleViewOrganizationProfile}
                onMessage={handleMessageOrganization}
                onViewRequest={activity.activity.type === "request" ? () => {} : undefined}
              />
            ))}
          </ul>
        </div>
      </div>

      {/* Service Form Modal */}
      <ServiceForm
        isOpen={isServiceFormOpen}
        onClose={() => setIsServiceFormOpen(false)}
        mode="create"
      />

      {/* Equipment Form Modal */}
      <EquipmentForm
        isOpen={isEquipmentFormOpen}
        onClose={() => setIsEquipmentFormOpen(false)}
        mode="create"
      />
    </div>
  );
}
