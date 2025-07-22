// src/components/layouts/PageLayout.jsx
import React from 'react';

/**
 * Consistent page layout component that ensures proper spacing
 * regardless of content amount
 */
export function PageLayout({ 
  title, 
  action, 
  children, 
  className = "",
  headerContent = null 
}) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Page Header - Always consistent spacing */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {action && <div>{action}</div>}
        </div>
        {headerContent && (
          <div className="space-y-4">
            {headerContent}
          </div>
        )}
      </div>

      {/* Page Content - Structured sections with consistent spacing */}
      <div className="space-y-8">
        {children}
      </div>
    </div>
  );
}

/**
 * Section component for consistent content blocks
 */
export function PageSection({ 
  title, 
  children, 
  className = "",
  spacing = "default" // "tight", "default", "loose"
}) {
  const spacingClasses = {
    tight: "space-y-4",
    default: "space-y-6", 
    loose: "space-y-8"
  };

  return (
    <section className={`${spacingClasses[spacing]} ${className}`}>
      {title && (
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      )}
      <div className={spacingClasses[spacing]}>
        {children}
      </div>
    </section>
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
    6: "grid-cols-1 md:grid-cols-3 lg:grid-cols-6"
  };

  return (
    <div className={`grid ${colClasses[cols]} gap-6`}>
      {children}
    </div>
  );
}

/**
 * Filters section component for consistent filter layouts
 */
export function FiltersSection({ children }) {
  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
}

/**
 * Content card component for consistent content blocks
 */
export function ContentCard({ 
  title, 
  children, 
  className = "",
  padding = "default" // "tight", "default", "loose"
}) {
  const paddingClasses = {
    tight: "p-4",
    default: "p-6",
    loose: "p-8"
  };

  return (
    <div className={`bg-card rounded-lg border ${paddingClasses[padding]} ${className}`}>
      {title && (
        <h3 className="text-lg font-medium mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
}
