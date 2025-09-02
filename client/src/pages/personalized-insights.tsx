import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Lightbulb, 
  TrendingUp, 
  Target, 
  Clock, 
  CheckCircle, 
  Archive, 
  Zap,
  BarChart,
  Users,
  DollarSign,
  Calendar,
  Eye,
  Trash2,
  RefreshCw
} from "lucide-react";

interface PersonalizedInsight {
  id: string;
  insightType: 'market_opportunity' | 'performance_improvement' | 'business_growth' | 'efficiency';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: 'pricing' | 'marketing' | 'prospecting' | 'operations' | 'client_relations';
  actionableSteps: string[];
  metrics: {
    currentValue: string;
    targetValue: string;
    expectedImpact: string;
    kpiToTrack: string;
  };
  confidence: number;
  potentialImpact: 'high' | 'medium' | 'low';
  timeframe: 'immediate' | '7_days' | '30_days' | '90_days' | '1_year';
  isViewed: boolean;
  isArchived: boolean;
  generatedAt: string;
  validUntil: string;
}

const getInsightTypeIcon = (type: string) => {
  switch (type) {
    case 'market_opportunity': return <TrendingUp className="h-5 w-5" />;
    case 'performance_improvement': return <Target className="h-5 w-5" />;
    case 'business_growth': return <BarChart className="h-5 w-5" />;
    case 'efficiency': return <Zap className="h-5 w-5" />;
    default: return <Lightbulb className="h-5 w-5" />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'pricing': return <DollarSign className="h-5 w-5" />;
    case 'marketing': return <TrendingUp className="h-5 w-5" />;
    case 'prospecting': return <Users className="h-5 w-5" />;
    case 'operations': return <Zap className="h-5 w-5" />;
    case 'client_relations': return <Users className="h-5 w-5" />;
    default: return <Lightbulb className="h-5 w-5" />;
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'destructive';
    case 'medium': return 'default';
    case 'low': return 'secondary';
    default: return 'default';
  }
};

const getTimeframeText = (timeframe: string) => {
  switch (timeframe) {
    case 'immediate': return 'Act Now';
    case '7_days': return '1 Week';
    case '30_days': return '1 Month';
    case '90_days': return '3 Months';
    case '1_year': return '1 Year';
    default: return timeframe;
  }
};

export default function PersonalizedInsights() {
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch personalized insights
  const { data: insights = [], isLoading } = useQuery<PersonalizedInsight[]>({
    queryKey: ['/api/personalized-insights', { includeArchived: activeTab === 'archived' }],
    queryFn: async () => {
      const response = await fetch(`/api/personalized-insights?includeArchived=${activeTab === 'archived'}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to fetch insights');
      return response.json();
    },
  });

  // Generate new insights
  const generateInsightsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/personalized-insights/generate', {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to generate insights');
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/personalized-insights'] });
      toast({
        title: "Insights Generated",
        description: `Generated ${data.count} new personalized business insights`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    },
  });

  // Mark insight as viewed
  const markViewedMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const response = await fetch(`/api/personalized-insights/${insightId}/viewed`, { 
        method: 'PATCH',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to mark as viewed');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personalized-insights'] });
    },
  });

  // Archive insight
  const archiveInsightMutation = useMutation({
    mutationFn: async (insightId: string) => {
      const response = await fetch(`/api/personalized-insights/${insightId}/archive`, { 
        method: 'PATCH',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to archive insight');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/personalized-insights'] });
      toast({
        title: "Insight Archived",
        description: "Insight has been archived successfully",
      });
    },
  });

  const activeInsights = insights.filter(insight => !insight.isArchived);
  const archivedInsights = insights.filter(insight => insight.isArchived);
  const unviewedCount = activeInsights.filter(insight => !insight.isViewed).length;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading personalized insights...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Personalized Business Insights</h1>
          <p className="text-muted-foreground">
            AI-powered recommendations based on your performance and market data
          </p>
        </div>
        <Button 
          onClick={() => generateInsightsMutation.mutate()}
          disabled={generateInsightsMutation.isPending}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
          Generate New Insights
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{activeInsights.length}</p>
                <p className="text-sm text-muted-foreground">Active Insights</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{unviewedCount}</p>
                <p className="text-sm text-muted-foreground">Unviewed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {activeInsights.filter(i => i.priority === 'high').length}
                </p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Archive className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-2xl font-bold">{archivedInsights.length}</p>
                <p className="text-sm text-muted-foreground">Archived</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="active">Active Insights ({activeInsights.length})</TabsTrigger>
          <TabsTrigger value="archived">Archived ({archivedInsights.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeInsights.length === 0 ? (
            <Card className="p-12 text-center">
              <Lightbulb className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Active Insights</h3>
              <p className="text-muted-foreground mb-6">
                Generate personalized business insights to optimize your real estate performance
              </p>
              <Button 
                onClick={() => generateInsightsMutation.mutate()}
                disabled={generateInsightsMutation.isPending}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
                Generate Insights
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeInsights.map((insight) => (
                <InsightCard 
                  key={insight.id} 
                  insight={insight}
                  onMarkViewed={() => markViewedMutation.mutate(insight.id)}
                  onArchive={() => archiveInsightMutation.mutate(insight.id)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          {archivedInsights.length === 0 ? (
            <Card className="p-12 text-center">
              <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Archived Insights</h3>
              <p className="text-muted-foreground">
                Archived insights will appear here when you archive them
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {archivedInsights.map((insight) => (
                <InsightCard 
                  key={insight.id} 
                  insight={insight}
                  isArchived={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

interface InsightCardProps {
  insight: PersonalizedInsight;
  onMarkViewed?: () => void;
  onArchive?: () => void;
  isArchived?: boolean;
}

function InsightCard({ insight, onMarkViewed, onArchive, isArchived = false }: InsightCardProps) {
  return (
    <Card className={`${!insight.isViewed && !isArchived ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 mb-2">
            {getInsightTypeIcon(insight.insightType)}
            <Badge variant={getPriorityColor(insight.priority) as any}>
              {insight.priority.toUpperCase()}
            </Badge>
            <Badge variant="outline">
              <Clock className="h-3 w-3 mr-1" />
              {getTimeframeText(insight.timeframe)}
            </Badge>
          </div>
          {!isArchived && (
            <div className="flex items-center gap-1">
              {!insight.isViewed && onMarkViewed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMarkViewed}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onArchive && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onArchive}
                  className="h-8 w-8 p-0"
                >
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        
        <CardTitle className="text-lg">{insight.title}</CardTitle>
        <CardDescription>{insight.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Metrics */}
          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Key Metrics
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Current: {insight.metrics.currentValue}</p>
                <p className="font-medium">Target: {insight.metrics.targetValue}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Expected Impact:</p>
                <p className="font-medium">{insight.metrics.expectedImpact}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Track: {insight.metrics.kpiToTrack}
            </p>
          </div>

          {/* Action Steps */}
          <div>
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Action Steps
            </h4>
            <ul className="space-y-1">
              {insight.actionableSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {getCategoryIcon(insight.category)}
                {insight.category.replace('_', ' ')}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {insight.confidence}% confidence
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(insight.generatedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}