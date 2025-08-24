/**
 * Unified Financial Card Component
 * Provides consistent styling and behavior for financial information
 * Ensures UI consistency across the application
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { FinancialDisplay } from "../../utils/financialUtils";
import { cn } from "../../lib/utils";

const FinancialCard = ({
  title,
  amount,
  subtitle,
  trend,
  trendValue,
  trendDirection = "neutral",
  icon: Icon,
  variant = "default",
  className,
  children,
  onClick,
  ...props
}) => {
  const baseClasses = "transition-all duration-200 hover:shadow-md";
  const clickableClasses = onClick ? "cursor-pointer hover:scale-[1.02]" : "";

  const variantClasses = {
    default: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
    success:
      "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
    danger: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
    info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800",
  };

  const trendColors = {
    up: "text-green-600 dark:text-green-400",
    down: "text-red-600 dark:text-red-400",
    neutral: "text-gray-600 dark:text-gray-400",
  };

  const trendIcons = {
    up: "↗",
    down: "↘",
    neutral: "→",
  };

  return (
    <Card
      className={cn(
        baseClasses,
        clickableClasses,
        variantClasses[variant],
        className
      )}
      onClick={onClick}
      {...props}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {title}
          </CardTitle>
          {Icon && (
            <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <Icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {FinancialDisplay.formatAmount(amount)}
            </span>
            {trend && (
              <Badge
                variant={trendDirection === "up" ? "default" : "secondary"}
                className={cn(
                  "text-xs",
                  trendDirection === "up"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                )}
              >
                <span className={trendColors[trendDirection]}>
                  {trendIcons[trendDirection]} {trendValue}
                </span>
              </Badge>
            )}
          </div>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialCard;
