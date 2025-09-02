import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Unlock, Target, Phone, Users, Clock, BarChart3 } from "lucide-react";

interface DailyGoals {
  id?: string;
  callsTarget: number;
  appointmentsTarget: number;
  hoursTarget: number;
  cmasTarget: number;
  isLocked: boolean;
  date: string;
}

export function DailyGoalsSidebar() {
  const [goals, setGoals] = useState<DailyGoals>({
    callsTarget: 25,
    appointmentsTarget: 2,
    hoursTarget: 8.0,
    cmasTarget: 2,
    isLocked: false,
    date: new Date().toISOString().split('T')[0]
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch today's goals
  const { data: todaysGoals } = useQuery({
    queryKey: ['/api/daily-goals', goals.date],
    enabled: true
  });

  // Update local state when data is fetched
  useEffect(() => {
    if (todaysGoals && typeof todaysGoals === 'object' && 'callsTarget' in todaysGoals) {
      setGoals(todaysGoals as DailyGoals);
    }
  }, [todaysGoals]);

  // Mutation to save/update daily goals
  const saveGoalsMutation = useMutation({
    mutationFn: async (goalsData: DailyGoals) => {
      console.log('Making API request with data:', goalsData);
      return apiRequest('POST', '/api/daily-goals', goalsData);
    },
    onSuccess: (data) => {
      console.log('API request successful:', data);
      queryClient.invalidateQueries({ queryKey: ['/api/daily-goals', goals.date] });
      toast({
        title: goals.isLocked ? "Goals Locked!" : "Goals Updated",
        description: goals.isLocked ? "Your daily goals are now locked and cannot be changed." : "Your daily goals have been saved.",
      });
    },
    onError: (error: any) => {
      console.error('API request failed:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save goals",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof DailyGoals, value: string | number) => {
    if (goals.isLocked) return; // Prevent changes when locked
    
    setGoals(prev => ({
      ...prev,
      [field]: typeof value === 'string' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSetAndLockGoals = () => {
    alert('Button clicked! Attempting to save goals...');
    console.log('Setting and locking goals:', goals);
    const updatedGoals = {
      ...goals,
      isLocked: true
    };
    setGoals(updatedGoals);
    console.log('About to save:', updatedGoals);
    saveGoalsMutation.mutate(updatedGoals);
  };

  const handleUnlockGoals = () => {
    const updatedGoals = {
      ...goals,
      isLocked: false
    };
    setGoals(updatedGoals);
    saveGoalsMutation.mutate(updatedGoals);
  };

  return (
    <Card className="w-full max-w-sm bg-white shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Daily Goals</CardTitle>
          {goals.isLocked && <Lock className="h-4 w-4 text-green-600" />}
        </div>
        <p className="text-sm text-gray-500">Set targets for today</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Daily Calls Target */}
        <div className="space-y-2">
          <Label htmlFor="calls-target" className="flex items-center gap-2 text-sm font-medium">
            <Phone className="h-4 w-4 text-blue-600" />
            Daily Calls Target
          </Label>
          <Input
            id="calls-target"
            type="number"
            value={goals.callsTarget}
            onChange={(e) => handleInputChange('callsTarget', e.target.value)}
            disabled={goals.isLocked}
            className={`${goals.isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            data-testid="input-calls-target"
          />
        </div>

        {/* Appointments Target */}
        <div className="space-y-2">
          <Label htmlFor="appointments-target" className="flex items-center gap-2 text-sm font-medium">
            <Users className="h-4 w-4 text-green-600" />
            Appointments Target
          </Label>
          <Input
            id="appointments-target"
            type="number"
            value={goals.appointmentsTarget}
            onChange={(e) => handleInputChange('appointmentsTarget', e.target.value)}
            disabled={goals.isLocked}
            className={`${goals.isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            data-testid="input-appointments-target"
          />
        </div>

        {/* Hours Target */}
        <div className="space-y-2">
          <Label htmlFor="hours-target" className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4 text-gray-600" />
            Hours Target
          </Label>
          <Input
            id="hours-target"
            type="number"
            step="0.5"
            value={goals.hoursTarget}
            onChange={(e) => handleInputChange('hoursTarget', e.target.value)}
            disabled={goals.isLocked}
            className={`${goals.isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            data-testid="input-hours-target"
          />
        </div>

        {/* CMAs Target */}
        <div className="space-y-2">
          <Label htmlFor="cmas-target" className="flex items-center gap-2 text-sm font-medium">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            CMAs Target
          </Label>
          <Input
            id="cmas-target"
            type="number"
            value={goals.cmasTarget}
            onChange={(e) => handleInputChange('cmasTarget', e.target.value)}
            disabled={goals.isLocked}
            className={`${goals.isLocked ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            data-testid="input-cmas-target"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4">
          {goals.isLocked ? (
            <Button
              onClick={handleUnlockGoals}
              disabled={saveGoalsMutation.isPending}
              className="w-full bg-green-600 hover:bg-green-700"
              data-testid="button-unlock-goals"
            >
              <Unlock className="h-4 w-4 mr-2" />
              {saveGoalsMutation.isPending ? 'Unlocking...' : 'Goals Locked'}
            </Button>
          ) : (
            <Button
              onClick={handleSetAndLockGoals}
              disabled={saveGoalsMutation.isPending}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 relative z-10"
              data-testid="button-set-lock-goals"
              type="button"
            >
              <Lock className="h-4 w-4 mr-2" />
              {saveGoalsMutation.isPending ? 'Setting...' : 'Set & Lock Goals'}
            </Button>
          )}
        </div>

        {goals.isLocked && (
          <div className="text-xs text-center text-green-600 bg-green-50 p-2 rounded">
            Goals are locked for today. Click above to unlock and edit.
          </div>
        )}
      </CardContent>
    </Card>
  );
}