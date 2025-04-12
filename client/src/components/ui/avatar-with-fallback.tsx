import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

type AvatarWithFallbackProps = {
  src?: string;
  name?: string;
  className?: string;
};

export function AvatarWithFallback({ src, name, className }: AvatarWithFallbackProps) {
  // Generate initials from name
  const getInitials = (name?: string) => {
    if (!name) return "";
    
    const names = name.split(" ");
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };
  
  return (
    <Avatar className={className}>
      <AvatarImage src={src} alt={name} />
      <AvatarFallback>
        {name ? getInitials(name) : <User className="h-4 w-4" />}
      </AvatarFallback>
    </Avatar>
  );
}
