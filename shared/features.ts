// Feature configuration for subscription plans
export interface PlanLimits {
  users: number;
  properties: number;
  reports: 'Basic' | 'Advanced';
  support: 'Email' | 'Priority Email' | 'Priority Support' | 'Dedicated Support';
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
      customBranding: false, // Not available in professional
      priorityEmailSupport: true,
      apiAccess: false, // Not available in professional
      additionalUsers: true
    }
  },
  elite: {
    limits: {
      users: 10,
      properties: 500,
      additionalUserCost: 25,
      reports: 'Advanced',
      support: 'Priority Support'
    },
    features: {
      // All professional features plus elite features
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
  },
  enterprise: {
    limits: {
      users: 999999,
      properties: 999999,
      reports: 'Advanced',
      support: 'Dedicated Support'
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

// Default plan for users without subscription (admin-controls branch: always enterprise)
export const DEFAULT_PLAN = 'enterprise';

// Helper function to get plan features (admin-controls branch: always enterprise)
export function getPlanFeatures(planId: string): PlanFeatures {
  return PLAN_CONFIGS['enterprise']?.features || PLAN_CONFIGS['enterprise'].features;
}

// Helper function to get plan limits (admin-controls branch: always enterprise)
export function getPlanLimits(planId: string): PlanLimits {
  return PLAN_CONFIGS['enterprise']?.limits || PLAN_CONFIGS['enterprise'].limits;
}

// Feature checking functions (admin-controls branch: always return true)
export function hasFeature(planId: string, feature: keyof PlanFeatures): boolean {
  return true; // Always enabled in admin-controls branch
}

export function canExceedLimit(planId: string, limitType: keyof PlanLimits, currentValue: number): boolean {
  return true; // Always allow in admin-controls branch
}
