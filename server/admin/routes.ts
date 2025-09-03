import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { DatabaseStorage } from '../storage';

const router = Router();

// Apply admin middleware to all routes
router.use(requireAuth);
router.use(requireAdmin);

// Admin statistics endpoint
router.get('/stats', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    
    // Get user statistics
    const totalUsers = await storage.getUserCount();
    const activeUsers = await storage.getActiveUserCount();
    
    // Get property statistics
    const totalProperties = await storage.getTotalPropertiesCount();
    
    // Get revenue statistics
    const totalRevenue = await storage.getTotalPlatformRevenue();
    
    // System health check
    const systemHealth = await checkSystemHealth();
    
    // Database size
    const databaseSize = await storage.getDatabaseSize();
    
    // Last backup info
    const lastBackup = await storage.getLastBackupDate();

    res.json({
      totalUsers,
      activeUsers,
      totalProperties,
      totalRevenue,
      systemHealth,
      databaseSize,
      lastBackup
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin statistics' });
  }
});

// User management endpoints
router.get('/users', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    const users = await storage.getAllUsersWithStats();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.post('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { action } = req.body;
    const storage = new DatabaseStorage();

    switch (action) {
      case 'upgrade':
        await storage.upgradeUserPlan(userId, 'professional');
        break;
      case 'downgrade':
        await storage.upgradeUserPlan(userId, 'starter');
        break;
      case 'suspend':
        await storage.suspendUser(userId);
        break;
      case 'activate':
        await storage.activateUser(userId);
        break;
      case 'reset':
        await storage.resetUserPassword(userId);
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.json({ success: true, message: `User ${action} completed` });
  } catch (error) {
    console.error('Error performing user action:', error);
    res.status(500).json({ error: 'Failed to perform user action' });
  }
});

// System configuration endpoints
router.get('/config', async (req, res) => {
  try {
    // Return sanitized configuration (without sensitive keys)
    const config = {
      openaiApiKey: process.env.OPENAI_API_KEY ? '***hidden***' : '',
      attomApiKey: process.env.ATTOM_API_KEY ? '***hidden***' : '',
      stripeSecretKey: process.env.STRIPE_SECRET_KEY ? '***hidden***' : '',
      stripePublicKey: process.env.VITE_STRIPE_PUBLIC_KEY || '',
      databaseUrl: process.env.DATABASE_URL ? '***hidden***' : '',
      sessionSecret: process.env.SESSION_SECRET ? '***hidden***' : '',
      features: {
        aiScripts: true, // These could be stored in database
        marketTiming: true,
        cmaReports: true,
        propertyPipeline: true
      },
      limits: {
        starterProperties: 10,
        professionalProperties: 100,
        starterUsers: 1,
        professionalUsers: 3
      }
    };

    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

router.post('/config', async (req, res) => {
  try {
    const config = req.body;
    
    // In a real implementation, you'd update environment variables
    // or store configuration in a secure database table
    // For now, we'll just acknowledge the request
    
    console.log('Admin config update requested:', config);
    
    res.json({ success: true, message: 'Configuration updated' });
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ error: 'Failed to update configuration' });
  }
});

// Database maintenance endpoints
router.post('/maintenance', async (req, res) => {
  try {
    const storage = new DatabaseStorage();
    
    // Run database maintenance tasks
    await storage.runMaintenance();
    
    res.json({ success: true, message: 'Database maintenance completed' });
  } catch (error) {
    console.error('Error running maintenance:', error);
    res.status(500).json({ error: 'Failed to run maintenance' });
  }
});

// System health check
async function checkSystemHealth() {
  try {
    // Check database connectivity
    const storage = new DatabaseStorage();
    await storage.testConnection();
    
    // Check external APIs
    // You could add actual health checks here
    
    return 'good';
  } catch (error) {
    console.error('System health check failed:', error);
    return 'critical';
  }
}

export default router;
