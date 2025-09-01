
import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const LoadingSpinner = ({ 
  size = 'default', 
  variant = 'default',
  text = '',
  className = '',
  fullScreen = false,
  children
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  };

  const Spinner = ({ className: spinnerClassName }) => {
    if (variant === 'dots') {
      return (
        <div className={cn("flex space-x-1", spinnerClassName)}>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-2 w-2 bg-primary rounded-full animate-bounce"></div>
        </div>
      );
    }
    
    if (variant === 'pulse') {
      return (
        <div className={cn("relative", spinnerClassName)}>
          <div className="h-8 w-8 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute inset-0 h-8 w-8 bg-primary rounded-full animate-ping opacity-75"></div>
        </div>
      );
    }

    if (variant === 'sparkle') {
      return (
        <Sparkles className={cn("animate-spin", sizeClasses[size], spinnerClassName)} />
      );
    }

    return (
      <Loader2 className={cn("animate-spin", sizeClasses[size], spinnerClassName)} />
    );
  };

  const content = (
    <div className={cn(
      "flex flex-col items-center justify-center",
      fullScreen ? "min-h-screen" : "py-8",
      className
    )}>
      <Spinner className="text-primary" />
      {text && (
        <p className="mt-3 text-sm text-muted-foreground font-medium">
          {text}
        </p>
      )}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-background border rounded-lg shadow-lg p-6 max-w-sm w-full mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

// Additional loading components for specific use cases
export const PageLoading = ({ text = "Loading..." }) => (
  <LoadingSpinner 
    size="lg" 
    text={text} 
    className="min-h-[400px]" 
  />
);

export const ButtonLoading = ({ text = "Loading..." }) => (
  <div className="flex items-center">
    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    {text}
  </div>
);

export const InlineLoading = ({ text = "Loading..." }) => (
  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
    <Loader2 className="h-4 w-4 animate-spin" />
    <span>{text}</span>
  </div>
);

export const TableLoading = ({ columns = 4 }) => (
  <tr>
    <td colSpan={columns} className="text-center py-8">
      <LoadingSpinner text="Loading data..." />
    </td>
  </tr>
);

export const CardLoading = () => (
  <div className="border rounded-lg p-6">
    <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

export default LoadingSpinner;
