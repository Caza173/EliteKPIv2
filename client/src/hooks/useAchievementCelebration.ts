import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";

interface Achievement {
  id: string;
  title: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  category: 'sales' | 'activity' | 'time' | 'streak' | 'milestone';
  points: number;
  isUnlocked: boolean;
  unlockedDate?: string;
}

interface AchievementsResponse {
  achievements: Achievement[];
  agentLevel: any;
  streaks: any;
  totalPoints: number;
}

export function useAchievementCelebration() {
  const [celebrationQueue, setCelebrationQueue] = useState<Achievement[]>([]);
  const [currentCelebration, setCurrentCelebration] = useState<Achievement | null>(null);
  const [isCelebrationOpen, setIsCelebrationOpen] = useState(false);
  const [lastCheckedAchievements, setLastCheckedAchievements] = useState<string[]>(() => {
    // Load from localStorage on initial render
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('achievementsCelebrated');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Get current achievements
  const { data: achievementsData } = useQuery<AchievementsResponse>({
    queryKey: ["/api/achievements"],
    retry: false,
  });

  // Flag to track if we've initialized
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize with stored achievements to prevent re-showing on page load
  useEffect(() => {
    if (achievementsData?.achievements && !hasInitialized) {
      const unlockedIds = achievementsData.achievements
        .filter((a: Achievement) => a.isUnlocked)
        .map((a: Achievement) => a.id);
      
      // If we don't have stored celebrations, save all current unlocked achievements
      // This prevents celebrating achievements that were already unlocked
      const storedCelebrated = localStorage.getItem('achievementsCelebrated');
      if (!storedCelebrated || storedCelebrated === '[]') {
        setLastCheckedAchievements(unlockedIds);
        localStorage.setItem('achievementsCelebrated', JSON.stringify(unlockedIds));
        console.log('Initialized celebrated achievements:', unlockedIds);
      } else {
        // Load existing celebrated achievements
        setLastCheckedAchievements(JSON.parse(storedCelebrated));
      }
      setHasInitialized(true);
    }
  }, [achievementsData, hasInitialized]);

  // Check for newly unlocked achievements (only after initialization)
  useEffect(() => {
    if (!achievementsData?.achievements || !hasInitialized) return;

    const unlockedAchievements = achievementsData.achievements.filter(
      (achievement: Achievement) => achievement.isUnlocked
    );

    // Find newly unlocked achievements (not in last checked list)
    const newlyUnlocked = unlockedAchievements.filter(
      (achievement: Achievement) => !lastCheckedAchievements.includes(achievement.id)
    );

    if (newlyUnlocked.length > 0) {
      console.log('Found newly unlocked achievements:', newlyUnlocked);
      // Disabled: Achievement popups are turned off
      // setCelebrationQueue(prev => [...prev, ...newlyUnlocked]);
      
      // Update last checked list and persist to localStorage (mark as celebrated without showing popup)
      const newCheckedList = unlockedAchievements.map((a: Achievement) => a.id);
      setLastCheckedAchievements(newCheckedList);
      localStorage.setItem('achievementsCelebrated', JSON.stringify(newCheckedList));
    }
  }, [achievementsData, lastCheckedAchievements, hasInitialized]);

  // Process celebration queue
  useEffect(() => {
    if (celebrationQueue.length > 0 && !isCelebrationOpen) {
      const nextAchievement = celebrationQueue[0];
      setCurrentCelebration(nextAchievement);
      setIsCelebrationOpen(true);
      
      // Remove from queue
      setCelebrationQueue(prev => prev.slice(1));
    }
  }, [celebrationQueue, isCelebrationOpen]);

  const closeCelebration = useCallback(() => {
    setIsCelebrationOpen(false);
    setCurrentCelebration(null);
  }, []);

  // Manually trigger celebration (for testing) - only if not already celebrated
  const triggerCelebration = useCallback((achievement: Achievement) => {
    // Check if this achievement has already been celebrated
    if (!lastCheckedAchievements.includes(achievement.id)) {
      setCelebrationQueue(prev => [...prev, achievement]);
      // Update the celebrated list to prevent future celebrations
      const updatedList = [...lastCheckedAchievements, achievement.id];
      setLastCheckedAchievements(updatedList);
      localStorage.setItem('achievementsCelebrated', JSON.stringify(updatedList));
    }
  }, [lastCheckedAchievements]);

  return {
    currentCelebration,
    isCelebrationOpen,
    closeCelebration,
    triggerCelebration,
    queueLength: celebrationQueue.length
  };
}