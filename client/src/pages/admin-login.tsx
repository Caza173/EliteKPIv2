import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { Shield, AlertCircle, LogIn } from "lucide-react";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const { isAuthenticated: isUserAuthenticated, user } = useAuth();

  useEffect(() => {
    // If user is already authenticated and is admin, redirect to admin dashboard
    if (isUserAuthenticated && user && (user as any).isAdmin) {
      setLocation("/admin/dashboard");
    }
  }, [isUserAuthenticated, user, setLocation]);

  const handleLogin = () => {
    // Set session storage to remember admin intent before redirecting to login
    sessionStorage.setItem('adminRedirect', 'true');
    window.location.href = "/api/login";
  };

  const handleBackToApp = () => {
    setLocation("/dashboard");
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900" data-testid="admin-login-page">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <Card className="w-full max-w-md mx-4 relative z-10 shadow-2xl border-slate-700 bg-slate-800/95 backdrop-blur">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Admin Access</CardTitle>
          <CardDescription className="text-slate-300">
            Secure administrative portal for EliteKPI platform management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isUserAuthenticated ? (
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <LogIn className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Authentication Required</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      Please sign in first to verify your admin credentials
                    </p>
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleLogin} 
                className="w-full bg-blue-600 hover:bg-blue-700"
                data-testid="admin-login-button"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            </div>
          ) : !(user as any)?.isAdmin ? (
            <div className="space-y-4">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Access Denied</p>
                    <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                      You don't have administrator privileges. Contact your system administrator if you believe this is an error.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleBackToApp} 
                  variant="outline" 
                  className="flex-1"
                  data-testid="back-to-app-button"
                >
                  Back to App
                </Button>
                <Button 
                  onClick={handleLogin} 
                  variant="outline" 
                  className="flex-1"
                  data-testid="try-different-account-button"
                >
                  Try Different Account
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Admin Access Verified</p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      Redirecting to admin dashboard...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="border-t border-slate-600 pt-4">
            <p className="text-xs text-slate-400 text-center">
              This is a secure administrative area. All activities are logged and monitored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}