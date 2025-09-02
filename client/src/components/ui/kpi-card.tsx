import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SparklineData {
  x: string;
  y: number;
}

interface Delta {
  value: number;
  direction: "up" | "down";
}

interface KpiCardProps {
  title: string;
  value: string;
  delta?: Delta;
  sparkline?: SparklineData[];
  intent?: "neutral" | "success" | "warning" | "danger";
}

export function KpiCard({ title, value, delta, sparkline, intent = "neutral" }: KpiCardProps) {
  const getSparklineColor = () => {
    switch (intent) {
      case "success": return "#10b981";
      case "warning": return "#06b6d4";
      case "danger": return "#ef4444";
      default: return "#3b82f6";
    }
  };

  const getDeltaStyles = () => {
    if (!delta) return "";
    
    if (delta.direction === "up") {
      return "bg-green-50 text-green-700 border border-green-200";
    } else {
      return "bg-red-50 text-red-700 border border-red-200";
    }
  };

  return (
    <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-3">
          {/* Header with title and delta */}
          <div className="flex items-start justify-between">
            <p className="text-xs font-medium text-slate-600 tracking-wide uppercase">
              {title}
            </p>
            {delta && (
              <div className={`inline-flex items-center px-2 py-1 rounded-xl text-xs font-medium ${getDeltaStyles()}`}>
                {delta.direction === "up" ? (
                  <TrendingUp className="h-3 w-3 mr-1" />
                ) : (
                  <TrendingDown className="h-3 w-3 mr-1" />
                )}
                {Math.abs(delta.value)}%
              </div>
            )}
          </div>
          
          {/* Main value */}
          <p className="text-3xl font-bold text-slate-900 tabular-nums">
            {value}
          </p>
          
          {/* Sparkline */}
          {sparkline && sparkline.length > 0 && (
            <div className="h-6 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sparkline}>
                  <Line 
                    type="monotone" 
                    dataKey="y" 
                    stroke={getSparklineColor()}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}