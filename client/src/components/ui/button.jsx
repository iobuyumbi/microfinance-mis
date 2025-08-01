import React, { forwardRef, createContext, useContext } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// Button variants using class-variance-authority
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800",
        destructive:
          "bg-error-600 text-white hover:bg-error-700 active:bg-error-800",
        outline:
          "border border-border-primary bg-transparent hover:bg-surface-secondary hover:text-text-primary",
        secondary:
          "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300",
        ghost: "hover:bg-surface-secondary hover:text-text-primary",
        link: "text-primary-600 underline-offset-4 hover:underline",
        success:
          "bg-success-600 text-white hover:bg-success-700 active:bg-success-800",
        warning:
          "bg-warning-600 text-white hover:bg-warning-700 active:bg-warning-800",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-md px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  }
);

// Button Group Context
const ButtonGroupContext = createContext({
  variant: "default",
  size: "default",
  fullWidth: false,
});

// Button Group Component
const ButtonGroup = ({
  children,
  variant = "default",
  size = "default",
  fullWidth = false,
  className,
  ...props
}) => {
  return (
    <ButtonGroupContext.Provider value={{ variant, size, fullWidth }}>
      <div
        className={cn("inline-flex", fullWidth && "w-full", className)}
        {...props}
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
};

// Main Button Component
const Button = forwardRef(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const groupContext = useContext(ButtonGroupContext);

    // Use group context values if not explicitly provided
    const finalVariant = variant || groupContext.variant;
    const finalSize = size || groupContext.size;
    const finalFullWidth = fullWidth ?? groupContext.fullWidth;

    const isDisabled = disabled || loading;

    return (
      <button
        className={cn(
          buttonVariants({
            variant: finalVariant,
            size: finalSize,
            fullWidth: finalFullWidth,
          }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {loading && loadingText ? loadingText : children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";

// Button Group Item Component
const ButtonGroupItem = forwardRef(
  ({ className, variant, size, fullWidth, ...props }, ref) => {
    const groupContext = useContext(ButtonGroupContext);

    return (
      <Button
        ref={ref}
        className={cn(
          "rounded-none first:rounded-l-md last:rounded-r-md",
          "border-r border-border-primary last:border-r-0",
          className
        )}
        variant={variant || groupContext.variant}
        size={size || groupContext.size}
        fullWidth={fullWidth ?? groupContext.fullWidth}
        {...props}
      />
    );
  }
);

ButtonGroupItem.displayName = "ButtonGroupItem";

// Export components
export { Button, ButtonGroup, ButtonGroupItem, buttonVariants };
export default Button;
