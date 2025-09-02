import { Card, CardContent } from "@/components/ui/card";

interface BadgeCardProps {
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  count: number;
  progress: number;
}

export function BadgeCard({ tier, count, progress }: BadgeCardProps) {
  const getTierColor = () => {
    switch (tier) {
      case "Bronze": return "text-orange-600";
      case "Silver": return "text-slate-600";
      case "Gold": return "text-blue-600";
      case "Platinum": return "text-slate-700";
      case "Diamond": return "text-cyan-600";
      default: return "text-slate-600";
    }
  };

  const getTierEmoji = () => {
    switch (tier) {
      case "Bronze": return "🥉";
      case "Silver": return "🥈";
      case "Gold": return "🥇";
      case "Platinum": return "⭐";
      case "Diamond": return "💎";
      default: return "🏆";
    }
  };

  return (
    <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
      <CardContent className="p-4 text-center">
        <div className="space-y-2">
          <div className="text-2xl">{getTierEmoji()}</div>
          <h3 className={`text-sm font-medium ${getTierColor()}`}>{tier}</h3>
          <div className="text-xl font-bold text-slate-900 tabular-nums">{count}</div>
          <div className="text-xs text-slate-600">
            {progress}% to next
          </div>
        </div>
      </CardContent>
    </Card>
  );
}