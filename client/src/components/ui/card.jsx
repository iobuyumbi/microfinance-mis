import React, { createContext, useContext, forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Card variants
const cardVariants = cva(
  "rounded-lg border bg-surface-primary text-text-primary shadow-sm",
  {
    variants: {
      variant: {
        default: "border-border-primary",
        elevated: "border-border-primary shadow-md",
        outlined: "border-border-primary bg-transparent",
        ghost: "border-transparent bg-transparent shadow-none",
        interactive:
          "border-border-primary hover:shadow-md transition-shadow cursor-pointer",
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      fullWidth: false,
    },
  }
);

// Card Context
const CardContext = createContext({
  variant: "default",
  padding: "md",
  fullWidth: false,
});

// Main Card Component
const Card = forwardRef(
  ({ className, variant, padding, fullWidth, children, ...props }, ref) => {
    return (
      <CardContext.Provider value={{ variant, padding, fullWidth }}>
        <div
          ref={ref}
          className={cn(
            cardVariants({ variant, padding, fullWidth }),
            className
          )}
          {...props}
        >
          {children}
        </div>
      </CardContext.Provider>
    );
  }
);

Card.displayName = "Card";

// Card Header Component
const CardHeader = forwardRef(({ className, children, ...props }, ref) => {
  const { padding } = useContext(CardContext);

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5",
        padding === "none" ? "p-4" : "pb-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardHeader.displayName = "CardHeader";

// Card Title Component
const CardTitle = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

// Card Description Component
const CardDescription = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("text-sm text-text-secondary", className)}
      {...props}
    >
      {children}
    </p>
  );
});

CardDescription.displayName = "CardDescription";

// Card Content Component
const CardContent = forwardRef(({ className, children, ...props }, ref) => {
  const { padding } = useContext(CardContext);

  return (
    <div
      ref={ref}
      className={cn(padding === "none" ? "p-4" : "pt-0", className)}
      {...props}
    >
      {children}
    </div>
  );
});

CardContent.displayName = "CardContent";

// Card Footer Component
const CardFooter = forwardRef(({ className, children, ...props }, ref) => {
  const { padding } = useContext(CardContext);

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center",
        padding === "none" ? "p-4" : "pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = "CardFooter";

// Card Image Component
const CardImage = forwardRef(
  ({ className, src, alt, children, ...props }, ref) => {
    const { padding } = useContext(CardContext);

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden",
          padding === "none" ? "p-4" : "px-4 pt-4",
          className
        )}
        {...props}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-auto rounded-md" />
        ) : (
          children
        )}
      </div>
    );
  }
);

CardImage.displayName = "CardImage";

// Card Actions Component
const CardActions = forwardRef(
  ({ className, children, align = "start", ...props }, ref) => {
    const { padding } = useContext(CardContext);

    const alignmentClasses = {
      start: "justify-start",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2",
          alignmentClasses[align],
          padding === "none" ? "p-4" : "pt-4",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardActions.displayName = "CardActions";

// Card Badge Component
const CardBadge = forwardRef(
  ({ className, variant = "default", children, ...props }, ref) => {
    const badgeVariants = {
      default: "bg-primary-100 text-primary-800",
      success: "bg-success-100 text-success-800",
      warning: "bg-warning-100 text-warning-800",
      error: "bg-error-100 text-error-800",
      secondary: "bg-secondary-100 text-secondary-800",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          badgeVariants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

CardBadge.displayName = "CardBadge";

// Card Stats Component
const CardStats = forwardRef(({ className, stats = [], ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("grid grid-cols-2 gap-4", className)}
      {...props}
    >
      {stats.map((stat, index) => (
        <div key={index} className="text-center">
          <div className="text-2xl font-bold text-text-primary">
            {stat.value}
          </div>
          <div className="text-sm text-text-secondary">{stat.label}</div>
        </div>
      ))}
    </div>
  );
});

CardStats.displayName = "CardStats";

// Export all components
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardImage,
  CardActions,
  CardBadge,
  CardStats,
  cardVariants,
};

export default Card;
