import { useState, useCallback } from "react";
import { Tutorial, TutorialStep } from "@/components/ui/tutorial-overlay";

export interface TutorialState {
  activeTutorial: Tutorial | null;
  currentStepIndex: number;
  isActive: boolean;
  completedTutorials: string[];
}

export function useTutorial() {
  const [state, setState] = useState<TutorialState>({
    activeTutorial: null,
    currentStepIndex: 0,
    isActive: false,
    completedTutorials: JSON.parse(localStorage.getItem('eliteKPI-completed-tutorials') || '[]')
  });

  const startTutorial = useCallback((tutorial: Tutorial) => {
    setState(prev => ({
      ...prev,
      activeTutorial: tutorial,
      currentStepIndex: 0,
      isActive: true
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      if (!prev.activeTutorial) return prev;
      
      const nextIndex = prev.currentStepIndex + 1;
      if (nextIndex >= prev.activeTutorial.steps.length) {
        return prev;
      }
      
      return {
        ...prev,
        currentStepIndex: nextIndex
      };
    });
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStepIndex: Math.max(0, prev.currentStepIndex - 1)
    }));
  }, []);

  const closeTutorial = useCallback(() => {
    setState(prev => ({
      ...prev,
      activeTutorial: null,
      currentStepIndex: 0,
      isActive: false
    }));
  }, []);

  const completeTutorial = useCallback(() => {
    setState(prev => {
      if (!prev.activeTutorial) return prev;
      
      const newCompleted = [...prev.completedTutorials, prev.activeTutorial.id];
      localStorage.setItem('eliteKPI-completed-tutorials', JSON.stringify(newCompleted));
      
      return {
        ...prev,
        activeTutorial: null,
        currentStepIndex: 0,
        isActive: false,
        completedTutorials: newCompleted
      };
    });
  }, []);

  const skipTutorial = useCallback(() => {
    closeTutorial();
  }, [closeTutorial]);

  const resetTutorialProgress = useCallback(() => {
    localStorage.removeItem('eliteKPI-completed-tutorials');
    setState(prev => ({
      ...prev,
      completedTutorials: []
    }));
  }, []);

  const isTutorialCompleted = useCallback((tutorialId: string) => {
    return state.completedTutorials.includes(tutorialId);
  }, [state.completedTutorials]);

  return {
    ...state,
    startTutorial,
    nextStep,
    previousStep,
    closeTutorial,
    completeTutorial,
    skipTutorial,
    resetTutorialProgress,
    isTutorialCompleted
  };
}