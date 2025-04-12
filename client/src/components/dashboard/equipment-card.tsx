import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BadgeStatus } from "@/components/ui/badge-status";
import { Button } from "@/components/ui/button";
import { Calendar, Banknote, User, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Equipment } from "@shared/schema";
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface EquipmentCardProps {
  equipment: Equipment;
  onViewDetails: (equipment: Equipment) => void;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
}

export function EquipmentCard({
  equipment,
  onViewDetails,
  onEdit,
  onDelete
}: EquipmentCardProps) {
  // Default placeholder image
  const defaultImage = "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60";

  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <AspectRatio ratio={16 / 9} className="bg-neutral-200">
        <img 
          src={equipment.imageUrl || defaultImage} 
          alt={equipment.name}
          className="object-cover w-full h-full rounded-t-lg"
        />
      </AspectRatio>
      
      <CardHeader className="p-4 flex justify-between items-start">
        <BadgeStatus 
          variant={equipment.status} 
          label={equipment.status.charAt(0).toUpperCase() + equipment.status.slice(1)} 
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
                <DropdownMenuItem onClick={() => onEdit(equipment)}>
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem 
                  className="text-destructive" 
                  onClick={() => onDelete(equipment)}
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
          {equipment.name}
        </h3>
        <p className="text-sm text-neutral-500 line-clamp-2">
          {equipment.description}
        </p>
        
        <div className="mt-3 flex items-center text-sm text-neutral-500">
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {equipment.availableUntil 
              ? `Available until ${new Date(equipment.availableUntil).toLocaleDateString()}` 
              : "Available anytime"}
          </span>
        </div>
        
        {equipment.deposit && (
          <div className="mt-1 flex items-center text-sm text-neutral-500">
            <Banknote className="h-4 w-4 mr-1" />
            <span>£{equipment.deposit} deposit required</span>
          </div>
        )}
        
        {equipment.status === "borrowed" && (
          <div className="mt-1 flex items-center text-sm text-neutral-500">
            <User className="h-4 w-4 mr-1" />
            <span>Currently borrowed</span>
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          <span className="text-sm font-medium text-primary">
            {/* Placeholder for request count that would come from API */}
            {Math.floor(Math.random() * 5)} requests
          </span>
          <Button
            variant="link"
            className="text-sm p-0 h-auto text-secondary-foreground font-medium hover:text-secondary"
            onClick={() => onViewDetails(equipment)}
          >
            View details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EquipmentCard;
