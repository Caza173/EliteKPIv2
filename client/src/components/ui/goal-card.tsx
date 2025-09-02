import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface GoalCardProps {
  title: string;
  current: number;
  target: number;
  onCelebrate?: () => void;
}

export function GoalCard({ title, current, target, onCelebrate }: GoalCardProps) {
  const progress = Math.min((current / target) * 100, 100);
  const isComplete = progress >= 100;

  const formatValue = (value: number) => {
    if (title.toLowerCase().includes('revenue')) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <Card className="bg-slate-900 border-slate-800 hover:shadow-md hover:border-slate-700 transition-all duration-200 rounded-2xl shadow-sm">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-200">{title}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {formatValue(current)} of {formatValue(target)}
            </p>
          </div>
          
          <div className="space-y-2">
            <Progress 
              value={progress} 
              className="h-2"
            />
            <div className="flex justify-between text-xs">
              <span className="text-slate-400">Progress</span>
              <span className="text-slate-200 font-medium tabular-nums">
                {progress.toFixed(1)}%
              </span>
            </div>
          </div>
          
          {isComplete && (
            <div className="text-center text-blue-400 text-sm font-medium">
              🎯 Goal Achieved!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}