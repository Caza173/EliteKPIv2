import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Target, Calendar, Phone, Clock, Users, Home, FileText, Search, CheckCircle, Eye, Key, Droplets, MapPin, FileSignature } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface DailyActivity {
  id: string;
  date: string;
  callsMade: number;
  hoursWorked: number;
  appointmentsSet: number;
  buyerAppointments: number;
  sellerAppointments: number;
  cmas: number;
  showings: number;
  appraisals: number;
  homeInspections: number;
  septicInspections: number;
  walkthroughs: number;
  closings: number;
  notes?: string;
}

interface ActivityGoal {
  id: string;
  activityType: string;
  goalValue: number;
  frequency: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
}

interface ActivityType {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const ACTIVITY_TYPES: ActivityType[] = [
  { id: 'calls', name: 'Calls Made', icon: Phone, color: 'bg-blue-500', description: 'Prospecting and follow-up calls' },
  { id: 'hours', name: 'Hours Worked', icon: Clock, color: 'bg-green-500', description: 'Total work hours logged' },
  { id: 'appointments', name: 'Appointments Set', icon: Calendar, color: 'bg-purple-500', description: 'New appointments scheduled' },
  { id: 'cmas', name: 'CMAs', icon: FileText, color: 'bg-indigo-500', description: 'Comparative Market Analyses' },
  { id: 'callsAnswered', name: 'Calls Answered', icon: Phone, color: 'bg-teal-500', description: 'Successfully answered calls' },
  { id: 'offersToWrite', name: 'Offers to Write', icon: FileSignature, color: 'bg-orange-500', description: 'Offers to be written' },
  { id: 'monthlyClosings', name: 'Monthly Closings', icon: Home, color: 'bg-emerald-500', description: 'Target monthly closings' },
];

const MOCK_DAILY_ACTIVITIES: DailyActivity[] = [
  {
    id: '1',
    date: '2025-09-01',
    callsMade: 25,
    hoursWorked: 8,
    appointmentsSet: 3,
    buyerAppointments: 1,
    sellerAppointments: 2,
    cmas: 1,
    showings: 4,
    appraisals: 0,
    homeInspections: 1,
    septicInspections: 0,
    walkthroughs: 0,
    closings: 1,
    notes: 'Great day with successful listing appointment'
  },
  {
    id: '2',
    date: '2025-09-02',
    callsMade: 18,
    hoursWorked: 7,
    appointmentsSet: 2,
    buyerAppointments: 2,
    sellerAppointments: 0,
    cmas: 2,
    showings: 3,
    appraisals: 1,
    homeInspections: 0,
    septicInspections: 1,
    walkthroughs: 1,
    closings: 0,
    notes: 'Focused on buyer clients today'
  },
];

const MOCK_GOALS: ActivityGoal[] = [
  { id: '1', activityType: 'calls', goalValue: 20, frequency: 'daily', startDate: '2025-09-01', isActive: true },
  { id: '2', activityType: 'hours', goalValue: 8, frequency: 'daily', startDate: '2025-09-01', isActive: true },
  { id: '3', activityType: 'showings', goalValue: 15, frequency: 'weekly', startDate: '2025-09-01', isActive: true },
  { id: '4', activityType: 'appointments', goalValue: 10, frequency: 'weekly', startDate: '2025-09-01', isActive: true },
];

function PerformanceCalendar() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showDayModal, setShowDayModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [activeTab, setActiveTab] = useState('log');
  const [goalTab, setGoalTab] = useState('create');
  const [dailyActivityData, setDailyActivityData] = useState<Partial<DailyActivity>>({});
  const [goalData, setGoalData] = useState<Partial<ActivityGoal>>({ frequency: 'daily' });
  
  // New goal form state
  const [newGoal, setNewGoal] = useState<{
    activityType: string;
    goalValue: number;
    frequency: 'daily' | 'weekly' | 'monthly';
  }>({
    activityType: '',
    goalValue: 0,
    frequency: 'daily'
  });
  
  // Success feedback state
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Local notes state for smooth typing
  const [localNotes, setLocalNotes] = useState('');
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const queryClient = useQueryClient();

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
    };
  }, []);

  // Fetch daily activities from existing activity actuals API
  const { data: activityActuals = [] } = useQuery({
    queryKey: ['/api/activity-actuals'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/activity-actuals');
        if (!response.ok) throw new Error('Failed to fetch activity actuals');
        return await response.json();
      } catch (error) {
        console.log('Failed to fetch activity actuals, using empty array');
        return [];
      }
    }
  });

  // Transform activity actuals to daily activities format
  const dailyActivities = activityActuals.map((actual: any) => ({
    id: actual.id,
    date: actual.date,
    callsMade: actual.calls || 0,
    hoursWorked: parseFloat(actual.hoursWorked || '0'),
    appointmentsSet: actual.appointments || 0,
    buyerAppointments: 0, // Not tracked in current system
    sellerAppointments: 0, // Not tracked in current system  
    cmas: actual.cmas || 0,
    showings: 0, // Could be mapped from showings table
    appraisals: 0,
    homeInspections: 0,
    septicInspections: 0,
    walkthroughs: 0,
    closings: 0,
    notes: actual.notes || ''
  }));

  // Fetch goals from existing goals API
  const { data: goalsData = [] } = useQuery({
    queryKey: ['/api/goals'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/goals');
        if (!response.ok) throw new Error('Failed to fetch goals');
        return await response.json();
      } catch (error) {
        console.log('Failed to fetch goals, using empty array');
        return [];
      }
    }
  });

  // Transform goals to activity goals format
  const goals = goalsData.map((goal: any) => ({
    id: goal.id,
    activityType: 'calls', // Map based on goal type
    goalValue: goal.calls || goal.appointments || goal.hours || 0,
    frequency: goal.period || 'daily',
    startDate: goal.effectiveDate,
    endDate: null,
    isActive: true
  }));

  // Mutations for saving data
  const saveDailyActivityMutation = useMutation({
    mutationFn: async (data: Partial<DailyActivity>) => {
      // Convert to activity actual format
      const actualData = {
        date: data.date,
        calls: data.callsMade,
        hoursWorked: data.hoursWorked?.toString(),
        appointments: data.appointmentsSet,
        cmas: data.cmas,
        notes: data.notes
      };
      const response = await fetch('/api/activity-actuals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actualData),
      });
      if (!response.ok) throw new Error('Failed to save daily activity');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/activity-actuals'] });
      setShowSuccess(true);
      // Close dialog after showing success
      setTimeout(() => {
        setShowSuccess(false);
        setShowDayModal(false);
      }, 1500);
    },
    onError: () => {
      alert('Failed to save daily activities');
    }
  });

  const saveGoalMutation = useMutation({
    mutationFn: async (data: Partial<ActivityGoal>) => {
      // Convert to goals format
      const goalData = {
        period: data.frequency,
        calls: data.activityType === 'calls' ? data.goalValue : null,
        appointments: data.activityType === 'appointments' ? data.goalValue : null,
        hours: data.activityType === 'hours' ? data.goalValue : null,
        effectiveDate: data.startDate
      };
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      if (!response.ok) throw new Error('Failed to save goal');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setShowGoalModal(false);
      alert('Goal saved successfully!');
    },
    onError: () => {
      alert('Failed to save goal');
    }
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: {
      activityType: string;
      goalValue: number;
      frequency: 'daily' | 'weekly' | 'monthly';
    }) => {
      // Convert to goals format with only valid fields
      const goalData = {
        period: data.frequency,
        calls: data.activityType === 'calls' ? data.goalValue : null,
        callsAnswered: data.activityType === 'callsAnswered' ? data.goalValue : null,
        appointments: data.activityType === 'appointments' ? data.goalValue : null,
        cmas: data.activityType === 'cmas' ? data.goalValue : null,
        hours: data.activityType === 'hours' ? data.goalValue : null,
        offersToWrite: data.activityType === 'offersToWrite' ? data.goalValue : null,
        monthlyClosings: data.activityType === 'monthlyClosings' ? data.goalValue : null,
        effectiveDate: new Date().toISOString().split('T')[0]
      };
      
      console.log('Creating goal with data:', goalData);
      
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goalData),
      });
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Goal creation failed:', errorText);
        throw new Error(`Failed to create goal: ${response.status}`);
      }
      return response.json();
    },
    onSuccess: () => {
      console.log('Goal created successfully');
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      setNewGoal({ activityType: '', goalValue: 0, frequency: 'daily' });
      setGoalTab('manage');
    },
    onError: (error) => {
      console.error('Goal creation error:', error);
      alert(`Failed to create goal: ${error.message}`);
    }
  });

  // Debounced notes save function
  const debouncedSaveNotes = useCallback((notes: string) => {
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    
    notesTimeoutRef.current = setTimeout(() => {
      setDailyActivityData(prev => ({
        ...prev,
        notes
      }));
    }, 500); // Save after 500ms of no typing
  }, []);

  // Handle notes input change
  const handleNotesChange = useCallback((value: string) => {
    setLocalNotes(value);
    debouncedSaveNotes(value);
  }, [debouncedSaveNotes]);

  // Handle notes blur (save immediately)
  const handleNotesBlur = useCallback(() => {
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    setDailyActivityData(prev => ({
      ...prev,
      notes: localNotes
    }));
  }, [localNotes]);

  // Handle modal close (save notes before closing)
  const handleModalClose = useCallback((open: boolean) => {
    if (!open) {
      // Save notes before closing
      if (notesTimeoutRef.current) {
        clearTimeout(notesTimeoutRef.current);
      }
      setDailyActivityData(prev => ({
        ...prev,
        notes: localNotes
      }));
    }
    setShowDayModal(open);
  }, [localNotes]);

  // Event handlers
  const handleDayClick = (day: number) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const clickedDate = new Date(currentYear, currentMonth, day);
    const dateString = clickedDate.toISOString().split('T')[0];
    
    // Find existing data for this day
    const existingActivity = dailyActivities.find((activity: any) => activity.date === dateString);
    if (existingActivity) {
      setDailyActivityData(existingActivity);
      setLocalNotes(existingActivity.notes || ''); // Initialize local notes
    } else {
      const newActivityData = {
        date: dateString,
        callsMade: 0,
        hoursWorked: 0,
        appointmentsSet: 0,
        buyerAppointments: 0,
        sellerAppointments: 0,
        cmas: 0,
        showings: 0,
        appraisals: 0,
        homeInspections: 0,
        septicInspections: 0,
        walkthroughs: 0,
        closings: 0,
        notes: ''
      };
      setDailyActivityData(newActivityData);
      setLocalNotes(''); // Initialize empty local notes
    }
    
    setSelectedDate(dateString);
    setShowDayModal(true);
  };

  const handleSaveDailyActivity = () => {
    if (!selectedDate) return;
    
    // Clear any pending debounced save
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    
    const activityData = {
      ...dailyActivityData,
      notes: localNotes, // Use current local notes value
      date: selectedDate
    };
    
    saveDailyActivityMutation.mutate(activityData);
  };

  const handleSaveGoal = () => {
    if (!goalData.activityType || !goalData.goalValue) {
      alert('Please fill in all required fields');
      return;
    }
    
    saveGoalMutation.mutate({
      ...goalData,
      startDate: new Date().toISOString().split('T')[0],
      isActive: true
    });
  };

  const handleCreateGoal = () => {
    if (!newGoal.activityType || !newGoal.goalValue) {
      alert('Please fill in all required fields');
      return;
    }
    
    createGoalMutation.mutate(newGoal);
  };

  // Helper functions
  const getTotalActivityCount = (date: string): number => {
    const activity = dailyActivities.find((a: DailyActivity) => a.date === date);
    if (!activity) return 0;
    
    return activity.callsMade + activity.appointmentsSet + activity.buyerAppointments + 
           activity.sellerAppointments + activity.cmas + activity.showings + 
           activity.appraisals + activity.homeInspections + activity.septicInspections + 
           activity.walkthroughs + activity.closings;
  };

  // Get activities for a date range (for weekly/monthly calculations)
  const getActivitiesInRange = (startDate: string, endDate: string) => {
    return dailyActivities.filter((activity: any) => 
      activity.date >= startDate && activity.date <= endDate
    );
  };

  // Calculate sum of activities in a range
  const sumActivitiesInRange = (activities: any[], fieldName: keyof DailyActivity) => {
    return activities.reduce((sum, activity) => sum + (activity[fieldName] || 0), 0);
  };

  // Get week start date (Sunday)
  const getWeekStart = (date: string) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff)).toISOString().split('T')[0];
  };

  // Get month start date
  const getMonthStart = (date: string) => {
    const d = new Date(date);
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  };

  // Calculate progress for a specific date with advanced goal resolution
  const calculateDayProgress = (date: string) => {
    const currentActivity = dailyActivities.find((a: any) => a.date === date);
    const currentDate = new Date(date);
    const progressData = [];

    const fieldMap: Record<string, keyof DailyActivity> = {
      'calls': 'callsMade',
      'hours': 'hoursWorked',
      'appointments': 'appointmentsSet',
      'buyerAppts': 'buyerAppointments',
      'sellerAppts': 'sellerAppointments',
      'cmas': 'cmas',
      'showings': 'showings',
      'appraisals': 'appraisals',
      'inspections': 'homeInspections',
      'septic': 'septicInspections',
      'walkthroughs': 'walkthroughs',
      'closings': 'closings'
    };

    for (const goal of goals.filter((g: any) => g.isActive)) {
      const activityType = ACTIVITY_TYPES.find(at => at.id === goal.activityType);
      if (!activityType) continue;

      const fieldName = fieldMap[goal.activityType];
      if (!fieldName) continue;

      let actualValue = 0;
      let targetValue = goal.goalValue;
      let percentage = 0;

      if (goal.frequency === 'daily') {
        // Daily goal: compare day's value vs daily goal
        actualValue = currentActivity?.[fieldName] || 0;
        percentage = targetValue > 0 ? Math.min((actualValue / targetValue), 1) : 0;
      } else if (goal.frequency === 'weekly') {
        // Weekly goal: compare week-to-date SUM vs weekly goal
        const weekStart = getWeekStart(date);
        const weekActivities = getActivitiesInRange(weekStart, date);
        actualValue = sumActivitiesInRange(weekActivities, fieldName);
        percentage = targetValue > 0 ? Math.min((actualValue / targetValue), 1) : 0;
      } else if (goal.frequency === 'monthly') {
        // Monthly goal: compare month-to-date SUM vs monthly goal
        const monthStart = getMonthStart(date);
        const monthActivities = getActivitiesInRange(monthStart, date);
        actualValue = sumActivitiesInRange(monthActivities, fieldName);
        percentage = targetValue > 0 ? Math.min((actualValue / targetValue), 1) : 0;
      }

      progressData.push({
        activityType,
        actual: actualValue,
        target: targetValue,
        percentage: percentage * 100,
        dayValue: currentActivity?.[fieldName] || 0, // Day's specific contribution
        frequency: goal.frequency,
        color: activityType.color
      });
    }

    return progressData;
  };

  // Calculate overall progress for a day
  const calculateOverallProgress = (date: string) => {
    const progressData = calculateDayProgress(date);
    if (progressData.length === 0) return null;

    const totalPercentage = progressData.reduce((sum, p) => sum + (p.percentage / 100), 0);
    const overallPercent = (totalPercentage / progressData.length) * 100;
    
    return {
      percentage: Math.min(overallPercent, 100),
      hasGoals: progressData.length > 0
    };
  };

  // Get top 3 activities for a day
  const getTopActivities = (date: string) => {
    const activity = dailyActivities.find((a: any) => a.date === date);
    if (!activity) return [];

    const activities = [
      { name: 'Calls', value: activity.callsMade, field: 'callsMade' },
      { name: 'Hours', value: activity.hoursWorked, field: 'hoursWorked', suffix: 'h' },
      { name: 'Appts', value: activity.appointmentsSet, field: 'appointmentsSet' },
      { name: 'Buyer', value: activity.buyerAppointments, field: 'buyerAppointments' },
      { name: 'Seller', value: activity.sellerAppointments, field: 'sellerAppointments' },
      { name: 'CMAs', value: activity.cmas, field: 'cmas' },
      { name: 'Shows', value: activity.showings, field: 'showings' },
      { name: 'Appraise', value: activity.appraisals, field: 'appraisals' },
      { name: 'Inspect', value: activity.homeInspections, field: 'homeInspections' },
      { name: 'Septic', value: activity.septicInspections, field: 'septicInspections' },
      { name: 'Walk', value: activity.walkthroughs, field: 'walkthroughs' },
      { name: 'Close', value: activity.closings, field: 'closings' },
    ];

    return activities
      .filter(a => a.value > 0)
      .sort((a, b) => b.value - a.value)
      .slice(0, 3);
  };

  // Get cell background color based on progress
  const getCellBackgroundClass = (date: string) => {
    const overallProgress = calculateOverallProgress(date);
    const hasData = dailyActivities.some((a: any) => a.date === date);
    
    if (!hasData) return 'bg-white hover:bg-blue-50';
    if (!overallProgress?.hasGoals) return 'bg-gray-50 hover:bg-gray-100';
    
    const percentage = overallProgress.percentage;
    if (percentage >= 80) return 'bg-green-100 border-green-300 hover:bg-green-150';
    if (percentage >= 60) return 'bg-yellow-100 border-yellow-300 hover:bg-yellow-150';
    return 'bg-red-100 border-red-300 hover:bg-red-150';
  };

  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(year, month, day).toISOString().split('T')[0];
      const dailyActivity = dailyActivities.find((activity: any) => activity.date === dateString);
      const hasData = !!dailyActivity;
      const activityCount = getTotalActivityCount(dateString);
      const progressData = calculateDayProgress(dateString);
      const topActivities = getTopActivities(dateString);
      const overallProgress = calculateOverallProgress(dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];
      
      days.push(
        <div
          key={day}
          className={`h-36 border p-2 cursor-pointer transition-all hover:shadow-lg ${getCellBackgroundClass(dateString)} ${
            isToday ? 'ring-2 ring-blue-500' : 'border-gray-200'
          }`}
          onClick={() => handleDayClick(day)}
        >
          {/* Day number */}
          <div className={`font-bold text-sm mb-1 ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
            {day}
          </div>
          
          {hasData ? (
            <div className="space-y-1">
              {/* Overall progress bar */}
              {overallProgress?.hasGoals && (
                <div className="mb-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        overallProgress.percentage >= 80 
                          ? 'bg-green-500' 
                          : overallProgress.percentage >= 60 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(overallProgress.percentage, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Activity summary */}
              <div className="text-xs text-gray-700 font-medium">
                ✓ {activityCount} activities
                {dailyActivity?.hoursWorked > 0 && ` • ${dailyActivity.hoursWorked}h worked`}
              </div>
              
              {/* Top 3 activities */}
              {topActivities.length > 0 && (
                <div className="space-y-0.5">
                  {topActivities.map((activity: any, index: number) => (
                    <div key={index} className="text-xs text-gray-600">
                      {activity.name} {activity.value}{activity.suffix || ''}
                    </div>
                  ))}
                </div>
              )}
              
              {/* Additional activities indicator */}
              {activityCount > topActivities.reduce((sum: number, a: any) => sum + a.value, 0) && (
                <div className="text-xs text-gray-500">
                  +{activityCount - topActivities.reduce((sum: number, a: any) => sum + a.value, 0)} more
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-gray-400 mt-1">
              Click to add
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const DayEntryModal = () => (
    <Dialog open={showDayModal} onOpenChange={handleModalClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            Daily Activities - {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }) : ''}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="log">Log Activities</TabsTrigger>
            <TabsTrigger value="goals">View Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="log" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ACTIVITY_TYPES.map((activity) => {
                const IconComponent = activity.icon;
                const fieldMap: Record<string, keyof DailyActivity> = {
                  'calls': 'callsMade',
                  'hours': 'hoursWorked',
                  'appointments': 'appointmentsSet',
                  'buyerAppts': 'buyerAppointments',
                  'sellerAppts': 'sellerAppointments',
                  'cmas': 'cmas',
                  'showings': 'showings',
                  'appraisals': 'appraisals',
                  'inspections': 'homeInspections',
                  'septic': 'septicInspections',
                  'walkthroughs': 'walkthroughs',
                  'closings': 'closings'
                };
                
                const fieldName = fieldMap[activity.id];
                if (!fieldName) return null;
                
                return (
                  <Card key={activity.id} className="p-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className={`p-2 rounded-lg ${activity.color} text-white`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-sm">{activity.name}</h3>
                        <p className="text-xs text-gray-500">{activity.description}</p>
                      </div>
                    </div>
                    <Input
                      type="number"
                      placeholder="0"
                      value={dailyActivityData[fieldName] || ''}
                      onChange={(e) => setDailyActivityData(prev => ({
                        ...prev,
                        [fieldName]: e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                      }))}
                      className="w-full"
                    />
                  </Card>
                );
              })}
            </div>
            
            <Card className="p-4">
              <Label htmlFor="notes" className="text-sm font-medium">Notes</Label>
              <textarea
                key={`notes-${selectedDate}`} // Stable key per date to prevent remounting
                id="notes"
                className="w-full mt-2 p-2 border border-gray-300 rounded-md resize-none"
                rows={3}
                placeholder="Add any notes about your day..."
                value={localNotes}
                onChange={(e) => handleNotesChange(e.target.value)}
                onBlur={handleNotesBlur}
              />
            </Card>

            {showSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Activities saved successfully!
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => handleModalClose(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveDailyActivity}
                disabled={saveDailyActivityMutation.isPending || showSuccess}
                className={showSuccess ? 'bg-green-500 hover:bg-green-600' : ''}
              >
                {showSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : saveDailyActivityMutation.isPending ? (
                  'Saving...'
                ) : (
                  'Save Activities'
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4">
            <div className="space-y-4">
              <h3 className="font-medium text-lg">Progress Overview for {selectedDate ? new Date(selectedDate).toLocaleDateString() : ''}</h3>
              
              {selectedDate && calculateDayProgress(selectedDate).map((progress: any, index: number) => {
                const IconComponent = progress.activityType.icon;
                
                return (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${progress.color} text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{progress.activityType.name}</h4>
                          <p className="text-sm text-gray-500">
                            {progress.frequency} goal: {progress.target}
                            {progress.frequency !== 'daily' && ` (${progress.dayValue} today)`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {progress.actual}/{progress.target}
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round(progress.percentage)}%
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          progress.percentage >= 100 
                            ? 'bg-green-500' 
                            : progress.percentage >= 75 
                              ? 'bg-yellow-500' 
                              : progress.percentage >= 50
                                ? 'bg-blue-500'
                                : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(progress.percentage, 100)}%` }}
                      ></div>
                    </div>
                    
                    {progress.frequency !== 'daily' && (
                      <div className="mt-2 text-xs text-gray-600">
                        {progress.frequency === 'weekly' ? 'Week-to-date' : 'Month-to-date'} progress
                      </div>
                    )}
                  </Card>
                );
              })}
              
              {selectedDate && calculateDayProgress(selectedDate).length === 0 && (
                <Card className="p-8 text-center">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Goals</h3>
                  <p className="text-gray-500 mb-4">Create goals to track your progress.</p>
                  <Button onClick={() => setGoalTab('create')}>
                    Create Your First Goal
                  </Button>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  const GoalManagementModal = () => (
    <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Goal Management</DialogTitle>
        </DialogHeader>
        
        <Tabs value={goalTab} onValueChange={setGoalTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Goal</TabsTrigger>
            <TabsTrigger value="manage">Manage Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="create" className="space-y-4">
            <Card className="p-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="activityType" className="text-sm font-medium">Activity Type</Label>
                  <select
                    id="activityType"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    value={newGoal.activityType}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, activityType: e.target.value }))}
                  >
                    <option value="">Select an activity type</option>
                    {ACTIVITY_TYPES.map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="goalValue" className="text-sm font-medium">Target Value</Label>
                  <Input
                    id="goalValue"
                    type="number"
                    placeholder="Enter target value"
                    value={newGoal.goalValue || ''}
                    onChange={(e) => setNewGoal(prev => ({ 
                      ...prev, 
                      goalValue: parseInt(e.target.value) || 0 
                    }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="frequency" className="text-sm font-medium">Frequency</Label>
                  <select
                    id="frequency"
                    className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                    value={newGoal.frequency}
                    onChange={(e) => setNewGoal(prev => ({ 
                      ...prev, 
                      frequency: e.target.value as 'daily' | 'weekly' | 'monthly' 
                    }))}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowGoalModal(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateGoal}
                    disabled={createGoalMutation.isPending || !newGoal.activityType || !newGoal.goalValue}
                  >
                    {createGoalMutation.isPending ? 'Creating...' : 'Create Goal'}
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="manage" className="space-y-4">
            <div className="space-y-3">
              {goals.map((goal: ActivityGoal) => {
                const activityType = ACTIVITY_TYPES.find(at => at.id === goal.activityType);
                if (!activityType) return null;
                
                const IconComponent = activityType.icon;
                
                return (
                  <Card key={goal.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${activityType.color} text-white`}>
                          <IconComponent className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium">{activityType.name}</h3>
                          <p className="text-sm text-gray-500">
                            {goal.goalValue} per {goal.frequency}
                          </p>
                          <p className="text-xs text-gray-400">
                            Start Date: {new Date(goal.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={goal.isActive ? 'default' : 'secondary'}>
                          {goal.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Toggle goal active status
                            console.log('Toggle goal:', goal.id);
                          }}
                        >
                          {goal.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {goals.length === 0 && (
              <Card className="p-8 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Goals Created</h3>
                <p className="text-gray-500 mb-4">Create your first goal to start tracking your daily activities.</p>
                <Button onClick={() => setGoalTab('create')}>
                  Create Your First Goal
                </Button>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Performance Calendar</h1>
        <Button onClick={() => setShowGoalModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="h-10 flex items-center justify-center font-semibold bg-gray-100 border">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-0">
            {renderCalendar()}
          </div>
        </CardContent>
      </Card>

      <DayEntryModal />
      <GoalManagementModal />
    </div>
  );
}

export default React.memo(PerformanceCalendar);
