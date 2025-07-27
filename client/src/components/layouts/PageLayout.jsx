// src/components/layouts/PageLayout.jsx
import React from "react";
import { motion } from "framer-motion"; // Import motion for animations

// Shadcn UI Imports
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

/**
 * Consistent page layout component that ensures proper spacing
 * regardless of content amount
 */
export function PageLayout({
  title,
  action,
  children,
  className = "",
  headerContent = null,
}) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Page Header - Always consistent spacing */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {action && <div>{action}</div>}
        </div>
        {headerContent && <div className="space-y-4">{headerContent}</div>}
      </div>

      {/* Page Content - Structured sections with consistent spacing */}
      <div className="space-y-8">{children}</div>
    </div>
  );
}

/**
 * Section component for consistent content blocks
 * Now uses Framer Motion for a subtle fade-in animation.
 */
export function PageSection({
  title,
  children,
  className = "",
  spacing = "default", // "tight", "default", "loose"
}) {
  const spacingClasses = {
    tight: "space-y-4",
    default: "space-y-6",
    loose: "space-y-8",
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }} // Start slightly hidden and below
      animate={{ opacity: 1, y: 0 }} // Animate to fully visible and original position
      transition={{ duration: 0.5, ease: "easeOut" }} // Animation duration and easing
      className={`${spacingClasses[spacing]} ${className}`}
    >
      {title && (
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      )}
      <div className={spacingClasses[spacing]}>{children}</div>
    </motion.section>
  );
}

/**
 * Stats grid component for consistent metric displays
 */
export function StatsGrid({ children, cols = 4 }) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6",
  };

  return <div className={`grid ${colClasses[cols]} gap-6`}>{children}</div>;
}

/**
 * Filters section component for consistent filter layouts
 * Now uses Shadcn's Card component for consistent styling.
 */
export function FiltersSection({ children }) {
  return (
    <Card className="p-6">
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-0">
        {children}
      </CardContent>
    </Card>
  );
}

/**
 * Content card component for consistent content blocks
 * Now includes a loading/skeleton variant using Tailwind's animate-pulse.
 */
export function ContentCard({
  title,
  children,
  className = "",
  padding = "default", // "tight", "default", "loose"
  isLoading = false, // New prop for loading state
}) {
  const paddingClasses = {
    tight: "p-4",
    default: "p-6",
    loose: "p-8",
  };

  return (
    <Card className={`${className} ${isLoading ? "animate-pulse" : ""}`}>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={paddingClasses[padding]}>
        {isLoading ? (
          // Skeleton UI when loading
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-3/4"></div>{" "}
            {/* Title/label placeholder */}
            <div className="h-6 bg-muted rounded w-1/2"></div>{" "}
            {/* Value placeholder */}
          </div>
        ) : (
          // Actual content when not loading
          children
        )}
      </CardContent>
    </Card>
  );
}
