import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ className, size = "default", ...props }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], className)}
      {...props}
    />
  );
}

export function LoadingPage({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <LoadingSpinner size="xl" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  );
}

export function LoadingButton({ loading, children, ...props }) {
  return (
    <button disabled={loading} {...props}>
      {loading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </button>
  );
}
