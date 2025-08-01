import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const EmptyState = ({
  icon,
  title = "No data found",
  description = "There's nothing to display here yet.",
  action,
  secondaryAction,
  variant = "default", // default, minimal, card
  size = "default", // sm, default, lg
  className = "",
  iconClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  actionsClassName = "",
}) => {
  const sizeClasses = {
    sm: {
      icon: "h-8 w-8",
      title: "text-sm font-medium",
      description: "text-xs",
      spacing: "space-y-2",
    },
    default: {
      icon: "h-12 w-12",
      title: "text-base font-semibold",
      description: "text-sm",
      spacing: "space-y-3",
    },
    lg: {
      icon: "h-16 w-16",
      title: "text-lg font-semibold",
      description: "text-base",
      spacing: "space-y-4",
    },
  };

  const variantClasses = {
    default: "text-center py-8",
    minimal: "text-center py-4",
    card: "text-center p-6",
  };

  const content = (
    <div
      className={cn(
        "flex flex-col items-center",
        sizeClasses[size].spacing,
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            "text-muted-foreground",
            sizeClasses[size].icon,
            iconClassName
          )}
        >
          {icon}
        </div>
      )}

      <div className="space-y-1">
        <h3
          className={cn(
            "text-muted-foreground",
            sizeClasses[size].title,
            titleClassName
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              "text-muted-foreground",
              sizeClasses[size].description,
              descriptionClassName
            )}
          >
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className={cn("flex items-center space-x-2", actionsClassName)}>
          {action && (
            <Button
              variant={action.variant || "default"}
              size={action.size || "sm"}
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant={secondaryAction.variant || "outline"}
              size={secondaryAction.size || "sm"}
              onClick={secondaryAction.onClick}
              disabled={secondaryAction.disabled}
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="h-4 w-4 mr-2" />
              )}
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (variant === "card") {
    return (
      <Card className="border-dashed">
        <CardContent className={cn(variantClasses[variant])}>
          {content}
        </CardContent>
      </Card>
    );
  }

  return <div className={cn(variantClasses[variant])}>{content}</div>;
};

// Common empty state variants
export const NoDataEmptyState = ({ action, ...props }) => (
  <EmptyState
    icon="📊"
    title="No data available"
    description="There's no data to display at the moment."
    action={action}
    {...props}
  />
);

export const NoResultsEmptyState = ({ searchTerm, onClear, ...props }) => (
  <EmptyState
    icon="🔍"
    title="No results found"
    description={
      searchTerm
        ? `No results found for "${searchTerm}"`
        : "No results match your search criteria."
    }
    action={
      searchTerm
        ? {
            label: "Clear search",
            variant: "outline",
            onClick: onClear,
          }
        : undefined
    }
    {...props}
  />
);

export const NoItemsEmptyState = ({ itemName = "items", action, ...props }) => (
  <EmptyState
    icon="📦"
    title={`No ${itemName} yet`}
    description={`You haven't created any ${itemName} yet.`}
    action={action}
    {...props}
  />
);

export const ErrorEmptyState = ({ error, onRetry, ...props }) => (
  <EmptyState
    icon="⚠️"
    title="Something went wrong"
    description={error || "An error occurred while loading the data."}
    action={
      onRetry
        ? {
            label: "Try again",
            variant: "default",
            onClick: onRetry,
          }
        : undefined
    }
    {...props}
  />
);

export const NoAccessEmptyState = ({ ...props }) => (
  <EmptyState
    icon="🔒"
    title="Access denied"
    description="You don't have permission to view this content."
    {...props}
  />
);

export const NoConnectionEmptyState = ({ onRetry, ...props }) => (
  <EmptyState
    icon="🌐"
    title="No internet connection"
    description="Please check your connection and try again."
    action={
      onRetry
        ? {
            label: "Retry",
            variant: "default",
            onClick: onRetry,
          }
        : undefined
    }
    {...props}
  />
);

export default EmptyState;
