import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoalData } from '@/components/celebrations/goal-completion-celebration';

export interface GoalTrackingData {
  goals: GoalData[];
  lastUpdated: string;
}

export function useGoalTracking() {
  const [celebrationQueue, setCelebrationQueue] = useState<GoalData[]>([]);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [currentCelebration, setCurrentCelebration] = useState<GoalData | null>(null);
  const [lastCheckedGoals, setLastCheckedGoals] = useState<string[]>([]);

  // Fetch dashboard metrics to track goal progress
  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    refetchInterval: 30000, // Check every 30 seconds for goal updates
  });

  // Load last checked goals from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('goalsCelebrated');
    if (stored) {
      try {
        const celebratedGoals = JSON.parse(stored);
        setLastCheckedGoals(celebratedGoals);
        setHasInitialized(true); // Mark as initialized if we have stored data
        console.log('Loaded celebrated goals from localStorage:', celebratedGoals);
      } catch (e) {
        console.error('Error loading celebrated goals:', e);
      }
    }
  }, []);

  // Generate goals based on current metrics
  const generateGoalsFromMetrics = useCallback((metricsData: any): GoalData[] => {
    if (!metricsData) return [];

    const goals: GoalData[] = [];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Revenue Goal (Monthly $100k target)
    if (metricsData.thisMonthRevenue >= 100000) {
      goals.push({
        id: `revenue_goal_${currentYear}_${currentMonth}`,
        title: 'Monthly Revenue Goal',
        category: 'revenue',
        targetValue: 100000,
        currentValue: metricsData.thisMonthRevenue,
        unit: '$',
        completedAt: new Date(),
        timeframe: 'This Month',
        difficulty: 'hard',
        reward: 'Revenue Champion Badge',
        bonusPoints: 500
      });
    }

    // Sales Target (5 properties closed this month)
    if (metricsData.thisMonthClosedDeals >= 5) {
      goals.push({
        id: `sales_goal_${currentYear}_${currentMonth}`,
        title: 'Monthly Sales Target',
        category: 'sales',
        targetValue: 5,
        currentValue: metricsData.thisMonthClosedDeals,
        completedAt: new Date(),
        timeframe: 'This Month',
        difficulty: 'medium',
        reward: 'Top Closer Badge',
        bonusPoints: 300
      });
    }

    // Activity Goal (50+ activities this month)
    if (metricsData.thisMonthActivities >= 50) {
      goals.push({
        id: `activity_goal_${currentYear}_${currentMonth}`,
        title: 'Monthly Activity Goal',
        category: 'activity',
        targetValue: 50,
        currentValue: metricsData.thisMonthActivities,
        completedAt: new Date(),
        timeframe: 'This Month',
        difficulty: 'easy',
        reward: 'Activity Champion Badge',
        bonusPoints: 200
      });
    }

    // Quarterly Revenue Goal ($250k)
    if (metricsData.totalRevenue >= 250000) {
      goals.push({
        id: `quarterly_revenue_${currentYear}_Q${Math.floor(currentMonth/3) + 1}`,
        title: 'Quarterly Revenue Milestone',
        category: 'revenue',
        targetValue: 250000,
        currentValue: metricsData.totalRevenue,
        unit: '$',
        completedAt: new Date(),
        timeframe: 'This Quarter',
        difficulty: 'extreme',
        reward: 'Revenue Master Badge',
        bonusPoints: 1000
      });
    }

    // First Sale Achievement
    if (metricsData.totalClosedDeals >= 1 && !lastCheckedGoals.includes('first_sale_achievement')) {
      goals.push({
        id: 'first_sale_achievement',
        title: 'First Sale Achievement',
        category: 'sales',
        targetValue: 1,
        currentValue: metricsData.totalClosedDeals,
        completedAt: new Date(),
        timeframe: 'Career',
        difficulty: 'easy',
        reward: 'First Sale Badge',
        bonusPoints: 100
      });
    }

    // 10 Sales Milestone
    if (metricsData.totalClosedDeals >= 10 && !lastCheckedGoals.includes('ten_sales_milestone')) {
      goals.push({
        id: 'ten_sales_milestone',
        title: '10 Sales Milestone',
        category: 'sales',
        targetValue: 10,
        currentValue: metricsData.totalClosedDeals,
        completedAt: new Date(),
        timeframe: 'Career',
        difficulty: 'medium',
        reward: 'Sales Pro Badge',
        bonusPoints: 250
      });
    }

    return goals;
  }, [lastCheckedGoals]);

  // Initialize goals tracking on first load to prevent celebration of existing goals
  const [hasInitialized, setHasInitialized] = useState(false);

  // Check for newly completed goals
  useEffect(() => {
    if (!metrics) return;

    const currentGoals = generateGoalsFromMetrics(metrics);
    
    if (!hasInitialized) {
      // On first load, mark all existing completed goals as already celebrated
      const allCompletedIds = currentGoals.map(goal => goal.id);
      setLastCheckedGoals(allCompletedIds);
      localStorage.setItem('goalsCelebrated', JSON.stringify(allCompletedIds));
      setHasInitialized(true);
      console.log('Initialized goal tracking, marked as celebrated:', allCompletedIds);
      return;
    }
    
    const newlyCompleted = currentGoals.filter(goal => 
      !lastCheckedGoals.includes(goal.id)
    );

    if (newlyCompleted.length > 0) {
      console.log('New goals completed:', newlyCompleted);
      // Disabled: Goal celebration popups are turned off
      // setCelebrationQueue(prev => [...prev, ...newlyCompleted]);
      
      // Update last checked list and persist to localStorage
      const newCheckedList = [...lastCheckedGoals, ...newlyCompleted.map(g => g.id)];
      setLastCheckedGoals(newCheckedList);
      localStorage.setItem('goalsCelebrated', JSON.stringify(newCheckedList));
    }
  }, [metrics, generateGoalsFromMetrics, lastCheckedGoals, hasInitialized]);

  // Process celebration queue - DISABLED
  useEffect(() => {
    // Disabled: Goal celebration popups are turned off
    // if (celebrationQueue.length > 0 && !isCelebrationOpen) {
    //   const nextGoal = celebrationQueue[0];
    //   setCurrentCelebration(nextGoal);
    //   setIsCelebrationOpen(true);
    //   
    //   // Remove from queue
    //   setCelebrationQueue(prev => prev.slice(1));
    // }
  }, [celebrationQueue, isCelebrationOpen]);

  const closeCelebration = useCallback(() => {
    setIsCelebrationOpen(false);
    setCurrentCelebration(null);
  }, []);

  const triggerCelebration = useCallback((goal: GoalData) => {
    setCelebrationQueue(prev => [...prev, goal]);
  }, []);

  // Manual goal completion check (for testing)
  const checkGoalCompletion = useCallback(() => {
    if (metrics) {
      const goals = generateGoalsFromMetrics(metrics);
      const uncelebrated = goals.filter(goal => !lastCheckedGoals.includes(goal.id));
      if (uncelebrated.length > 0) {
        setCelebrationQueue(prev => [...prev, ...uncelebrated]);
      }
    }
  }, [metrics, generateGoalsFromMetrics, lastCheckedGoals]);

  return {
    isCelebrationOpen,
    currentCelebration,
    celebrationQueue: celebrationQueue.length,
    closeCelebration,
    triggerCelebration,
    checkGoalCompletion
  };
}