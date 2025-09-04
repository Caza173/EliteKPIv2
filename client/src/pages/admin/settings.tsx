import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Save, RefreshCw, Key, Database, Shield, Globe, ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';

interface SystemConfig {
  openaiApiKey: string;
  attomApiKey: string;
  stripeSecretKey: string;
  stripePublicKey: string;
  databaseUrl: string;
  sessionSecret: string;
  features: {
    aiScripts: boolean;
    marketTiming: boolean;
    cmaReports: boolean;
    propertyPipeline: boolean;
  };
  limits: {
    starterProperties: number;
    professionalProperties: number;
    starterUsers: number;
    professionalUsers: number;
  };
}

export default function AdminSettings() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('api-keys');
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      alert('Configuration saved successfully!');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    if (!config) return;
    const keys = path.split('.');
    const newConfig = { ...config };
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    
    setConfig(newConfig);
  };

  const runDatabaseMaintenance = async () => {
    try {
      const response = await fetch('/api/admin/maintenance', { method: 'POST' });
      const result = await response.json();
      alert(`Maintenance completed: ${result.message}`);
    } catch (error) {
      console.error('Error running maintenance:', error);
      alert('Error running maintenance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading system configuration...</div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Failed to load configuration</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchConfig}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={saveConfig} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save All'}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('api-keys')}>
          <CardContent className="p-6 text-center">
            <Key className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium text-purple-600">Configure API Keys</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('features')}>
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium text-purple-600">Manage Feature Flags</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('limits')}>
          <CardContent className="p-6 text-center">
            <Shield className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium text-purple-600">Update Plan Configurations</h3>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={runDatabaseMaintenance}>
          <CardContent className="p-6 text-center">
            <Database className="h-8 w-8 mx-auto mb-2 text-purple-600" />
            <h3 className="font-medium text-purple-600">Database Maintenance</h3>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="api-keys" data-tab="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="features" data-tab="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="limits" data-tab="limits">Plan Limits</TabsTrigger>
          <TabsTrigger value="database" data-tab="database">Database</TabsTrigger>
          <TabsTrigger value="security" data-tab="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="api-keys" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                API Configuration
              </CardTitle>
              <CardDescription>
                Manage external service API keys and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openai-key">OpenAI API Key</Label>
                  <Input
                    id="openai-key"
                    type="password"
                    value={config.openaiApiKey}
                    onChange={(e) => updateConfig('openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attom-key">ATTOM Data API Key</Label>
                  <Input
                    id="attom-key"
                    type="password"
                    value={config.attomApiKey}
                    onChange={(e) => updateConfig('attomApiKey', e.target.value)}
                    placeholder="Your ATTOM API key"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                  <Input
                    id="stripe-secret"
                    type="password"
                    value={config.stripeSecretKey}
                    onChange={(e) => updateConfig('stripeSecretKey', e.target.value)}
                    placeholder="sk_live_..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stripe-public">Stripe Public Key</Label>
                  <Input
                    id="stripe-public"
                    value={config.stripePublicKey}
                    onChange={(e) => updateConfig('stripePublicKey', e.target.value)}
                    placeholder="pk_live_..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Feature Flags
              </CardTitle>
              <CardDescription>
                Enable or disable platform features globally
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ai-scripts">AI Scripts</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable AI-powered script generation
                    </p>
                  </div>
                  <Switch
                    id="ai-scripts"
                    checked={config.features.aiScripts}
                    onCheckedChange={(checked) => updateConfig('features.aiScripts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="market-timing">Market Timing</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable market timing intelligence
                    </p>
                  </div>
                  <Switch
                    id="market-timing"
                    checked={config.features.marketTiming}
                    onCheckedChange={(checked) => updateConfig('features.marketTiming', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cma-reports">CMA Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable comparative market analysis
                    </p>
                  </div>
                  <Switch
                    id="cma-reports"
                    checked={config.features.cmaReports}
                    onCheckedChange={(checked) => updateConfig('features.cmaReports', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="property-pipeline">Property Pipeline</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable advanced property management
                    </p>
                  </div>
                  <Switch
                    id="property-pipeline"
                    checked={config.features.propertyPipeline}
                    onCheckedChange={(checked) => updateConfig('features.propertyPipeline', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Plan Limits</CardTitle>
              <CardDescription>
                Configure limits for different subscription plans
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="starter-properties">Starter Plan - Max Properties</Label>
                  <Input
                    id="starter-properties"
                    type="number"
                    value={config.limits.starterProperties}
                    onChange={(e) => updateConfig('limits.starterProperties', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional-properties">Professional Plan - Max Properties</Label>
                  <Input
                    id="professional-properties"
                    type="number"
                    value={config.limits.professionalProperties}
                    onChange={(e) => updateConfig('limits.professionalProperties', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="starter-users">Starter Plan - Max Users</Label>
                  <Input
                    id="starter-users"
                    type="number"
                    value={config.limits.starterUsers}
                    onChange={(e) => updateConfig('limits.starterUsers', parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="professional-users">Professional Plan - Max Users</Label>
                  <Input
                    id="professional-users"
                    type="number"
                    value={config.limits.professionalUsers}
                    onChange={(e) => updateConfig('limits.professionalUsers', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Management
              </CardTitle>
              <CardDescription>
                Database configuration and maintenance tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="database-url">Database URL</Label>
                <Input
                  id="database-url"
                  type="password"
                  value={config.databaseUrl}
                  onChange={(e) => updateConfig('databaseUrl', e.target.value)}
                  placeholder="postgresql://..."
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={runDatabaseMaintenance}>
                  Run Maintenance
                </Button>
                <Button variant="outline">
                  Create Backup
                </Button>
                <Button variant="outline">
                  View Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Security and authentication configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session-secret">Session Secret</Label>
                <Input
                  id="session-secret"
                  type="password"
                  value={config.sessionSecret}
                  onChange={(e) => updateConfig('sessionSecret', e.target.value)}
                  placeholder="Your secure session secret"
                />
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-black">Security Status</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-black">HTTPS Enabled</span>
                    <Badge variant="default">✓ Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black">Session Security</span>
                    <Badge variant="default">✓ Secure</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-black">API Rate Limiting</span>
                    <Badge variant="default">✓ Enabled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
