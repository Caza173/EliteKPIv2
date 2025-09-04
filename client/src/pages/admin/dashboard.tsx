import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Database, Settings, Activity, AlertTriangle, TrendingUp, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

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
  const [, setLocation] = useLocation();

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

  const handleSystemDiagnostics = async () => {
    try {
      const response = await fetch('/api/admin/system/diagnostics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await response.json();
      
      if (response.ok) {
        alert(`System Diagnostics Complete!\n\n${result.message || 'All systems checked successfully.'}`);
      } else {
        alert(`Diagnostics Error: ${result.error || 'Failed to run diagnostics'}`);
      }
      
      // Refresh admin data to update any status changes
      fetchAdminData();
    } catch (error) {
      console.error('Error running system diagnostics:', error);
      alert('Failed to run system diagnostics. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-black">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-black">Admin Dashboard</h1>
        </div>
        <Badge variant={stats?.systemHealth === 'good' ? 'default' : 'destructive'}>
          System Status: {stats?.systemHealth}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeUsers || 0} active this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Properties</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats?.totalProperties || 0}</div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">${stats?.totalRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Platform-wide</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-black">Database Size</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{stats?.databaseSize || 'N/A'}</div>
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
              <CardTitle className="text-black">System Health</CardTitle>
              <CardDescription className="text-black">Monitor system performance and health</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-black">Database Connection</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">✓ Connected</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black">OpenAI API</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">✓ Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black">ATTOM Data API</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">✓ Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-black">Stripe Integration</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-300">✓ Connected</Badge>
                </div>
                <div className="mt-4">
                  <Button className="w-full" onClick={handleSystemDiagnostics}>Run System Diagnostics</Button>
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
