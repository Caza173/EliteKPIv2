import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { SmartTask } from '@shared/schema';

interface TaskReminderHookResult {
  dueTask: SmartTask | null;
  isReminderOpen: boolean;
  closeReminder: () => void;
  completeTask: (taskId: string) => void;
  snoozeTask: (taskId: string) => void;
}

export function useTaskReminders(): TaskReminderHookResult {
  const [dueTask, setDueTask] = useState<SmartTask | null>(null);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Set<string>>(new Set());

  // Query to get tasks
  const { data: tasks } = useQuery<SmartTask[]>({
    queryKey: ['/api/tasks'],
    refetchInterval: 30 * 1000, // Check every 30 seconds for due tasks
  });

  // Check for due tasks
  useEffect(() => {
    if (!tasks) return;

    const now = new Date();
    const dueTasks = tasks.filter(task => {
      if (!task.dueDate || task.status !== 'pending') return false;
      if (checkedTasks.has(task.id)) return false; // Already shown
      
      const dueDate = new Date(task.dueDate);
      return dueDate <= now;
    });

    // Show dialog for the first due task
    if (dueTasks.length > 0 && !isReminderOpen) {
      const taskToShow = dueTasks[0];
      setDueTask(taskToShow);
      setIsReminderOpen(true);
    }
  }, [tasks, checkedTasks, isReminderOpen]);

  const closeReminder = () => {
    setIsReminderOpen(false);
    if (dueTask) {
      // Mark as checked so we don't show it again
      setCheckedTasks(prev => new Set(prev).add(dueTask.id));
    }
    setDueTask(null);
  };

  const completeTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'completed',
          completedAt: new Date().toISOString()
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to complete task');
      }

      // Add to checked tasks so it doesn't show again
      setCheckedTasks(prev => new Set(prev).add(taskId));
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const snoozeTask = async (taskId: string) => {
    try {
      // Snooze for 1 hour
      const snoozeTime = new Date(Date.now() + 60 * 60 * 1000);
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          dueDate: snoozeTime.toISOString(),
          reminderSent: false // Allow reminder to be sent again
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to snooze task');
      }

      // Add to checked tasks for now
      setCheckedTasks(prev => new Set(prev).add(taskId));
    } catch (error) {
      console.error('Error snoozing task:', error);
    }
  };

  return {
    dueTask,
    isReminderOpen,
    closeReminder,
    completeTask,
    snoozeTask,
  };
}