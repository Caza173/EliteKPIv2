import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Trophy, Clock, CheckCircle, PlayCircle, Users, Target, Sparkles, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export function LearningPage() {
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: learningPaths, isLoading: pathsLoading } = useQuery({
    queryKey: ["/api/learning-paths"],
  });

  const { data: progress, isLoading: progressLoading } = useQuery({
    queryKey: ["/api/learning-progress"],
  });

  const { data: streak } = useQuery({
    queryKey: ["/api/learning-streak"],
  });

  const { data: achievementsData } = useQuery({
    queryKey: ["/api/learning-achievements"],
  });

  // Create enhanced learning content
  const createContentMutation = useMutation({
    mutationFn: () => apiRequest("/api/learning/create-sample-data", "POST", {}),
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Enhanced learning content with best practices has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/learning-paths"] });
      queryClient.invalidateQueries({ queryKey: ["/api/learning-progress"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create enhanced learning content",
        variant: "destructive",
      });
    },
  });

  // AI Content Generation
  const generateAIContentMutation = useMutation({
    mutationFn: () => apiRequest("/api/learning/generate-enhanced-content", "POST", {}),
    onSuccess: (data: any) => {
      toast({
        title: "AI Content Generated!",
        description: "Advanced real estate learning content with best practices has been generated.",
      });
      console.log("Generated AI content:", data);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI content",
        variant: "destructive",
      });
    },
  });

  if (pathsLoading || progressLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading learning paths...</p>
        </div>
      </div>
    );
  }

  const learningStreakData = streak || { currentStreak: 0, longestStreak: 0 };
  const achievements = (achievementsData as any)?.userAchievements || [];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Learning Center</h1>
            <p className="text-muted-foreground">
              Master real estate skills with our comprehensive learning paths
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="flex items-center space-x-2 text-2xl font-bold text-orange-600">
                <Trophy className="h-6 w-6" />
                <span>{learningStreakData.currentStreak}</span>
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
            <div className="text-center">
              <div className="flex items-center space-x-2 text-2xl font-bold text-blue-600">
                <Target className="h-6 w-6" />
                <span>{achievements.length}</span>
              </div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => createContentMutation.mutate()}
                disabled={createContentMutation.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="sm"
                data-testid="button-create-content"
              >
                <Download className="h-4 w-4 mr-2" />
                {createContentMutation.isPending ? "Creating..." : "Load Enhanced Content"}
              </Button>
              <Button
                onClick={() => generateAIContentMutation.mutate()}
                disabled={generateAIContentMutation.isPending}
                variant="outline"
                size="sm"
                className="border-purple-200 hover:bg-purple-50"
                data-testid="button-generate-ai"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generateAIContentMutation.isPending ? "Generating..." : "AI Best Practices"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="paths" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="paths" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Learning Paths</span>
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>My Progress</span>
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Achievements</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="paths" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(learningPaths as any)?.map((path: any) => {
              const userProgress = (progress as any)?.find((p: any) => p.learningPathId === path.id);
              const progressPercent = userProgress?.progressPercent || 0;
              
              return (
                <Card key={path.id} className="relative overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group">
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${
                    path.difficulty === 'beginner' ? 'from-green-400 to-green-600' :
                    path.difficulty === 'intermediate' ? 'from-blue-400 to-blue-600' :
                    'from-red-400 to-red-600'
                  }`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                          {path.title}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={path.difficulty === 'beginner' ? 'default' : 
                                   path.difficulty === 'intermediate' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {path.difficulty}
                          </Badge>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{path.estimatedHours}h</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{progressPercent}%</div>
                        <p className="text-xs text-muted-foreground">Complete</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed">
                      {path.description}
                    </CardDescription>
                    
                    <Progress value={progressPercent} className="h-2" />
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>1,247 enrolled</span>
                      </div>
                      <Button
                        size="sm"
                        variant={userProgress ? "outline" : "default"}
                        className="group-hover:shadow-md transition-shadow"
                        onClick={() => setSelectedPath(path.id)}
                      >
                        {userProgress ? (
                          <>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Continue
                          </>
                        ) : (
                          <>
                            <BookOpen className="h-4 w-4 mr-2" />
                            Start Learning
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {(progress as any)?.map((userProgress: any) => {
              const path = (learningPaths as any)?.find((p: any) => p.id === userProgress.learningPathId);
              if (!path) return null;
              
              return (
                <Card key={userProgress.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{path.title}</CardTitle>
                      <Badge variant={userProgress.status === 'completed' ? 'default' : 'secondary'}>
                        {userProgress.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{userProgress.progressPercent || 0}%</span>
                      </div>
                      <Progress value={userProgress.progressPercent || 0} className="h-2" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Started</p>
                        <p className="font-medium">
                          {userProgress.startedAt ? new Date(userProgress.startedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Activity</p>
                        <p className="font-medium">
                          {userProgress.lastAccessedAt ? new Date(userProgress.lastAccessedAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedPath(userProgress.learningPathId)}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Continue Learning
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement: any) => (
              <Card key={achievement.id} className="border-2 border-dashed border-blue-200 bg-blue-50/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{achievement.title}</CardTitle>
                      <CardDescription className="text-sm">
                        Earned {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  <div className="mt-3 flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      +{achievement.pointsReward} XP
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {achievements.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium">No achievements yet</h3>
                <p className="text-muted-foreground">
                  Start learning to unlock your first achievement!
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}