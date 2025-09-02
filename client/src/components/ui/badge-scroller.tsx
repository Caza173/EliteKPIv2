import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Trophy, Award, Star, Crown, Gem } from "lucide-react";

interface BadgeItem {
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  count: number;
  progress: number;
}

interface BadgeScrollerProps {
  items: BadgeItem[];
}

export function BadgeScroller({ items }: BadgeScrollerProps) {
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "Diamond":
        return <Gem className="h-5 w-5" />;
      case "Platinum":
        return <Crown className="h-5 w-5" />;
      case "Gold":
        return <Trophy className="h-5 w-5" />;
      case "Silver":
        return <Award className="h-5 w-5" />;
      default:
        return <Star className="h-5 w-5" />;
    }
  };

  const getTierColors = (tier: string) => {
    switch (tier) {
      case "Diamond":
        return "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50 border-cyan-200 dark:border-cyan-800";
      case "Platinum":
        return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800";
      case "Gold":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800";
      case "Silver":
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/50 border-gray-200 dark:border-gray-800";
      default:
        return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border-orange-200 dark:border-orange-800";
    }
  };

  return (
    <TooltipProvider>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {items.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Card className={`min-w-[140px] flex-shrink-0 hover:shadow-md transition-shadow cursor-default ${getTierColors(item.tier)}`}>
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    {getTierIcon(item.tier)}
                  </div>
                  <h3 className="text-sm font-medium mb-2">{item.tier}</h3>
                  <Badge variant="secondary" className="mb-3 tabular-nums">
                    {item.count}
                  </Badge>
                  {item.progress < 100 && (
                    <div className="space-y-1">
                      <Progress value={item.progress} className="h-1" />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {Math.round(item.progress)}% to next
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <div className="text-center">
                <p className="font-medium">{item.tier} Badges</p>
                <p className="text-xs text-neutral-500 mt-1">
                  {item.count} earned
                </p>
                {item.progress < 100 && (
                  <p className="text-xs mt-1">
                    {Math.round(100 - item.progress)}% until next badge
                  </p>
                )}
              </div>
            </TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
}