import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

export const StatCard = ({
  title,
  value,
  icon,
  trend,
  className,
  valueClassName,
}: StatCardProps) => {
  return (
    <div className={cn("glass-card p-6", className)}>
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm text-muted-foreground">{title}</span>
        {icon}
      </div>
      <p className={cn("text-2xl font-bold", valueClassName)}>{value}</p>
      {trend && (
        <p
          className={cn(
            "text-sm mt-1",
            trend.isPositive ? "text-emerald-500" : "text-red-500"
          )}
        >
          {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}% vs mês anterior
        </p>
      )}
    </div>
  );
};
