import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";

export function UserAvatar({ 
  user, 
  size = "default", 
  showStatus = false, 
  showBadge = false,
  className 
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-400",
    busy: "bg-yellow-500",
    away: "bg-red-500",
  };

  const roleBadgeColors = {
    admin: "default",
    officer: "secondary",
    leader: "outline",
    member: "secondary",
  };

  return (
    <div className="relative inline-flex items-center">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={user?.avatar} alt={user?.name} />
        <AvatarFallback className={cn("font-medium text-white", getAvatarColor(user?.name))}>
          {getInitials(user?.name)}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && user?.status && (
        <span 
          className={cn(
            "absolute -bottom-0 -right-0 h-3 w-3 rounded-full border-2 border-background",
            statusColors[user.status] || statusColors.inactive
          )}
        />
      )}
      
      {showBadge && user?.role && (
        <Badge 
          variant={roleBadgeColors[user.role] || "secondary"}
          className="absolute -top-1 -right-1 text-xs px-1 py-0 h-5"
        >
          {user.role}
        </Badge>
      )}
    </div>
  );
}

export function UserAvatarGroup({ users, max = 3, size = "default" }) {
  const displayUsers = users.slice(0, max);
  const remainingCount = users.length - max;

  return (
    <div className="flex -space-x-2">
      {displayUsers.map((user, index) => (
        <UserAvatar
          key={user.id || index}
          user={user}
          size={size}
          className="border-2 border-background"
        />
      ))}
      {remainingCount > 0 && (
        <Avatar className={cn("border-2 border-background", 
          size === "sm" ? "h-8 w-8" : 
          size === "lg" ? "h-12 w-12" : 
          size === "xl" ? "h-16 w-16" : "h-10 w-10"
        )}>
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            +{remainingCount}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
