import { cn } from "@/lib/utils";

/**
 * UI utility functions
 */

// Status color mapping for badges and indicators
export const getStatusColor = (status) => {
  const colors = {
    // Loan statuses
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    approved: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200",
    disbursed: "bg-blue-100 text-blue-800 border-blue-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    defaulted: "bg-red-100 text-red-800 border-red-200",

    // User statuses
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    suspended: "bg-red-100 text-red-800 border-red-200",
    pending_approval: "bg-yellow-100 text-yellow-800 border-yellow-200",

    // Transaction statuses
    success: "bg-green-100 text-green-800 border-green-200",
    failed: "bg-red-100 text-red-800 border-red-200",
    processing: "bg-blue-100 text-blue-800 border-blue-200",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200",

    // Meeting statuses
    scheduled: "bg-blue-100 text-blue-800 border-blue-200",
    ongoing: "bg-green-100 text-green-800 border-green-200",
    completed: "bg-gray-100 text-gray-800 border-gray-200",
    cancelled: "bg-red-100 text-red-800 border-red-200",

    // Group statuses
    active: "bg-green-100 text-green-800 border-green-200",
    inactive: "bg-gray-100 text-gray-800 border-gray-200",
    dissolved: "bg-red-100 text-red-800 border-red-200",
  };

  return colors[status] || colors.inactive;
};

// Text truncation with ellipsis
export const truncateText = (text, maxLength = 50) => {
  if (!text || typeof text !== "string") return "";

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Enhanced className utility
export const getClassName = (...classes) => cn(...classes);

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    low: "bg-gray-100 text-gray-800 border-gray-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    urgent: "bg-red-100 text-red-800 border-red-200",
  };

  return colors[priority] || colors.medium;
};

// Get amount color based on value (positive/negative)
export const getAmountColor = (amount) => {
  if (amount === null || amount === undefined) return "text-gray-600";

  const numAmount = parseFloat(amount);
  if (isNaN(numAmount)) return "text-gray-600";

  if (numAmount > 0) return "text-green-600";
  if (numAmount < 0) return "text-red-600";
  return "text-gray-600";
};

// Get progress color based on percentage
export const getProgressColor = (percentage) => {
  if (percentage >= 80) return "bg-green-500";
  if (percentage >= 60) return "bg-blue-500";
  if (percentage >= 40) return "bg-yellow-500";
  if (percentage >= 20) return "bg-orange-500";
  return "bg-red-500";
};

// Get chart colors for different data series
export const getChartColors = (index = 0) => {
  const colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#06B6D4", // cyan
    "#F97316", // orange
    "#EC4899", // pink
    "#84CC16", // lime
    "#6366F1", // indigo
  ];

  return colors[index % colors.length];
};

// Get responsive text size classes
export const getResponsiveTextSize = (size = "base") => {
  const sizes = {
    xs: "text-xs sm:text-sm",
    sm: "text-sm sm:text-base",
    base: "text-base sm:text-lg",
    lg: "text-lg sm:text-xl",
    xl: "text-xl sm:text-2xl",
    "2xl": "text-2xl sm:text-3xl",
    "3xl": "text-3xl sm:text-4xl",
  };

  return sizes[size] || sizes.base;
};

// Get responsive padding classes
export const getResponsivePadding = (size = "base") => {
  const paddings = {
    xs: "p-2 sm:p-3",
    sm: "p-3 sm:p-4",
    base: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
    xl: "p-8 sm:p-12",
  };

  return paddings[size] || paddings.base;
};

// Get responsive margin classes
export const getResponsiveMargin = (size = "base") => {
  const margins = {
    xs: "m-2 sm:m-3",
    sm: "m-3 sm:m-4",
    base: "m-4 sm:m-6",
    lg: "m-6 sm:m-8",
    xl: "m-8 sm:m-12",
  };

  return margins[size] || margins.base;
};

// Get animation classes
export const getAnimationClasses = (type = "fade") => {
  const animations = {
    fade: "animate-in fade-in duration-300",
    slide: "animate-in slide-in-from-bottom duration-300",
    scale: "animate-in zoom-in duration-300",
    bounce: "animate-in bounce-in duration-300",
  };

  return animations[type] || animations.fade;
};

// Get hover effect classes
export const getHoverClasses = (type = "lift") => {
  const hovers = {
    lift: "hover:shadow-lg hover:-translate-y-1 transition-all duration-200",
    scale: "hover:scale-105 transition-transform duration-200",
    glow: "hover:shadow-lg hover:shadow-blue-500/25 transition-shadow duration-200",
    border: "hover:border-blue-500 transition-colors duration-200",
  };

  return hovers[type] || hovers.lift;
};

// Get focus classes for accessibility
export const getFocusClasses = () => {
  return "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2";
};

// Get disabled classes
export const getDisabledClasses = () => {
  return "opacity-50 cursor-not-allowed pointer-events-none";
};

// Get loading classes
export const getLoadingClasses = () => {
  return "animate-pulse opacity-75";
};

// Get skeleton classes
export const getSkeletonClasses = () => {
  return "animate-pulse bg-gray-200 rounded";
};

// Get card classes
export const getCardClasses = (variant = "default") => {
  const variants = {
    default: "bg-white border border-gray-200 rounded-lg shadow-sm",
    elevated: "bg-white border border-gray-200 rounded-lg shadow-md",
    outlined: "bg-transparent border border-gray-200 rounded-lg",
    ghost: "bg-transparent",
  };

  return variants[variant] || variants.default;
};

// Get button variant classes
export const getButtonClasses = (variant = "default", size = "md") => {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
    destructive: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background";

  return cn(baseClasses, variants[variant], sizes[size]);
};
