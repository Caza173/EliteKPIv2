import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AdminLayout from "@/components/layout/admin-layout";
import { 
  Users, 
  Shield, 
  User,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  Crown,
  Activity
} from "lucide-react";
import { format } from "date-fns";

interface AdminUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isActive: boolean;
  isAdmin: boolean;
  subscriptionStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: () => apiRequest('GET', '/api/admin/users').then(res => res.json()),
  });

  const updateUserStatusMutation = useMutation({
    mutationFn: (data: { id: string; isActive: boolean }) =>
      apiRequest('PATCH', `/api/admin/users/${data.id}/status`, { isActive: data.isActive }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User Status Updated",
        description: "User status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update user status.",
        variant: "destructive",
      });
    }
  });

  const updateSubscriptionMutation = useMutation({
    mutationFn: (data: { id: string; status: string; subscriptionId?: string }) =>
      apiRequest('PATCH', `/api/admin/users/${data.id}/subscription`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Subscription Updated",
        description: "User subscription has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update subscription.",
        variant: "destructive",
      });
    }
  });

  const handleToggleUserStatus = (user: AdminUser) => {
    updateUserStatusMutation.mutate({
      id: user.id,
      isActive: !user.isActive
    });
  };

  const handleUpdateSubscription = (user: AdminUser, status: string) => {
    updateSubscriptionMutation.mutate({
      id: user.id,
      status: status
    });
  };

  const activeUsers = users.filter((user: AdminUser) => user.isActive);
  const inactiveUsers = users.filter((user: AdminUser) => !user.isActive);
  const adminUsers = users.filter((user: AdminUser) => user.isAdmin);

  return (
    <AdminLayout>
      <div className="space-y-6" data-testid="admin-users-page">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            User Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage user accounts, permissions, and subscription status
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
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-slate-600">
                All registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeUsers.length}</div>
              <p className="text-xs text-slate-600">
                Currently active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inactiveUsers.length}</div>
              <p className="text-xs text-slate-600">
                Deactivated accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Crown className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{adminUsers.length}</div>
              <p className="text-xs text-slate-600">
                Admin accounts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users
            </CardTitle>
            <CardDescription>
              Manage user accounts, permissions, and subscription status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No users found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user: AdminUser) => (
                  <Card key={user.id} className="border-l-4 border-l-primary">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                            {user.isAdmin ? (
                              <Crown className="h-5 w-5 text-blue-600" />
                            ) : (
                              <User className="h-5 w-5 text-slate-600" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {user.firstName && user.lastName 
                                ? `${user.firstName} ${user.lastName}` 
                                : user.email}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <span>{user.email}</span>
                              <span>•</span>
                              <span>Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.isAdmin && (
                            <Badge className="bg-blue-100 text-blue-800">
                              <Shield className="h-3 w-3 mr-1" />
                              Admin
                            </Badge>
                          )}
                          <Badge className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {user.subscriptionStatus && (
                            <Badge variant="outline">
                              {user.subscriptionStatus}
                            </Badge>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                                data-testid={`manage-user-${user.id}`}
                              >
                                <Settings className="h-4 w-4 mr-1" />
                                Manage
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <User className="h-5 w-5" />
                                  Manage User: {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                                </DialogTitle>
                                <DialogDescription>
                                  Update user permissions, status, and subscription details
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold mb-2">User Information</h4>
                                    <div className="space-y-2 text-sm">
                                      <p><span className="font-medium">Email:</span> {user.email}</p>
                                      <p><span className="font-medium">Name:</span> {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : 'Not provided'}</p>
                                      <p><span className="font-medium">Created:</span> {format(new Date(user.createdAt), 'PPp')}</p>
                                      <p><span className="font-medium">Last Updated:</span> {format(new Date(user.updatedAt), 'PPp')}</p>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-semibold mb-2">Account Status</h4>
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm">Account Status</span>
                                        <Button
                                          size="sm"
                                          variant={user.isActive ? "destructive" : "default"}
                                          onClick={() => handleToggleUserStatus(user)}
                                          disabled={updateUserStatusMutation.isPending}
                                          data-testid={`toggle-user-status-${user.id}`}
                                        >
                                          {user.isActive ? (
                                            <>
                                              <XCircle className="h-3 w-3 mr-1" />
                                              Deactivate
                                            </>
                                          ) : (
                                            <>
                                              <CheckCircle className="h-3 w-3 mr-1" />
                                              Activate
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                      
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm">Admin Rights</span>
                                        <Badge className={user.isAdmin ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
                                          {user.isAdmin ? 'Admin' : 'Standard User'}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div>
                                  <h4 className="font-semibold mb-2">Subscription Management</h4>
                                  <div className="space-y-3">
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm min-w-0 flex-1">Current Status:</span>
                                      <Badge variant="outline">
                                        {user.subscriptionStatus || 'No subscription'}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Select 
                                        value={user.subscriptionStatus || 'none'} 
                                        onValueChange={(value) => handleUpdateSubscription(user, value)}
                                      >
                                        <SelectTrigger data-testid={`subscription-select-${user.id}`}>
                                          <SelectValue placeholder="Update subscription" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="none">No Subscription</SelectItem>
                                          <SelectItem value="starter">Starter Plan</SelectItem>
                                          <SelectItem value="professional">Professional Plan</SelectItem>
                                          <SelectItem value="enterprise">Enterprise Plan</SelectItem>
                                          <SelectItem value="cancelled">Cancelled</SelectItem>
                                          <SelectItem value="suspended">Suspended</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                                  <h4 className="font-semibold mb-2 text-sm">Action Log</h4>
                                  <p className="text-xs text-slate-600">
                                    User management actions are logged for security and audit purposes.
                                  </p>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}