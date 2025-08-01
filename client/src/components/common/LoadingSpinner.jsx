import React from "react";
import { Loader2, Loader } from "lucide-react";
import { cn } from "@/lib/utils";

const LoadingSpinner = ({
  size = "default",
  variant = "spinner", // spinner, dots, pulse
  className = "",
  text = "",
  fullScreen = false,
  overlay = false,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "dots":
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
          </div>
        );

      case "pulse":
        return (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:0.2s]"></div>
            <div className="w-2 h-2 bg-current rounded-full animate-pulse [animation-delay:0.4s]"></div>
          </div>
        );

      case "spinner":
      default:
        return <Loader2 className={cn(sizeClasses[size], "animate-spin")} />;
    }
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center space-y-2",
        className
      )}
    >
      {renderSpinner()}
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

// Convenience components for common loading states
export const PageLoader = ({ text = "Loading page..." }) => (
  <LoadingSpinner size="xl" text={text} fullScreen className="min-h-screen" />
);

export const TableLoader = ({ text = "Loading data..." }) => (
  <LoadingSpinner size="lg" text={text} className="py-8" />
);

export const ButtonLoader = ({ size = "sm" }) => (
  <LoadingSpinner size={size} className="inline-flex" />
);

export const CardLoader = ({ text = "Loading..." }) => (
  <LoadingSpinner size="default" text={text} className="py-12" />
);

export const InlineLoader = ({ size = "sm" }) => (
  <LoadingSpinner size={size} className="inline-flex" />
);

export default LoadingSpinner;
