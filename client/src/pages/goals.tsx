import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  Clock,
  CheckCircle2,
  Trophy,
  Flame,
  Edit3,
  Plus,
  BarChart3,
  Users,
  Phone,
  Home,
  FileText,
  HandHeart,
  Timer,
  PenTool,
  Save
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { DailyGoalsSidebar } from "@/components/goals/daily-goals-sidebar";

interface Goal {
  id: string;
  period: 'daily' | 'weekly' | 'monthly';
  calls?: number;
  appointments?: number;
  cmas?: number;
  hours?: number;
  offersToWrite?: number;
  monthlyClosings?: number;
  isLocked: boolean;
  effectiveDate: string;
  createdAt: string;
  updatedAt: string;
}

interface ActivityActual {
  id: string;
  date: string;
  calls: number;
  appointments: number;
  sellerAppts: number;
  buyerAppts: number;
  appointmentsSet: number;
  cmasCompleted: number;
  hoursWorked: number;
  offersWritten: number;
  showings: number;
}

export default function Goals() {
  const [activeTab, setActiveTab] = useState("daily");
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [editMode, setEditMode] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [showActivityDialog, setShowActivityDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [editingGoals, setEditingGoals] = useState({
    calls: 25,
    appointments: 8,
    cmas: 3,
    hours: 8,
    offers: 2,
    closings: 4
  });
  const [newGoalForm, setNewGoalForm] = useState({
    period: "daily",
    calls: "",
    appointments: "",
    cmas: "",
    hours: "",
    offers: "",
    closings: ""
  });
  const [activityForm, setActivityForm] = useState({
    calls: "",
    appointments: "",
    sellerAppts: "",
    buyerAppts: "",
    appointmentsSet: "",
    cmasCompleted: "",
    hoursWorked: "",
    offersWritten: "",
    showings: "",
    // Goal completion tracking
    callsGoalMet: false,
    appointmentsGoalMet: false,
    cmasGoalMet: false,
    hoursGoalMet: false,
    offersGoalMet: false,
    showingsGoalMet: false
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch goals and activity data
  const { data: goals = [], isLoading: goalsLoading } = useQuery({
    queryKey: ['/api/goals'],
  });

  const { data: activityActuals = [], isLoading: activitiesLoading } = useQuery<ActivityActual[]>({
    queryKey: ['/api/activity-actuals'],
  });

  // Mutation for creating new goals
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: any) => {
      return apiRequest('POST', '/api/goals', goalData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: "Goal Created",
        description: "Your new goal has been saved successfully.",
      });
      setShowNewGoalDialog(false);
      setNewGoalForm({
        period: "daily",
        calls: "",
        appointments: "",
        cmas: "",
        hours: "",
        offers: "",
        closings: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  // Mutation for creating/updating activity actuals
  const saveActivityMutation = useMutation({
    mutationFn: async (activityData: any) => {
      return apiRequest('POST', '/api/activity-actuals', activityData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity-actuals'] });
      toast({
        title: "Activity Logged",
        description: "Your daily activities have been saved successfully.",
      });
      setShowActivityDialog(false);
      setActivityForm({
        calls: "",
        appointments: "",
        sellerAppts: "",
        buyerAppts: "",
        appointmentsSet: "",
        cmasCompleted: "",
        hoursWorked: "",
        offersWritten: "",
        showings: "",
        callsGoalMet: false,
        appointmentsGoalMet: false,
        cmasGoalMet: false,
        hoursGoalMet: false,
        offersGoalMet: false,
        showingsGoalMet: false
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save activities",
        variant: "destructive",
      });
    },
  });

  // Handle edit goals toggle and save
  const handleEditGoals = async () => {
    if (editMode) {
      // Save the edited goals
      try {
        const goalData = {
          period: 'daily',
          calls: editingGoals.calls,
          appointments: editingGoals.appointments,
          cmas: editingGoals.cmas,
          hours: editingGoals.hours,
          offersToWrite: editingGoals.offers,
          monthlyClosings: editingGoals.closings,
          effectiveDate: format(new Date(), 'yyyy-MM-dd')
        };
        
        await createGoalMutation.mutateAsync(goalData);
        setEditMode(false);
      } catch (error) {
        // Error handling is done in mutation
      }
    } else {
      setEditMode(true);
    }
  };

  // Handle new goal form submission
  const handleNewGoalSubmit = () => {
    const goalData = {
      period: newGoalForm.period,
      calls: newGoalForm.calls ? parseInt(newGoalForm.calls) : null,
      appointments: newGoalForm.appointments ? parseInt(newGoalForm.appointments) : null,
      cmas: newGoalForm.cmas ? parseInt(newGoalForm.cmas) : null,
      hours: newGoalForm.hours ? parseInt(newGoalForm.hours) : null,
      offersToWrite: newGoalForm.offers ? parseInt(newGoalForm.offers) : null,
      monthlyClosings: newGoalForm.closings ? parseInt(newGoalForm.closings) : null,
      effectiveDate: format(new Date(), 'yyyy-MM-dd')
    };

    createGoalMutation.mutate(goalData);
  };

  // Handle opening activity logging dialog
  const handleLogActivity = (dateStr: string) => {
    setSelectedDate(dateStr);
    // Pre-fill form with existing values if any
    const existingActivity = activityActuals.find((a: ActivityActual) => a.date === dateStr);
    if (existingActivity) {
      setActivityForm({
        calls: existingActivity.calls.toString(),
        appointments: existingActivity.appointments.toString(),
        cmasCompleted: existingActivity.cmasCompleted.toString(),
        hoursWorked: existingActivity.hoursWorked.toString(),
        offersWritten: existingActivity.offersWritten.toString(),
        showings: existingActivity.showings.toString(),
        callsGoalMet: false,
        appointmentsGoalMet: false,
        cmasGoalMet: false,
        hoursGoalMet: false,
        offersGoalMet: false,
        showingsGoalMet: false
      });
    } else {
      setActivityForm({
        calls: "",
        appointments: "",
        cmasCompleted: "",
        hoursWorked: "",
        offersWritten: "",
        showings: "",
        callsGoalMet: false,
        appointmentsGoalMet: false,
        cmasGoalMet: false,
        hoursGoalMet: false,
        offersGoalMet: false,
        showingsGoalMet: false
      });
    }
    setShowActivityDialog(true);
  };

  // Handle activity form submission
  const handleActivitySubmit = () => {
    const activityData = {
      date: selectedDate,
      calls: activityForm.calls ? parseInt(activityForm.calls) : 0,
      appointments: activityForm.appointments ? parseInt(activityForm.appointments) : 0,
      sellerAppts: activityForm.sellerAppts ? parseInt(activityForm.sellerAppts) : 0,
      buyerAppts: activityForm.buyerAppts ? parseInt(activityForm.buyerAppts) : 0,
      appointmentsSet: activityForm.appointmentsSet ? parseInt(activityForm.appointmentsSet) : 0,
      cmasCompleted: activityForm.cmasCompleted ? parseInt(activityForm.cmasCompleted) : 0,
      hoursWorked: activityForm.hoursWorked ? parseInt(activityForm.hoursWorked) : 0,
      offersWritten: activityForm.offersWritten ? parseInt(activityForm.offersWritten) : 0,
      showings: activityForm.showings ? parseInt(activityForm.showings) : 0,
    };

    saveActivityMutation.mutate(activityData);
  };

  // Get current week's daily goals
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Goal categories with icons and colors
  const goalCategories = [
    {
      id: 'calls',
      label: 'Phone Calls',
      icon: Phone,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      target: 25,
      unit: 'calls'
    },
    {
      id: 'appointments',
      label: 'Appointments',
      icon: Users,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
      target: 8,
      unit: 'meetings'
    },
    {
      id: 'cmas',
      label: 'Market Analysis',
      icon: BarChart3,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      target: 3,
      unit: 'CMAs'
    },
    {
      id: 'hours',
      label: 'Work Hours',
      icon: Clock,
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      bgLight: 'bg-orange-50',
      target: 8,
      unit: 'hours'
    },
    {
      id: 'offers',
      label: 'Offers Written',
      icon: PenTool,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
      target: 2,
      unit: 'offers'
    },
    {
      id: 'closings',
      label: 'Monthly Closings',
      icon: Home,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      bgLight: 'bg-emerald-50',
      target: 4,
      unit: 'closings'
    }
  ];

  // Calculate today's progress
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayActuals = activityActuals.find((a: ActivityActual) => a.date === today) || {} as ActivityActual;

  const getProgressValue = (category: string) => {
    let actual = 0;
    
    // Map category IDs to correct database field names
    switch (category) {
      case 'calls':
        actual = todayActuals.calls || 0;
        break;
      case 'appointments':
        actual = todayActuals.appointments || 0;
        break;
      case 'cmas':
        actual = todayActuals.cmasCompleted || 0;
        break;
      case 'hours':
        actual = todayActuals.hoursWorked || 0;
        break;
      case 'offers':
        actual = todayActuals.offersWritten || 0;
        break;
      case 'closings':
        actual = todayActuals.showings || 0; // Using showings for now as closings placeholder
        break;
    }
    
    const categoryData = goalCategories.find(g => g.id === category);
    return categoryData ? (actual / categoryData.target) * 100 : 0;
  };

  const getActualValue = (category: string) => {
    // Map category IDs to correct database field names
    switch (category) {
      case 'calls':
        return todayActuals.calls || 0;
      case 'appointments':
        return todayActuals.appointments || 0;
      case 'cmas':
        return todayActuals.cmasCompleted || 0;
      case 'hours':
        return todayActuals.hoursWorked || 0;
      case 'offers':
        return todayActuals.offersWritten || 0;
      case 'closings':
        return todayActuals.showings || 0; // Using showings for now as closings placeholder
      default:
        return 0;
    }
  };

  // Weekly progress data for charts
  const weeklyData = weekDays.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const dayActuals = activityActuals.find((a: ActivityActual) => a.date === dateStr) || {} as ActivityActual;
    
    return {
      date: format(day, 'EEE'),
      calls: dayActuals.calls || 0,
      appointments: dayActuals.appointments || 0,
      cmas: dayActuals.cmasCompleted || 0,
      hours: dayActuals.hoursWorked || 0,
    };
  });

  if (goalsLoading || activitiesLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Loading goals and activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-gray-900 min-w-0 overflow-hidden">
      <div className="container mx-auto p-3 sm:p-6 max-w-7xl min-w-0">
        
        {/* Debug Info */}
        <div className="mb-4 p-4 bg-white rounded-lg shadow">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Goals loading: {goalsLoading.toString()}</p>
          <p>Activities loading: {activitiesLoading.toString()}</p>
          <p>Goals count: {goals?.length || 0}</p>
          <p>Activities count: {activityActuals?.length || 0}</p>
        </div>

        {/* Side-by-side layout: Daily Goals Sidebar and Main Content */}
        <div className="flex flex-col lg:flex-row gap-6 min-w-0">
          {/* Daily Goals Sidebar - Fixed width on large screens */}
          <div className="lg:w-80 flex-shrink-0">
            <DailyGoalsSidebar />
          </div>

          {/* Main Goals Content - Flexible width */}
          <div className="flex-1 min-w-0">
            {/* Modern Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div className="space-y-2 min-w-0 flex-1">
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Goals & Performance
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-lg">
                Track your daily progress and achieve your real estate targets
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
              <Button
                onClick={handleEditGoals}
                disabled={createGoalMutation.isPending}
                variant={editMode ? "default" : "outline"}
                className="flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                {editMode ? <Save className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                <span className="hidden sm:inline">
                  {createGoalMutation.isPending ? 'Saving...' : (editMode ? 'Save Changes' : 'Edit Goals')}
                </span>
                <span className="sm:hidden">
                  {createGoalMutation.isPending ? 'Saving...' : (editMode ? 'Save' : 'Edit')}
                </span>
              </Button>
              
              <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">New Goal</span>
                    <span className="sm:hidden">Goal</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Create New Goal</DialogTitle>
                    <DialogDescription>
                      Set a new performance target for your real estate activities.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="period">Goal Period</Label>
                      <Select 
                        value={newGoalForm.period} 
                        onValueChange={(value) => setNewGoalForm({...newGoalForm, period: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calls">Phone Calls</Label>
                        <Input
                          id="calls"
                          type="number"
                          placeholder="25"
                          value={newGoalForm.calls}
                          onChange={(e) => setNewGoalForm({...newGoalForm, calls: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="appointments">Appointments</Label>
                        <Input
                          id="appointments"
                          type="number"
                          placeholder="8"
                          value={newGoalForm.appointments}
                          onChange={(e) => setNewGoalForm({...newGoalForm, appointments: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cmas">Market Analysis</Label>
                        <Input
                          id="cmas"
                          type="number"
                          placeholder="3"
                          value={newGoalForm.cmas}
                          onChange={(e) => setNewGoalForm({...newGoalForm, cmas: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hours">Work Hours</Label>
                        <Input
                          id="hours"
                          type="number"
                          placeholder="8"
                          value={newGoalForm.hours}
                          onChange={(e) => setNewGoalForm({...newGoalForm, hours: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="offers">Offers Written</Label>
                        <Input
                          id="offers"
                          type="number"
                          placeholder="2"
                          value={newGoalForm.offers}
                          onChange={(e) => setNewGoalForm({...newGoalForm, offers: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="closings">Monthly Closings</Label>
                        <Input
                          id="closings"
                          type="number"
                          placeholder="4"
                          value={newGoalForm.closings}
                          onChange={(e) => setNewGoalForm({...newGoalForm, closings: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      disabled={createGoalMutation.isPending}
                      onClick={handleNewGoalSubmit}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Today's Focus</p>
                    <p className="text-2xl font-bold text-gray-900">6/6</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Weekly Streak</p>
                    <p className="text-2xl font-bold text-orange-600">7 Days</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Flame className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-purple-600">85%</p>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-blue-600">92%</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur border-0 shadow-lg p-1">
            <TabsTrigger value="daily" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Daily Goals
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>


          {/* Daily Goals Tab with Overview Integration */}
          <TabsContent value="daily" className="space-y-6">
            {/* Today's Goal Overview Cards */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Today's Goal Progress
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {goalCategories.slice(0,6).map((category) => {
                  const IconComponent = category.icon;
                  const progress = getProgressValue(category.id);
                  const actual = getActualValue(category.id);
                  
                  return (
                    <Card key={category.id} className="bg-white/80 backdrop-blur border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`h-10 w-10 ${category.bgLight} rounded-xl flex items-center justify-center`}>
                            <IconComponent className={`h-5 w-5 ${category.textColor}`} />
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {format(new Date(), 'MMM dd')}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div>
                            <h3 className="font-medium text-gray-900 text-sm">{category.label}</h3>
                            {editMode ? (
                              <div className="flex items-center gap-2 mt-1">
                                <Label className="text-xs">Target:</Label>
                                <Input
                                  type="number"
                                  value={editingGoals[category.id as keyof typeof editingGoals]}
                                  onChange={(e) => setEditingGoals({
                                    ...editingGoals,
                                    [category.id]: parseInt(e.target.value) || 0
                                  })}
                                  className="w-12 h-6 text-center text-xs"
                                />
                                <span className="text-xs text-gray-500">{category.unit}</span>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500">Target: {category.target} {category.unit}</p>
                            )}
                          </div>
                          
                          <div className="flex items-end justify-between">
                            <div>
                              <span className="text-2xl font-bold text-gray-900">{actual}</span>
                              <span className="text-gray-500 ml-1 text-sm">/ {editMode ? editingGoals[category.id as keyof typeof editingGoals] : category.target}</span>
                            </div>
                            <span className={`text-xs font-medium ${progress >= 100 ? 'text-green-600' : category.textColor}`}>
                              {Math.round(progress)}%
                            </span>
                          </div>
                          
                          <Progress value={progress} className="h-2" />
                          
                          {progress >= 100 && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle2 className="h-3 w-3" />
                              <span className="text-xs font-medium">Goal Complete!</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl">Daily Goal Tracker</CardTitle>
                    <CardDescription>Set and track your daily performance targets</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                    >
                      Previous Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(new Date())}
                    >
                      This Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                    >
                      Next Week
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="grid grid-cols-7 gap-4">
                  {weekDays.map((day) => {
                    const isToday = isSameDay(day, new Date());
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayActuals = activityActuals.find((a: ActivityActual) => a.date === dateStr) || {} as ActivityActual;
                    
                    return (
                      <Card 
                        key={dateStr} 
                        className={`${isToday ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white'} border shadow-sm`}
                      >
                        <CardContent className="p-4">
                          <div className="text-center space-y-3">
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide">
                                {format(day, 'EEE')}
                              </p>
                              <p className={`text-lg font-bold ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                                {format(day, 'd')}
                              </p>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span>Calls</span>
                                <span className="font-medium">{dayActuals.calls || 0}/25</span>
                              </div>
                              <Progress value={((dayActuals.calls || 0) / 25) * 100} className="h-1" />
                              
                              <div className="flex items-center justify-between text-xs">
                                <span>Meetings</span>
                                <span className="font-medium">{dayActuals.appointments || 0}/8</span>
                              </div>
                              <Progress value={((dayActuals.appointments || 0) / 8) * 100} className="h-1" />
                              
                              <div className="flex items-center justify-between text-xs">
                                <span>Hours</span>
                                <span className="font-medium">{dayActuals.hoursWorked || 0}/8</span>
                              </div>
                              <Progress value={((dayActuals.hoursWorked || 0) / 8) * 100} className="h-1" />
                            </div>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLogActivity(dateStr)}
                              className="w-full text-xs mt-2"
                              data-testid={`log-activity-${dateStr}`}
                            >
                              <PenTool className="h-3 w-3 mr-1" />
                              Log Activity
                            </Button>
                            
                            {isToday && (
                              <Badge className="text-xs bg-blue-600 text-white">Today</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Weekly Activity Trends</CardTitle>
                  <CardDescription>Your activity patterns over the current week</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area 
                        type="monotone" 
                        dataKey="calls" 
                        stackId="1" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.6}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="appointments" 
                        stackId="1" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Performance Score</CardTitle>
                  <CardDescription>Overall goal completion rate this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {goalCategories.slice(0, 4).map((category) => {
                      const progress = getProgressValue(category.id);
                      const IconComponent = category.icon;
                      
                      return (
                        <div key={category.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 ${category.bgLight} rounded-lg flex items-center justify-center`}>
                              <IconComponent className={`h-5 w-5 ${category.textColor}`} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{category.label}</p>
                              <p className="text-sm text-gray-500">{getActualValue(category.id)}/{category.target} {category.unit}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Progress value={progress} className="w-24 h-2" />
                            <span className={`text-sm font-medium ${progress >= 100 ? 'text-green-600' : category.textColor}`}>
                              {Math.round(progress)}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Deep insights into your goal achievement patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-green-600">94%</p>
                    <p className="text-sm text-gray-600">Average Completion Rate</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-blue-600">7.2</p>
                    <p className="text-sm text-gray-600">Days Streak Average</p>
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-3xl font-bold text-purple-600">156</p>
                    <p className="text-sm text-gray-600">Total Goals This Month</p>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="calls" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="cmas" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Enhanced Activity Logging Dialog with Goal Completion */}
        <Dialog open={showActivityDialog} onOpenChange={setShowActivityDialog}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Log Daily Activities & Goal Progress</DialogTitle>
              <DialogDescription>
                Track your completed activities and goal achievement for {selectedDate && format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d, yyyy')}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Phone Calls */}
              <div className="space-y-3 p-4 bg-blue-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-medium text-blue-900">Phone Calls (Goal: 25)</Label>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <Label htmlFor="activity-calls" className="text-sm">Actual calls made</Label>
                    <Input
                      id="activity-calls"
                      type="number"
                      placeholder="0"
                      min="0"
                      value={activityForm.calls}
                      onChange={(e) => setActivityForm({...activityForm, calls: e.target.value})}
                      data-testid="input-activity-calls"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="calls-goal-met"
                      checked={activityForm.callsGoalMet}
                      onCheckedChange={(checked) => setActivityForm({...activityForm, callsGoalMet: checked as boolean})}
                      data-testid="checkbox-calls-goal"
                    />
                    <Label htmlFor="calls-goal-met" className="text-sm font-medium">
                      Did you meet your calls goal today?
                    </Label>
                  </div>
                </div>
              </div>

              {/* Appointments */}
              <div className="space-y-3 p-4 bg-green-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <Label className="text-base font-medium text-green-900">Appointments (Goal: 8)</Label>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <Label htmlFor="activity-appointments" className="text-sm">Actual appointments held</Label>
                    <Input
                      id="activity-appointments"
                      type="number"
                      placeholder="0"
                      min="0"
                      value={activityForm.appointments}
                      onChange={(e) => setActivityForm({...activityForm, appointments: e.target.value})}
                      data-testid="input-activity-appointments"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="appointments-goal-met"
                      checked={activityForm.appointmentsGoalMet}
                      onCheckedChange={(checked) => setActivityForm({...activityForm, appointmentsGoalMet: checked as boolean})}
                      data-testid="checkbox-appointments-goal"
                    />
                    <Label htmlFor="appointments-goal-met" className="text-sm font-medium">
                      Did you meet your meetings goal today?
                    </Label>
                  </div>
                </div>
              </div>

              {/* Work Hours */}
              <div className="space-y-3 p-4 bg-orange-50 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <Label className="text-base font-medium text-orange-900">Work Hours (Goal: 8)</Label>
                </div>
                <div className="grid grid-cols-2 gap-4 items-center">
                  <div>
                    <Label htmlFor="activity-hours" className="text-sm">Actual hours worked</Label>
                    <Input
                      id="activity-hours"
                      type="number"
                      placeholder="0"
                      min="0"
                      step="0.5"
                      value={activityForm.hoursWorked}
                      onChange={(e) => setActivityForm({...activityForm, hoursWorked: e.target.value})}
                      data-testid="input-activity-hours"
                      className="mt-1"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="hours-goal-met"
                      checked={activityForm.hoursGoalMet}
                      onCheckedChange={(checked) => setActivityForm({...activityForm, hoursGoalMet: checked as boolean})}
                      data-testid="checkbox-hours-goal"
                    />
                    <Label htmlFor="hours-goal-met" className="text-sm font-medium">
                      Did you meet your hours goal today?
                    </Label>
                  </div>
                </div>
              </div>

              {/* Additional Activities in Compact Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 p-3 bg-indigo-50 rounded-lg border">
                  <Label htmlFor="activity-seller-appts" className="flex items-center gap-2 text-sm font-medium">
                    <HandHeart className="h-4 w-4 text-indigo-600" />
                    Seller Appts
                  </Label>
                  <Input
                    id="activity-seller-appts"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={activityForm.sellerAppts}
                    onChange={(e) => setActivityForm({...activityForm, sellerAppts: e.target.value})}
                    data-testid="input-activity-seller-appts"
                  />
                </div>

                <div className="space-y-2 p-3 bg-cyan-50 rounded-lg border">
                  <Label htmlFor="activity-buyer-appts" className="flex items-center gap-2 text-sm font-medium">
                    <Users className="h-4 w-4 text-cyan-600" />
                    Buyer Appts
                  </Label>
                  <Input
                    id="activity-buyer-appts"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={activityForm.buyerAppts}
                    onChange={(e) => setActivityForm({...activityForm, buyerAppts: e.target.value})}
                    data-testid="input-activity-buyer-appts"
                  />
                </div>

                <div className="space-y-2 p-3 bg-pink-50 rounded-lg border">
                  <Label htmlFor="activity-appointments-set" className="flex items-center gap-2 text-sm font-medium">
                    <Calendar className="h-4 w-4 text-pink-600" />
                    Appointments Set
                  </Label>
                  <Input
                    id="activity-appointments-set"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={activityForm.appointmentsSet}
                    onChange={(e) => setActivityForm({...activityForm, appointmentsSet: e.target.value})}
                    data-testid="input-activity-appointments-set"
                  />
                </div>
                
                <div className="space-y-2 p-3 bg-purple-50 rounded-lg border">
                  <Label htmlFor="activity-cmas" className="flex items-center gap-2 text-sm font-medium">
                    <BarChart3 className="h-4 w-4 text-purple-600" />
                    Market Analysis (CMAs)
                  </Label>
                  <Input
                    id="activity-cmas"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={activityForm.cmasCompleted}
                    onChange={(e) => setActivityForm({...activityForm, cmasCompleted: e.target.value})}
                    data-testid="input-activity-cmas"
                  />
                </div>
                
                <div className="space-y-2 p-3 bg-red-50 rounded-lg border">
                  <Label htmlFor="activity-offers" className="flex items-center gap-2 text-sm font-medium">
                    <FileText className="h-4 w-4 text-red-600" />
                    Offers Written
                  </Label>
                  <Input
                    id="activity-offers"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={activityForm.offersWritten}
                    onChange={(e) => setActivityForm({...activityForm, offersWritten: e.target.value})}
                    data-testid="input-activity-offers"
                  />
                </div>
                
                <div className="space-y-2 p-3 bg-emerald-50 rounded-lg border">
                  <Label htmlFor="activity-showings" className="flex items-center gap-2 text-sm font-medium">
                    <Home className="h-4 w-4 text-emerald-600" />
                    Property Showings
                  </Label>
                  <Input
                    id="activity-showings"
                    type="number"
                    placeholder="0"
                    min="0"
                    value={activityForm.showings}
                    onChange={(e) => setActivityForm({...activityForm, showings: e.target.value})}
                    data-testid="input-activity-showings"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowActivityDialog(false)}
                data-testid="button-cancel-activity"
              >
                Cancel
              </Button>
              <Button
                onClick={handleActivitySubmit}
                disabled={saveActivityMutation.isPending}
                data-testid="button-save-activity"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {saveActivityMutation.isPending ? 'Saving...' : 'Save Activities & Goals'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
          </div> {/* End Main Goals Content */}
        </div> {/* End Side-by-side layout */}
      </div>
    </div>
  );
}