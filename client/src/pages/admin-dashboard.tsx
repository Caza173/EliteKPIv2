import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/layout/admin-layout";
import { 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Settings
} from "lucide-react";
import { format } from "date-fns";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalFeedback: number;
  openFeedback: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
    // Removed automatic polling to prevent authentication loops
    // refetchInterval: 30000, // Refetch every 30 seconds
  });

  const { data: recentFeedback = [] } = useQuery<Array<{
    id: string;
    subject: string;
    status: string;
    priority: string;
    userName: string;
    createdAt: string;
  }>>({
    queryKey: ["/api/admin/feedback"],
  });

  const statusIcons = {
    open: <AlertCircle className="h-4 w-4 text-blue-600" />,
    in_progress: <Clock className="h-4 w-4 text-blue-600" />,
    resolved: <CheckCircle className="h-4 w-4 text-green-600" />,
    closed: <XCircle className="h-4 w-4 text-gray-600" />,
    declined: <XCircle className="h-4 w-4 text-red-600" />
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-dashboard">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor platform activity and manage user feedback
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-slate-600">
                {stats?.activeUsers || 0} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</div>
              <p className="text-xs text-slate-600">
                Currently online
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalFeedback || 0}</div>
              <p className="text-xs text-slate-600">
                All time submissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats?.openFeedback || 0}</div>
              <p className="text-xs text-slate-600">
                Needs attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Feedback */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Recent Feedback
              </CardTitle>
              <CardDescription>
                Latest user feedback and support requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentFeedback.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No feedback submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentFeedback.slice(0, 5).map((feedback) => (
                    <div key={feedback.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {statusIcons[feedback.status as keyof typeof statusIcons]}
                          <span className="font-medium text-sm">{feedback.subject}</span>
                        </div>
                        <Badge className={priorityColors[feedback.priority as keyof typeof priorityColors]}>
                          {feedback.priority}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-600">
                        From: {feedback.userName} • {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                      </div>
                    </div>
                  ))}
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => window.location.href = "/admin/feedback"}
                    data-testid="view-all-feedback-button"
                  >
                    View All Feedback
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = "/admin/users"}
                  data-testid="manage-users-button"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Users
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = "/admin/feedback"}
                  data-testid="review-feedback-button"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Review Feedback
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => window.location.href = "/admin/settings"}
                  data-testid="system-settings-button"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}