import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function ErrorMessage({ 
  title = "Something went wrong", 
  message = "An unexpected error occurred. Please try again.", 
  onRetry,
  showRetry = true 
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-6">
      <Alert className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
      </Alert>
      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="outline" className="mt-4">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

export function ErrorCard({ error, onRetry }) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6">
      <div className="flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-destructive">Error</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {error?.message || "An unexpected error occurred"}
          </p>
          {onRetry && (
            <Button 
              onClick={onRetry} 
              variant="outline" 
              size="sm" 
              className="mt-3"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
