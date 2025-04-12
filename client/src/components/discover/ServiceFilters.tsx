import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type ServiceFiltersProps = {
  filters: {
    serviceType: string;
    cost: string;
    availability: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    serviceType: string;
    cost: string;
    availability: string;
  }>>;
};

export default function ServiceFilters({ filters, setFilters }: ServiceFiltersProps) {
  const handleServiceTypeChange = (value: string) => {
    setFilters(prev => ({ ...prev, serviceType: value }));
  };

  const handleCostChange = (value: string) => {
    setFilters(prev => ({ ...prev, cost: value }));
  };

  const handleAvailabilityChange = (value: string) => {
    setFilters(prev => ({ ...prev, availability: value }));
  };

  const handleApplyFilters = () => {
    // This function can be used to trigger additional actions when applying filters
    // Currently the filters are applied automatically when changed
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="service-type" className="block text-sm font-medium text-gray-700">Service Type</Label>
            <Select 
              value={filters.serviceType} 
              onValueChange={handleServiceTypeChange}
            >
              <SelectTrigger id="service-type" className="mt-1">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Types">All Types</SelectItem>
                <SelectItem value="Technical">Technical</SelectItem>
                <SelectItem value="Creative">Creative</SelectItem>
                <SelectItem value="Educational">Educational</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="cost-filter" className="block text-sm font-medium text-gray-700">Cost</Label>
            <Select 
              value={filters.cost} 
              onValueChange={handleCostChange}
            >
              <SelectTrigger id="cost-filter" className="mt-1">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="availability" className="block text-sm font-medium text-gray-700">Availability</Label>
            <Select 
              value={filters.availability} 
              onValueChange={handleAvailabilityChange}
            >
              <SelectTrigger id="availability" className="mt-1">
                <SelectValue placeholder="Any time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Any time">Any time</SelectItem>
                <SelectItem value="This week">This week</SelectItem>
                <SelectItem value="This month">This month</SelectItem>
                <SelectItem value="On demand">On demand</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button className="w-full" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
