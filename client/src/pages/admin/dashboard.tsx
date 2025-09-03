import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Database, Settings, Activity, AlertTriangle, TrendingUp } from 'lucide-react';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  totalRevenue: number;
  systemHealth: 'good' | 'warning' | 'critical';
  databaseSize: string;
  lastBackup: string;
}

interface UserData {
  id: string;
  email: string;
  plan: string;
  properties: number;
  lastActive: string;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      // Fetch admin statistics
      const statsResponse = await fetch('/api/admin/stats');
      const statsData = await statsResponse.json();
      setStats(statsData);

      // Fetch users data
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      fetchAdminData(); // Refresh data
    } catch (error) {
      console.error('Error performing user action:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Badge variant={stats?.systemHealth === 'good' ? 'default' : 'destructive'}>
          System Status: {stats?.systemHealth}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.databaseSize || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Last backup: {stats?.lastBackup || 'Never'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage users, their plans, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{user.email}</div>
                      <div className="text-sm text-muted-foreground">
                        Plan: {user.plan} • Properties: {user.properties} • Revenue: ${user.totalRevenue}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last active: {user.lastActive}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUserAction(user.id, 'upgrade')}
                      >
                        Upgrade Plan
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUserAction(user.id, 'reset')}
                      >
                        Reset Password
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleUserAction(user.id, 'suspend')}
                      >
                        Suspend
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Monitor system performance and health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Database Connection</span>
                  <Badge variant="default">✓ Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>OpenAI API</span>
                  <Badge variant="default">✓ Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>ATTOM Data API</span>
                  <Badge variant="default">✓ Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Stripe Integration</span>
                  <Badge variant="default">✓ Connected</Badge>
                </div>
                <div className="mt-4">
                  <Button className="w-full">Run System Diagnostics</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>Deep insights into platform usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-sm">
                  <strong>Feature Usage:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• AI Scripts: 245 generated this month</li>
                    <li>• Market Timing: 189 queries this month</li>
                    <li>• CMA Reports: 156 generated this month</li>
                    <li>• Property Pipeline: 89% adoption rate</li>
                  </ul>
                </div>
                <div className="text-sm">
                  <strong>Plan Distribution:</strong>
                  <ul className="mt-2 space-y-1">
                    <li>• Starter: 60% of users</li>
                    <li>• Professional: 35% of users</li>
                    <li>• Enterprise: 5% of users</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
              <CardDescription>Configure platform-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">
                  Configure API Keys
                </Button>
                <Button variant="outline" className="w-full">
                  Manage Feature Flags
                </Button>
                <Button variant="outline" className="w-full">
                  Update Plan Configurations
                </Button>
                <Button variant="outline" className="w-full">
                  Database Maintenance
                </Button>
                <Button variant="destructive" className="w-full">
                  Emergency Shutdown
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
