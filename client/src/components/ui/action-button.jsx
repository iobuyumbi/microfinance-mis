import * as React from "react";
import { cn } from "@/lib/utils";

function ActionButton({
  title,
  description,
  icon: Icon,
  onClick,
  variant = "default",
  className,
  ...props
}) {
  const variants = {
    default:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
    warning: "bg-orange-600 hover:bg-orange-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    purple:
      "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white",
    teal: "bg-teal-600 hover:bg-teal-700 text-white",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-xl border border-transparent transition-all duration-200 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]",
        "flex flex-col items-start gap-3 text-left",
        variants[variant],
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs opacity-90 mt-1">{description}</p>
      </div>
    </button>
  );
}

export { ActionButton };
