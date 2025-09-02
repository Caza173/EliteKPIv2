import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plug, Clock, Zap, Building, Mail, BarChart3, CreditCard, User } from "lucide-react";

export function IntegrationsPage() {
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