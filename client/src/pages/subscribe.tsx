import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link, useLocation } from "wouter";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const SubscribeForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + '/billing?success=true',
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Payment Successful",
        description: "Welcome to EliteKPI Professional!",
      });
      setLocation('/billing?success=true');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" data-testid="subscription-form">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-black">Payment Information</h3>
        <div className="p-4 border rounded-lg">
          <PaymentElement />
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => setLocation('/billing')}
          className="flex-1"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Billing
        </Button>
        <Button 
          type="submit" 
          disabled={!stripe || isLoading}
          className="flex-1 bg-purple-600 hover:bg-purple-700"
          data-testid="button-subscribe"
        >
          {isLoading ? "Processing..." : "Start Free Trial"}
        </Button>
      </div>
    </form>
  );
};

export default function Subscribe() {
  const [clientSecret, setClientSecret] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [location] = useLocation();
  const { toast } = useToast();

  // Extract plan from URL query parameters
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const planId = urlParams.get('plan') || 'professional';

  // Plan details for display
  const planDetails = {
    starter: {
      name: "Starter",
      price: 29,
      features: [
        "1 user included",
        "Up to 25 active properties",
        "Basic performance dashboards",
        "Property management",
        "Essential CMA tools",
        "Email support"
      ]
    },
    professional: {
      name: "Professional", 
      price: 79,
      features: [
        "3 users included ($15/additional user)",
        "Up to 100 active properties",
        "Advanced analytics & automation",
        "Leaderboards & goal tracking",
        "Performance analytics",
        "Advanced CMAs",
        "Priority email support"
      ]
    },
    elite: {
      name: "Elite",
      price: 199,
      features: [
        "10 users included ($25/additional user)",
        "Up to 500 active properties",
        "Team collaboration tools",
        "Custom dashboards",
        "AI-powered pricing strategies",
        "Market Timing AI & Offer Strategies",
        "Office Challenges & Competition Hub",
        "Custom branding & API access",
        "Priority support"
      ]
    },
    enterprise: {
      name: "Enterprise",
      price: "Custom",
      features: [
        "Unlimited users & properties",
        "Multi-office analytics",
        "White-label branding",
        "Dedicated account manager",
        "Custom integrations",
        "Advanced reporting",
        "Priority phone support",
        "Custom training & SLA"
      ]
    }
  };

  const selectedPlan = planDetails[planId as keyof typeof planDetails] || planDetails.professional;

  useEffect(() => {
    // Create subscription as soon as the page loads
    apiRequest("POST", "/api/get-or-create-subscription", { planId })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          throw new Error(data.error.message);
        }
        
        // If user already has active subscription, redirect to billing
        if (data.redirectToBilling) {
          toast({
            title: "Already Subscribed",
            description: "You already have an active subscription. Redirecting to billing page.",
          });
          setTimeout(() => {
            window.location.href = '/billing';
          }, 2000);
          return;
        }
        
        if (!data.clientSecret) {
          throw new Error('No client secret received from server');
        }
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        toast({
          title: "Subscription Error",
          description: error.message || "Failed to create subscription. Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="loading-state">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" aria-label="Loading"/>
                <p className="text-muted-foreground">Setting up your subscription...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="container mx-auto px-4 py-8" data-testid="error-state">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Subscription Setup Failed</CardTitle>
              <CardDescription>
                We couldn't set up your subscription. Please try again or contact support.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" data-testid="button-back-to-billing">
                <Link href="/billing">Back to Billing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="subscribe-page">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-black">Subscribe to EliteKPI {selectedPlan.name}</CardTitle>
                <CardDescription className="text-black">
                  ✅ Free 1-Week Trial • Cancel anytime
                </CardDescription>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 rounded-lg p-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-black">${selectedPlan.price}</div>
                <div className="text-sm text-black">per month after trial</div>
                <div className="text-xs text-green-600 font-medium mt-1">First week FREE</div>
              </div>
              <div className="mt-4 space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-black">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Make SURE to wrap the form in <Elements> which provides the stripe context. */}
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <SubscribeForm />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}