import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Crown, Star, Zap, CreditCard, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link, useLocation } from "wouter";
import ReferralProgram from "@/components/referrals/referral-program";

// EliteKPI subscription plans - Complete 4-tier structure based on $100M money model
const subscriptionPlans = [
  {
    id: "starter",
    name: "Starter",
    price: 29,
    description: "Perfect for individual agents just getting started.",
    icon: Circle,
    badge: "Free 1-Week Trial",
    features: [
      "1 user included",
      "Up to 25 active properties",
      "Basic performance dashboards",
      "Property management",
      "Essential CMA tools",
      "Basic contact management",
      "Expense tracking & time logging",
      "Email support"
    ],
    limits: {
      users: 1,
      properties: 25,
      reports: "Basic",
      support: "Email"
    }
  },
  {
    id: "professional",
    name: "Professional",
    price: 79,
    description: "For established agents and small teams.",
    icon: Star,
    popular: true,
    badge: "Free 1-Week Trial",
    features: [
      "3 users included ($15/additional user)",
      "Up to 100 active properties",
      "Advanced analytics",
      "Automation & workflows",
      "Leaderboards",
      "Goal tracking",
      "Performance analytics (Conversion Rate, Offer Acceptance)",
      "Advanced CMAs with success rate tracking",
      "Priority email support"
    ],
    limits: {
      users: 3,
      properties: 100,
      additionalUserCost: 15,
      reports: "Advanced",
      support: "Priority Email"
    }
  },
  {
    id: "elite",
    name: "Elite",
    price: 199,
    description: "For high-performing agents and teams.",
    icon: Crown,
    badge: "Free 1-Week Trial",
    features: [
      "10 users included ($25/additional user)",
      "Up to 500 active properties",
      "Team collaboration tools",
      "Custom dashboards",
      "AI-powered pricing strategies",
      "Office Challenges & Competition Hub",
      "Custom branding",
      "Priority support",
      "API access"
    ],
    limits: {
      users: 10,
      properties: 500,
      additionalUserCost: 25,
      reports: "Advanced",
      support: "Priority Support"
    }
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    description: "For brokerages and large teams.",
    icon: Zap,
    badge: "Contact Sales",
    features: [
      "Unlimited users",
      "Unlimited properties",
      "Multi-office analytics",
      "White-label branding",
      "Dedicated account manager",
      "Custom integrations",
      "Advanced reporting & analytics",
      "Priority phone support",
      "Custom training & onboarding",
      "SLA guarantee"
    ],
    limits: {
      users: -1,
      properties: -1,
      reports: "Advanced",
      support: "Dedicated Support"
    }
  }
];

export default function Billing() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // In admin-controls branch, mock enterprise subscription for full access
  const mockEnterpriseSubscription = {
    status: 'active',
    current_period_end: Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60), // 1 year from now
    plan: 'enterprise'
  };

  // Get current subscription status from Stripe (but override with mock data)
  const { data: subscriptionStatus = mockEnterpriseSubscription, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/subscription-status'],
    queryFn: () => Promise.resolve(mockEnterpriseSubscription), // Always return mock enterprise subscription
  });

  // Get user data for usage calculations
  const { data: user } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: () => apiRequest('GET', '/api/auth/user').then(res => res.json()),
  });

  // Get properties for usage tracking
  const { data: properties = [] } = useQuery({
    queryKey: ['/api/properties'],
    queryFn: () => apiRequest('GET', '/api/properties').then(res => res.json()),
  });

  // Cancel subscription mutation
  const cancelSubscription = useMutation({
    mutationFn: () => apiRequest('POST', '/api/cancel-subscription').then(res => res.json()),
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription has been canceled successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
    },
    onError: (error: any) => {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle URL parameters for success messages
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      toast({
        title: "Subscription Activated!",
        description: "Welcome to EliteKPI Professional. Your subscription is now active.",
      });
      // Remove success parameter from URL
      window.history.replaceState({}, '', '/billing');
    }
  }, [toast]);

  const handleSubscribe = (planId: string) => {
    // Pass the plan ID to the subscription page
    setLocation(`/subscribe?plan=${planId}`);
  };

  const handleCancelSubscription = () => {
    if (window.confirm("Are you sure you want to cancel your subscription? You'll lose access to professional features at the end of your current billing period.")) {
      cancelSubscription.mutate();
    }
  };

  const handleManageSubscription = () => {
    toast({
      title: "Stripe Customer Portal",
      description: "This would open the Stripe customer portal for detailed subscription management.",
    });
  };

  // Get current plan based on subscription status
  const getCurrentPlan = () => {
    if (!subscriptionStatus || subscriptionStatus.status === 'no_subscription') {
      return null;
    }
    // For now, default to Professional, but this could be enhanced to detect actual plan
    return subscriptionPlans.find(plan => plan.id === "professional") || subscriptionPlans[1];
  };

  const currentPlan = getCurrentPlan();
  const hasActiveSubscription = subscriptionStatus?.status === 'active';
  const hasSubscription = subscriptionStatus?.status && subscriptionStatus.status !== 'no_subscription';

  // Calculate usage (mock data for now)
  const currentUsage = {
    users: 1,
    properties: properties.length || 0,
    transactions: Math.floor(properties.length / 2), // Mock transaction count
    storageUsed: 3.2
  };

  return (
    <div className="space-y-6" data-testid="billing-page">
      {/* Admin Controls Branch Banner */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-600" />
            <CardTitle className="text-purple-900 dark:text-purple-100">🚀 Admin Controls Branch - Full Access Enabled</CardTitle>
          </div>
          <CardDescription className="text-purple-700 dark:text-purple-300">
            You have complete access to all EliteKPI features in this admin version. All payment restrictions are disabled for testing purposes.
          </CardDescription>
        </CardHeader>
      </Card>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-black">Billing & Subscription</h1>
        <p className="text-black">
          Manage your subscription and billing preferences
        </p>
      </div>

      {/* Success message for active subscriptions */}
      {hasActiveSubscription && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <CardTitle className="text-green-900 dark:text-green-100">Subscription Active</CardTitle>
            </div>
            <CardDescription className="text-green-700 dark:text-green-300">
              You're subscribed to EliteKPI Professional. Welcome to advanced real estate management!
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Development: Clear test subscription button */}
      {subscriptionStatus?.status === 'incomplete' && (
        <Button 
          variant="outline" 
          size="sm"
          onClick={async () => {
            try {
              await apiRequest("POST", "/api/clear-test-subscription");
              queryClient.invalidateQueries({ queryKey: ['/api/subscription-status'] });
              toast({
                title: "Test Subscription Cleared",
                description: "You can now create a new subscription.",
              });
            } catch (error) {
              toast({
                title: "Error",
                description: "Failed to clear test subscription",
                variant: "destructive",
              });
            }
          }}
          data-testid="button-clear-test"
        >
          Clear Test Subscription
        </Button>
      )}


      <Tabs defaultValue="plans" className="space-y-6">
        <TabsList>
          <TabsTrigger value="plans" data-testid="tab-plans">Subscription Plans</TabsTrigger>
          {hasSubscription && (
            <>
              <TabsTrigger value="current" data-testid="tab-current">Current Plan</TabsTrigger>
              <TabsTrigger value="usage" data-testid="tab-usage">Usage & Limits</TabsTrigger>
            </>
          )}
          <TabsTrigger value="billing" data-testid="tab-billing">Billing History</TabsTrigger>
          <TabsTrigger value="referrals" data-testid="tab-referrals">Referral Program</TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="space-y-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {subscriptionPlans.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = hasActiveSubscription && plan.id === "professional";
                const isAvailable = plan.id !== 'enterprise'; // Enterprise requires custom pricing
                
                return (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'border-purple-500 shadow-xl ring-2 ring-purple-500/20' : 'border-gray-200'} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`} data-testid={`plan-card-${plan.id}`}>
                    {/* Trial Badge */}
                    {plan.badge && plan.id !== 'enterprise' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-1">
                          ✅ {plan.badge}
                        </Badge>
                      </div>
                    )}

                    {/* Enterprise Contact Badge */}
                    {plan.id === 'enterprise' && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-1">
                          📞 {plan.badge}
                        </Badge>
                      </div>
                    )}
                    
                    {/* Popular Badge */}
                    {plan.popular && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-orange-500 text-white font-medium">
                          Most Popular
                        </Badge>
                      </div>
                    )}
                    
                    {/* Current Plan Badge */}
                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-4">
                        <Badge className="bg-green-600 text-white font-medium">
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    
                    <CardHeader className="text-center pb-4">
                      <div className="flex justify-center mb-4">
                        <Icon className={`h-10 w-10 ${plan.popular ? 'text-purple-600' : plan.id === 'elite' ? 'text-yellow-600' : plan.id === 'enterprise' ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <CardTitle className="text-2xl font-bold text-gray-900">{plan.name}</CardTitle>
                      <div className="text-3xl font-bold text-gray-900 mb-2">
                        {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
                        {typeof plan.price === 'number' && <span className="text-base font-normal text-gray-600">/month</span>}
                      </div>
                      <CardDescription className="text-gray-600 text-sm">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <ul className="space-y-2">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full h-10 text-sm font-semibold ${
                          plan.popular 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : plan.id === 'elite'
                            ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                            : plan.id === 'enterprise'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-600 hover:bg-gray-700 text-white'
                        }`}
                        onClick={() => plan.id === 'enterprise' ? window.open('mailto:sales@elitekpi.com?subject=Enterprise Plan Inquiry') : handleSubscribe(plan.id)}
                        disabled={isCurrentPlan}
                        data-testid={`button-subscribe-${plan.id}`}
                      >
                        {isCurrentPlan ? "Current Plan" : plan.id === 'enterprise' ? "Contact Sales" : "Start Free Trial"}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Additional Info Section */}
            <div className="mt-12 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <Zap className="h-4 w-4 text-purple-600" />
                <span>All plans include a free 1-week trial - no credit card required</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                <CreditCard className="h-4 w-4 text-blue-600" />
                <span>Cancel anytime • No setup fees • 30-day money-back guarantee</span>
              </div>
            </div>
          </div>
        </TabsContent>

        {hasActiveSubscription && (
          <TabsContent value="current" className="space-y-6">
            <Card data-testid="current-subscription-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Enterprise Plan (Admin Access)
                </CardTitle>
                <CardDescription className="text-black">
                  Your current subscription details - Full Admin Access Enabled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <div className="text-sm font-medium text-black">Status</div>
                    <Badge variant="default" className="mt-1 bg-green-600" data-testid="subscription-status">
                      🚀 Admin Full Access
                    </Badge>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">Plan Type</div>
                    <div className="mt-1 text-black font-semibold">Enterprise (Admin Controls)</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">Monthly Cost</div>
                    <div className="text-2xl font-bold mt-1 text-black" data-testid="monthly-cost">FREE (Testing)</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-black">Plan Benefits</div>
                    <div className="mt-1 text-black">Unlimited everything, All features unlocked, Admin privileges</div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button disabled variant="outline" data-testid="button-admin-note">
                    <Crown className="w-4 h-4 mr-2" />
                    Admin Version - All Features Enabled
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

                {hasSubscription && (
          <TabsContent value="usage" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card data-testid="usage-users">
                <CardHeader>
                  <CardTitle className="text-black">Team Members</CardTitle>
                  <CardDescription className="text-black">
                    {currentUsage.users} of ∞ users (Unlimited in Admin version)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={10} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-black mt-2">
                    <span>Used: {currentUsage.users}</span>
                    <span>Limit: Unlimited</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="usage-properties">
                <CardHeader>
                  <CardTitle className="text-black">Active Properties</CardTitle>
                  <CardDescription className="text-black">
                    {currentUsage.properties} of ∞ properties (Unlimited in Admin version)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={10} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-black mt-2">
                    <span>Used: {currentUsage.properties}</span>
                    <span>Limit: Unlimited</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="usage-transactions">
                <CardHeader>
                  <CardTitle className="text-black">Transactions This Month</CardTitle>
                  <CardDescription className="text-black">
                    {currentUsage.transactions} of ∞ transactions (Unlimited in Admin version)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={10} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-black mt-2">
                    <span>Used: {currentUsage.transactions}</span>
                    <span>Limit: Unlimited</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="usage-storage">
                <CardHeader>
                  <CardTitle className="text-black">Storage Usage</CardTitle>
                  <CardDescription className="text-black">
                    {currentUsage.storageUsed} GB of ∞ GB used (Unlimited in Admin version)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={10} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-black mt-2">
                    <span>Used: {currentUsage.storageUsed} GB</span>
                    <span>Limit: Unlimited</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="billing" className="space-y-6">
          <Card data-testid="billing-history">
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                Your recent invoices and payment history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {hasActiveSubscription ? (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Billing history will appear here after your first payment.
                  </p>
                  <p className="text-sm text-black mt-2">
                    You can also access detailed billing information through the Stripe customer portal.
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-black">
                    No billing history available. Subscribe to see your payment history.
                  </p>
                  <Button asChild className="mt-4" data-testid="button-subscribe-now">
                    <Link href="/subscribe">Subscribe Now</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <ReferralProgram />
        </TabsContent>
      </Tabs>

      {/* Call-to-action for non-subscribers */}
      {!hasActiveSubscription && (
        <Card className="border-primary bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20" data-testid="subscription-cta">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-black">Ready to unlock professional features?</CardTitle>
            <CardDescription className="text-base text-black">
              Join thousands of successful real estate agents using EliteKPI Professional
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" asChild data-testid="button-start-subscription">
              <Link href="/subscribe">
                <Star className="w-4 h-4 mr-2" />
                Start Professional Subscription
              </Link>
            </Button>
            <p className="text-sm text-black mt-2">
              $79/month • Cancel anytime • Full feature access
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}