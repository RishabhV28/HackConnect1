import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeStatusVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        free: "bg-green-100 text-green-800", 
        paid: "bg-blue-100 text-blue-800",
        available: "bg-green-100 text-green-800",
        borrowed: "bg-red-100 text-red-800",
        maintenance: "bg-yellow-100 text-yellow-800",
        pending: "bg-yellow-100 text-yellow-800",
        accepted: "bg-green-100 text-green-800",
        rejected: "bg-red-100 text-red-800",
        completed: "bg-blue-100 text-blue-800",
        connected: "bg-green-100 text-green-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeStatusProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeStatusVariants> {
  label: string;
}

function BadgeStatus({ className, variant, label, ...props }: BadgeStatusProps) {
  return (
    <div className={cn(badgeStatusVariants({ variant }), className)} {...props}>
      {label}
    </div>
  );
}

export { BadgeStatus, badgeStatusVariants };
