import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  bgColor: string;
}

export function StatsCard({ title, value, icon: Icon, bgColor }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
              <Icon className="text-white h-5 w-5" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dt className="text-sm font-medium text-neutral-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-neutral-900">
                  {value}
                </div>
              </dd>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default StatsCard;
