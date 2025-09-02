import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Users, Calendar, Target, Award, Plus, TrendingUp, Clock, DollarSign, Star, Eye } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface Competition {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  targetValue?: number;
  prize: string;
  participantCount: number;
  winnerId?: string;
  hasJoined?: boolean;
}

interface CompetitionParticipant {
  id: string;
  userId: string;
  userName: string;
  currentScore: number;
  rank?: number;
}

export default function OfficeCompetitions() {
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
  const [viewParticipantsCompetition, setViewParticipantsCompetition] = useState<Competition | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch office competitions
  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['/api/competitions'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/competitions', {
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) {
          if (response.status === 401) {
            // Return empty array if unauthorized instead of throwing
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
  const { data: participants = [], isLoading: isLoadingParticipants } = useQuery({
    queryKey: ['/api/competitions', viewParticipantsCompetition?.id, 'leaderboard'],
    enabled: !!viewParticipantsCompetition?.id,
  });

  // Create competition mutation
  const createCompetitionMutation = useMutation({
    mutationFn: async (competition: any) => {
      console.log('Attempting to create competition:', competition);
      const response = await fetch('/api/competitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(competition),
        credentials: 'include'
      });
      
      console.log('Competition creation response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Competition creation failed:', response.status, errorData);
        
        if (response.status === 401) {
          // Redirect to login if unauthorized
          window.location.href = '/api/login';
          throw new Error('Session expired. Redirecting to login...');
        }
        
        throw new Error(errorData.message || 'Failed to create competition');
      }
      
      const result = await response.json();
      console.log('Competition created successfully:', result);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competitions'] });
      setIsCreateModalOpen(false);
      setNewCompetition({
        title: '',
        description: '',
        type: 'sales_volume',
        startDate: '',
        endDate: '',
        targetValue: '',
        prize: '',
        rules: ''
      });
      toast({
        title: 'Competition Created',
        description: 'Your office competition has been created successfully!'
      });
    },
    onError: (error: any) => {
      console.error('Competition creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create competition. Please try again.',
        variant: 'destructive'
      });
    }
  });

  // Join competition mutation
  const joinCompetitionMutation = useMutation({
    mutationFn: async (competitionId: string) => {
      const response = await fetch(`/api/competitions/${competitionId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to join competition');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/competitions'] });
      toast({
        title: 'Competition Joined',
        description: 'You have successfully joined the competition!'
      });
    }
  });

  const getCompetitionIcon = (type: string) => {
    switch (type) {
      case 'sales_volume': return <DollarSign className="h-4 w-4" />;
      case 'commission_earned': return <TrendingUp className="h-4 w-4" />;
      case 'properties_closed': return <Trophy className="h-4 w-4" />;
      case 'activities_completed': return <Target className="h-4 w-4" />;
      case 'hours_logged': return <Clock className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCompetitionType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const activeCompetitions = (competitions as Competition[]).filter((c: Competition) => c.status === 'active');
  const upcomingCompetitions = (competitions as Competition[]).filter((c: Competition) => c.status === 'upcoming');
  const completedCompetitions = (competitions as Competition[]).filter((c: Competition) => c.status === 'completed');

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Office Competitions</h1>
          <p className="text-muted-foreground mt-1">
            Compete with your colleagues and drive team performance
          </p>
        </div>
        
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Competition
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Competition</DialogTitle>
              <DialogDescription>
                Set up a new office-wide competition to motivate your team
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Competition Title</Label>
                <Input
                  id="title"
                  value={newCompetition.title}
                  onChange={(e) => setNewCompetition({ ...newCompetition, title: e.target.value })}
                  placeholder="Q1 Sales Sprint"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCompetition.description}
                  onChange={(e) => setNewCompetition({ ...newCompetition, description: e.target.value })}
                  placeholder="Quarterly sales competition to boost team performance"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="type">Competition Type</Label>
                <Select
                  value={newCompetition.type}
                  onValueChange={(value) => setNewCompetition({ ...newCompetition, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales_volume">Sales Volume</SelectItem>
                    <SelectItem value="commission_earned">Commission Earned</SelectItem>
                    <SelectItem value="properties_closed">Properties Closed</SelectItem>
                    <SelectItem value="activities_completed">Activities Completed</SelectItem>
                    <SelectItem value="hours_logged">Hours Logged</SelectItem>
                    <SelectItem value="revenue_target">Revenue Target</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetValue">Target Quantity</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={newCompetition.targetValue}
                  onChange={(e) => setNewCompetition({ ...newCompetition, targetValue: e.target.value })}
                  placeholder="e.g., 500000 for sales volume, 10 for properties"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCompetition.startDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCompetition.endDate}
                    onChange={(e) => setNewCompetition({ ...newCompetition, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="prize">Prize/Reward</Label>
                <Input
                  id="prize"
                  value={newCompetition.prize}
                  onChange={(e) => setNewCompetition({ ...newCompetition, prize: e.target.value })}
                  placeholder="$500 gift card + bragging rights"
                />
              </div>
              <Button
                onClick={() => createCompetitionMutation.mutate(newCompetition)}
                disabled={createCompetitionMutation.isPending}
                className="w-full"
              >
                {createCompetitionMutation.isPending ? 'Creating...' : 'Create Competition'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Competitions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompetitions.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently running
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(competitions as Competition[]).reduce((sum: number, c: Competition) => sum + c.participantCount, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all competitions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Competitions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingCompetitions.length}</div>
            <p className="text-xs text-muted-foreground">
              Starting soon
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCompetitions.length}</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Competition Tabs */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active ({activeCompetitions.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({upcomingCompetitions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedCompetitions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeCompetitions.map((competition: Competition) => (
              <CompetitionCard 
                key={competition.id} 
                competition={competition} 
                onJoin={joinCompetitionMutation.mutate}
                isJoining={joinCompetitionMutation.isPending}
                onViewParticipants={setViewParticipantsCompetition}
              />
            ))}
          </div>
          {activeCompetitions.length === 0 && (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Competitions</h3>
              <p className="text-muted-foreground mb-4">
                Create a new competition to start motivating your team!
              </p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingCompetitions.map((competition: Competition) => (
              <CompetitionCard 
                key={competition.id} 
                competition={competition} 
                onJoin={joinCompetitionMutation.mutate}
                isJoining={joinCompetitionMutation.isPending}
                onViewParticipants={setViewParticipantsCompetition}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {completedCompetitions.map((competition: Competition) => (
              <CompetitionCard 
                key={competition.id} 
                competition={competition} 
                onJoin={() => {}}
                isJoining={false}
                onViewParticipants={setViewParticipantsCompetition}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Participants View Modal */}
      <Dialog open={!!viewParticipantsCompetition} onOpenChange={() => setViewParticipantsCompetition(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Competition Participants</span>
            </DialogTitle>
            <DialogDescription>
              {viewParticipantsCompetition?.title} - Current standings and progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {isLoadingParticipants ? (
              <div className="text-center py-4">Loading participants...</div>
            ) : participants.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Participants Yet</h3>
                <p className="text-muted-foreground">Be the first to join this competition!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Leaderboard</h4>
                  <Badge variant="outline">{participants.length} participant{participants.length !== 1 ? 's' : ''}</Badge>
                </div>
                
                <div className="space-y-2">
                  {participants.map((participant: any, index: number) => (
                    <Card key={participant.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                            #{index + 1}
                          </div>
                          <div>
                            <div className="font-medium">{participant.userName || participant.userEmail}</div>
                            <div className="text-sm text-muted-foreground">
                              Joined {format(new Date(participant.joinedAt), 'MMM d, yyyy')}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">{participant.currentScore}</div>
                          <div className="text-sm text-muted-foreground">Current Score</div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Competition Card Component
function CompetitionCard({ 
  competition, 
  onJoin, 
  isJoining,
  onViewParticipants
}: { 
  competition: Competition; 
  onJoin: (id: string) => void; 
  isJoining: boolean; 
  onViewParticipants?: (competition: Competition) => void;
}) {
  const getCompetitionIcon = (type: string) => {
    switch (type) {
      case 'sales_volume': return <DollarSign className="h-4 w-4" />;
      case 'commission_earned': return <TrendingUp className="h-4 w-4" />;
      case 'properties_closed': return <Trophy className="h-4 w-4" />;
      case 'activities_completed': return <Target className="h-4 w-4" />;
      case 'hours_logged': return <Clock className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'upcoming': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCompetitionType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const daysRemaining = differenceInDays(new Date(competition.endDate), new Date());
  const totalDays = differenceInDays(new Date(competition.endDate), new Date(competition.startDate));
  const progress = competition.status === 'active' 
    ? Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100))
    : competition.status === 'completed' ? 100 : 0;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getCompetitionIcon(competition.type)}
            <CardTitle className="text-lg">{competition.title}</CardTitle>
          </div>
          <Badge className={getStatusColor(competition.status)}>
            {competition.status.charAt(0).toUpperCase() + competition.status.slice(1)}
          </Badge>
        </div>
        <CardDescription className="line-clamp-2">
          {competition.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium">{formatCompetitionType(competition.type)}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Participants:</span>
          <span className="font-medium">{competition.participantCount}</span>
        </div>

        {competition.targetValue && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target:</span>
            <span className="font-medium">
              {competition.type === 'sales_volume' || competition.type === 'commission_earned' || competition.type === 'revenue_target' 
                ? `$${Number(competition.targetValue).toLocaleString()}`
                : competition.type === 'hours_logged'
                ? `${competition.targetValue} hours`
                : `${competition.targetValue}`
              }
            </span>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress:</span>
            <span className="font-medium">
              {competition.status === 'active' 
                ? `${daysRemaining} days left`
                : format(new Date(competition.startDate), 'MMM dd, yyyy')
              }
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Prize:</span>
          </div>
          <p className="text-sm font-medium bg-orange-50 dark:bg-orange-900/20 p-2 rounded border border-orange-200 dark:border-orange-800">
            {competition.prize}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {format(new Date(competition.startDate), 'MMM dd')} - {format(new Date(competition.endDate), 'MMM dd, yyyy')}
          </p>
        </div>

        {competition.status !== 'completed' && (
          <div className="flex space-x-2">
            <Button
              onClick={() => onJoin(competition.id)}
              disabled={isJoining || competition.hasJoined}
              className="flex-1"
              variant={competition.status === 'active' ? 'default' : 'outline'}
            >
              {competition.hasJoined ? 'Joined' : isJoining ? 'Joining...' : 
               competition.status === 'active' ? 'Join Competition' : 'Join When Started'}
            </Button>
            
            {onViewParticipants && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewParticipants(competition)}
                className="flex items-center space-x-1"
                data-testid={`button-view-participants-${competition.id}`}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}

        {competition.status === 'completed' && competition.winnerId && (
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
            <Trophy className="h-5 w-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
              Competition Winner!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}