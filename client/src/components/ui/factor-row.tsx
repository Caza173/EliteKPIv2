import { ChevronUp, ChevronDown, Minus } from "lucide-react";

interface FactorRowProps {
  label: string;
  weightPct: number;
  trend: -1 | 0 | 1;
}

export function FactorRow({ label, weightPct, trend }: FactorRowProps) {
  const getTrendIcon = () => {
    if (trend === 1) return <ChevronUp className="h-3 w-3 text-green-600" />;
    if (trend === -1) return <ChevronDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-slate-500" />;
  };

  const getBarColor = () => {
    if (weightPct >= 80) return "bg-green-500";
    if (weightPct >= 60) return "bg-blue-500";
    return "bg-red-500";
  };

  return (
    <div className="flex items-center space-x-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">{label}</p>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Progress bar */}
        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
          <div 
            className={`h-full ${getBarColor()} transition-all duration-500`}
            style={{ width: `${weightPct}%` }}
          />
        </div>
        
        {/* Weight percentage */}
        <span className="text-xs font-medium text-slate-600 tabular-nums w-8 text-right">
          {weightPct}%
        </span>
        
        {/* Trend icon */}
        {getTrendIcon()}
      </div>
    </div>
  );
}