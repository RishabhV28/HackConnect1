import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AvatarListProps {
  avatars: { name: string; image?: string; initials: string }[];
  max?: number;
}

export function AvatarList({ avatars, max = 3 }: AvatarListProps) {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleAvatars.map((avatar, index) => (
        <Avatar key={index} className="border-2 border-white">
          {avatar.image ? (
            <AvatarImage src={avatar.image} alt={avatar.name} />
          ) : (
            <AvatarFallback className="bg-primary text-white">
              {avatar.initials}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      
      {remainingCount > 0 && (
        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white bg-muted text-muted-foreground font-medium text-xs">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

export default AvatarList;
