import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { 
  MessageSquare, 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  Eye,
  MessageCircle
} from "lucide-react";
import { format } from "date-fns";

interface Feedback {
  id: string;
  type: 'general' | 'bug_report' | 'feature_request' | 'improvement_suggestion' | 'performance_issue';
  status: 'open' | 'in_progress' | 'resolved' | 'closed' | 'declined';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  description: string;
  userId: string;
  userEmail: string;
  userName: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FeedbackUpdate {
  id: string;
  feedbackId: string;
  userId: string;
  updateType: 'status_change' | 'comment' | 'assignment';
  newValue?: string;
  comment: string;
  isInternal: boolean;
  createdAt: string;
}

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

const typeIcons = {
  general: MessageSquare,
  performance_issue: AlertTriangle,
  feature_request: MessageCircle,
  improvement_suggestion: MessageCircle,
  bug_report: XCircle
};

export default function AdminFeedback() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [adminComment, setAdminComment] = useState<string>('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['/api/admin/feedback'],
    queryFn: () => apiRequest('GET', '/api/admin/feedback').then(res => res.json())
  });

  const { data: feedbackUpdates = [] } = useQuery({
    queryKey: ['/api/feedback', selectedFeedback?.id, 'updates'],
    queryFn: () => apiRequest('GET', `/api/feedback/${selectedFeedback?.id}/updates`).then(res => res.json()),
    enabled: !!selectedFeedback?.id
  });

  const updateFeedbackMutation = useMutation({
    mutationFn: (data: { id: string; status?: string; adminNotes?: string }) =>
      apiRequest('PATCH', `/api/admin/feedback/${data.id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/feedback'] });
      toast({
        title: "Feedback Updated",
        description: "The feedback has been successfully updated.",
      });
      setSelectedFeedback(null);
      setStatusUpdate('');
      setAdminComment('');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update feedback. Please try again.",
        variant: "destructive",
      });
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: (data: { feedbackId: string; comment: string; isInternal: boolean }) =>
      apiRequest('POST', `/api/feedback/${data.feedbackId}/updates`, {
        updateType: 'comment',
        comment: data.comment,
        isInternal: data.isInternal
      }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback', selectedFeedback?.id, 'updates'] });
      toast({
        title: "Comment Added",
        description: "Your comment has been added successfully.",
      });
      setAdminComment('');
    }
  });

  const handleStatusUpdate = () => {
    if (!selectedFeedback || !statusUpdate) return;
    
    updateFeedbackMutation.mutate({
      id: selectedFeedback.id,
      status: statusUpdate,
      adminNotes: adminComment || undefined
    });
  };

  const handleAddComment = () => {
    if (!selectedFeedback || !adminComment) return;
    
    addCommentMutation.mutate({
      feedbackId: selectedFeedback.id,
      comment: adminComment,
      isInternal: true
    });
  };

  const groupedFeedback = {
    open: feedback.filter((f: Feedback) => f.status === 'open'),
    in_progress: feedback.filter((f: Feedback) => f.status === 'in_progress'),
    resolved: feedback.filter((f: Feedback) => f.status === 'resolved'),
    closed: feedback.filter((f: Feedback) => f.status === 'closed')
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-feedback">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Feedback & Complaints</h1>
          <p className="text-muted-foreground">
            Manage and respond to user feedback, complaints, and suggestions
          </p>
        </div>
        
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Urgent Issues</p>
                <p className="text-2xl font-bold text-red-600">
                  {feedback.filter((f: Feedback) => f.priority === 'urgent' && f.status !== 'closed').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Pending</p>
                <p className="text-2xl font-bold text-blue-600">
                  {feedback.filter((f: Feedback) => f.status === 'open').length}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="open" className="space-y-4">
        <TabsList>
          <TabsTrigger value="open">Open ({groupedFeedback.open.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({groupedFeedback.in_progress.length})</TabsTrigger>
          <TabsTrigger value="resolved">Resolved ({groupedFeedback.resolved.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({groupedFeedback.closed.length})</TabsTrigger>
        </TabsList>

        {(['open', 'in_progress', 'resolved', 'closed'] as const).map((status) => (
          <TabsContent key={status} value={status}>
            <div className="grid gap-4">
              {groupedFeedback[status].length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-8">
                    <p className="text-muted-foreground">No {status.replace('_', ' ')} feedback items</p>
                  </CardContent>
                </Card>
              ) : (
                groupedFeedback[status].map((item: Feedback) => {
                  const TypeIcon = typeIcons[item.type];
                  return (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <CardTitle className="text-base">{item.subject}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-1">
                                <User className="h-3 w-3" />
                                {item.userName} ({item.userEmail})
                                <span className="text-xs">
                                  • {format(new Date(item.createdAt), 'MMM d, yyyy')}
                                </span>
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={priorityColors[item.priority]}>
                              {item.priority}
                            </Badge>
                            <Badge className={statusColors[item.status]}>
                              {item.status.replace('_', ' ')}
                            </Badge>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedFeedback(item)}
                                  data-testid={`view-feedback-${item.id}`}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle className="flex items-center gap-2">
                                    <TypeIcon className="h-5 w-5" />
                                    {item.subject}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {item.type.replace('_', ' ')} from {item.userName} • {format(new Date(item.createdAt), 'PPp')}
                                  </DialogDescription>
                                </DialogHeader>
                                
                                <div className="space-y-6">
                                  <div>
                                    <h4 className="font-semibold mb-2">Description</h4>
                                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                      {item.description}
                                    </p>
                                  </div>

                                  {item.adminNotes && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Admin Notes</h4>
                                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                        {item.adminNotes}
                                      </p>
                                    </div>
                                  )}

                                  {feedbackUpdates.length > 0 && (
                                    <div>
                                      <h4 className="font-semibold mb-2">Activity Timeline</h4>
                                      <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {feedbackUpdates.map((update: FeedbackUpdate) => (
                                          <div key={update.id} className="text-sm border-l-2 border-muted pl-3 py-1">
                                            <p className="font-medium">
                                              {update.updateType.replace('_', ' ')} 
                                              {update.newValue && ` to ${update.newValue}`}
                                            </p>
                                            {update.comment && (
                                              <p className="text-muted-foreground">{update.comment}</p>
                                            )}
                                            <p className="text-xs text-muted-foreground">
                                              {format(new Date(update.createdAt), 'MMM d, h:mm a')}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold mb-2">Update Status</h4>
                                      <Select 
                                        value={statusUpdate || item.status} 
                                        onValueChange={setStatusUpdate}
                                      >
                                        <SelectTrigger data-testid="status-select">
                                          <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="open">Open</SelectItem>
                                          <SelectItem value="in_progress">In Progress</SelectItem>
                                          <SelectItem value="resolved">Resolved</SelectItem>
                                          <SelectItem value="closed">Closed</SelectItem>
                                          <SelectItem value="declined">Declined</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    
                                    <div className="flex items-end">
                                      <Button 
                                        onClick={handleStatusUpdate}
                                        disabled={updateFeedbackMutation.isPending || !statusUpdate}
                                        className="w-full"
                                        data-testid="update-status-button"
                                      >
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Update Status
                                      </Button>
                                    </div>
                                  </div>

                                  <div>
                                    <h4 className="font-semibold mb-2">Add Internal Comment</h4>
                                    <Textarea
                                      placeholder="Add notes or comments (visible to admin only)..."
                                      value={adminComment}
                                      onChange={(e) => setAdminComment(e.target.value)}
                                      className="mb-2"
                                      data-testid="admin-comment-input"
                                    />
                                    <Button 
                                      onClick={handleAddComment}
                                      disabled={addCommentMutation.isPending || !adminComment}
                                      variant="outline"
                                      data-testid="add-comment-button"
                                    >
                                      <MessageCircle className="h-4 w-4 mr-1" />
                                      Add Comment
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
      </div>
    </AdminLayout>
  );
}