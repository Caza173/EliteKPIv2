import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import type { SmartTask } from '@shared/schema';

interface TaskReminderDialogProps {
  task: SmartTask | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (taskId: string) => void;
  onSnooze: (taskId: string) => void;
}

export function TaskReminderDialog({ 
  task, 
  isOpen, 
  onClose, 
  onComplete, 
  onSnooze 
}: TaskReminderDialogProps) {
  if (!task) return null;

  const dueDate = new Date(task.dueDate!);
  const isPastDue = dueDate < new Date();
  const formattedDate = dueDate.toLocaleDateString();
  const formattedTime = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-blue-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityIcon = (priority: string | null) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'low': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-6 w-6 text-blue-500" />
            <AlertDialogTitle className="text-lg font-semibold">
              {isPastDue ? '⚠️ Task Overdue!' : '📅 Task Due Now!'}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {task.title}
                </h3>
                {task.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(task.priority)}
                    <span className={`capitalize font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority} Priority
                    </span>
                  </div>
                  <div className="text-gray-500 dark:text-gray-400">
                    Due: {formattedDate} at {formattedTime}
                  </div>
                </div>
              </div>
              
              {isPastDue && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                      This task is {Math.floor((new Date().getTime() - dueDate.getTime()) / (1000 * 60 * 60))} hours overdue
                    </p>
                  </div>
                </div>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => {
              onSnooze(task.id);
              onClose();
            }}
            className="flex-1"
          >
            Snooze 1hr
          </Button>
          <AlertDialogAction
            onClick={() => {
              onComplete(task.id);
              onClose();
            }}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Mark Complete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}