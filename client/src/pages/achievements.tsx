import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  TrendingUp, 
  Award, 
  Crown,
  Medal,
  Flame,
  DollarSign,
  Home,
  Activity,
  Clock,
  Users,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAchievementCelebration } from "@/hooks/useAchievementCelebration";
import AchievementCelebration from "@/components/achievements/achievement-celebration";
import type { DashboardMetrics } from "@shared/schema";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: 'sales' | 'activity' | 'time' | 'streak' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: number;
  currentProgress: number;
  isUnlocked: boolean;
  unlockedDate?: string;
  points: number;
}

interface PerformanceStreak {
  type: string;
  current: number;
  longest: number;
  isActive: boolean;
}

interface AgentLevel {
  level: number;
  title: string;
  totalPoints: number;
  pointsToNext: number;
  pointsRequired: number;
}

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();
  const { 
    currentCelebration, 
    isCelebrationOpen, 
    closeCelebration, 
    triggerCelebration 
  } = useAchievementCelebration();

  // Fetch achievements data from API
  const { data: achievementsData, isLoading } = useQuery({
    queryKey: ["/api/achievements"],
  });

  // Fallback achievement data
  const achievements: Achievement[] = (achievementsData as any)?.achievements || [
    // Sales Achievements
    {
      id: "first_sale",
      title: "First Sale",
      description: "Close your first property transaction",
      icon: Home,
      category: "sales",
      tier: "bronze",
      requirement: 1,
      currentProgress: 0,
      isUnlocked: false,
      points: 100
    },
    {
      id: "deal_closer",
      title: "Deal Closer",
      description: "Close 5 property transactions",
      icon: Trophy,
      category: "sales",
      tier: "silver", 
      requirement: 5,
      currentProgress: 0,
      isUnlocked: false,
      points: 500
    },
    {
      id: "sales_master",
      title: "Sales Master",
      description: "Close 25 property transactions",
      icon: Crown,
      category: "sales",
      tier: "gold",
      requirement: 25,
      currentProgress: 0,
      isUnlocked: false,
      points: 2500
    },

    // Revenue Achievements
    {
      id: "first_100k",
      title: "Six Figure Agent",
      description: "Earn $100,000 in commissions",
      icon: DollarSign,
      category: "sales",
      tier: "silver",
      requirement: 100000,
      currentProgress: 0,
      isUnlocked: false,
      points: 1000
    },
    {
      id: "million_dollar_agent",
      title: "Million Dollar Agent",
      description: "Sell $1,000,000+ in property volume",
      icon: Medal,
      category: "sales",
      tier: "gold",
      requirement: 1000000,
      currentProgress: 0,
      isUnlocked: false,
      points: 5000
    },

    // Activity Achievements
    {
      id: "networker",
      title: "Networker",
      description: "Complete 50 client activities",
      icon: Users,
      category: "activity",
      tier: "bronze",
      requirement: 50,
      currentProgress: 0,
      isUnlocked: false,
      points: 250
    },
    {
      id: "time_tracker",
      title: "Time Tracker",
      description: "Log 100+ hours of work time",
      icon: Clock,
      category: "time",
      tier: "bronze",
      requirement: 100,
      currentProgress: 0,
      isUnlocked: false,
      points: 300
    },

    // Streak Achievements
    {
      id: "weekly_warrior",
      title: "Weekly Warrior",
      description: "Complete activities for 7 consecutive days",
      icon: Flame,
      category: "streak",
      tier: "silver",
      requirement: 7,
      currentProgress: 0,
      isUnlocked: false,
      points: 750
    },
    {
      id: "consistency_king",
      title: "Consistency King",
      description: "Log activities for 30 consecutive days",
      icon: Trophy,
      category: "streak",
      tier: "platinum",
      requirement: 30,
      currentProgress: 0,
      isUnlocked: false,
      points: 3000
    }
  ];

  const streaks: PerformanceStreak[] = (achievementsData as any)?.streaks || [];
  const agentLevel: AgentLevel = (achievementsData as any)?.agentLevel || {
    level: 1,
    title: "Rookie Agent",
    totalPoints: 0,
    pointsToNext: 1000,
    pointsRequired: 1000
  };
  const totalPoints = (achievementsData as any)?.totalPoints || 0;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "bronze": return "text-gray-600 bg-gray-50";
      case "silver": return "text-gray-600 bg-gray-50";  
      case "gold": return "text-blue-600 bg-blue-50";
      case "platinum": return "text-purple-600 bg-purple-50";
      case "diamond": return "text-blue-600 bg-blue-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "bronze": return "🥉";
      case "silver": return "🥈";
      case "gold": return "🥇";
      case "platinum": return "💎";
      case "diamond": return "💍";
      default: return "🏆";
    }
  };

  const filteredAchievements = selectedCategory === "all" ? 
    achievements : achievements.filter(a => a.category === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-gray-200 h-32 rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const categoryStats = {
    all: achievements.length,
    sales: achievements.filter(a => a.category === "sales").length,
    activity: achievements.filter(a => a.category === "activity").length,
    time: achievements.filter(a => a.category === "time").length,
    streak: achievements.filter(a => a.category === "streak").length,
    milestone: achievements.filter(a => a.category === "milestone").length,
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Performance</h1>
          <p className="text-sm text-gray-600">Track achievements, streaks, and level up your career</p>
        </div>
        <div className="text-right space-y-2">
          <div className="text-2xl font-bold text-primary">{agentLevel.title}</div>
          <div className="text-sm text-gray-600">Level {agentLevel.level} • {totalPoints} Points</div>
        </div>
      </div>

      {/* Performance Streaks & Medals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Performance Streaks & Medals
          </CardTitle>
          <p className="text-sm text-gray-600">Track your consistency and competitive achievements</p>
        </CardHeader>
        <CardContent>
          {/* Medal Summary */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Medal Collection</h4>
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">🥉</div>
                <div className="text-lg font-bold text-gray-700">12</div>
                <div className="text-xs text-gray-600">Bronze</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mb-1">🥈</div>
                <div className="text-lg font-bold text-gray-700">8</div>
                <div className="text-xs text-gray-600">Silver</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-1">🥇</div>
                <div className="text-lg font-bold text-blue-700">5</div>
                <div className="text-xs text-blue-600">Gold</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl mb-1">💎</div>
                <div className="text-lg font-bold text-purple-700">2</div>
                <div className="text-xs text-purple-600">Platinum</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl mb-1">💍</div>
                <div className="text-lg font-bold text-blue-700">1</div>
                <div className="text-xs text-blue-600">Diamond</div>
              </div>
            </div>
          </div>

          {/* Current Streaks */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Current Streaks</h4>
            {[
              { type: 'Daily Activities', current: 14, best: 23, active: true },
              { type: 'Weekly Goals Met', current: 3, best: 8, active: true },
              { type: 'Monthly Revenue Target', current: 2, best: 4, active: false },
              { type: 'Client Follow-ups', current: 7, best: 12, active: true }
            ].map((streak) => (
              <div key={streak.type} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${streak.active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <div className="text-sm font-medium">{streak.type}</div>
                    <div className="text-xs text-gray-500">Best: {streak.best} days</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{streak.current}</div>
                  <div className="text-xs text-gray-600">days</div>
                </div>
              </div>
            ))}
          </div>

          {/* Competitive Ranking */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700">Competitive Rank</h4>
              <Badge className="bg-purple-100 text-purple-700">#47 Regional</Badge>
            </div>
            <div className="text-xs text-gray-600 mb-3">
              You're in the top 15% of EliteKPI agents in your area based on performance streaks and achievements.
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{width: '85%'}} />
              </div>
              <span className="text-xs font-medium text-purple-700">85%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Level Progress */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">{agentLevel.title}</CardTitle>
                <p className="text-sm text-gray-600">Level {agentLevel.level}</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {totalPoints} pts
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {agentLevel.level + 1}</span>
              <span>{agentLevel.pointsToNext} pts to go</span>
            </div>
            <Progress 
              value={((agentLevel.pointsRequired - agentLevel.pointsToNext) / agentLevel.pointsRequired) * 100} 
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Streaks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            Performance Streaks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {streaks.map((streak, index) => (
              <div key={index} className="text-center p-4 border rounded-lg">
                <div className={`text-2xl font-bold ${streak.isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                  {streak.current}
                </div>
                <div className="text-sm text-gray-600 mb-1">{streak.type}</div>
                <div className="text-xs text-gray-500">
                  Best: {streak.longest} {streak.isActive && <span className="text-orange-500">🔥</span>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievement Categories */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All ({categoryStats.all})</TabsTrigger>
          <TabsTrigger value="sales">Sales ({categoryStats.sales})</TabsTrigger>
          <TabsTrigger value="activity">Activity ({categoryStats.activity})</TabsTrigger>
          <TabsTrigger value="time">Time ({categoryStats.time})</TabsTrigger>
          <TabsTrigger value="streak">Streaks ({categoryStats.streak})</TabsTrigger>
          <TabsTrigger value="milestone">Milestones ({categoryStats.milestone})</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`relative overflow-hidden ${achievement.isUnlocked ? 'ring-2 ring-green-200 bg-green-50/30' : 'opacity-75'}`}
              >
                {achievement.isUnlocked && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${achievement.isUnlocked ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <achievement.icon className={`h-6 w-6 ${achievement.isUnlocked ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-base">{achievement.title}</CardTitle>
                        <Badge variant="outline" className={getTierColor(achievement.tier)}>
                          {getTierIcon(achievement.tier)} {achievement.tier}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">
                          {Math.min(achievement.currentProgress, achievement.requirement).toLocaleString()} / {achievement.requirement.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.currentProgress / achievement.requirement) * 100} 
                        className="h-2"
                      />
                    </div>

                    {/* Points and Status */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{achievement.points} pts</span>
                      </div>
                      {achievement.isUnlocked ? (
                        <Badge variant="default" className="bg-green-600">Unlocked</Badge>
                      ) : (
                        <Badge variant="secondary">Locked</Badge>
                      )}
                    </div>

                    {achievement.isUnlocked && achievement.unlockedDate && (
                      <div className="text-xs text-gray-500">
                        Unlocked {achievement.unlockedDate}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{achievements.filter(a => a.isUnlocked).length}</div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{totalPoints}</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Flame className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{streaks.filter(s => s.isActive).length}</div>
            <div className="text-sm text-gray-600">Active Streaks</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold">{agentLevel.level}</div>
            <div className="text-sm text-gray-600">Agent Level</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Achievement Celebration Modal */}
      <AchievementCelebration
        achievement={currentCelebration}
        isOpen={isCelebrationOpen}
        onClose={closeCelebration}
      />
    </div>
  );
}