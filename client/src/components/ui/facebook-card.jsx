import * as React from "react";
import { cn } from "@/lib/utils";

function FacebookCard({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function FacebookCardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-b border-gray-100 dark:border-gray-700",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function FacebookCardContent({ className, children, ...props }) {
  return (
    <div className={cn("px-6 py-4", className)} {...props}>
      {children}
    </div>
  );
}

function FacebookCardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "px-6 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export {
  FacebookCard,
  FacebookCardHeader,
  FacebookCardContent,
  FacebookCardFooter,
};
