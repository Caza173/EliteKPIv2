import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAchievementCelebration } from "@/hooks/useAchievementCelebration";
import AchievementCelebration from "@/components/achievements/achievement-celebration";
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
  CheckCircle,
  ChevronUp,
  ChevronDown,
  Mail,
  X,
  Send,
  Plus,
  Calendar,
  Eye,
  Search,
  User
} from "lucide-react";
import type { DashboardMetrics } from "@shared/schema";
import { format, differenceInDays } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

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

interface Agent {
  id: string;
  name: string;
  title: string;
  level: number;
  totalPoints: number;
  rank: number;
  previousRank: number;
  metrics: {
    propertiesClosed: number;
    totalRevenue: number;
    totalVolume: number;
    activitiesCompleted: number;
    ytdHours: number;
    currentStreak: number;
  };
  badges: string[];
  location: string;
  joinedDate: string;
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

interface LeaderboardData {
  currentUser: Agent;
  topAgents: Agent[];
  nearbyAgents: Agent[];
  totalAgents: number;
}

export default function CompetitionHub() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [challengeType, setChallengeType] = useState("");
  const [newCompetition, setNewCompetition] = useState({
    title: '',
    description: '',
    type: 'sales_volume',
    startDate: '',
    endDate: '',
    targetValue: '',
    prize: '',
    rules: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [viewParticipantsCompetition, setViewParticipantsCompetition] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { 
    currentCelebration, 
    isCelebrationOpen, 
    closeCelebration, 
    triggerCelebration 
  } = useAchievementCelebration();

  // Fetch data
  const { data: achievementsData, isLoading: achievementsLoading } = useQuery({
    queryKey: ["/api/achievements"],
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: [`/api/leaderboard/${selectedPeriod}/rank`],
  });

  const { data: challengesData } = useQuery({
    queryKey: [`/api/leaderboard/${selectedPeriod}/challenges`],
  });

  // Fetch office competitions
  const { data: competitions = [] } = useQuery({
    queryKey: ['/api/competitions'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/competitions', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          if (response.status === 401) {
            return [];
          }
          throw new Error('Failed to fetch competitions');
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching competitions:', error);
        return [];
      }
    }
  });

  // Fetch participants for selected competition
  const { data: participants = [] } = useQuery({
    queryKey: ['/api/competitions', viewParticipantsCompetition?.id, 'leaderboard'],
    enabled: !!viewParticipantsCompetition?.id,
  });

  const achievements: Achievement[] = (achievementsData as any)?.achievements || [];
  const agentLevel: AgentLevel = (achievementsData as any)?.agentLevel || {
    level: 1,
    title: "Rookie Agent",
    totalPoints: 0,
    pointsToNext: 1000,
    pointsRequired: 1000
  };
  const streaks: PerformanceStreak[] = (achievementsData as any)?.streaks || [];

  const currentUser: Agent = (leaderboardData as any)?.currentUser || {
    id: "current",
    name: "Loading...",
    title: "Agent",
    level: 1,
    totalPoints: 0,
    rank: 0,
    previousRank: 0,
    metrics: {
      propertiesClosed: 0,
      totalRevenue: 0,
      totalVolume: 0,
      activitiesCompleted: 0,
      ytdHours: 0,
      currentStreak: 0
    },
    badges: [],
    location: "",
    joinedDate: ""
  };

  const topAgents: Agent[] = (leaderboardData as any)?.topAgents || [];
  const nearbyAgents: Agent[] = (leaderboardData as any)?.nearbyAgents || [];

  // Category filters
  const categoryFilters = [
    { value: "all", label: "All", icon: Trophy },
    { value: "sales", label: "Sales", icon: DollarSign },
    { value: "activity", label: "Activity", icon: Activity },
    { value: "time", label: "Time", icon: Clock },
    { value: "streak", label: "Streaks", icon: Flame },
    { value: "milestone", label: "Milestones", icon: Star }
  ];

  const filteredAchievements = selectedCategory === "all" 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const totalCount = achievements.length;

  const tierColors = {
    bronze: "from-orange-600 to-orange-800",
    silver: "from-gray-400 to-gray-600", 
    gold: "from-blue-400 to-blue-600",
    platinum: "from-purple-400 to-purple-600",
    diamond: "from-blue-400 to-blue-600"
  };

  const getRankChangeIcon = (current: number, previous: number) => {
    if (current < previous) return <ChevronUp className="h-4 w-4 text-green-500" />;
    if (current > previous) return <ChevronDown className="h-4 w-4 text-red-500" />;
    return null;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCompetitionType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'upcoming': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeCompetitions = competitions.filter((c: any) => c.status === 'active');
  const upcomingCompetitions = competitions.filter((c: any) => c.status === 'upcoming');
  const completedCompetitions = competitions.filter((c: any) => c.status === 'completed');

  // Search functionality
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const results = await response.json();
        setSearchResults(results);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/profile`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const profile = await response.json();
        setSelectedUser(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      toast({
        title: "Error",
        description: "Failed to load user profile.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayedSearch);
  }, [searchQuery]);

  const inviteChallenge = useMutation({
    mutationFn: async (challengeData: any) => {
      const response = await fetch('/api/challenges/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(challengeData),
      });
      if (!response.ok) throw new Error('Failed to send challenge');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Challenge Sent!",
        description: "Your challenge invitation has been sent successfully.",
      });
      setInviteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send challenge invitation.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competition Hub</h1>
          <p className="text-gray-600">Track your achievements and compete with other agents</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ytd">Year to Date</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="daily">Today</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Your Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Level & Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-blue-500" />
                  Agent Level
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{agentLevel.level}</div>
                  <div className="text-lg text-gray-600">{agentLevel.title}</div>
                  <div className="text-sm text-gray-500">{agentLevel.totalPoints.toLocaleString()} total points</div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to Level {agentLevel.level + 1}</span>
                    <span>{agentLevel.pointsToNext.toLocaleString()} points needed</span>
                  </div>
                  <Progress 
                    value={((agentLevel.pointsRequired - agentLevel.pointsToNext) / agentLevel.pointsRequired) * 100} 
                    className="h-3"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Current Rank */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-blue-500" />
                  Your Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900">#{currentUser.rank}</span>
                    {getRankChangeIcon(currentUser.rank, currentUser.previousRank)}
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    {currentUser.rank < currentUser.previousRank ? 
                      `Up ${currentUser.previousRank - currentUser.rank} positions` :
                      currentUser.rank > currentUser.previousRank ?
                      `Down ${currentUser.rank - currentUser.previousRank} positions` :
                      'No change from last period'
                    }
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{formatCurrency(currentUser.metrics.totalRevenue)}</div>
                      <div className="text-xs text-gray-500">Revenue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">{currentUser.metrics.propertiesClosed}</div>
                      <div className="text-xs text-gray-500">Properties Closed</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Achievements & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-purple-500" />
                    Recent Achievements
                  </span>
                  <Badge variant="secondary">{unlockedCount}/{totalCount}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {achievements
                    .filter(a => a.isUnlocked)
                    .slice(0, 5)
                    .map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 rounded-lg bg-gray-50">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tierColors[achievement.tier]} flex items-center justify-center flex-shrink-0`}>
                          <achievement.icon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{achievement.title}</div>
                          <div className="text-xs text-gray-500 truncate">{achievement.description}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">{achievement.tier}</Badge>
                      </div>
                    ))}
                  {achievements.filter(a => a.isUnlocked).length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      No achievements unlocked yet. Keep working to earn your first badge!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top 3 Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topAgents.slice(0, 3).map((agent, index) => (
                    <div key={agent.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-gray-500">{formatCurrency(agent.metrics.totalRevenue)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{agent.totalPoints}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categoryFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={selectedCategory === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(filter.value)}
                className="flex items-center gap-2"
              >
                <filter.icon className="h-4 w-4" />
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`group relative overflow-hidden bg-white border border-gray-200 rounded-xl transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] ${
                  achievement.isUnlocked ? 'shadow-md' : 'opacity-90'
                }`}
              >
                <CardContent className="p-6">
                  {/* Header with Icon and Tier Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      achievement.isUnlocked 
                        ? `bg-gradient-to-br ${tierColors[achievement.tier]}` 
                        : 'bg-gray-200'
                    }`}>
                      <achievement.icon className={`h-6 w-6 transition-all duration-300 ${
                        achievement.isUnlocked ? 'text-white' : 'text-gray-400'
                      }`} />
                    </div>
                    
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium uppercase tracking-wide ${
                      achievement.tier === 'bronze' ? 'bg-orange-100 text-orange-800' :
                      achievement.tier === 'silver' ? 'bg-gray-100 text-gray-800' :
                      achievement.tier === 'gold' ? 'bg-blue-100 text-blue-800' :
                      achievement.tier === 'platinum' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {achievement.tier === 'bronze' && '🥉'}
                      {achievement.tier === 'silver' && '🥈'}
                      {achievement.tier === 'gold' && '🥇'}
                      {achievement.tier === 'platinum' && '💎'}
                      {achievement.tier === 'diamond' && '💎'}
                      {' '}{achievement.tier}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{achievement.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{achievement.description}</p>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-900">
                        {achievement.isUnlocked ? achievement.requirement : achievement.currentProgress} / {achievement.requirement}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ease-out ${
                          achievement.isUnlocked 
                            ? 'bg-gradient-to-r from-green-400 to-green-600' 
                            : `bg-gradient-to-r ${tierColors[achievement.tier]}`
                        }`}
                        style={{ 
                          width: `${achievement.isUnlocked ? 100 : (achievement.currentProgress / achievement.requirement) * 100}%`,
                        }}
                      >
                        {/* Animated shine effect */}
                        <div className="h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                      </div>
                    </div>
                  </div>

                  {/* Points and Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700">{achievement.points} pts</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {achievement.isUnlocked ? (
                        <div className="flex items-center gap-1 text-green-600 animate-pulse">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Unlocked</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-gray-500">
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          </div>
                          <span className="text-xs font-medium">Locked</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Completion Celebration */}
                  {achievement.isUnlocked && (
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute top-2 right-2 w-2 h-2 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                      <div className="absolute top-4 right-6 w-1 h-1 bg-green-400 rounded-full animate-bounce opacity-60"></div>
                      <div className="absolute bottom-4 left-4 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse opacity-50"></div>
                    </div>
                  )}

                  {/* Hover Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:translate-x-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Leaderboard Tab */}
        <TabsContent value="leaderboard" className="space-y-6">
          {/* User Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by name, email, or agent ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="input-search-users"
                  />
                </div>
                
                {/* Search Results */}
                {isSearching && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">Searching...</div>
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((user: any) => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{user.name || 'Unknown User'}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            <div className="text-xs text-gray-400">
                              {user.title || 'Real Estate Agent'} • Level {user.level || 1}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fetchUserProfile(user.id)}
                          data-testid={`button-view-profile-${user.id}`}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Profile
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className="text-center py-4">
                    <div className="text-sm text-gray-500">No agents found</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top 3 Podium */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center items-end gap-4 mb-6">
                {topAgents.slice(0, 3).map((agent, index) => (
                  <div key={agent.id} className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-2 rounded-full flex items-center justify-center ${
                      index === 0 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500' :
                      'bg-gradient-to-r from-orange-600 to-orange-800'
                    }`}>
                      {index === 0 ? <Crown className="h-8 w-8 text-white" /> :
                       index === 1 ? <Medal className="h-8 w-8 text-white" /> :
                       <Trophy className="h-6 w-6 text-white" />}
                    </div>
                    <div className="font-bold text-sm">{agent.name}</div>
                    <div className="text-xs text-gray-500">{formatCurrency(agent.metrics.totalRevenue)}</div>
                    <div className="text-xs font-medium">{agent.totalPoints} pts</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>All Rankings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {/* Current User */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {currentUser.rank}
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium bg-blue-100">
                        {currentUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{currentUser.name} (You)</div>
                      <div className="text-xs text-gray-600">{currentUser.location}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm">{formatCurrency(currentUser.metrics.totalRevenue)}</div>
                      <div className="text-xs text-gray-500">{currentUser.totalPoints} pts</div>
                    </div>
                    <div className="flex items-center">
                      {getRankChangeIcon(currentUser.rank, currentUser.previousRank)}
                    </div>
                  </div>
                </div>

                {/* Other Agents */}
                {nearbyAgents.map((agent) => (
                  <div key={agent.id} className="p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {agent.rank}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs font-medium">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-gray-600">{agent.location}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">{formatCurrency(agent.metrics.totalRevenue)}</div>
                        <div className="text-xs text-gray-500">{agent.totalPoints} pts</div>
                      </div>
                      <div className="flex items-center">
                        {getRankChangeIcon(agent.rank, agent.previousRank)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Challenges Tab */}
        <TabsContent value="challenges" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold">Active Challenges</h2>
              <p className="text-gray-600">Compete directly with other agents</p>
            </div>
            <Button onClick={() => setInviteModalOpen(true)}>
              <Send className="h-4 w-4 mr-2" />
              Create Challenge
            </Button>
          </div>

          {/* Active Challenges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(challengesData as any)?.challenges?.map((challenge: any) => (
              <Card key={challenge.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{challenge.title}</CardTitle>
                  <Badge variant={challenge.status === 'active' ? 'default' : 'secondary'}>
                    {challenge.status}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600">{challenge.description}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Prize: {formatCurrency(challenge.prize)}</span>
                    <span className="text-sm text-gray-500">Ends {new Date(challenge.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="space-y-2">
                    {challenge.participants.map((participant: any, index: number) => (
                      <div key={participant.id} className="flex justify-between items-center text-sm">
                        <span>{participant.name}</span>
                        <span className="font-medium">{formatCurrency(participant.currentValue)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )) || (
              <div className="col-span-2 text-center py-8 text-gray-500">
                No active challenges. Create one to get started!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Challenge Invitation Modal */}
      <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Challenge</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="challenge-title">Challenge Title</Label>
              <Input 
                id="challenge-title" 
                placeholder="Monthly Revenue Sprint"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="agent-email">Invite Agent (Email)</Label>
              <Input 
                id="agent-email" 
                type="email" 
                placeholder="agent@example.com"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="target-metric">Metric</Label>
                <Select defaultValue="revenue">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="sales">Properties Closed</SelectItem>
                    <SelectItem value="volume">Sales Volume</SelectItem>
                    <SelectItem value="calls">Calls Made</SelectItem>
                    <SelectItem value="appointments">Appointments Set</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select defaultValue="1">
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Month</SelectItem>
                    <SelectItem value="2">2 Months</SelectItem>
                    <SelectItem value="3">3 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="prize">Prize Amount ($)</Label>
              <Input 
                id="prize" 
                type="number" 
                placeholder="500"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea 
                id="message" 
                placeholder="Let's see who can close more deals this month!"
                className="mt-1"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button 
                className="flex-1" 
                onClick={() => {
                  toast({
                    title: "Challenge Created!",
                    description: "Your challenge invitation has been sent.",
                  });
                  setInviteModalOpen(false);
                }}
              >
                Send Challenge
              </Button>
              <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback>
                  {selectedUser?.name?.charAt(0)?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-bold">{selectedUser?.name || 'Unknown User'}</div>
                <div className="text-sm text-gray-500 font-normal">{selectedUser?.email}</div>
              </div>
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              {/* User Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">{selectedUser.level || 1}</div>
                    <div className="text-sm text-gray-600">Agent Level</div>
                    <div className="text-xs text-gray-500">{selectedUser.title || 'Real Estate Agent'}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(selectedUser.totalRevenue || 0)}</div>
                    <div className="text-sm text-gray-600">Total Revenue</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">{selectedUser.totalSales || 0}</div>
                    <div className="text-sm text-gray-600">Total Sales</div>
                  </CardContent>
                </Card>
              </div>

              {/* User Achievements */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Achievements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedUser.achievements?.slice(0, 6).map((achievement: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${tierColors[achievement.tier]} flex items-center justify-center`}>
                        <Trophy className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{achievement.title}</div>
                        <div className="text-xs text-gray-500">{achievement.tier} • {achievement.points} pts</div>
                      </div>
                      {achievement.isUnlocked && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
                {selectedUser.achievements?.length > 6 && (
                  <div className="text-center mt-4">
                    <div className="text-sm text-gray-500">
                      +{selectedUser.achievements.length - 6} more achievements
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{selectedUser.conversionRate || 0}%</div>
                    <div className="text-xs text-gray-600">Conversion Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{selectedUser.avgDaysOnMarket || 0}</div>
                    <div className="text-xs text-gray-600">Avg Days on Market</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{selectedUser.clientSatisfaction || 0}%</div>
                    <div className="text-xs text-gray-600">Client Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-orange-600">#{selectedUser.rank || 'N/A'}</div>
                    <div className="text-xs text-gray-600">Regional Rank</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Achievement Celebration Modal */}
      <AchievementCelebration
        achievement={currentCelebration}
        isOpen={isCelebrationOpen}
        onClose={closeCelebration}
      />
    </div>
  );
}