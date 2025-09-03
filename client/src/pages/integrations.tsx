import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plug, Clock, Zap, Building, Mail, BarChart3, CreditCard, User, Database, CheckCircle } from "lucide-react";
import { MLSSettingsSection } from "@/components/mls-settings";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function IntegrationsPage() {
  const [showMLSSettings, setShowMLSSettings] = useState(false);

  // Fetch data sources status
  const { data: dataSourcesStatus } = useQuery<any>({
    queryKey: ["/api/data-sources/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const comingSoonIntegrations = [
    {
      name: "Zapier",
      description: "Connect EliteKPI with 5,000+ apps to automate your workflow",
      icon: Zap,
      category: "Automation",
      color: "from-orange-400 to-orange-600"
    },
    {
      name: "DocuSign",
      description: "Seamlessly integrate contract signing into your transaction process",
      icon: Building,
      category: "Documents",
      color: "from-blue-400 to-blue-600"
    },
    {
      name: "Mailchimp",
      description: "Sync your client data with email marketing campaigns",
      icon: Mail,
      category: "Marketing",
      color: "from-cyan-400 to-cyan-600"
    },
    {
      name: "QuickBooks",
      description: "Automatically sync commissions and expenses with your accounting",
      icon: BarChart3,
      category: "Accounting",
      color: "from-green-400 to-green-600"
    },
    {
      name: "Stripe",
      description: "Process payments and manage subscriptions directly in EliteKPI",
      icon: CreditCard,
      category: "Payments",
      color: "from-purple-400 to-purple-600"
    },
    {
      name: "HubSpot",
      description: "Connect your CRM data with performance tracking",
      icon: User,
      category: "CRM",
      color: "from-pink-400 to-pink-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-12">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Plug className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Integrations</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
          Connect EliteKPI with your favorite tools to supercharge your real estate business
        </p>
        <div className="flex items-center justify-center space-x-2">
          <Clock className="h-5 w-5 text-orange-500" />
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-4 py-2 text-lg">
            Coming Soon
          </Badge>
        </div>
      </div>

      {/* Active Integrations */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Active Integrations</h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Live data sources and integrations currently powering your EliteKPI experience
          </p>
        </div>

        {/* ATTOM Data Solutions */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-black">ATTOM Data Solutions</CardTitle>
                  <p className="text-gray-600">Primary residential sales market data provider</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <Badge className="bg-green-100 text-green-800">
                  ACTIVE
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-black mb-3">Data Coverage</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• 158+ million property records nationwide</li>
                  <li>• Real-time sales prices and market trends</li>
                  <li>• Days on market and inventory levels</li>
                  <li>• Price per square foot calculations</li>
                  <li>• Automated market condition analysis</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-black mb-3">Integration Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Coverage:</span>
                    <span className="text-black font-medium">Nationwide (US)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Last Updated:</span>
                    <span className="text-black font-medium">Just now</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Response Time:</span>
                    <span className="text-black font-medium">&lt; 500ms</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MLS Integration */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-black">MLS Integration</CardTitle>
                  <p className="text-gray-600">Connect to your local MLS for real-time property data</p>
                </div>
              </div>
              <Button
                onClick={() => setShowMLSSettings(!showMLSSettings)}
                variant="outline"
              >
                {showMLSSettings ? 'Hide Settings' : 'Configure MLS'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showMLSSettings ? (
              <MLSSettingsSection />
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-black mb-3">Features</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Access to local MLS listings</li>
                    <li>• Automated property data sync</li>
                    <li>• Real-time market statistics</li>
                    <li>• Comparable sales analysis</li>
                    <li>• Listing status updates</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-black mb-3">Getting Started</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>1. Select your state and MLS system</p>
                    <p>2. Enter your MLS Grid API key</p>
                    <p>3. Test the connection</p>
                    <p>4. Save your configuration</p>
                    <p className="text-blue-600 mt-3">
                      <Button variant="outline" size="sm" onClick={() => setShowMLSSettings(true)}>
                        Start Configuration →
                      </Button>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Coming Soon Integrations Header */}
      <div className="mt-12 text-center">
        <h2 className="text-3xl font-bold text-black mb-4">Coming Soon</h2>
        <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-6">
          Additional integrations being developed to enhance your workflow
        </p>
        <div className="flex items-center justify-center space-x-2">
          <Clock className="h-5 w-5 text-orange-500" />
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-4 py-2 text-lg">
            Coming Soon
          </Badge>
        </div>
      </div>

      {/* Coming Soon Integrations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {comingSoonIntegrations.map((integration) => (
          <Card key={integration.name} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${integration.color}`} />
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${integration.color} flex items-center justify-center`}>
                  <integration.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{integration.name}</CardTitle>
                  <Badge variant="outline" className="text-xs mt-1">
                    {integration.category}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {integration.description}
              </p>
              <div className="mt-4 flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-600 font-medium">Coming Soon</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Integration */}
      <div className="mt-12 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Request an Integration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Don't see the integration you need? Let us know what tools you'd like to connect.
            </p>
            <div className="flex items-center justify-center space-x-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-600 font-medium">Submit Requests Soon</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}