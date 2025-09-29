import express from 'express';

const router = express.Router();

// In-memory storage for development (replace with database in production)
let dailyActivities: any[] = [
  {
    id: '1',
    date: '2025-09-01',
    callsMade: 25,
    hoursWorked: 8,
    appointmentsSet: 3,
    buyerAppointments: 1,
    sellerAppointments: 2,
    cmas: 1,
    showings: 4,
    appraisals: 0,
    homeInspections: 1,
    septicInspections: 0,
    walkthroughs: 0,
    closings: 1,
    notes: 'Great day with successful listing appointment'
  },
  {
    id: '2',
    date: '2025-09-02',
    callsMade: 18,
    hoursWorked: 7,
    appointmentsSet: 2,
    buyerAppointments: 2,
    sellerAppointments: 0,
    cmas: 2,
    showings: 3,
    appraisals: 1,
    homeInspections: 0,
    septicInspections: 1,
    walkthroughs: 1,
    closings: 0,
    notes: 'Focused on buyer clients today'
  },
];

let activityGoals: any[] = [
  { id: '1', activityType: 'calls', goalValue: 20, frequency: 'daily', startDate: '2025-09-01', isActive: true },
  { id: '2', activityType: 'hours', goalValue: 8, frequency: 'daily', startDate: '2025-09-01', isActive: true },
  { id: '3', activityType: 'showings', goalValue: 15, frequency: 'weekly', startDate: '2025-09-01', isActive: true },
  { id: '4', activityType: 'appointments', goalValue: 10, frequency: 'weekly', startDate: '2025-09-01', isActive: true },
];

// Get all daily activities
router.get('/daily-activities', (req, res) => {
  try {
    res.json(dailyActivities);
  } catch (error) {
    console.error('Error fetching daily activities:', error);
    res.status(500).json({ error: 'Failed to fetch daily activities' });
  }
});

// Save or update daily activity
router.post('/daily-activities', (req, res) => {
  try {
    const activityData = req.body;
    
    // Generate ID if not provided
    if (!activityData.id) {
      activityData.id = Date.now().toString();
    }
    
    // Check if activity for this date already exists
    const existingIndex = dailyActivities.findIndex(
      activity => activity.date === activityData.date
    );
    
    if (existingIndex !== -1) {
      // Update existing activity
      dailyActivities[existingIndex] = { ...dailyActivities[existingIndex], ...activityData };
      res.json(dailyActivities[existingIndex]);
    } else {
      // Add new activity
      dailyActivities.push(activityData);
      res.json(activityData);
    }
  } catch (error) {
    console.error('Error saving daily activity:', error);
    res.status(500).json({ error: 'Failed to save daily activity' });
  }
});

// Get all activity goals
router.get('/activity-goals', (req, res) => {
  try {
    res.json(activityGoals);
  } catch (error) {
    console.error('Error fetching activity goals:', error);
    res.status(500).json({ error: 'Failed to fetch activity goals' });
  }
});

// Create new activity goal
router.post('/activity-goals', (req, res) => {
  try {
    const goalData = req.body;
    
    // Generate ID if not provided
    if (!goalData.id) {
      goalData.id = Date.now().toString();
    }
    
    // Add creation date if not provided
    if (!goalData.createdAt) {
      goalData.createdAt = new Date().toISOString();
    }
    
    activityGoals.push(goalData);
    res.json(goalData);
  } catch (error) {
    console.error('Error creating activity goal:', error);
    res.status(500).json({ error: 'Failed to create activity goal' });
  }
});

// Update activity goal
router.put('/activity-goals/:id', (req, res) => {
  try {
    const goalId = req.params.id;
    const updateData = req.body;
    
    const goalIndex = activityGoals.findIndex(goal => goal.id === goalId);
    if (goalIndex === -1) {
      return res.status(404).json({ error: 'Activity goal not found' });
    }
    
    activityGoals[goalIndex] = { ...activityGoals[goalIndex], ...updateData };
    res.json(activityGoals[goalIndex]);
  } catch (error) {
    console.error('Error updating activity goal:', error);
    res.status(500).json({ error: 'Failed to update activity goal' });
  }
});

// Delete activity goal
router.delete('/activity-goals/:id', (req, res) => {
  try {
    const goalId = req.params.id;
    const goalIndex = activityGoals.findIndex(goal => goal.id === goalId);
    
    if (goalIndex === -1) {
      return res.status(404).json({ error: 'Activity goal not found' });
    }
    
    activityGoals.splice(goalIndex, 1);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting activity goal:', error);
    res.status(500).json({ error: 'Failed to delete activity goal' });
  }
});

export default router;
