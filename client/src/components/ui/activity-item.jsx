import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "./badge";

function ActivityItem({
  icon: Icon,
  title,
  description,
  time,
  variant = "default",
  className,
  ...props
}) {
  const variants = {
    default: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    success:
      "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    warning:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    danger: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    purple:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center",
            variants[variant]
          )}
        >
          {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{title}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </div>
      </div>
      <Badge variant="secondary" className="text-xs">
        {time}
      </Badge>
    </div>
  );
}

export { ActivityItem };
