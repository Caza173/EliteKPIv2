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

// EliteKPI subscription plans - Clean 2-tier structure
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
      "Basic contact management",
      "Expense tracking & time logging",
      "Basic reports (Revenue, Volume, Conversion)",
      "Dashboard overview (core KPIs only)",
      "CMA creation (basic estimates & notes)",
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
    price: 69,
    description: "For established agents and small teams.",
    icon: Star,
    popular: true,
    badge: "Free 1-Week Trial",
    features: [
      "3 users included (add'l $15/user)",
      "Up to 100 active properties",
      "Comprehensive property pipeline (ROI, offer tracking, commission tracking)",
      "Advanced CMAs (list price, low/high estimates, success rate tracking)",
      "Performance analytics (Conversion Rate, Offer Acceptance Rate, DOM, etc.)",
      "Market Timing AI (basic predictions for when to list/close)",
      "Offer Strategies (AI-assisted competitive offer suggestions)",
      "Office Challenges (gamified productivity tracking)",
      "Competition Hub (agent leaderboard & peer comparisons)",
      "Custom branding",
      "Priority email support",
      "API access"
    ],
    limits: {
      users: 3,
      properties: 100,
      additionalUserCost: 15,
      reports: "Advanced",
      support: "Priority Email"
    }
  }
];

export default function Billing() {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState("professional");
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Get current subscription status from Stripe
  const { data: subscriptionStatus, isLoading: isLoadingSubscription } = useQuery({
    queryKey: ['/api/subscription-status'],
    queryFn: () => apiRequest('GET', '/api/subscription-status').then(res => res.json()),
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
          <div className="max-w-5xl mx-auto">
            <div className="grid gap-8 md:grid-cols-2">
              {subscriptionPlans.map((plan) => {
                const Icon = plan.icon;
                const isCurrentPlan = hasActiveSubscription && plan.id === "professional";
                const isAvailable = true; // All plans are now available
                
                return (
                  <Card key={plan.id} className={`relative ${plan.popular ? 'border-purple-500 shadow-xl ring-2 ring-purple-500/20' : 'border-gray-200'} ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`} data-testid={`plan-card-${plan.id}`}>
                    {/* Trial Badge */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <Badge className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-1">
                          ✅ {plan.badge}
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
                        <Icon className={`h-12 w-12 ${plan.popular ? 'text-purple-600' : 'text-blue-600'}`} />
                      </div>
                      <CardTitle className="text-3xl font-bold text-gray-900">{plan.name}</CardTitle>
                      <div className="text-4xl font-bold text-gray-900 mb-2">
                        ${plan.price}
                        <span className="text-lg font-normal text-gray-600">/month</span>
                      </div>
                      <CardDescription className="text-gray-600 text-base">{plan.description}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <Button 
                        className={`w-full h-12 text-base font-semibold ${
                          plan.popular 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        onClick={() => handleSubscribe(plan.id)}
                        disabled={isCurrentPlan || !isAvailable}
                        data-testid={`button-subscribe-${plan.id}`}
                      >
                        {isCurrentPlan ? "Current Plan" : "Start Free Trial"}
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

        {hasSubscription && (
          <TabsContent value="current" className="space-y-6">
            <Card data-testid="current-subscription-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-black">
                  <Star className="h-5 w-5 text-primary" />
                  {currentPlan?.name || 'Professional'} Plan
                </CardTitle>
                <CardDescription className="text-black">
                  Your current subscription details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoadingSubscription ? (
                  <div className="space-y-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <div className="text-sm font-medium text-black">Status</div>
                      <Badge variant="default" className="mt-1" data-testid="subscription-status">
                        {subscriptionStatus?.status === 'active' ? 'Active' : subscriptionStatus?.status || 'Unknown'}
                      </Badge>
                    </div>
                    {subscriptionStatus?.current_period_end && (
                      <div>
                        <div className="text-sm font-medium text-black">Next Billing</div>
                        <div className="mt-1 text-black" data-testid="next-billing-date">
                          {new Date(subscriptionStatus.current_period_end * 1000).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-black">Monthly Cost</div>
                      <div className="text-2xl font-bold mt-1 text-black" data-testid="monthly-cost">$69.00</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-black">Plan Benefits</div>
                      <div className="mt-1 text-black">100 properties, Advanced CRM, Priority support</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  {subscriptionStatus?.status === 'incomplete' ? (
                    <Button onClick={() => setLocation('/subscribe')} className="w-full" data-testid="button-complete-payment">
                      Complete Payment
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleManageSubscription} data-testid="button-manage-subscription">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Manage Subscription
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancelSubscription}
                        disabled={cancelSubscription.isPending}
                        data-testid="button-cancel-subscription"
                      >
                        {cancelSubscription.isPending ? "Canceling..." : "Cancel Subscription"}
                      </Button>
                    </>
                  )}
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
                  <CardTitle className="text-black">Users</CardTitle>
                  <CardDescription className="text-black">
                    {currentUsage.users} of 3 users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(currentUsage.users / 3) * 100} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-black mt-2">
                    <span>Used: {currentUsage.users}</span>
                    <span>Limit: 3</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="usage-properties">
                <CardHeader>
                  <CardTitle className="text-black">Properties Usage</CardTitle>
                  <CardDescription className="text-black">
                    {currentUsage.properties} of 100 properties used
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(currentUsage.properties / 100) * 100} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-black mt-2">
                    <span>Used: {currentUsage.properties}</span>
                    <span>Limit: 100</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="usage-transactions">
                <CardHeader>
                  <CardTitle className="text-black">Transactions This Month</CardTitle>
                  <CardDescription className="text-black">
                    {currentUsage.transactions} of 50 transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(currentUsage.transactions / 50) * 100} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-black mt-2">
                    <span>Used: {currentUsage.transactions}</span>
                    <span>Limit: 50</span>
                  </div>
                </CardContent>
              </Card>

              <Card data-testid="usage-storage">
                <CardHeader>
                  <CardTitle className="text-black">Storage Usage</CardTitle>
                  <CardDescription className="text-black">
                    {currentUsage.storageUsed} GB of 10 GB used
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={(currentUsage.storageUsed / 10) * 100} 
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-black mt-2">
                    <span>Used: {currentUsage.storageUsed} GB</span>
                    <span>Limit: 10 GB</span>
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
              $69/month • Cancel anytime • Full feature access
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}