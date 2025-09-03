import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  Home, 
  FileText, 
  TrendingUp, 
  Target, 
  PieChart,
  Calculator,
  Settings,
  HelpCircle,
  Shield,
  Activity,
  CreditCard,
  Trophy,
  Users,
  X,
  Brain,
  MessageSquare,
  Lightbulb,
  GraduationCap,
  Plug,
  TrendingDown
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const baseNavigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Properties', href: '/properties', icon: Home },
  { name: 'Log Activities & Goals', href: '/activities', icon: Activity },
  { name: 'CMAs', href: '/cmas', icon: FileText },
  { name: 'Expense Analysis', href: '/expense-analysis', icon: TrendingDown },
  { name: 'Reports', href: '/reports', icon: TrendingUp },
  { name: 'Performance', href: '/performance', icon: PieChart },
];

const professionalNavigation = [
  { name: 'Market Timing AI', href: '/market-timing', icon: Brain, requiresPlan: 'professional' },
  { name: 'Offer Strategies', href: '/offer-strategies', icon: Target, requiresPlan: 'professional' },
  { name: 'Office Challenges', href: '/office-competitions', icon: Users, requiresPlan: 'professional' },
  { name: 'Competition Hub', href: '/competition', icon: Trophy, requiresPlan: 'professional' },
];

const eliteNavigation = [
  // Elite navigation items would go here
];

const enterpriseNavigation: any[] = [
  // Enterprise-only features like multi-office analytics would go here
];

const bottomNavigation = [
  { name: 'Integrations', href: '/integrations', icon: Plug },
  { name: 'GCI Calculator', href: '/calculator', icon: Calculator },
  { name: 'Billing', href: '/billing', icon: CreditCard },
  { name: 'Feedback', href: '/feedback', icon: MessageSquare },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
];

const adminNavigation: any[] = [
  // Admin navigation removed from sidebar - access via admin login
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const isMobile = useIsMobile();
  const { user, logout } = useAuth();

  // Mock subscription plan - in real app this would come from API
  const currentSubscription = {
    plan: "elite" // starter, professional, elite, enterprise
  };

  // Show all navigation for admin/developer access
  const navigation = [
    ...baseNavigation,
    ...professionalNavigation,
    ...eliteNavigation,
    ...enterpriseNavigation
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center flex-shrink-0 px-4 py-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="ml-3">
            <h1 className="text-xl font-bold text-modern-gradient">EliteKPI</h1>
          </div>
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="ml-auto"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-5 flex-grow flex flex-col">
        <nav className="flex-1 px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    "group flex items-center px-4 py-4 text-base font-medium nav-modern min-w-0 touch-manipulation cursor-pointer",
                    isActive
                      ? "active text-white"
                      : "text-black hover:text-black"
                  )}
                  onClick={() => isMobile && onClose()}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-6 w-6 flex-shrink-0",
                      isActive ? "text-white" : "text-black"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                  {(item as any).requiresPremium && (
                    <span className="ml-auto text-xs bg-gradient-to-r from-blue-400 to-blue-600 text-white px-2 py-1 rounded-lg font-semibold">
                      PRO
                    </span>
                  )}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Navigation */}
        {(user as any)?.isAdmin && (
          <div className="flex-shrink-0 px-2 mb-2">
            <div className="border-t border-gray-200 pt-2">
              {adminNavigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <span
                      className={cn(
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                        isActive
                          ? "bg-red-600 text-white"
                          : "text-red-600 hover:bg-red-50 hover:text-red-700"
                      )}
                      onClick={() => isMobile && onClose()}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5",
                          isActive ? "text-white" : "text-red-500"
                        )}
                      />
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Navigation - iPhone optimized */}
        <div className="flex-shrink-0 px-2 space-y-1 border-t border-gray-200 pt-2 mt-2">
          {bottomNavigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <span
                  className={cn(
                    "group flex items-center px-4 py-4 text-base font-medium nav-modern min-w-0 touch-manipulation cursor-pointer",
                    isActive
                      ? "active text-white"
                      : "text-black hover:text-black"
                  )}
                  onClick={() => isMobile && onClose()}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-6 w-6",
                      isActive ? "text-white" : "text-black"
                    )}
                  />
                  {item.name}
                </span>
              </Link>
            );
          })}
          
          {/* Logout */}
          <button
            onClick={logout}
            className="w-full group flex items-center px-4 py-4 text-base font-medium nav-modern text-black hover:text-black touch-manipulation"
          >
            <span className="mr-3 h-6 w-6 text-black">→</span>
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div 
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
            onClick={onClose}
          />
        )}
        
        {/* Mobile sidebar */}
        <div className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 md:w-64 sidebar-mobile modern-sidebar transform transition-transform duration-300 ease-in-out ios-safe-area overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop sidebar
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto modern-sidebar">
          {sidebarContent}
        </div>
      </div>
    </div>
  );
}
