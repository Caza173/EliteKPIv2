import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Calendar, BarChart3, Clock, Info } from "lucide-react";
import ProgressWheel from "@/components/ui/progress-wheel";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface HistoricalEfficiencyData {
  date: string;
  averageScore: number;
  scoreCount: number;
}

interface EfficiencyTrackerProps {
  currentScore: number;
  showCompact?: boolean;
}

export default function EfficiencyTracker({ currentScore, showCompact = false }: EfficiencyTrackerProps) {
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('day');
  const [count, setCount] = useState(30);
  const [timeFilter, setTimeFilter] = useState<1 | 7 | 30>(7); // New time period filter

  const { data: historicalData, isLoading } = useQuery<HistoricalEfficiencyData[]>({
    queryKey: ['/api/efficiency-scores', period, count],
    enabled: true
  });

  // Query for real-time efficiency calculation with time filtering
  const { data: liveEfficiencyData, isLoading: liveLoading } = useQuery({
    queryKey: ['/api/efficiency-scores/calculate', timeFilter],
    enabled: true
  });

  // Calculate trend compared to previous period
  const getTrend = () => {
    if (!historicalData || historicalData.length < 2) return null;
    
    const current = historicalData[0]?.averageScore || 0;
    const previous = historicalData[1]?.averageScore || 0;
    const change = current - previous;
    
    return {
      value: Math.abs(change),
      direction: change >= 0 ? 'up' : 'down',
      percentage: previous > 0 ? Math.abs((change / previous) * 100) : 0
    };
  };

  const trend = getTrend();

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-blue-600 bg-blue-50";
    if (score >= 50) return "text-blue-600 bg-blue-50";
    return "text-red-600 bg-red-50";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    if (score >= 50) return "outline";
    return "destructive";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Needs Improvement';
  };

  const getScoreDescription = () => {
    return `Your efficiency score is calculated based on multiple performance metrics including conversion rates, activity consistency, time management, deal velocity, and ROI performance. The score reflects your overall business efficiency over the selected time period.`;
  };

  // Use live calculated score instead of prop
  const displayScore = (liveEfficiencyData as any)?.score ?? currentScore ?? 0;
  const breakdown = (liveEfficiencyData as any)?.breakdown || {};

  if (showCompact) {
    return (
      <TooltipProvider>
        <div className="bg-white rounded-lg border p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Efficiency Tracking</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{getScoreDescription()}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeFilter.toString()} onValueChange={(value) => setTimeFilter(Number(value) as 1 | 7 | 30)}>
                <SelectTrigger className="w-[80px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Last...</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                </SelectContent>
              </Select>
              <Select value="days">
                <SelectTrigger className="w-[70px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <ProgressWheel 
                value={displayScore} 
                size={120} 
                strokeWidth={8}
                color="#f97316"
                backgroundColor="#e5e7eb"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{Math.round(displayScore)}%</div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="space-y-2">
                <div>
                  <div className="text-sm text-gray-500">Efficiency Score ({timeFilter} days)</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getScoreBadgeVariant(displayScore)} className="text-sm">
                      {getScoreLabel(displayScore)}
                    </Badge>
                  </div>
                </div>
                {historicalData && historicalData.length === 0 && (
                  <div className="text-center text-gray-500 py-8">
                    <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <div className="text-sm">No historical data available yet.</div>
                    <div className="text-xs">Keep tracking your daily activities to see trends.</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  }

  // Mock efficiency breakdown data
  const efficiencyBreakdown = [
    { label: "Conversion", percentage: 25, weight: "High", color: "text-blue-600" },
    { label: "Call Efficiency", percentage: 15, weight: "Med", color: "text-teal-600" },
    { label: "ROI", percentage: 15, weight: "Med", color: "text-orange-600" },
    { label: "Days on Market", percentage: 10, weight: "Med", color: "text-purple-600" },
    { label: "CMA Accuracy", percentage: 10, weight: "Med", color: "text-teal-600" },
    { label: "Price Ratio", percentage: 10, weight: "Low", color: "text-red-600" },
    { label: "Time Management", percentage: 10, weight: "Low", color: "text-blue-600" },
    { label: "Deal Retention", percentage: 5, weight: "Low", color: "text-orange-600" }
  ];

  return (
    <TooltipProvider>
      <div className="bg-white rounded-xl border p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
              <span className="text-blue-600 text-xs">⚡</span>
            </div>
            <h3 className="text-base font-semibold text-gray-900">Overall Efficiency Score</h3>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-3 w-3 text-gray-400 hover:text-gray-600" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="text-sm">{getScoreDescription()}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Compact Progress Wheel */}
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-2">
            <ProgressWheel 
              value={displayScore} 
              size={100} 
              strokeWidth={8}
              color="#ef4444"
              backgroundColor="#e5e7eb"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{Math.round(displayScore)}%</div>
              </div>
            </div>
          </div>
          <div className="text-center">
            <div className="text-red-500 text-sm font-medium">Needs Improvement</div>
          </div>
        </div>

        {/* Compact Efficiency Breakdown */}
        <div className="space-y-1 mb-3">
          {efficiencyBreakdown.map((item, index) => (
            <div key={index} className="flex items-center justify-between py-1">
              <div className="flex-1">
                <span className="text-sm text-gray-700">{item.label} ({item.percentage}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs">Weight:</span>
                <span className={`text-xs font-medium ${item.color}`}>{item.weight}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Compact Bottom Info */}
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-xs text-gray-600">
            Comprehensive efficiency score now includes CMA accuracy tracking to measure pricing expertise and market knowledge.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}