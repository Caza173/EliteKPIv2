import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, X, Info, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";

export default function WelcomeNotice() {
  const [isDismissed, setIsDismissed] = useState(false);
  
  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  useEffect(() => {
    // Check if user has dismissed the welcome notice
    const dismissed = localStorage.getItem("welcomeNoticeDismissed");
    if (dismissed === "true") {
      setIsDismissed(true);
    }
  }, []);

  // Check if user has incomplete settings
  const hasIncompleteSettings = user && (
    !user.hourlyRate || 
    !user.vehicleMpg || 
    !user.avgGasPrice || 
    !user.defaultCommissionSplit
  );

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("welcomeNoticeDismissed", "true");
  };

  // Don't show notice if dismissed or user has complete settings
  if (isDismissed || !hasIncompleteSettings) {
    return null;
  }

  return (
    <Alert className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-blue-900">Welcome to EliteKPI!</span>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Setup Required</span>
          </div>
          <p className="text-blue-800 text-sm mb-3">
            Complete your account setup to unlock accurate calculations and personalized insights. 
            Configure your hourly rate, commission split, and vehicle details.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link href="/settings">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Settings className="h-4 w-4 mr-2" />
                Complete Setup
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleDismiss}
              className="border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              Remind me later
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="text-blue-600 hover:bg-blue-100 ml-4"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}