import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { Calendar, Group, Banknote, MoreHorizontal } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Service } from "@shared/schema";

interface ServiceCardProps {
  service: Service;
  onViewDetails: (service: Service) => void;
  onEdit?: (service: Service) => void;
  onDelete?: (service: Service) => void;
}

export function ServiceCard({ 
  service, 
  onViewDetails, 
  onEdit, 
  onDelete 
}: ServiceCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="p-4 flex justify-between items-start">
        <BadgeStatus 
          variant={service.pricing === "free" ? "free" : "paid"} 
          label={service.pricing === "free" ? "Free" : "Paid"} 
        />
        
        {(onEdit || onDelete) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(service)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => onDelete(service)}
                >
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="text-lg font-medium text-neutral-900 mb-1">
          {service.title}
        </h3>
        <p className="text-sm text-neutral-500 line-clamp-2">
          {service.description}
        </p>
        
        <div className="mt-3 flex items-center text-sm text-neutral-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>{service.availability}</span>
        </div>
        
        {service.capacity && (
          <div className="mt-1 flex items-center text-sm text-neutral-500">
            <Group className="h-4 w-4 mr-1" />
            <span>{service.capacity}</span>
          </div>
        )}
        
        {service.pricing === "paid" && service.price && (
          <div className="mt-1 flex items-center text-sm text-neutral-500">
            <Banknote className="h-4 w-4 mr-1" />
            <span>£{service.price}</span>
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          <span className="text-sm font-medium text-primary">
            {/* Placeholder for request count that would come from API */}
            {Math.floor(Math.random() * 10)} requests
          </span>
          <Button
            variant="link"
            className="text-sm p-0 h-auto text-secondary-foreground font-medium hover:text-secondary"
            onClick={() => onViewDetails(service)}
          >
            View details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ServiceCard;
