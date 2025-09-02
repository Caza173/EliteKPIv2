import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  Phone,
  UserCheck,
  Home,
  Clock,
  Target,
  Lock,
  Unlock,
  Save
} from "lucide-react";
import { format, addDays, subDays, isToday, isTomorrow, isYesterday } from "date-fns";

interface DailyGoal {
  id?: string;
  calls: number;
  callsAnswered: number;
  buyerAppointments: number;
  sellerAppointments: number;
  cmasCompleted: number;
  dailyHours: number;
  offersToWrite: number;
  monthlyClosings: number;
  date: string;
  isLocked: boolean;
}

interface DailyActual {
  id?: string;
  calls: number;
  callsAnswered: number;
  buyerAppointments: number;
  sellerAppointments: number;
  cmasCompleted: number;
  dailyHours: number;
  offersToWrite: number;
  monthlyClosings: number;
  date: string;
}

export default function DailyGoalsCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEditing, setIsEditing] = useState(false);
  const [goalData, setGoalData] = useState<DailyGoal>({
    calls: 25,
    callsAnswered: 12,
    buyerAppointments: 1,
    sellerAppointments: 1,
    cmasCompleted: 1,
    dailyHours: 8,
    offersToWrite: 1,
    monthlyClosings: 2,
    date: format(new Date(), 'yyyy-MM-dd'),
    isLocked: false
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Format date for API
  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  // Fetch daily goals for selected date
  const { data: dailyGoals, isLoading: goalsLoading } = useQuery({
    queryKey: [`/api/goals/daily/${dateStr}`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/goals/daily/${dateStr}`);
        return response;
      } catch (error) {
        // Return default goals if none exist for this date
        return null;
      }
    },
    retry: false,
  });

  // Fetch daily actuals for selected date
  const { data: dailyActuals, isLoading: actualsLoading } = useQuery({
    queryKey: [`/api/activity-actuals/daily/${dateStr}`],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', `/api/activity-actuals/daily/${dateStr}`);
        return response;
      } catch (error) {
        // Return zeros if no actuals exist for this date
        return {
          calls: 0,
          callsAnswered: 0,
          buyerAppointments: 0,
          sellerAppointments: 0,
          cmasCompleted: 0,
          dailyHours: 0,
          offersToWrite: 0,
          monthlyClosings: 0
        };
      }
    },
    retry: false,
  });

  // Update goal data when dailyGoals changes
  useEffect(() => {
    if (dailyGoals) {
      setGoalData({
        ...dailyGoals,
        date: dateStr
      });
    } else {
      // Reset to default goals for new date
      setGoalData({
        calls: 25,
        callsAnswered: 12,
        buyerAppointments: 1,
        sellerAppointments: 1,
        cmasCompleted: 1,
        dailyHours: 8,
        offersToWrite: 1,
        monthlyClosings: 2,
        date: dateStr,
        isLocked: false
      });
    }
  }, [dailyGoals, dateStr]);

  // Save goals mutation
  const saveGoalsMutation = useMutation({
    mutationFn: async (goals: DailyGoal) => {
      if (goals.id) {
        return apiRequest('PUT', `/api/goals/daily/${goals.id}`, goals);
      } else {
        return apiRequest('POST', '/api/goals/daily', goals);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/daily/${dateStr}`] });
      setIsEditing(false);
      toast({
        title: "Goals Saved",
        description: `Daily goals for ${format(selectedDate, 'MMM d, yyyy')} have been saved.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save goals",
        variant: "destructive",
      });
    },
  });

  // Lock/unlock goals mutation
  const toggleLockMutation = useMutation({
    mutationFn: async (isLocked: boolean) => {
      if (goalData.id) {
        return apiRequest('PATCH', `/api/goals/daily/${goalData.id}`, { isLocked });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/goals/daily/${dateStr}`] });
      toast({
        title: goalData.isLocked ? "Goals Unlocked" : "Goals Locked",
        description: `Goals for ${format(selectedDate, 'MMM d, yyyy')} are now ${goalData.isLocked ? 'unlocked' : 'locked'}.`,
      });
    },
  });

  // Navigation functions
  const goToPreviousDay = () => setSelectedDate(prev => subDays(prev, 1));
  const goToNextDay = () => setSelectedDate(prev => addDays(prev, 1));
  const goToToday = () => setSelectedDate(new Date());

  // Format date display
  const getDateDisplay = () => {
    if (isToday(selectedDate)) return "Today";
    if (isTomorrow(selectedDate)) return "Tomorrow";
    if (isYesterday(selectedDate)) return "Yesterday";
    return format(selectedDate, 'MMM d, yyyy');
  };

  // Calculate progress percentage
  const getProgress = (actual: number, goal: number) => {
    if (goal === 0) return 0;
    return Math.min((actual / goal) * 100, 100);
  };

  // Goal items configuration
  const goalItems = [
    { key: 'calls', label: 'Calls', icon: Phone, actual: dailyActuals?.calls || 0 },
    { key: 'callsAnswered', label: 'Calls Answered', icon: Phone, actual: dailyActuals?.callsAnswered || 0 },
    { key: 'buyerAppointments', label: 'Buyer Appointments', icon: UserCheck, actual: dailyActuals?.buyerAppointments || 0 },
    { key: 'sellerAppointments', label: 'Seller Appointments', icon: Home, actual: dailyActuals?.sellerAppointments || 0 },
    { key: 'cmasCompleted', label: 'CMAs Completed', icon: Target, actual: dailyActuals?.cmasCompleted || 0 },
    { key: 'dailyHours', label: 'Daily Hours', icon: Clock, actual: dailyActuals?.dailyHours || 0 },
    { key: 'offersToWrite', label: 'Offers to Write', icon: Target, actual: dailyActuals?.offersToWrite || 0 },
    { key: 'monthlyClosings', label: 'Monthly Closings', icon: Home, actual: dailyActuals?.monthlyClosings || 0 },
  ];

  const handleSaveGoals = () => {
    saveGoalsMutation.mutate(goalData);
  };

  const handleToggleLock = () => {
    if (goalData.id) {
      toggleLockMutation.mutate(!goalData.isLocked);
    }
  };

  const handleInputChange = (key: keyof DailyGoal, value: string) => {
    const numValue = parseFloat(value) || 0;
    setGoalData(prev => ({ ...prev, [key]: numValue }));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-orange-600 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Goals & Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            {goalData.isLocked ? (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            ) : (
              <Badge variant="outline" className="flex items-center gap-1">
                <Unlock className="h-3 w-3" />
                Unlocked
              </Badge>
            )}
          </div>
        </div>
        
        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousDay}
            data-testid="button-previous-day"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {getDateDisplay()}
            </h3>
            {!isToday(selectedDate) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToToday}
                data-testid="button-today"
              >
                Today
              </Button>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNextDay}
            data-testid="button-next-day"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {goalsLoading || actualsLoading ? (
          <div className="animate-pulse space-y-4">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Goal Setting Toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Goals are {goalData.isLocked ? 'locked' : 'unlocked'} for tracking. 
                {goalData.isLocked ? ' Click "Unlock Goals" to make changes.' : ' Click "Save Goals" to lock them.'}
              </span>
              <div className="flex gap-2">
                {isEditing && (
                  <Button
                    size="sm"
                    onClick={handleSaveGoals}
                    disabled={saveGoalsMutation.isPending}
                    data-testid="button-save-goals"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Goals
                  </Button>
                )}
                {goalData.id && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleLock}
                    disabled={toggleLockMutation.isPending}
                    data-testid="button-toggle-lock"
                  >
                    {goalData.isLocked ? (
                      <>
                        <Unlock className="h-4 w-4 mr-1" />
                        Unlock Goals
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4 mr-1" />
                        Lock Goals
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Daily Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {goalItems.map((item) => {
                const goal = goalData[item.key as keyof DailyGoal] as number;
                const actual = item.actual;
                const progress = getProgress(actual, goal);
                const Icon = item.icon;

                return (
                  <div key={item.key} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>
                      {goalData.isLocked ? (
                        <Badge variant="outline">
                          {goal} {item.key === 'dailyHours' ? 'hrs' : ''}
                        </Badge>
                      ) : (
                        <Input
                          type="number"
                          value={goal}
                          onChange={(e) => {
                            handleInputChange(item.key as keyof DailyGoal, e.target.value);
                            if (!isEditing) setIsEditing(true);
                          }}
                          className="w-20 h-8 text-center"
                          data-testid={`input-${item.key}`}
                        />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress:</span>
                        <span className="font-medium">
                          {actual} / {goal} {item.key === 'dailyHours' ? 'hrs' : ''}
                        </span>
                      </div>
                      <Progress 
                        value={progress} 
                        className="h-2" 
                        data-testid={`progress-${item.key}`}
                      />
                      <div className="text-xs text-right text-gray-500">
                        {progress.toFixed(0)}% Complete
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Log Today's Activities Section */}
            <div className="border-t pt-4 mt-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Log Today's Activities</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    data-testid="button-save-activities"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save All Activities
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    data-testid="button-update-lock-goals"
                  >
                    Update & Lock Goals
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}