import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendValue,
  trendLabel,
  progress,
  currency = false,
  className,
  variant = "default"
}) {
  const getTrendIcon = () => {
    if (trend === "up") return TrendingUp;
    if (trend === "down") return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-600";
    return "text-muted-foreground";
  };

  const TrendIcon = getTrendIcon();

  const formatValue = (val) => {
    if (currency) return formatCurrency(val);
    if (typeof val === 'number') return val.toLocaleString();
    return val;
  };

  const cardVariants = {
    default: "border-border",
    success: "border-green-200 bg-green-50/50",
    warning: "border-yellow-200 bg-yellow-50/50",
    danger: "border-red-200 bg-red-50/50",
    info: "border-blue-200 bg-blue-50/50",
  };

  return (
    <Card className={cn(cardVariants[variant], className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="h-4 w-4 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold tracking-tight">
          {formatValue(value)}
        </div>
        
        {description && (
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        )}
        
        {(trend || trendValue) && (
          <div className="flex items-center space-x-1">
            <TrendIcon className={cn("h-3 w-3", getTrendColor())} />
            <span className={cn("text-xs font-medium", getTrendColor())}>
              {trendValue && `${trendValue}%`}
            </span>
            {trendLabel && (
              <span className="text-xs text-muted-foreground">
                {trendLabel}
              </span>
            )}
          </div>
        )}
        
        {progress !== undefined && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatsGrid({ children, className }) {
  return (
    <div className={cn(
      "grid gap-4 md:grid-cols-2 lg:grid-cols-4",
      className
    )}>
      {children}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className
}) {
  const changeColors = {
    positive: "text-green-600 bg-green-50",
    negative: "text-red-600 bg-red-50",
    neutral: "text-muted-foreground bg-muted",
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-4 rounded-lg border bg-card",
      className
    )}>
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className="flex items-center space-x-2">
        {change && (
          <Badge 
            variant="secondary" 
            className={cn("text-xs", changeColors[changeType])}
          >
            {change}
          </Badge>
        )}
        {Icon && (
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </div>
  );
}
