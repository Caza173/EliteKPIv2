import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Bot, Clock, CheckCircle, AlertCircle, Plus, Filter, Calendar, Target, Zap, Settings, Brain, Lightbulb, Users } from 'lucide-react';
import { format, differenceInDays, addDays, parseISO } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface SmartTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  dueDate?: string;
  propertyId?: string;
  isAutomated: boolean;
  triggerCondition?: string;
  createdAt: string;
  updatedAt: string;
}

const AUTOMATION_RULES = [
  {
    id: 'new_lead',
    title: 'New Lead Contact',
    description: 'Automatically create follow-up task when a new lead is added',
    trigger: 'new_lead',
    delay: 2, // hours
    enabled: true
  },
  {
    id: 'property_contract',
    title: 'Property Under Contract',
    description: 'Create inspection, appraisal, and financing tasks when property goes under contract',
    trigger: 'property_under_contract',
    delay: 0,
    enabled: true
  },
  {
    id: 'showing_followup',
    title: 'Showing Follow-up',
    description: 'Create follow-up task 24 hours after a property showing',
    trigger: 'showing_scheduled',
    delay: 24, // hours
    enabled: true
  },
  {
    id: 'listing_expires',
    title: 'Listing Expiration Warning',
    description: 'Alert 30 days before listing expires',
    trigger: 'listing_expiration',
    delay: -30, // days before
    enabled: true
  }
];

export default function SmartTasks() {
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16), // Tomorrow at current time
    propertyId: ''
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [automationSettings, setAutomationSettings] = useState(AUTOMATION_RULES);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch smart tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['/api/tasks', statusFilter, priorityFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);
      const response = await fetch(`/api/tasks?${params.toString()}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch tasks');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Fetch properties for task assignment
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      const response = await fetch('/api/properties', {
        credentials: 'include'
      });
      if (!response.ok) {
        if (response.status === 401) return [];
        throw new Error('Failed to fetch properties');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: any) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsCreateModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        propertyId: ''
      });
      toast({
        title: 'Task Created',
        description: 'Your smart task has been created successfully!'
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, updates }: { taskId: string; updates: any }) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Task Updated',
        description: 'Task status has been updated successfully!'
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete task');
      }
      return response.status === 204 ? {} : response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Task Deleted',
        description: 'Task has been deleted successfully!'
      });
    }
  });

  // Trigger automation
  const triggerAutomationMutation = useMutation({
    mutationFn: async (params: { event: string; entityId: string; entityType: string }) => {
      const response = await fetch('/api/automation/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to trigger automation');
      }
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: 'Automation Triggered',
        description: `Created ${data.tasksCreated || 0} automated tasks`
      });
    }
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTasks = tasks.filter((task: SmartTask) => {
    const statusMatch = statusFilter === 'all' || task.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const pendingTasks = filteredTasks.filter((t: SmartTask) => t.status === 'pending');
  const inProgressTasks = filteredTasks.filter((t: SmartTask) => t.status === 'in_progress');
  const completedTasks = filteredTasks.filter((t: SmartTask) => t.status === 'completed');
  const overdueTasks = filteredTasks.filter((t: SmartTask) => 
    t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed'
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Bot className="h-8 w-8 mr-3 text-blue-600" />
            Smart Task Automation
          </h1>
          <p className="text-muted-foreground mt-1">
            Intelligent task management with automated follow-ups and reminders
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => triggerAutomationMutation.mutate({
              event: 'property_under_contract',
              entityId: 'demo-property',
              entityType: 'property'
            })}
            variant="outline"
            disabled={triggerAutomationMutation.isPending}
          >
            <Zap className="h-4 w-4 mr-2" />
            Test Automation
          </Button>
          
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Create a manual task or let automation handle it
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Follow up with new lead"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Contact the lead and schedule showing"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newTask.priority}
                      onValueChange={(value) => setNewTask({ ...newTask, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="urgent">Urgent</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="datetime-local"
                      value={newTask.dueDate}
                      onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="property">Related Property (Optional)</Label>
                  <Select
                    value={newTask.propertyId}
                    onValueChange={(value) => setNewTask({ ...newTask, propertyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No property</SelectItem>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => {
                    const taskToCreate = {
                      ...newTask,
                      propertyId: newTask.propertyId === 'none' ? null : newTask.propertyId,
                      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : null,
                      isAutomated: false
                    };
                    createTaskMutation.mutate(taskToCreate);
                  }}
                  disabled={createTaskMutation.isPending}
                  className="w-full"
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to start
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              This week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Automated</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredTasks.filter((t: SmartTask) => t.isAutomated).length}
            </div>
            <p className="text-xs text-muted-foreground">
              AI generated
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="tasks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tasks">Tasks ({filteredTasks.length})</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  Task Filters
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Status Filter</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Priority Filter</Label>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <Card className="p-8 text-center">
                <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tasks Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first task or let automation create them for you!
                </p>
              </Card>
            ) : (
              filteredTasks.map((task: SmartTask) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  properties={properties}
                  onUpdate={updateTaskMutation.mutate}
                  onDelete={deleteTaskMutation.mutate}
                  isUpdating={updateTaskMutation.isPending}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Automation Rules
              </CardTitle>
              <CardDescription>
                Configure automated task creation based on your activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {automationSettings.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{rule.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {rule.description}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        Trigger: {rule.trigger.replace('_', ' ')}
                      </Badge>
                    </div>
                    <Switch
                      checked={rule.enabled}
                      onCheckedChange={(checked) => {
                        setAutomationSettings(prev => 
                          prev.map(r => r.id === rule.id ? { ...r, enabled: checked } : r)
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="h-5 w-5 mr-2 text-purple-600" />
                  AI Task Recommendations
                </CardTitle>
                <CardDescription>
                  Suggested tasks based on your recent activity
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-purple-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Follow up on showing feedback</p>
                      <p className="text-xs text-muted-foreground">
                        You had 3 showings this week without follow-up calls
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Users className="h-4 w-4 text-blue-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Contact new leads within 2 hours</p>
                      <p className="text-xs text-muted-foreground">
                        Industry best practice for lead conversion
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <Calendar className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="text-sm font-medium">Schedule CMA updates</p>
                      <p className="text-xs text-muted-foreground">
                        2 CMAs haven't been updated in over 30 days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Task Performance Metrics</CardTitle>
                <CardDescription>
                  Your task completion trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm">87%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">On-Time Completion</span>
                      <span className="text-sm">73%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '73%' }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Automation Usage</span>
                      <span className="text-sm">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Task Card Component
function TaskCard({ 
  task, 
  properties, 
  onUpdate, 
  onDelete, 
  isUpdating 
}: { 
  task: SmartTask; 
  properties: any[];
  onUpdate: (params: { taskId: string; updates: any }) => void; 
  onDelete: (taskId: string) => void;
  isUpdating: boolean;
}) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const property = task.propertyId ? properties.find(p => p.id === task.propertyId) : null;

  return (
    <Card className={`hover:shadow-md transition-shadow ${isOverdue ? 'border-red-200 bg-red-50/30 dark:bg-red-900/10' : ''}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {task.isAutomated && <Bot className="h-4 w-4 text-blue-600" />}
              <h3 className="font-semibold">{task.title}</h3>
              {isOverdue && <AlertCircle className="h-4 w-4 text-red-600" />}
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground">{task.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getPriorityColor(task.priority)}>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
            <Badge className={getStatusColor(task.status)}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {task.dueDate && (
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className={isOverdue ? 'text-red-600' : ''}>
                Due: {format(parseISO(task.dueDate), 'MMM dd, yyyy h:mm a')}
              </span>
              {isOverdue && <span className="text-red-600 font-medium">(Overdue)</span>}
            </div>
          )}
          
          {property && (
            <div className="flex items-center space-x-2 text-sm">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span>Property: {property.address}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>Created: {format(parseISO(task.createdAt), 'MMM dd, yyyy')}</span>
            {task.isAutomated && (
              <Badge variant="outline" className="text-xs">
                Automated
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-2">
              {task.status !== 'completed' && task.status !== 'cancelled' && (
                <Button
                  size="sm"
                  onClick={() => onUpdate({ taskId: task.id, updates: { status: 'completed' } })}
                  disabled={isUpdating}
                >
                  Complete
                </Button>
              )}
              
              {task.status !== 'completed' && task.status !== 'cancelled' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUpdate({ taskId: task.id, updates: { status: 'cancelled' } })}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              )}
            </div>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onDelete(task.id)}
              disabled={isUpdating}
            >
              Delete
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}