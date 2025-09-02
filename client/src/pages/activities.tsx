import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CircularProgress from "@/components/ui/circular-progress";
import { 
  Target, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Trophy,
  Unlock,
  Edit3,
  Users,
  Phone,
  Home,
  FileText,
  HandHeart,
  Timer,
  Save,
  Lock,
  Calendar,
  BarChart3,
  ArrowUp,
  ArrowDown,
  Minus,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface Goal {
  id: string;
  userId: string;
  period: 'daily' | 'weekly' | 'monthly';
  calls?: number;
  appointments?: number;
  hours?: number;
  cmas?: number;
  offersToWrite?: number;
  monthlyClosings?: number;
  effectiveDate: string;
  isLocked?: boolean;
}

interface ActivityActual {
  id: string;
  userId: string;
  date: string;
  calls: number;
  appointments: number;
  hoursWorked: string;
  cmasCompleted?: number;
  buyersSignedUp?: number;
  listingsSigned?: number;
  offersWritten?: number;
}

interface Activity {
  id: string;
  userId: string;
  propertyId: string | null;
  type: string;
  date: string;
  notes: string | null;
  createdAt: string;
}

export default function Activities() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Goal form states
  const [dailyGoals, setDailyGoals] = useState({
    calls: '25',
    buyerAppointments: '1',
    sellerAppointments: '1',
    buyersSignedUp: '1',
    listingsSigned: '1',
    cmasCompleted: '3',
    dailyHours: '8',
    offersToWrite: '1',
    monthlyClosings: '2'
  });

  // Daily performance form
  const [dailyPerformance, setDailyPerformance] = useState({
    calls: '25',
    buyerAppointments: '1',
    sellerAppointments: '1',
    buyersSignedUp: '1',
    listingsSigned: '1',
    cmasCompleted: '1',
    dailyHours: '8',
    offersToWrite: '1',
    monthlyClosings: '2'
  });

  // Fetch goals and actuals
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  const { data: actuals = [] } = useQuery<ActivityActual[]>({
    queryKey: ['/api/activity-actuals'],
  });

  // Get current goals by period
  const currentDailyGoal = goals.filter(g => g.period === 'daily').sort((a, b) => 
    new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  )[0];

  const currentWeeklyGoal = goals.filter(g => g.period === 'weekly').sort((a, b) => 
    new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  )[0];

  const currentMonthlyGoal = goals.filter(g => g.period === 'monthly').sort((a, b) => 
    new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime()
  )[0];

  const selectedDateActual = actuals.find(a => a.date === selectedDate);

  // Calculate progress percentages
  const getProgress = (actual: number, goal: number) => {
    if (!goal) return 0;
    return Math.min((actual / goal) * 100, 100);
  };

  // Save goal mutation
  const saveGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/goals', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: "Goals Locked",
        description: "Your goals have been set and locked successfully."
      });
    },
  });

  // Save daily performance mutation
  const savePerformanceMutation = useMutation({
    mutationFn: async (data: any) => {
      if (selectedDateActual) {
        return apiRequest(`/api/activity-actuals/${selectedDateActual.id}`, 'PUT', data);
      } else {
        return apiRequest('/api/activity-actuals', 'POST', { ...data, date: selectedDate });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity-actuals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/metrics'] });
      toast({
        title: "Performance Saved",
        description: "Your daily activities have been recorded."
      });
    },
  });

  const handleLockGoals = () => {
    const goalData = {
      calls: parseInt(dailyGoals.calls) || 0,
      appointments: parseInt(dailyGoals.buyerAppointments) + parseInt(dailyGoals.sellerAppointments) || 0,
      hours: parseFloat(dailyGoals.dailyHours) || 0,
      cmas: parseInt(dailyGoals.cmasCompleted) || 0,
      offersToWrite: parseInt(dailyGoals.offersToWrite) || 0,
      monthlyClosings: parseInt(dailyGoals.monthlyClosings) || 0,
      period: 'daily' as const,
      effectiveDate: selectedDate,
      isLocked: true
    };

    saveGoalMutation.mutate(goalData);
  };

  const handleSavePerformance = () => {
    const performanceData = {
      calls: parseInt(dailyPerformance.calls) || 0,
      appointments: parseInt(dailyPerformance.buyerAppointments) + parseInt(dailyPerformance.sellerAppointments) || 0,
      hoursWorked: dailyPerformance.dailyHours || '0',
      cmasCompleted: parseInt(dailyPerformance.cmasCompleted) || 0,
      buyersSignedUp: parseInt(dailyPerformance.buyersSignedUp) || 0,
      listingsSigned: parseInt(dailyPerformance.listingsSigned) || 0,
      offersWritten: parseInt(dailyPerformance.offersToWrite) || 0
    };

    savePerformanceMutation.mutate(performanceData);
  };

  // Mock data for demonstration - in real app this would come from API
  const activityProgress = [
    { title: 'Daily Hours', progress: 133, actual: 8, goal: 6, period: 'Daily', color: 'text-green-600' },
    { title: 'Calls', progress: 100, actual: 25, goal: 25, period: 'Daily', color: 'text-green-600' },
    { title: 'Monthly Closings', progress: 0, actual: 0, goal: 2, period: 'Monthly', color: 'text-gray-400' },
    { title: 'Buyer Appointments', progress: 100, actual: 1, goal: 1, period: 'Daily', color: 'text-green-600' },
    { title: 'Buyers Signed', progress: 0, actual: 0, goal: 1, period: 'Weekly', color: 'text-gray-400' },
    { title: 'Offers To Write', progress: 0, actual: 0, goal: 1, period: 'Weekly', color: 'text-gray-400' },
    { title: 'Listings Signed', progress: 100, actual: 1, goal: 1, period: 'Weekly', color: 'text-green-600' },
    { title: 'Seller Appointments', progress: 100, actual: 1, goal: 1, period: 'Daily', color: 'text-green-600' },
    { title: 'Cmas Completed', progress: 100, actual: 3, goal: 3, period: 'Weekly', color: 'text-green-600' }
  ];

  const goalVsActual = [
    { title: 'Calls', progress: 100, comparison: '+0', color: 'text-green-600' },
    { title: 'Buyer Appointments', progress: 100, comparison: '+0', color: 'text-green-600' },
    { title: 'Seller Appointments', progress: 100, comparison: '+0', color: 'text-green-600' },
    { title: 'Daily Hours', progress: 133, comparison: '+2', color: 'text-green-600' }
  ];

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Goals & Performance</h1>
          <p className="text-gray-600 dark:text-gray-400">Set targets, record performance, and track your progress all in one place.</p>
        </div>
        
        <Button 
          onClick={handleLockGoals}
          disabled={saveGoalMutation.isPending}
          className="bg-red-500 hover:bg-red-600 text-white"
          data-testid="button-unlock-goals"
        >
          <Unlock className="h-4 w-4 mr-2" />
          Unlock Goals
        </Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Left Column - Goal Setting */}
        <div className="space-y-6">
          
          {/* Set Your Activity Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
                Set Your Activity Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                
                {/* Calls */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Calls</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.calls}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, calls: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-calls-goal"
                    />
                    <Select value="daily">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Buyer Appointments */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Buyer Appointments</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.buyerAppointments}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, buyerAppointments: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-buyer-appointments-goal"
                    />
                    <Select value="daily">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Seller Appointments */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Seller Appointments</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.sellerAppointments}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, sellerAppointments: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-seller-appointments-goal"
                    />
                    <Select value="daily">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Buyers Signed */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Buyers Signed</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.buyersSignedUp}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, buyersSignedUp: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-buyers-signed-goal"
                    />
                    <Select value="weekly">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Listings Signed */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Listings Signed</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.listingsSigned}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, listingsSigned: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-listings-signed-goal"
                    />
                    <Select value="weekly">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* CMAs Completed */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">CMAs Completed</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.cmasCompleted}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, cmasCompleted: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-cmas-completed-goal"
                    />
                    <Select value="weekly">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Daily Hours */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Daily Hours</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.dailyHours}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, dailyHours: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-daily-hours-goal"
                    />
                    <Select value="daily">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Offers to Write */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Offers to Write</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.offersToWrite}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, offersToWrite: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-offers-to-write-goal"
                    />
                    <Select value="weekly">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Monthly Closings */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Monthly Closings</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={dailyGoals.monthlyClosings}
                      onChange={(e) => setDailyGoals(prev => ({ ...prev, monthlyClosings: e.target.value }))}
                      className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      data-testid="input-monthly-closings-goal"
                    />
                    <Select value="monthly">
                      <SelectTrigger className="w-20 bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Record Daily Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Record Daily Performance
                <Badge variant="outline" className="ml-auto">
                  {format(new Date(selectedDate), 'MMM dd, yyyy')}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                
                {/* Calls */}
                <div className="space-y-2">
                  <Label className="text-sm">Calls</Label>
                  <Input
                    type="number"
                    value={dailyPerformance.calls}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, calls: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-calls"
                  />
                </div>

                {/* Buyer Appointments */}
                <div className="space-y-2">
                  <Label className="text-sm">Buyer Appointments</Label>
                  <Input
                    type="number"
                    value={dailyPerformance.buyerAppointments}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, buyerAppointments: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-buyer-appointments"
                  />
                </div>

                {/* Seller Appointments */}
                <div className="space-y-2">
                  <Label className="text-sm">Seller Appointments</Label>
                  <Input
                    type="number"
                    value={dailyPerformance.sellerAppointments}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, sellerAppointments: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-seller-appointments"
                  />
                </div>

                {/* Buyers Signed */}
                <div className="space-y-2">
                  <Label className="text-sm">Buyers Signed</Label>
                  <Input
                    type="number"
                    value={dailyPerformance.buyersSignedUp}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, buyersSignedUp: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-buyers-signed"
                  />
                </div>

                {/* Listings Signed */}
                <div className="space-y-2">
                  <Label className="text-sm">Listings Signed</Label>
                  <Input
                    type="number"
                    value={dailyPerformance.listingsSigned}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, listingsSigned: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-listings-signed"
                  />
                </div>

                {/* CMAs Completed */}
                <div className="space-y-2">
                  <Label className="text-sm">CMAs Completed</Label>
                  <Input
                    type="number"
                    value={dailyPerformance.cmasCompleted}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, cmasCompleted: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-cmas-completed"
                  />
                </div>

                {/* Daily Hours */}
                <div className="space-y-2">
                  <Label className="text-sm">Daily Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={dailyPerformance.dailyHours}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, dailyHours: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-daily-hours"
                  />
                </div>

                {/* Offers to Write */}
                <div className="space-y-2">
                  <Label className="text-sm">Offers to Write</Label>
                  <Input
                    type="number"
                    value={dailyPerformance.offersToWrite}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, offersToWrite: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-offers-to-write"
                  />
                </div>

                {/* Monthly Closings */}
                <div className="space-y-2">
                  <Label className="text-sm">Monthly Closings</Label>
                  <Input
                    type="number"
                    value={dailyPerformance.monthlyClosings}
                    onChange={(e) => setDailyPerformance(prev => ({ ...prev, monthlyClosings: e.target.value }))}
                    className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    data-testid="input-performance-monthly-closings"
                  />
                </div>

              </div>

              <Button 
                onClick={handleSavePerformance}
                disabled={savePerformanceMutation.isPending}
                className="w-full bg-green-600 hover:bg-green-700"
                data-testid="button-save-daily-activities"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Daily Activities
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress Tracking */}
        <div className="space-y-6">
          
          {/* Activity Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                Activity Progress
                <Badge variant="outline" className="ml-auto">
                  Monday, Sep 1, 2025
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {activityProgress.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-2">
                      <CircularProgress 
                        value={item.progress} 
                        size={80} 
                        strokeWidth={6}
                        className="mx-auto"
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.period}
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {item.actual}/{item.goal}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Goal vs Actual Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                Goal vs Actual Performance
                <Select value="daily">
                  <SelectTrigger className="w-20 ml-auto">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {goalVsActual.map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="mb-2">
                      <CircularProgress 
                        value={item.progress} 
                        size={80} 
                        strokeWidth={6}
                        className="mx-auto"
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className={`text-xs font-medium ${item.color}`}>
                      {item.comparison}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}