// Feature configuration for subscription plans
export interface PlanLimits {
  users: number;
  properties: number;
  reports: 'Basic' | 'Advanced';
  support: 'Email' | 'Priority Email';
  additionalUserCost?: number;
}

export interface PlanFeatures {
  // Core features
  contactManagement: boolean;
  expenseTracking: boolean;
  timeLogging: boolean;
  dashboardOverview: boolean;
  emailSupport: boolean;
  
  // Basic features
  basicReports: boolean;
  basicCMA: boolean;
  
  // Professional features
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

export const PLAN_CONFIGS: Record<string, { limits: PlanLimits; features: PlanFeatures }> = {
  starter: {
    limits: {
      users: 1,
      properties: 25,
      reports: 'Basic',
      support: 'Email'
    },
    features: {
      // Core features (available to all)
      contactManagement: true,
      expenseTracking: true,
      timeLogging: true,
      dashboardOverview: true,
      emailSupport: true,
      
      // Basic features
      basicReports: true,
      basicCMA: true,
      
      // Professional features (not available)
      comprehensivePropertyPipeline: false,
      advancedCMA: false,
      performanceAnalytics: false,
      marketTimingAI: false,
      offerStrategies: false,
      officeChallenges: false,
      competitionHub: false,
      customBranding: false,
      priorityEmailSupport: false,
      apiAccess: false,
      additionalUsers: false
    }
  },
  professional: {
    limits: {
      users: 3,
      properties: 100,
      additionalUserCost: 15,
      reports: 'Advanced',
      support: 'Priority Email'
    },
    features: {
      // Core features
      contactManagement: true,
      expenseTracking: true,
      timeLogging: true,
      dashboardOverview: true,
      emailSupport: true,
      
      // Basic features
      basicReports: true,
      basicCMA: true,
      
      // Professional features (all available)
      comprehensivePropertyPipeline: true,
      advancedCMA: true,
      performanceAnalytics: true,
      marketTimingAI: true,
      offerStrategies: true,
      officeChallenges: true,
      competitionHub: true,
      customBranding: true,
      priorityEmailSupport: true,
      apiAccess: true,
      additionalUsers: true
    }
  },
  enterprise: {
    limits: {
      users: 999999,
      properties: 999999,
      reports: 'Advanced',
      support: 'Priority Email'
    },
    features: {
      // All features enabled for enterprise/admin
      contactManagement: true,
      expenseTracking: true,
      timeLogging: true,
      dashboardOverview: true,
      emailSupport: true,
      basicReports: true,
      basicCMA: true,
      comprehensivePropertyPipeline: true,
      advancedCMA: true,
      performanceAnalytics: true,
      marketTimingAI: true,
      offerStrategies: true,
      officeChallenges: true,
      competitionHub: true,
      customBranding: true,
      priorityEmailSupport: true,
      apiAccess: true,
      additionalUsers: true
    }
  }
};

// Default plan for users without subscription
export const DEFAULT_PLAN = 'starter';

// Helper function to get plan features
export function getPlanFeatures(planId: string): PlanFeatures {
  return PLAN_CONFIGS[planId]?.features || PLAN_CONFIGS[DEFAULT_PLAN].features;
}

// Helper function to get plan limits
export function getPlanLimits(planId: string): PlanLimits {
  return PLAN_CONFIGS[planId]?.limits || PLAN_CONFIGS[DEFAULT_PLAN].limits;
}

// Feature checking functions
export function hasFeature(planId: string, feature: keyof PlanFeatures): boolean {
  const features = getPlanFeatures(planId);
  return features[feature];
}

export function canExceedLimit(planId: string, limitType: keyof PlanLimits, currentValue: number): boolean {
  const limits = getPlanLimits(planId);
  const limit = limits[limitType];
  
  if (typeof limit === 'number') {
    return currentValue < limit;
  }
  
  return true; // For non-numeric limits
}
