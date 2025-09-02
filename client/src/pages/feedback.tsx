import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  AlertTriangle, 
  MessageCircle, 
  XCircle,
  Send,
  Clock,
  CheckCircle,
  User,
  Lightbulb
} from "lucide-react";
import { format } from "date-fns";

interface Feedback {
  id: string;
  type: 'general' | 'bug_report' | 'feature_request' | 'improvement_suggestion' | 'performance_issue';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'declined';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

const feedbackSchema = z.object({
  type: z.enum(['general', 'bug_report', 'feature_request', 'improvement_suggestion', 'performance_issue']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
});

type FeedbackForm = z.infer<typeof feedbackSchema>;

const typeOptions = [
  { value: 'general', label: 'General Feedback', icon: MessageSquare, description: 'Share your thoughts and suggestions' },
  { value: 'performance_issue', label: 'Performance Issue', icon: AlertTriangle, description: 'Report slow or problematic performance' },
  { value: 'feature_request', label: 'Feature Request', icon: MessageCircle, description: 'Suggest new features or improvements' },
  { value: 'improvement_suggestion', label: 'Improvement Suggestion', icon: Lightbulb, description: 'Suggest ways to improve existing features' },
  { value: 'bug_report', label: 'Bug Report', icon: XCircle, description: 'Report technical issues or bugs' }
];

const priorityOptions = [
  { value: 'low', label: 'Low', description: 'Minor issue or suggestion' },
  { value: 'medium', label: 'Medium', description: 'Moderate impact on your experience' },
  { value: 'high', label: 'High', description: 'Significant impact on your work' },
  { value: 'urgent', label: 'Urgent', description: 'Critical issue blocking your work' }
];

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
  declined: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

export default function FeedbackPage() {
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FeedbackForm>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: 'general',
      priority: 'medium',
      subject: '',
      description: '',
    },
  });

  const { data: userFeedback = [], isLoading } = useQuery({
    queryKey: ['/api/feedback/user'],
    queryFn: () => apiRequest('GET', '/api/feedback/user').then(res => res.json()),
    enabled: activeTab === 'history'
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: (data: FeedbackForm) =>
      apiRequest('POST', '/api/feedback', data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback/user'] });
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it and get back to you soon.",
      });
      form.reset();
      setActiveTab('history');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit feedback. Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FeedbackForm) => {
    submitFeedbackMutation.mutate(data);
  };

  return (
    <div className="space-y-6" data-testid="feedback-page">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Feedback & Support</h1>
        <p className="text-muted-foreground">
          Share your thoughts, report issues, or suggest improvements to help us make EliteKPI better
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'submit' | 'history')}>
        <TabsList>
          <TabsTrigger value="submit">Submit Feedback</TabsTrigger>
          <TabsTrigger value="history">My Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="submit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Submit New Feedback
              </CardTitle>
              <CardDescription>
                Help us improve EliteKPI by sharing your feedback, reporting issues, or suggesting new features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Feedback Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="feedback-type-select">
                                <SelectValue placeholder="Select feedback type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {typeOptions.map((option) => {
                                const Icon = option.icon;
                                return (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <Icon className="h-4 w-4" />
                                      <div>
                                        <p className="font-medium">{option.label}</p>
                                        <p className="text-xs text-muted-foreground">{option.description}</p>
                                      </div>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="priority-select">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {priorityOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  <div>
                                    <p className="font-medium">{option.label}</p>
                                    <p className="text-xs text-muted-foreground">{option.description}</p>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Brief summary of your feedback" 
                            {...field} 
                            data-testid="subject-input"
                          />
                        </FormControl>
                        <FormDescription>
                          Provide a clear, descriptive subject line (minimum 5 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide detailed information about your feedback, including steps to reproduce if reporting a bug..."
                            className="min-h-[120px]"
                            {...field}
                            data-testid="description-input"
                          />
                        </FormControl>
                        <FormDescription>
                          Be as specific as possible. For bugs, include steps to reproduce the issue (minimum 20 characters)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={submitFeedbackMutation.isPending}
                    className="w-full md:w-auto"
                    data-testid="submit-feedback-button"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {submitFeedbackMutation.isPending ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                My Feedback History
              </CardTitle>
              <CardDescription>
                Track the status of your submitted feedback and see responses from our team
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : userFeedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't submitted any feedback yet.</p>
                  <p className="text-sm">Click the "Submit Feedback" tab to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userFeedback.map((item: Feedback) => {
                    const typeOption = typeOptions.find(t => t.value === item.type);
                    const TypeIcon = typeOption?.icon || MessageSquare;
                    
                    return (
                      <Card key={item.id} className="border-l-4 border-l-primary">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <TypeIcon className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <CardTitle className="text-base">{item.subject}</CardTitle>
                                <CardDescription className="flex items-center gap-2 mt-1">
                                  <Clock className="h-3 w-3" />
                                  Submitted {format(new Date(item.createdAt), 'MMM d, yyyy')}
                                  {item.updatedAt !== item.createdAt && (
                                    <span>• Updated {format(new Date(item.updatedAt), 'MMM d, yyyy')}</span>
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={priorityColors[item.priority]}>
                                {item.priority}
                              </Badge>
                              <Badge className={statusColors[item.status]}>
                                {item.status === 'in_progress' ? 'In Progress' : 
                                 item.status === 'resolved' ? 'Resolved' :
                                 item.status === 'closed' ? 'Closed' : 
                                 item.status === 'declined' ? 'Declined' : 'Open'}
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {item.description}
                          </p>
                          {item.status === 'resolved' && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                              <div className="flex items-center gap-2 text-green-800">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">Resolved</span>
                              </div>
                              <p className="text-sm text-green-700 mt-1">
                                This issue has been resolved. Thank you for your feedback!
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}