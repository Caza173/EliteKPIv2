import { Request, Response, NextFunction } from 'express';
import { PLAN_CONFIGS, hasFeature, canExceedLimit, DEFAULT_PLAN } from '../../shared/features';

// Extend the Request type to include user and plan info
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    subscriptionStatus?: string;
    stripeSubscriptionId?: string;
    planId?: string;
  };
}

// Middleware to check if user has access to a specific feature
export function requireFeature(feature: keyof typeof PLAN_CONFIGS.starter.features) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Get user's current plan
      const userPlan = await getUserPlan(req.user.id);
      
      // Check if user has the required feature
      if (!hasFeature(userPlan, feature)) {
        return res.status(403).json({ 
          message: 'This feature is not available with your current subscription plan',
          feature: feature,
          currentPlan: userPlan,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Error checking feature access:', error);
      res.status(500).json({ message: 'Error checking feature access' });
    }
  };
}

// Middleware to check resource limits (properties, users, etc.)
export function checkResourceLimit(resourceType: 'properties' | 'users', additionalCount: number = 1) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userPlan = await getUserPlan(req.user.id);
      const limits = PLAN_CONFIGS[userPlan]?.limits || PLAN_CONFIGS[DEFAULT_PLAN].limits;
      
      // Get current count based on resource type
      let currentCount = 0;
      if (resourceType === 'properties') {
        currentCount = await getCurrentPropertyCount(req.user.id);
      } else if (resourceType === 'users') {
        currentCount = await getCurrentUserCount(req.user.id);
      }

      const limit = limits[resourceType];
      if (typeof limit === 'number' && (currentCount + additionalCount) > limit) {
        return res.status(403).json({
          message: `You have reached the ${resourceType} limit for your current plan`,
          currentCount,
          limit,
          resourceType,
          upgradeRequired: true
        });
      }

      next();
    } catch (error) {
      console.error('Error checking resource limit:', error);
      res.status(500).json({ message: 'Error checking resource limit' });
    }
  };
}

// Helper function to get user's current plan
async function getUserPlan(userId: string): Promise<string> {
  try {
    // Import storage here to avoid circular dependencies
    const { storage } = await import('../storage');
    const user = await storage.getUser(userId);
    
    if (!user || !user.stripeSubscriptionId || user.subscriptionStatus !== 'active') {
      return DEFAULT_PLAN;
    }

    // In a real implementation, you might want to check the Stripe subscription
    // to get the actual plan ID. For now, we'll determine based on subscription existence
    return user.planId || 'professional'; // Default to professional if they have active subscription
  } catch (error) {
    console.error('Error getting user plan:', error);
    return DEFAULT_PLAN;
  }
}

// Helper function to get current property count
async function getCurrentPropertyCount(userId: string): Promise<number> {
  try {
    const { storage } = await import('../storage');
    const properties = await storage.getProperties(userId);
    return properties.length;
  } catch (error) {
    console.error('Error getting property count:', error);
    return 0;
  }
}

// Helper function to get current user count (for team subscriptions)
async function getCurrentUserCount(userId: string): Promise<number> {
  try {
    // For now, return 1 (single user). In a team setup, you'd query your user/team table
    return 1;
  } catch (error) {
    console.error('Error getting user count:', error);
    return 1;
  }
}

// Utility function to get user's plan info for client-side
export async function getUserPlanInfo(userId: string) {
  try {
    const planId = await getUserPlan(userId);
    return {
      planId,
      features: PLAN_CONFIGS[planId]?.features || PLAN_CONFIGS[DEFAULT_PLAN].features,
      limits: PLAN_CONFIGS[planId]?.limits || PLAN_CONFIGS[DEFAULT_PLAN].limits,
    };
  } catch (error) {
    console.error('Error getting user plan info:', error);
    return {
      planId: DEFAULT_PLAN,
      features: PLAN_CONFIGS[DEFAULT_PLAN].features,
      limits: PLAN_CONFIGS[DEFAULT_PLAN].limits,
    };
  }
}
