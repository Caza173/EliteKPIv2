import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Properties from "@/pages/properties";
import Cmas from "@/pages/cmas";
import Reports from "@/pages/reports";
import Performance from "@/pages/performance";
import Calculator from "@/pages/calculator";
import Billing from "@/pages/billing";
import Subscribe from "@/pages/subscribe";
import CompetitionHub from "@/pages/competition-hub";
import OfficeCompetitions from "@/pages/office-competitions";
import MarketTiming from "@/pages/market-timing";
import OfferStrategies from "@/pages/offer-strategies";
import ExpenseAnalysis from "@/pages/expense-analysis";
import { LearningPage } from "@/pages/learning";
import { IntegrationsPage } from "@/pages/integrations";
import { useAchievementCelebration } from "@/hooks/useAchievementCelebration";
import AchievementCelebration from "@/components/achievements/achievement-celebration";
import { useTaskReminders } from "@/hooks/use-task-reminders";
import { TaskReminderDialog } from "@/components/modals/task-reminder-dialog";
import Settings from "@/pages/settings";
import Help from "@/pages/help";
import AdminPanel from "@/pages/admin";
import Activities from "@/pages/activities";
import Scripts from "@/pages/scripts";
import Feedback from "@/pages/feedback";
import AdminFeedback from "@/pages/admin-feedback";
import AdminLoginPage from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import AdminUsersPage from "@/pages/admin-users";
import AppLayout from "@/components/layout/app-layout";
import { Trophy } from "lucide-react";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { 
    currentCelebration, 
    isCelebrationOpen, 
    closeCelebration 
  } = useAchievementCelebration();
  
  const {
    dueTask,
    isReminderOpen,
    closeReminder,
    completeTask,
    snoozeTask,
  } = useTaskReminders();

  // Mock subscription plan - in real app this would come from API
  const currentSubscription = {
    plan: "elite" // starter, professional, elite, enterprise  
  };

  // Component to show upgrade message for professional features
  const ProfessionalUpgradeMessage = () => (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
          <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Professional Feature</h2>
          <p className="text-gray-600 mb-6">
            This feature is available with Professional, Elite, and Enterprise plans.
          </p>
          <div className="space-y-3 text-sm text-gray-700 mb-6">
            <p>🏆 Advanced performance analytics and insights</p>
            <p>📊 Market Timing AI predictions</p>
            <p>🎯 Office challenges and team productivity</p>
            <p>🤖 Competition hub with agent leaderboards</p>
          </div>
          <button 
            onClick={() => window.location.href = '/billing'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to Professional
          </button>
        </div>
      </div>
    </div>
  );

  // Component to show upgrade message for elite features
  const EliteUpgradeMessage = () => (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-8 border border-blue-200">
          <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Elite Feature</h2>
          <p className="text-gray-600 mb-6">
            Advanced automation and team collaboration tools are available with Elite and Enterprise plans.
          </p>
          <div className="space-y-3 text-sm text-gray-700 mb-6">
            <p>🏢 Advanced automation & workflows</p>
            <p>👥 Team collaboration hub with task management</p>
            <p>🎖️ Advanced BI dashboards and reporting</p>
            <p>📈 White-label branding and custom integrations</p>
          </div>
          <button 
            onClick={() => window.location.href = '/billing'}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Upgrade to Elite
          </button>
        </div>
      </div>
    </div>
  );

  // Component to show upgrade message for enterprise features
  const EnterpriseUpgradeMessage = () => (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-8 border border-purple-200">
          <Trophy className="h-16 w-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Feature</h2>
          <p className="text-gray-600 mb-6">
            Multi-office analytics and advanced business intelligence are exclusive to Enterprise plans.
          </p>
          <div className="space-y-3 text-sm text-gray-700 mb-6">
            <p>🏢 Multi-office comparisons and market share tracking</p>
            <p>👥 Full team management with advanced permissions</p>
            <p>🎖️ Custom integrations with in-house systems</p>
            <p>📈 White-label options for offices and franchises</p>
          </div>
          <button 
            onClick={() => window.location.href = '/billing'}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Contact Sales for Enterprise
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <Switch>
      {/* Admin routes - handled separately with their own auth */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/feedback" component={AdminFeedback} />
      
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/settings" component={() => {
            window.location.href = '/api/login';
            return null;
          }} />
          <Route component={() => {
            window.location.href = '/api/login';
            return null;
          }} />
        </>
      ) : (
        <AppLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/properties" component={Properties} />

          <Route path="/cmas" component={Cmas} />
          <Route path="/scripts" component={Scripts} />
          <Route path="/expense-analysis" component={ExpenseAnalysis} />
          <Route path="/reports" component={Reports} />
          <Route path="/performance" component={Performance} />
          <Route path="/calculator" component={Calculator} />
          <Route path="/activities" component={Activities} />
          <Route path="/learning" component={LearningPage} />
          <Route path="/integrations" component={IntegrationsPage} />
          <Route path="/billing" component={Billing} />
          <Route path="/subscribe" component={Subscribe} />
          <Route path="/office-competitions" component={OfficeCompetitions} />
          <Route path="/market-timing" component={MarketTiming} />
          <Route path="/offer-strategies" component={OfferStrategies} />
          <Route path="/competition" component={CompetitionHub} />
          <Route path="/settings" component={Settings} />
          <Route path="/help" component={Help} />
          <Route path="/feedback" component={Feedback} />
        </AppLayout>
      )}
      
      {/* Global Achievement Celebration */}
      <AchievementCelebration
        achievement={currentCelebration}
        isOpen={isCelebrationOpen}
        onClose={closeCelebration}
      />
      
      {/* Global Task Reminder Dialog */}
      <TaskReminderDialog
        task={dueTask}
        isOpen={isReminderOpen}
        onClose={closeReminder}
        onComplete={completeTask}
        onSnooze={snoozeTask}
      />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="elitekpi-theme">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
