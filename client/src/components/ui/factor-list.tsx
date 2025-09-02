import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Factor {
  label: string;
  weightPct: number;
  weightLevel: "Low" | "Med" | "High";
  trend: -1 | 0 | 1;
  definition?: string;
}

interface FactorListProps {
  items: Factor[];
}

export function FactorList({ items }: FactorListProps) {
  const getWeightColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-emerald-500 dark:bg-emerald-600";
      case "Med":
        return "bg-blue-500 dark:bg-blue-600";
      case "Low":
        return "bg-neutral-400 dark:bg-neutral-500";
      default:
        return "bg-neutral-300 dark:bg-neutral-600";
    }
  };

  const getTrendIcon = (trend: number) => {
    if (trend === 1) return <TrendingUp className="h-3 w-3 text-emerald-500" />;
    if (trend === -1) return <TrendingDown className="h-3 w-3 text-rose-500" />;
    return <Minus className="h-3 w-3 text-neutral-400" />;
  };

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {items.map((factor, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <div className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-default">
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-2 h-2 rounded-full ${getWeightColor(factor.weightLevel)}`}
                  />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    {factor.label}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs tabular-nums">
                    {factor.weightPct}%
                  </Badge>
                  {getTrendIcon(factor.trend)}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="max-w-xs">
                <p className="font-medium">{factor.label}</p>
                {factor.definition && (
                  <p className="text-xs text-neutral-500 mt-1">{factor.definition}</p>
                )}
                <p className="text-xs mt-1">
                  Weight: {factor.weightPct}% | 30-day trend: {
                    factor.trend === 1 ? "↗ Improving" : 
                    factor.trend === -1 ? "↘ Declining" : 
                    "→ Stable"
                  }
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}