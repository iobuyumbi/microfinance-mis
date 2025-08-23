import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export function PageHeader({ 
  title, 
  description, 
  action, 
  children,
  className = ""
}) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
        {action && (
          <div className="flex items-center space-x-2">
            {action}
          </div>
        )}
      </div>
      {children}
      <Separator />
    </div>
  );
}

export function PageSection({ 
  title, 
  description, 
  action, 
  children,
  className = "" 
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || action) && (
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            {title && (
              <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {action && action}
        </div>
      )}
      {children}
    </div>
  );
}

export function PageContainer({ 
  children, 
  className = "",
  maxWidth = "max-w-7xl"
}) {
  return (
    <div className={cn("container mx-auto px-4 py-6", maxWidth, className)}>
      {children}
    </div>
  );
}

export function PageGrid({ 
  children, 
  className = "",
  cols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
}) {
  return (
    <div className={cn("grid gap-6", cols, className)}>
      {children}
    </div>
  );
}

export function PageCard({ 
  children, 
  className = "",
  padding = "p-6"
}) {
  return (
    <div className={cn("bg-card border rounded-lg shadow-sm", padding, className)}>
      {children}
    </div>
  );
}

export function PageActions({ 
  children, 
  className = "" 
}) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {children}
    </div>
  );
}

export function PageSearch({ 
  placeholder = "Search...",
  value,
  onChange,
  className = ""
}) {
  return (
    <div className={cn("relative", className)}>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
      />
      <svg
        className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </div>
  );
}
