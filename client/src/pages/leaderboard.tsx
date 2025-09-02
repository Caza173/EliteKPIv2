import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  DollarSign, 
  Home, 
  Users,
  Target,
  Flame,
  ChevronUp,
  ChevronDown,
  Award,
  Mail,
  X,
  Send
} from "lucide-react";

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

interface LeaderboardData {
  currentUser: Agent;
  topAgents: Agent[];
  nearbyAgents: Agent[];
  totalAgents: number;
}

// Agent Invitation Modal Component
interface InviteAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeType: string;
}

function InviteAgentModal({ isOpen, onClose, challengeType }: InviteAgentModalProps) {
  const [agentEmail, setAgentEmail] = useState("");
  const [personalMessage, setPersonalMessage] = useState("");
  const [challengeTitle, setChallengeTitle] = useState("");
  const [challengeDuration, setChallengeDuration] = useState("1");
  const [targetMetric, setTargetMetric] = useState("revenue");
  const [targetAmount, setTargetAmount] = useState("");
  const [rewardAmount, setRewardAmount] = useState("");
  const { toast } = useToast();

  const challengeNames = {
    activity: "Top Activity Challenge",
    revenue: "Revenue Sprint",
    calls: "Daily Call Blitz",
    listings: "Weekly Listing Challenge",
    showings: "Monthly Showing Marathon",
    efficiency: "Time Efficiency Contest",
    custom: "Custom Challenge",
  };

  const metricOptions = [
    { value: "revenue", label: "Total Revenue" },
    { value: "sales", label: "Properties Closed" },
    { value: "activities", label: "Activities Completed" },
    { value: "calls", label: "Client Calls Made" },
    { value: "showings", label: "Showings Conducted" },
    { value: "listings", label: "New Listings" },
    { value: "hours", label: "Hours Logged" },
  ];

  const handleSendInvitation = async () => {
    if (!agentEmail) {
      toast({
        title: "Error",
        description: "Please enter an agent's email address",
        variant: "destructive",
      });
      return;
    }

    if (challengeType === 'custom' && (!challengeTitle || !targetAmount)) {
      toast({
        title: "Error",
        description: "Please fill in all custom challenge fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch('/api/challenge-invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          agentEmail,
          personalMessage,
          challengeType,
          challengeTitle,
          targetMetric,
          targetAmount,
          challengeDuration
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Challenge Created & Invitation Sent!",
          description: `${result.challengeName} invitation sent to ${agentEmail}`,
        });
        
        // Reset form and close modal
        setAgentEmail("");
        setPersonalMessage("");
        setChallengeTitle("");
        setChallengeDuration("1");
        setTargetMetric("revenue");
        setTargetAmount("");
        setRewardAmount("");
        onClose();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to send challenge invitation",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error sending challenge invitation:', error);
      toast({
        title: "Error", 
        description: "Failed to send challenge invitation. Please try again.",
        variant: "destructive",
      });
    }
  };

  const challengeName = challengeNames[challengeType as keyof typeof challengeNames] || "Challenge";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={challengeType === 'custom' ? "sm:max-w-lg" : "sm:max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Invite Agent to Challenge
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm font-medium text-blue-800">Challenge: {challengeName}</p>
            <p className="text-xs text-blue-600 mt-1">
              Invite a fellow agent to compete with you in this challenge
            </p>
          </div>

          {challengeType === 'custom' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="challengeTitle">Challenge Title</Label>
                <Input
                  id="challengeTitle"
                  placeholder="e.g., Q4 Revenue Race"
                  value={challengeTitle}
                  onChange={(e) => setChallengeTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (weeks)</Label>
                  <Select value={challengeDuration} onValueChange={setChallengeDuration}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Week</SelectItem>
                      <SelectItem value="2">2 Weeks</SelectItem>
                      <SelectItem value="4">1 Month</SelectItem>
                      <SelectItem value="12">3 Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metric">Target Metric</Label>
                  <Select value={targetMetric} onValueChange={setTargetMetric}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {metricOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="target">Target Amount</Label>
                  <Input
                    id="target"
                    type="number"
                    placeholder="e.g., 50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reward">Reward ($)</Label>
                  <Input
                    id="reward"
                    type="number"
                    placeholder="e.g., 500"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Agent Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@realestate.com"
              value={agentEmail}
              onChange={(e) => setAgentEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Personal Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Hey! Want to compete with me in this challenge? Let's see who can come out on top!"
              value={personalMessage}
              onChange={(e) => setPersonalMessage(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSendInvitation} className="gap-2">
              <Send className="h-4 w-4" />
              Send Invitation
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Leaderboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("ytd");
  const [selectedCategory, setSelectedCategory] = useState("rank");
  const [selectedState, setSelectedState] = useState("all");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock subscription data - in real app, this would come from user context/API
  const currentSubscription = {
    plan: "professional" // starter, professional, enterprise
  };

  // Mock leaderboard data - would come from API
  const mockLeaderboardData: LeaderboardData = {
    currentUser: {
      id: "current",
      name: "You",
      title: "Rising Star",
      level: 3,
      totalPoints: 3250,
      rank: 42,
      previousRank: 47,
      metrics: {
        propertiesClosed: 11,
        totalRevenue: 89500,
        totalVolume: 3850000,
        activitiesCompleted: 189,
        ytdHours: 285,
        currentStreak: 7
      },
      badges: ["first_sale", "deal_closer", "networker"],
      location: "Austin, TX",
      joinedDate: "2024-03-15"
    },
    topAgents: [
      {
        id: "1",
        name: "Sarah Johnson",
        title: "Elite Agent", 
        level: 8,
        totalPoints: 8450,
        rank: 1,
        previousRank: 1,
        metrics: {
          propertiesClosed: 34,
          totalRevenue: 285000,
          totalVolume: 12500000,
          activitiesCompleted: 520,
          ytdHours: 580,
          currentStreak: 28
        },
        badges: ["elite_closer", "million_volume", "consistency_king"],
        location: "San Francisco, CA",
        joinedDate: "2023-01-12"
      },
      {
        id: "2", 
        name: "Michael Chen",
        title: "Top Producer",
        level: 7,
        totalPoints: 7890,
        rank: 2,
        previousRank: 3,
        metrics: {
          propertiesClosed: 29,
          totalRevenue: 220000,
          totalVolume: 9800000,
          activitiesCompleted: 445,
          ytdHours: 520,
          currentStreak: 15
        },
        badges: ["sales_master", "six_figure", "activity_master"],
        location: "Seattle, WA",
        joinedDate: "2023-02-28"
      },
      {
        id: "3",
        name: "Jessica Rodriguez",
        title: "Market Leader",
        level: 6,
        totalPoints: 6750,
        rank: 3,
        previousRank: 2,
        metrics: {
          propertiesClosed: 25,
          totalRevenue: 195000,
          totalVolume: 8200000,
          activitiesCompleted: 380,
          ytdHours: 465,
          currentStreak: 12
        },
        badges: ["top_producer", "quarter_million", "networker"],
        location: "Miami, FL", 
        joinedDate: "2023-04-10"
      },
      {
        id: "4",
        name: "David Thompson",
        title: "Sales Champion",
        level: 6,
        totalPoints: 6420,
        rank: 4,
        previousRank: 5,
        metrics: {
          propertiesClosed: 23,
          totalRevenue: 175000,
          totalVolume: 7650000,
          activitiesCompleted: 365,
          ytdHours: 445,
          currentStreak: 9
        },
        badges: ["deal_master", "efficiency_expert", "client_favorite"],
        location: "Denver, CO",
        joinedDate: "2023-03-22"
      },
      {
        id: "5",
        name: "Lisa Park",
        title: "Rising Star",
        level: 5,
        totalPoints: 5980,
        rank: 5,
        previousRank: 4,
        metrics: {
          propertiesClosed: 21,
          totalRevenue: 165000,
          totalVolume: 6900000,
          activitiesCompleted: 342,
          ytdHours: 425,
          currentStreak: 18
        },
        badges: ["consistent_performer", "rookie_crusher", "time_optimizer"],
        location: "Phoenix, AZ",
        joinedDate: "2023-05-15"
      },
      {
        id: "6",
        name: "Marcus Williams",
        title: "Market Expert",
        level: 5,
        totalPoints: 5750,
        rank: 6,
        previousRank: 6,
        metrics: {
          propertiesClosed: 19,
          totalRevenue: 152000,
          totalVolume: 6400000,
          activitiesCompleted: 318,
          ytdHours: 398,
          currentStreak: 11
        },
        badges: ["luxury_specialist", "market_analyst", "deal_closer"],
        location: "Atlanta, GA",
        joinedDate: "2023-04-03"
      },
      {
        id: "7",
        name: "Jennifer Lee",
        title: "Performance Pro",
        level: 4,
        totalPoints: 5420,
        rank: 7,
        previousRank: 8,
        metrics: {
          propertiesClosed: 18,
          totalRevenue: 142000,
          totalVolume: 5850000,
          activitiesCompleted: 295,
          ytdHours: 375,
          currentStreak: 14
        },
        badges: ["activity_champion", "client_whisperer", "steady_eddie"],
        location: "Nashville, TN",
        joinedDate: "2023-06-08"
      },
      {
        id: "8",
        name: "Alex Martinez",
        title: "Deal Maker",
        level: 4,
        totalPoints: 5180,
        rank: 8,
        previousRank: 7,
        metrics: {
          propertiesClosed: 16,
          totalRevenue: 135000,
          totalVolume: 5420000,
          activitiesCompleted: 278,
          ytdHours: 356,
          currentStreak: 6
        },
        badges: ["negotiation_ninja", "first_time_friend", "referral_magnet"],
        location: "Las Vegas, NV",
        joinedDate: "2023-07-12"
      },
      {
        id: "9",
        name: "Rachel Turner",
        title: "Growth Leader",
        level: 4,
        totalPoints: 4920,
        rank: 9,
        previousRank: 10,
        metrics: {
          propertiesClosed: 15,
          totalRevenue: 128000,
          totalVolume: 5100000,
          activitiesCompleted: 265,
          ytdHours: 342,
          currentStreak: 8
        },
        badges: ["social_seller", "tech_savvy", "community_builder"],
        location: "Portland, OR",
        joinedDate: "2023-08-19"
      },
      {
        id: "10",
        name: "Kevin Brown",
        title: "Steady Performer",
        level: 4,
        totalPoints: 4680,
        rank: 10,
        previousRank: 9,
        metrics: {
          propertiesClosed: 14,
          totalRevenue: 118000,
          totalVolume: 4750000,
          activitiesCompleted: 248,
          ytdHours: 325,
          currentStreak: 5
        },
        badges: ["reliable_closer", "weekend_warrior", "detail_oriented"],
        location: "Charlotte, NC",
        joinedDate: "2023-09-05"
      },
      {
        id: "11",
        name: "Emily Davis",
        title: "Rising Talent",
        level: 3,
        totalPoints: 4420,
        rank: 11,
        previousRank: 13,
        metrics: {
          propertiesClosed: 13,
          totalRevenue: 108000,
          totalVolume: 4350000,
          activitiesCompleted: 235,
          ytdHours: 312,
          currentStreak: 10
        },
        badges: ["fast_learner", "client_advocate", "goal_crusher"],
        location: "Raleigh, NC",
        joinedDate: "2023-10-22"
      },
      {
        id: "12",
        name: "Ryan O'Connor",
        title: "Market Mover",
        level: 3,
        totalPoints: 4150,
        rank: 12,
        previousRank: 11,
        metrics: {
          propertiesClosed: 12,
          totalRevenue: 98000,
          totalVolume: 4100000,
          activitiesCompleted: 220,
          ytdHours: 295,
          currentStreak: 7
        },
        badges: ["buyer_specialist", "market_maven", "hustle_hero"],
        location: "Sacramento, CA",
        joinedDate: "2023-11-14"
      },
      {
        id: "13",
        name: "Samantha Wright",
        title: "Deal Hunter",
        level: 3,
        totalPoints: 3890,
        rank: 13,
        previousRank: 12,
        metrics: {
          propertiesClosed: 11,
          totalRevenue: 89000,
          totalVolume: 3850000,
          activitiesCompleted: 205,
          ytdHours: 278,
          currentStreak: 4
        },
        badges: ["investment_insider", "data_driven", "relationship_builder"],
        location: "San Diego, CA",
        joinedDate: "2024-01-08"
      },
      {
        id: "14",
        name: "Brandon Clark",
        title: "Sales Specialist",
        level: 3,
        totalPoints: 3650,
        rank: 14,
        previousRank: 15,
        metrics: {
          propertiesClosed: 10,
          totalRevenue: 82000,
          totalVolume: 3600000,
          activitiesCompleted: 192,
          ytdHours: 265,
          currentStreak: 6
        },
        badges: ["new_construction", "follow_up_master", "persistence_pays"],
        location: "Tampa, FL",
        joinedDate: "2024-02-12"
      },
      {
        id: "15",
        name: "Michelle Taylor",
        title: "Growth Agent",
        level: 3,
        totalPoints: 3420,
        rank: 15,
        previousRank: 14,
        metrics: {
          propertiesClosed: 9,
          totalRevenue: 75000,
          totalVolume: 3350000,
          activitiesCompleted: 178,
          ytdHours: 252,
          currentStreak: 9
        },
        badges: ["condo_queen", "first_time_helper", "communication_king"],
        location: "Orlando, FL",
        joinedDate: "2024-03-05"
      }
    ],
    nearbyAgents: [
      {
        id: "40",
        name: "Jonathan Miller",
        title: "Steady Climber",
        level: 3,
        totalPoints: 3150,
        rank: 40,
        previousRank: 43,
        metrics: {
          propertiesClosed: 8,
          totalRevenue: 72000,
          totalVolume: 3250000,
          activitiesCompleted: 182,
          ytdHours: 268,
          currentStreak: 5
        },
        badges: ["weekend_warrior", "luxury_trainee", "referral_rookie"],
        location: "Austin, TX",
        joinedDate: "2024-01-22"
      },
      {
        id: "41",
        name: "Catherine Liu",
        title: "Rising Star",
        level: 3,
        totalPoints: 3080,
        rank: 41,
        previousRank: 39,
        metrics: {
          propertiesClosed: 7,
          totalRevenue: 68500,
          totalVolume: 3150000,
          activitiesCompleted: 175,
          ytdHours: 261,
          currentStreak: 12
        },
        badges: ["social_media_star", "tech_adopter", "client_favorite"],
        location: "Austin, TX",
        joinedDate: "2024-02-05"
      },
      {
        id: "43",
        name: "Daniel Cooper",
        title: "Determined Agent",
        level: 3,
        totalPoints: 2950,
        rank: 43,
        previousRank: 45,
        metrics: {
          propertiesClosed: 6,
          totalRevenue: 64200,
          totalVolume: 3050000,
          activitiesCompleted: 168,
          ytdHours: 255,
          currentStreak: 3
        },
        badges: ["early_riser", "investment_curious", "local_expert"],
        location: "Austin, TX",
        joinedDate: "2024-03-12"
      },
      {
        id: "44",
        name: "Nicole Peterson",
        title: "Ambitious Rookie",
        level: 2,
        totalPoints: 2920,
        rank: 44,
        previousRank: 46,
        metrics: {
          propertiesClosed: 6,
          totalRevenue: 62800,
          totalVolume: 2980000,
          activitiesCompleted: 164,
          ytdHours: 248,
          currentStreak: 7
        },
        badges: ["first_sale", "detail_detective", "follow_up_champion"],
        location: "Austin, TX",
        joinedDate: "2024-04-01"
      },
      {
        id: "45",
        name: "Robert Kim",
        title: "Rising Star",
        level: 3,
        totalPoints: 2890,
        rank: 45,
        previousRank: 48,
        metrics: {
          propertiesClosed: 9,
          totalRevenue: 65400,
          totalVolume: 3100000,
          activitiesCompleted: 167,
          ytdHours: 258,
          currentStreak: 6
        },
        badges: ["deal_closer", "networker", "time_tracker"],
        location: "Austin, TX",
        joinedDate: "2024-02-20"
      },
      {
        id: "46",
        name: "Amanda Foster",
        title: "Rising Star", 
        level: 3,
        totalPoints: 2820,
        rank: 46,
        previousRank: 44,
        metrics: {
          propertiesClosed: 7,
          totalRevenue: 58900,
          totalVolume: 2950000,
          activitiesCompleted: 189,
          ytdHours: 276,
          currentStreak: 8
        },
        badges: ["first_sale", "busy_agent", "dedicated_worker"],
        location: "Austin, TX",
        joinedDate: "2024-01-08"
      },
      {
        id: "47",
        name: "Carlos Rodriguez",
        title: "Motivated Newcomer",
        level: 2,
        totalPoints: 2750,
        rank: 47,
        previousRank: 49,
        metrics: {
          propertiesClosed: 5,
          totalRevenue: 55600,
          totalVolume: 2850000,
          activitiesCompleted: 158,
          ytdHours: 242,
          currentStreak: 4
        },
        badges: ["bilingual_bonus", "community_connector", "hustle_hero"],
        location: "Austin, TX",
        joinedDate: "2024-04-18"
      },
      {
        id: "48",
        name: "Ashley Graham",
        title: "Goal Getter",
        level: 2,
        totalPoints: 2680,
        rank: 48,
        previousRank: 47,
        metrics: {
          propertiesClosed: 5,
          totalRevenue: 53200,
          totalVolume: 2750000,
          activitiesCompleted: 152,
          ytdHours: 235,
          currentStreak: 2
        },
        badges: ["new_agent", "social_connector", "learning_machine"],
        location: "Austin, TX",
        joinedDate: "2024-05-02"
      }
    ],
    totalAgents: 2847
  };

  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["/api/leaderboard", selectedPeriod, selectedCategory, selectedState],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedState !== 'all') {
        params.set('state', selectedState);
      }
      const response = await fetch(`/api/leaderboard/${selectedPeriod}/${selectedCategory}?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }
      return response.json();
    },
    select: (data) => {
      // If API returns empty or error, fallback to mock data for demo
      if (!data || !data.topAgents) {
        return mockLeaderboardData;
      }
      return data;
    },
  });

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-blue-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />;
    return null;
  };

  const getRankChange = (current: number, previous: number) => {
    const change = previous - current;
    if (change > 0) {
      return (
        <div className="flex items-center text-green-600 text-xs">
          <ChevronUp className="h-3 w-3" />
          {change}
        </div>
      );
    } else if (change < 0) {
      return (
        <div className="flex items-center text-red-600 text-xs">
          <ChevronDown className="h-3 w-3" />
          {Math.abs(change)}
        </div>
      );
    }
    return <div className="text-gray-400 text-xs">-</div>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-gray-200 h-32 rounded-lg"></div>
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-200 h-16 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const currentUser = leaderboardData?.currentUser;
  const topAgents = leaderboardData?.topAgents || [];
  const nearbyAgents = leaderboardData?.nearbyAgents || [];

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Leaderboard</h1>
          <p className="text-sm text-gray-600">
            {selectedState === 'all' ? 'Compete with top agents across the nation' : `Top agents in ${selectedState}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {leaderboardData?.totalAgents || 0} Active Agents
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Location:</label>
          <Select value={selectedState} onValueChange={setSelectedState}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All States" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              <SelectItem value="AL">Alabama</SelectItem>
              <SelectItem value="AK">Alaska</SelectItem>
              <SelectItem value="AZ">Arizona</SelectItem>
              <SelectItem value="AR">Arkansas</SelectItem>
              <SelectItem value="CA">California</SelectItem>
              <SelectItem value="CO">Colorado</SelectItem>
              <SelectItem value="CT">Connecticut</SelectItem>
              <SelectItem value="DE">Delaware</SelectItem>
              <SelectItem value="FL">Florida</SelectItem>
              <SelectItem value="GA">Georgia</SelectItem>
              <SelectItem value="HI">Hawaii</SelectItem>
              <SelectItem value="ID">Idaho</SelectItem>
              <SelectItem value="IL">Illinois</SelectItem>
              <SelectItem value="IN">Indiana</SelectItem>
              <SelectItem value="IA">Iowa</SelectItem>
              <SelectItem value="KS">Kansas</SelectItem>
              <SelectItem value="KY">Kentucky</SelectItem>
              <SelectItem value="LA">Louisiana</SelectItem>
              <SelectItem value="ME">Maine</SelectItem>
              <SelectItem value="MD">Maryland</SelectItem>
              <SelectItem value="MA">Massachusetts</SelectItem>
              <SelectItem value="MI">Michigan</SelectItem>
              <SelectItem value="MN">Minnesota</SelectItem>
              <SelectItem value="MS">Mississippi</SelectItem>
              <SelectItem value="MO">Missouri</SelectItem>
              <SelectItem value="MT">Montana</SelectItem>
              <SelectItem value="NE">Nebraska</SelectItem>
              <SelectItem value="NV">Nevada</SelectItem>
              <SelectItem value="NH">New Hampshire</SelectItem>
              <SelectItem value="NJ">New Jersey</SelectItem>
              <SelectItem value="NM">New Mexico</SelectItem>
              <SelectItem value="NY">New York</SelectItem>
              <SelectItem value="NC">North Carolina</SelectItem>
              <SelectItem value="ND">North Dakota</SelectItem>
              <SelectItem value="OH">Ohio</SelectItem>
              <SelectItem value="OK">Oklahoma</SelectItem>
              <SelectItem value="OR">Oregon</SelectItem>
              <SelectItem value="PA">Pennsylvania</SelectItem>
              <SelectItem value="RI">Rhode Island</SelectItem>
              <SelectItem value="SC">South Carolina</SelectItem>
              <SelectItem value="SD">South Dakota</SelectItem>
              <SelectItem value="TN">Tennessee</SelectItem>
              <SelectItem value="TX">Texas</SelectItem>
              <SelectItem value="UT">Utah</SelectItem>
              <SelectItem value="VT">Vermont</SelectItem>
              <SelectItem value="VA">Virginia</SelectItem>
              <SelectItem value="WA">Washington</SelectItem>
              <SelectItem value="WV">West Virginia</SelectItem>
              <SelectItem value="WI">Wisconsin</SelectItem>
              <SelectItem value="WY">Wyoming</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Your Ranking Card */}
      {currentUser && (
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-white">
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-lg">{currentUser.name}</div>
                  <div className="text-sm text-gray-600">{currentUser.title} • Level {currentUser.level}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">#{currentUser.rank}</span>
                  {getRankChange(currentUser.rank, currentUser.previousRank)}
                </div>
                <div className="text-sm text-gray-600">{currentUser.totalPoints.toLocaleString()} points</div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{currentUser.metrics.propertiesClosed}</div>
                <div className="text-xs text-gray-600">Sales</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">${(currentUser.metrics.totalVolume / 1000000).toFixed(1)}M</div>
                <div className="text-xs text-gray-600">Volume</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{currentUser.totalPoints.toLocaleString()}</div>
                <div className="text-xs text-gray-600">Points</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-500">{currentUser.metrics.currentStreak}</div>
                <div className="text-xs text-gray-600">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="rank">Rank</TabsTrigger>
          <TabsTrigger value="volume">Volume</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="points">Points</TabsTrigger>
          <TabsTrigger value="challenges" disabled={currentSubscription.plan === 'starter'}>
            Challenges {currentSubscription.plan === 'starter' && '🔒'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rank" className="space-y-4 mt-6">
          {/* Top 3 Podium */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-blue-500" />
                Top Performers - Rank
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topAgents.slice(0, 3).map((agent: Agent, index: number) => (
                  <div
                    key={agent.id}
                    className={`p-4 rounded-lg border-2 text-center ${
                      index === 0 ? 'border-blue-200 bg-blue-50' :
                      index === 1 ? 'border-gray-200 bg-gray-50' :
                      'border-orange-200 bg-orange-50'
                    }`}
                  >
                    <div className="flex justify-center mb-3">
                      {getRankIcon(agent.rank)}
                    </div>
                    <Avatar className="w-16 h-16 mx-auto mb-3">
                      <AvatarFallback className={
                        index === 0 ? 'bg-blue-500 text-white' :
                        index === 1 ? 'bg-gray-500 text-white' :
                        'bg-orange-500 text-white'
                      }>
                        {agent.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="font-bold">{agent.name}</div>
                    <div className="text-sm text-gray-600 mb-2">{agent.title}</div>
                    <div className="text-lg font-bold text-primary">{agent.totalPoints.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>National Rankings - By Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAgents.map((agent: Agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-12">
                        {getRankIcon(agent.rank)}
                        <span className="font-bold text-lg">#{agent.rank}</span>
                      </div>
                      <Avatar>
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-600">{agent.title} • {agent.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold">{agent.totalPoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${(agent.metrics.totalVolume / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-gray-500">volume</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{agent.metrics.propertiesClosed}</div>
                        <div className="text-xs text-gray-500">sales</div>
                      </div>
                      {getRankChange(agent.rank, agent.previousRank)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="volume" className="space-y-4 mt-6">
          {/* Volume Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Volume Leaders - Total Sales Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAgents.sort((a: Agent, b: Agent) => b.metrics.totalVolume - a.metrics.totalVolume).map((agent: Agent, index: number) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-12">
                        {index < 3 && getRankIcon(index + 1)}
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </div>
                      <Avatar>
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-600">{agent.title} • {agent.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-green-600">${(agent.metrics.totalVolume / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-gray-500">total volume</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{agent.metrics.propertiesClosed}</div>
                        <div className="text-xs text-gray-500">closed deals</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{agent.totalPoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4 mt-6">
          {/* Sales Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-500" />
                Sales Champions - Closed Deals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAgents.sort((a: Agent, b: Agent) => b.metrics.propertiesClosed - a.metrics.propertiesClosed).map((agent: Agent, index: number) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-12">
                        {index < 3 && getRankIcon(index + 1)}
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </div>
                      <Avatar>
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-600">{agent.title} • {agent.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-blue-600">{agent.metrics.propertiesClosed}</div>
                        <div className="text-xs text-gray-500">properties closed</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">${(agent.metrics.totalVolume / 1000000).toFixed(1)}M</div>
                        <div className="text-xs text-gray-500">total volume</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{agent.totalPoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="points" className="space-y-4 mt-6">
          {/* Points Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                Points Leaders - Achievement Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAgents.sort((a: Agent, b: Agent) => b.totalPoints - a.totalPoints).map((agent: Agent, index: number) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-12">
                        {index < 3 && getRankIcon(index + 1)}
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </div>
                      <Avatar>
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-600">{agent.title} • {agent.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{agent.totalPoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">achievement points</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-600">Level {agent.level}</div>
                        <div className="text-xs text-gray-500">agent level</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{agent.badges.length}</div>
                        <div className="text-xs text-gray-500">badges earned</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4 mt-6">
          {currentSubscription.plan === 'starter' ? (
            // Upgrade Message for Starter Users
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
                    <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Premium Feature</h2>
                    <p className="text-gray-600 mb-6">
                      Challenges are available with Professional and Enterprise plans.
                    </p>
                    <div className="space-y-3 text-sm text-gray-700 mb-6">
                      <p>🏆 Compete in daily, weekly, and monthly challenges</p>
                      <p>🎯 Invite other agents to custom competitions</p>
                      <p>🏅 Earn bonus points and exclusive rewards</p>
                      <p>📈 Track your performance against top agents</p>
                    </div>
                    <Button 
                      onClick={() => window.location.href = '/billing'}
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upgrade Your Plan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Challenges Content for Pro/Enterprise Users
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Active Challenges
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Daily Challenges */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Flame className="h-4 w-4 text-red-500" />
                    Daily Challenges
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border-2 border-red-200 bg-red-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-red-800">Daily Call Blitz</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">18 hours left</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedChallenge("calls");
                              setIsInviteModalOpen(true);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-red-700 mb-2">Make the most client calls today</p>
                      <div className="text-xs text-gray-600">
                        Current leader: <span className="font-bold">Alex Rodriguez</span> (23 calls)
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your progress: 8 calls • Reward: 150 bonus points
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Challenges */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-500" />
                    Weekly Challenges
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border-2 border-orange-200 bg-orange-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-orange-800">Top Activity Challenge</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">3 days left</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedChallenge("activity");
                              setIsInviteModalOpen(true);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-orange-700 mb-2">Complete the most client activities this week</p>
                      <div className="text-xs text-gray-600">
                        Current leader: <span className="font-bold">Sarah Johnson</span> (47 activities)
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your progress: 12 activities • Reward: 500 bonus points
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border-2 border-green-200 bg-green-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-green-800">Revenue Sprint</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">1 week left</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedChallenge("revenue");
                              setIsInviteModalOpen(true);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-green-700 mb-2">Highest revenue generated this week</p>
                      <div className="text-xs text-gray-600">
                        Current leader: <span className="font-bold">Michael Chen</span> ({formatCurrency(45000)})
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your progress: {formatCurrency(12500)} • Reward: 1000 bonus points
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-blue-800">Weekly Listing Challenge</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">5 days left</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedChallenge("listings");
                              setIsInviteModalOpen(true);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 mb-2">Secure the most new listings this week</p>
                      <div className="text-xs text-gray-600">
                        Current leader: <span className="font-bold">Maria Garcia</span> (3 listings)
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your progress: 1 listing • Reward: 750 bonus points
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border-2 border-purple-200 bg-purple-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-purple-800">Time Efficiency Contest</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">2 days left</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedChallenge("efficiency");
                              setIsInviteModalOpen(true);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-purple-700 mb-2">Highest revenue per hour worked</p>
                      <div className="text-xs text-gray-600">
                        Current leader: <span className="font-bold">David Kim</span> ($285/hour)
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your progress: $178/hour • Reward: 600 bonus points
                      </div>
                    </div>
                  </div>
                </div>

                {/* Monthly Challenges */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-500" />
                    Monthly Challenges
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border-2 border-blue-200 bg-blue-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-blue-800">Monthly Showing Marathon</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">12 days left</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedChallenge("showings");
                              setIsInviteModalOpen(true);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-blue-700 mb-2">Complete the most property showings this month</p>
                      <div className="text-xs text-gray-600">
                        Current leader: <span className="font-bold">Jennifer Lee</span> (47 showings)
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your progress: 18 showings • Reward: 1,200 bonus points
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border-2 border-indigo-200 bg-indigo-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-indigo-800">Million Dollar Month</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">12 days left</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedChallenge("revenue");
                              setIsInviteModalOpen(true);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-indigo-700 mb-2">Reach $1M in sales volume this month</p>
                      <div className="text-xs text-gray-600">
                        Current leader: <span className="font-bold">Robert Chen</span> ($847K)
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your progress: $312K • Reward: 2,000 bonus points
                      </div>
                    </div>
                  </div>
                </div>

                {/* Custom Challenges */}
                <div>
                  <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-500" />
                    Custom Challenges
                  </h3>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border-2 border-gray-200 bg-gray-50">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-bold text-gray-800">Team Building Contest</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Private</Badge>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedChallenge("custom");
                              setIsInviteModalOpen(true);
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Mail className="h-3 w-3 mr-1" />
                            Invite
                          </Button>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 mb-2">Office referral contest - Most agent-to-agent referrals</p>
                      <div className="text-xs text-gray-600">
                        Participants: 8 agents • Duration: 2 weeks
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Your progress: 2 referrals • Custom reward: Team dinner
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full h-12 border-dashed border-2 text-gray-500 hover:text-gray-700 hover:border-gray-400"
                      onClick={() => {
                        setSelectedChallenge("custom");
                        setIsInviteModalOpen(true);
                      }}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Create Custom Challenge
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-4 mt-6">
          {/* Activity Rankings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                Activity Leaders - Most Engaged Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topAgents.sort((a: Agent, b: Agent) => b.metrics.activitiesCompleted - a.metrics.activitiesCompleted).map((agent: Agent, index: number) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 w-12">
                        {index < 3 && getRankIcon(index + 1)}
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </div>
                      <Avatar>
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-gray-600">{agent.title} • {agent.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="font-bold text-purple-600">{agent.metrics.activitiesCompleted}</div>
                        <div className="text-xs text-gray-500">activities</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-orange-600">{agent.metrics.ytdHours}</div>
                        <div className="text-xs text-gray-500">hours logged</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-red-600">{agent.metrics.currentStreak}</div>
                        <div className="text-xs text-gray-500">day streak</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Nearby Competition */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Local Competition
              </CardTitle>
              <p className="text-sm text-gray-600">Agents in your area</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {nearbyAgents.map((agent: Agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm w-8">#{agent.rank}</span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{agent.name}</div>
                        <div className="text-xs text-gray-600">{agent.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-sm">{agent.totalPoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                      {getRankChange(agent.rank, agent.previousRank)}
                    </div>
                  </div>
                ))}
                
                {/* Current user in nearby list */}
                {currentUser && (
                  <div className="flex items-center justify-between p-3 rounded-lg border-2 border-primary bg-primary/5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-sm w-8">#{currentUser.rank}</span>
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-white text-xs">
                          {currentUser.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm">{currentUser.name} (You)</div>
                        <div className="text-xs text-gray-600">{currentUser.title}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-sm">{currentUser.totalPoints.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">points</div>
                      </div>
                      {getRankChange(currentUser.rank, currentUser.previousRank)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </TabsContent>
      </Tabs>

      {/* Agent Invitation Modal */}
      <InviteAgentModal 
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        challengeType={selectedChallenge}
      />
    </div>
  );
}