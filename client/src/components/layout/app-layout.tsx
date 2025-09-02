import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "./sidebar";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900 ios-safe-area mobile-optimized">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile menu button */}
        {isMobile && (
          <div className="md:hidden fixed top-0 left-0 z-50 bg-white border-b border-gray-200 w-full ios-safe-top">
            <div className="flex items-center justify-between px-4 py-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <i className="fas fa-chart-line text-white text-sm"></i>
                </div>
                <h1 className="ml-3 text-xl font-bold text-gray-900">EliteKPI</h1>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="min-h-[44px] min-w-[44px] touch-manipulation"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        )}

        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 shadow border-b border-gray-200 dark:border-gray-700">
          <div className="flex-1 px-4 flex justify-between items-center">
            <div className="flex-1 flex">
              {!isMobile && (
                <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-gray-100 sm:truncate">
                  Dashboard
                </h2>
              )}
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <ModeToggle />
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700 dark:text-gray-300">Real Estate Pro</span>
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">RP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <main className={`flex-1 relative overflow-y-auto focus:outline-none ios-safe-bottom mobile-optimized ${isMobile ? 'mt-20' : ''}`}>
          {children}
        </main>
      </div>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}
