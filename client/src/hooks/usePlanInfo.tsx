import { useQuery } from "@tanstack/react-query";

// Types for plan info
export interface PlanFeatures {
  contactManagement: boolean;
  expenseTracking: boolean;
  timeLogging: boolean;
  dashboardOverview: boolean;
  emailSupport: boolean;
  basicReports: boolean;
  basicCMA: boolean;
  comprehensivePropertyPipeline: boolean;
  advancedCMA: boolean;
  performanceAnalytics: boolean;
  marketTimingAI: boolean;
  offerStrategies: boolean;
  officeChallenges: boolean;
  competitionHub: boolean;
  customBranding: boolean;
  priorityEmailSupport: boolean;
  apiAccess: boolean;
  additionalUsers: boolean;
}

export interface PlanLimits {
  users: number;
  properties: number;
  reports: 'Basic' | 'Advanced';
  support: 'Email' | 'Priority Email';
  additionalUserCost?: number;
}

export interface PlanInfo {
  planId: string;
  features: PlanFeatures;
  limits: PlanLimits;
  usage: {
    properties: number;
    users: number;
  };
}

// Hook to get user's plan information
export function usePlanInfo() {
  return useQuery<PlanInfo>({
    queryKey: ["/api/plan-info"],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to check if user has a specific feature
export function useHasFeature(feature: keyof PlanFeatures) {
  const { data: planInfo } = usePlanInfo();
  return planInfo?.features[feature] ?? false;
}

// Hook to check if user can add more of a resource
export function useCanAddResource(resourceType: 'properties' | 'users') {
  const { data: planInfo } = usePlanInfo();
  
  if (!planInfo) return false;
  
  const currentUsage = planInfo.usage[resourceType];
  const limit = planInfo.limits[resourceType];
  
  if (typeof limit === 'number') {
    return currentUsage < limit;
  }
  
  return true;
}

// Hook to get resource usage info
export function useResourceUsage(resourceType: 'properties' | 'users') {
  const { data: planInfo } = usePlanInfo();
  
  if (!planInfo) {
    return { current: 0, limit: 0, percentage: 0, canAdd: false };
  }
  
  const current = planInfo.usage[resourceType];
  const limit = planInfo.limits[resourceType];
  
  if (typeof limit !== 'number') {
    return { current, limit: Infinity, percentage: 0, canAdd: true };
  }
  
  const percentage = (current / limit) * 100;
  const canAdd = current < limit;
  
  return { current, limit, percentage, canAdd };
}

// Component to show upgrade prompt
interface UpgradePromptProps {
  feature?: string;
  resourceType?: 'properties' | 'users';
  className?: string;
}

export function UpgradePrompt({ feature, resourceType, className = "" }: UpgradePromptProps) {
  const { data: planInfo } = usePlanInfo();
  
  if (!planInfo || planInfo.planId === 'professional') {
    return null;
  }
  
  let message = "Upgrade to Professional to unlock this feature";
  
  if (resourceType) {
    const { current, limit } = useResourceUsage(resourceType);
    message = `You've reached your ${resourceType} limit (${current}/${limit}). Upgrade to Professional for more.`;
  } else if (feature) {
    message = `${feature} is available with Professional plan. Upgrade to unlock.`;
  }
  
  return (
    <div className={`bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-purple-900">Upgrade Required</h3>
          <p className="text-sm text-purple-700">{message}</p>
        </div>
        <a
          href="/billing"
          className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors"
        >
          Upgrade Now
        </a>
      </div>
    </div>
  );
}

// Component to conditionally render based on features
interface FeatureGateProps {
  feature: keyof PlanFeatures;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({ feature, children, fallback, showUpgrade = true }: FeatureGateProps) {
  const hasFeature = useHasFeature(feature);
  
  if (hasFeature) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgrade) {
    return <UpgradePrompt feature={feature} />;
  }
  
  return null;
}

// Component to conditionally render based on resource limits
interface ResourceGateProps {
  resourceType: 'properties' | 'users';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function ResourceGate({ resourceType, children, fallback, showUpgrade = true }: ResourceGateProps) {
  const canAdd = useCanAddResource(resourceType);
  
  if (canAdd) {
    return <>{children}</>;
  }
  
  if (fallback) {
    return <>{fallback}</>;
  }
  
  if (showUpgrade) {
    return <UpgradePrompt resourceType={resourceType} />;
  }
  
  return null;
}
