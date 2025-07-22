import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export function PageHeader({ 
  title, 
  description, 
  action, 
  children,
  className = "" 
}) {
  return (
    <div className={`space-y-6 ${className}`}>
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
    <div className={`space-y-4 ${className}`}>
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
