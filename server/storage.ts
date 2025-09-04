import {
  users,
  properties,
  commissions,
  expenses,
  timeEntries,
  activities,
  activityActuals,
  efficiencyScores,
  cmas,
  showings,
  mileageLogs,
  goals,
  referrals,
  smartTasks,
  propertyDeadlines,
  officeCompetitions,
  competitionParticipants,
  gpsLocations,
  notifications,
  marketIntelligence,
  featureRequests,
  personalizedInsights,
  mlsSettings,
  learningPaths,
  courses,
  lessons,
  userLearningProgress,
  userCourseProgress,
  userLessonProgress,
  learningAchievements,
  userLearningAchievements,
  learningStreaks,
  feedback,
  feedbackUpdates,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Commission,
  type InsertCommission,
  type Expense,
  type InsertExpense,
  type TimeEntry,
  type InsertTimeEntry,
  type Activity,
  type InsertActivity,
  type ActivityActual,
  type InsertActivityActual,
  type EfficiencyScore,
  type InsertEfficiencyScore,
  type Cma,
  type InsertCma,
  type Showing,
  type InsertShowing,
  type MileageLog,
  type InsertMileageLog,
  type Goal,
  type InsertGoal,
  type Referral,
  type InsertReferral,
  type PersonalizedInsight,
  type InsertPersonalizedInsight,
  type MLSSetting,
  type InsertMLSSetting,
  type SmartTask,
  type InsertSmartTask,
  type PropertyDeadline,
  type InsertPropertyDeadline,
  type OfficeCompetition,
  type InsertOfficeCompetition,
  type CompetitionParticipant,
  type InsertCompetitionParticipant,
  type GpsLocation,
  type InsertGpsLocation,
  type Notification,
  type InsertNotification,
  type MarketIntelligence,
  type InsertMarketIntelligence,
  type FeatureRequest,
  type InsertFeatureRequest,
  type LearningPath,
  type InsertLearningPath,
  type Course,
  type InsertCourse,
  type Lesson,
  type InsertLesson,
  type UserLearningProgress,
  type InsertUserLearningProgress,
  type UserCourseProgress,
  type InsertUserCourseProgress,
  type UserLessonProgress,
  type InsertUserLessonProgress,
  type LearningAchievement,
  type InsertLearningAchievement,
  type UserLearningAchievement,
  type InsertUserLearningAchievement,
  type LearningStreak,
  type InsertLearningStreak,
  type Feedback,
  type InsertFeedback,
  type FeedbackUpdate,
  type InsertFeedbackUpdate,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte, sql, count, sum, isNotNull } from "drizzle-orm";

export interface IStorage {
  // User operations - required for authentication
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
  clearUserData(userId: string): Promise<void>;
  
  // Admin user operations
  getAllUsers(): Promise<User[]>;
  updateUserStatus(userId: string, isActive: boolean): Promise<User>;
  updateUserSubscription(userId: string, status: string, subscriptionId?: string): Promise<User>;
  deleteUser(userId: string): Promise<void>;

  // Property operations
  getProperties(userId: string): Promise<Property[]>;
  getProperty(id: string, userId: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty & { userId: string }): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>, userId: string): Promise<Property>;
  deleteProperty(id: string, userId: string): Promise<void>;

  // Commission operations
  getCommissions(userId: string): Promise<Commission[]>;
  getCommissionsByProperty(propertyId: string, userId: string): Promise<Commission[]>;
  createCommission(commission: InsertCommission & { userId: string }): Promise<Commission>;
  updateCommission(id: string, commission: Partial<InsertCommission>, userId: string): Promise<Commission>;
  deleteCommission(id: string, userId: string): Promise<void>;

  // Expense operations
  getExpenses(userId: string, startDate?: string, endDate?: string): Promise<Expense[]>;
  getExpensesByProperty(propertyId: string, userId: string, startDate?: string, endDate?: string): Promise<Expense[]>;
  getExpensesGroupedByProperty(userId: string, startDate?: string, endDate?: string): Promise<{ propertyId: string; propertyAddress: string; total: number; count: number; percentage: number; roi?: number }[]>;
  getExpenseBreakdown(userId: string, startDate?: string, endDate?: string): Promise<{ category: string; total: number; count: number; percentage: number }[]>;
  createExpense(expense: InsertExpense & { userId: string }): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>, userId: string): Promise<Expense>;
  deleteExpense(id: string, userId: string): Promise<void>;

  // Time entry operations
  getTimeEntries(userId: string): Promise<TimeEntry[]>;
  getTimeEntriesByProperty(propertyId: string, userId: string): Promise<TimeEntry[]>;
  createTimeEntry(timeEntry: InsertTimeEntry & { userId: string }): Promise<TimeEntry>;
  updateTimeEntry(id: string, timeEntry: Partial<InsertTimeEntry>, userId: string): Promise<TimeEntry>;
  deleteTimeEntry(id: string, userId: string): Promise<void>;

  // Activity operations
  getActivities(userId: string): Promise<Activity[]>;
  createActivity(activity: InsertActivity & { userId: string }): Promise<Activity>;

  // Activity Actuals operations
  getActivityActuals(userId: string, startDate?: string, endDate?: string): Promise<ActivityActual[]>;
  createActivityActual(activityActual: InsertActivityActual & { userId: string }): Promise<ActivityActual>;
  updateActivityActual(id: string, activityActual: Partial<InsertActivityActual>, userId: string): Promise<ActivityActual>;

  // Efficiency Score operations
  getEfficiencyScores(userId: string, startDate?: string, endDate?: string): Promise<EfficiencyScore[]>;
  createEfficiencyScore(efficiencyScore: InsertEfficiencyScore & { userId: string }): Promise<EfficiencyScore>;
  getEfficiencyScoresByPeriod(userId: string, period: 'day' | 'week' | 'month', count: number): Promise<{ date: string; averageScore: number; scoreCount: number }[]>;

  // CMA operations
  getCmas(userId: string): Promise<Cma[]>;
  createCma(cma: InsertCma & { userId: string }): Promise<Cma>;
  updateCma(id: string, cma: Partial<InsertCma>, userId: string): Promise<Cma>;
  deleteCma(id: string, userId: string): Promise<void>;

  // Showing operations
  getShowings(userId: string): Promise<Showing[]>;
  createShowing(showing: InsertShowing & { userId: string }): Promise<Showing>;
  updateShowing(id: string, showing: Partial<InsertShowing>, userId: string): Promise<Showing>;
  deleteShowing(id: string, userId: string): Promise<void>;

  // Mileage operations
  getMileageLogs(userId: string): Promise<MileageLog[]>;
  createMileageLog(mileageLog: InsertMileageLog & { userId: string }): Promise<MileageLog>;

  // Goal operations
  getGoals(userId: string): Promise<Goal[]>;
  createGoal(goal: InsertGoal & { userId: string }): Promise<Goal>;
  updateGoal(id: string, goal: Partial<InsertGoal>, userId: string): Promise<Goal>;
  deleteGoal(id: string, userId: string): Promise<void>;
  getDailyGoal(userId: string, date: string): Promise<Goal | undefined>;
  getDailyActivityActuals(userId: string, date: string): Promise<ActivityActual | undefined>;

  // Dashboard metrics
  getDashboardMetrics(userId: string): Promise<any>;

  // Referral operations
  getReferrals(userId: string): Promise<Referral[]>;
  createReferral(referral: InsertReferral & { referrerId: string }): Promise<Referral>;
  updateReferralStatus(id: string, status: string, userId: string): Promise<Referral>;
  getReferralStats(userId: string): Promise<{ total: number; successful: number; pending: number; rewardsEarned: number }>;

  // Smart Task operations
  getSmartTasks(userId: string, status?: string, priority?: string): Promise<SmartTask[]>;
  createSmartTask(userId: string, task: InsertSmartTask): Promise<SmartTask>;
  updateSmartTask(userId: string, taskId: string, updates: Partial<InsertSmartTask>): Promise<SmartTask>;
  deleteSmartTask(userId: string, taskId: string): Promise<void>;
  getDueTasks(): Promise<SmartTask[]>;
  getTasksDueInMinutes(minutes: number): Promise<SmartTask[]>;
  markTaskReminderSent(taskId: string): Promise<void>;
  markTaskReminder30minSent(taskId: string): Promise<void>;
  markTaskReminder10minSent(taskId: string): Promise<void>;
  markTaskReminder5minSent(taskId: string): Promise<void>;

  // Property Deadline operations
  getPropertyDeadlines(userId: string, propertyId?: string): Promise<PropertyDeadline[]>;
  createPropertyDeadline(userId: string, deadline: InsertPropertyDeadline): Promise<PropertyDeadline>;
  updatePropertyDeadline(userId: string, deadlineId: string, updates: Partial<InsertPropertyDeadline>): Promise<PropertyDeadline>;

  // Office Competition operations
  getOfficeCompetitions(officeId: string): Promise<OfficeCompetition[]>;
  createOfficeCompetition(userId: string, competition: InsertOfficeCompetition): Promise<OfficeCompetition>;
  joinCompetition(competitionId: string, userId: string): Promise<CompetitionParticipant>;
  getCompetitionLeaderboard(competitionId: string): Promise<CompetitionParticipant[]>;

  // GPS Location operations
  getGpsLocations(userId: string, startDate?: string, endDate?: string): Promise<GpsLocation[]>;
  createGpsLocation(userId: string, location: InsertGpsLocation): Promise<GpsLocation>;
  getGpsInsights(userId: string, period: string): Promise<any>;

  // Notification operations
  getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]>;
  createNotification(userId: string, notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(userId: string, notificationId: string): Promise<Notification>;

  // Market Intelligence operations
  getMarketIntelligence(city?: string, state?: string, propertyType?: string): Promise<MarketIntelligence[]>;
  getMarketTimingIntelligence(city: string, state: string): Promise<any>;

  // Feature Request operations
  createFeatureRequest(featureRequest: InsertFeatureRequest): Promise<FeatureRequest>;
  getFeatureRequests(): Promise<FeatureRequest[]>;
  updateFeatureRequestStatus(id: string, status: string): Promise<FeatureRequest>;

  // Automation operations
  processAutomationTrigger(userId: string, event: string, entityId: string, entityType: string): Promise<any>;
  
  // Personalized Insights operations
  getPersonalizedInsights(userId: string, includeArchived?: boolean): Promise<PersonalizedInsight[]>;
  createPersonalizedInsights(insights: InsertPersonalizedInsight[]): Promise<PersonalizedInsight[]>;
  markInsightAsViewed(userId: string, insightId: string): Promise<PersonalizedInsight>;
  archiveInsight(userId: string, insightId: string): Promise<PersonalizedInsight>;
  getPersonalizedInsightsCount(userId: string): Promise<{ active: number; unviewed: number; highPriority: number; archived: number; }>;

  // MLS Settings operations
  getMLSSettings(userId: string): Promise<MLSSetting | undefined>;
  upsertMLSSettings(userId: string, settings: Omit<InsertMLSSetting, 'userId'>): Promise<MLSSetting>;
  deleteMLSSettings(userId: string): Promise<void>;

  // Learning System operations
  getLearningPaths(): Promise<LearningPath[]>;
  getLearningPath(id: string): Promise<LearningPath | undefined>;
  getCoursesByPath(learningPathId: string): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getLessonsByCourse(courseId: string): Promise<Lesson[]>;
  getLesson(id: string): Promise<Lesson | undefined>;
  
  // User Progress operations
  getUserLearningProgress(userId: string): Promise<UserLearningProgress[]>;
  getUserLearningPathProgress(userId: string, learningPathId: string): Promise<UserLearningProgress | undefined>;
  getUserCourseProgress(userId: string, courseId: string): Promise<UserCourseProgress | undefined>;
  getUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | undefined>;
  
  startLearningPath(userId: string, learningPathId: string): Promise<UserLearningProgress>;
  startCourse(userId: string, courseId: string): Promise<UserCourseProgress>;
  startLesson(userId: string, lessonId: string): Promise<UserLessonProgress>;
  
  completeLesson(userId: string, lessonId: string, timeSpent: number, quizScore?: number, maxScore?: number): Promise<UserLessonProgress>;
  updateLessonProgress(userId: string, lessonId: string, timeSpent: number, notes?: string): Promise<UserLessonProgress>;
  
  getLearningStreak(userId: string): Promise<LearningStreak | undefined>;
  updateLearningStreak(userId: string): Promise<LearningStreak>;
  
  // Learning Achievements
  getLearningAchievements(): Promise<LearningAchievement[]>;
  getUserLearningAchievements(userId: string): Promise<UserLearningAchievement[]>;
  checkLearningAchievements(userId: string): Promise<UserLearningAchievement[]>;

  // Feedback operations
  getAllFeedback(): Promise<Feedback[]>;
  getUserFeedback(userId: string): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: string, updates: Partial<InsertFeedback>): Promise<Feedback>;
  getFeedbackUpdates(feedbackId: string): Promise<FeedbackUpdate[]>;
  createFeedbackUpdate(update: InsertFeedbackUpdate): Promise<FeedbackUpdate>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchResults = await db
      .select()
      .from(users)
      .where(
        sql`LOWER(${users.name}) LIKE ${`%${query}%`} OR 
            LOWER(${users.email}) LIKE ${`%${query}%`} OR 
            LOWER(${users.username}) LIKE ${`%${query}%`}`
      )
      .limit(10);
    return searchResults;
  }

  // Admin user operations
  async getAllUsers(): Promise<User[]> {
    return await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));
  }

  async updateUserStatus(userId: string, isActive: boolean): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUserSubscription(userId: string, status: string, subscriptionId?: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        subscriptionStatus: status, 
        subscriptionId,
        updatedAt: new Date() 
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    await db
      .delete(users)
      .where(eq(users.id, userId));
  }

  async clearUserData(userId: string): Promise<void> {
    // Clear all user-related data while keeping the user account
    await db.delete(properties).where(eq(properties.userId, userId));
    await db.delete(commissions).where(eq(commissions.userId, userId));
    await db.delete(expenses).where(eq(expenses.userId, userId));
    await db.delete(timeEntries).where(eq(timeEntries.userId, userId));
    await db.delete(activities).where(eq(activities.userId, userId));
    await db.delete(activityActuals).where(eq(activityActuals.userId, userId));
    await db.delete(cmas).where(eq(cmas.userId, userId));
    await db.delete(showings).where(eq(showings.userId, userId));
    await db.delete(mileageLogs).where(eq(mileageLogs.userId, userId));
    await db.delete(goals).where(eq(goals.userId, userId));
  }

  // Property operations
  async getProperties(userId: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(eq(properties.userId, userId))
      .orderBy(desc(properties.createdAt));
  }

  async getProperty(id: string, userId: string): Promise<Property | undefined> {
    const [property] = await db
      .select()
      .from(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, userId)));
    return property;
  }

  async createProperty(property: InsertProperty & { userId: string }): Promise<Property> {
    // Convert numeric fields to strings for database storage
    const propertyData = {
      ...property,
      bathrooms: property.bathrooms ? property.bathrooms.toString() : null,
      listingPrice: property.listingPrice ? property.listingPrice.toString() : null,
      offerPrice: property.offerPrice ? property.offerPrice.toString() : null,
      acceptedPrice: property.acceptedPrice ? property.acceptedPrice.toString() : null,
      soldPrice: property.soldPrice ? property.soldPrice.toString() : null,
      commissionRate: property.commissionRate ? property.commissionRate.toString() : null,
      referralFee: property.referralFee ? property.referralFee.toString() : null,
    };
    const [newProperty] = await db.insert(properties).values(propertyData).returning();
    return newProperty;
  }

  async updateProperty(id: string, property: Partial<InsertProperty>, userId: string): Promise<Property> {
    // Convert numeric fields to strings for database storage
    const propertyData = {
      ...property,
      bathrooms: property.bathrooms ? property.bathrooms.toString() : undefined,
      listingPrice: property.listingPrice ? property.listingPrice.toString() : undefined,
      offerPrice: property.offerPrice ? property.offerPrice.toString() : undefined,
      acceptedPrice: property.acceptedPrice ? property.acceptedPrice.toString() : undefined,
      soldPrice: property.soldPrice ? property.soldPrice.toString() : undefined,
      commissionRate: property.commissionRate ? property.commissionRate.toString() : undefined,
      referralFee: property.referralFee ? property.referralFee.toString() : undefined,
      updatedAt: new Date(),
    };
    const [updatedProperty] = await db
      .update(properties)
      .set(propertyData)
      .where(and(eq(properties.id, id), eq(properties.userId, userId)))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: string, userId: string): Promise<void> {
    await db
      .delete(properties)
      .where(and(eq(properties.id, id), eq(properties.userId, userId)));
  }

  async getPropertiesByZipcode(zipcode: string): Promise<Property[]> {
    return await db
      .select()
      .from(properties)
      .where(eq(properties.zipCode, zipcode))
      .orderBy(desc(properties.createdAt));
  }

  async getZipcodeMarketMetrics(zipcode: string): Promise<any> {
    const propertiesInZip = await this.getPropertiesByZipcode(zipcode);
    
    if (propertiesInZip.length === 0) {
      return null;
    }

    const soldProperties = propertiesInZip.filter(p => p.status === 'closed' && p.soldPrice);
    const listedProperties = propertiesInZip.filter(p => p.status === 'listed' && p.listingPrice);
    const activeListings = propertiesInZip.filter(p => ['listed', 'active_under_contract', 'pending'].includes(p.status || ''));
    
    // Calculate actual metrics from real data
    const avgListingPrice = listedProperties.length > 0 ? 
      listedProperties.reduce((sum, p) => sum + parseFloat(p.listingPrice || '0'), 0) / listedProperties.length : 0;
    
    const avgSoldPrice = soldProperties.length > 0 ? 
      soldProperties.reduce((sum, p) => sum + parseFloat(p.soldPrice || '0'), 0) / soldProperties.length : 0;
    
    const avgDaysOnMarket = soldProperties.filter(p => p.daysOnMarket).length > 0 ?
      soldProperties.filter(p => p.daysOnMarket).reduce((sum, p) => sum + (p.daysOnMarket || 0), 0) / soldProperties.filter(p => p.daysOnMarket).length : 0;
    
    // Calculate sale-to-list ratios
    const saleToListRatios = soldProperties
      .filter(p => p.listingPrice && p.soldPrice)
      .map(p => parseFloat(p.soldPrice!) / parseFloat(p.listingPrice!));
    
    const avgSaleToListRatio = saleToListRatios.length > 0 ?
      saleToListRatios.reduce((sum, ratio) => sum + ratio, 0) / saleToListRatios.length : 0;
    
    const aboveAskingPercent = saleToListRatios.length > 0 ?
      (saleToListRatios.filter(ratio => ratio > 1.0).length / saleToListRatios.length) * 100 : 0;
    
    // Property type breakdown
    const propertyTypes = propertiesInZip.reduce((acc, p) => {
      const type = p.propertyType || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Recent price trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const recentSales = soldProperties.filter(p => 
      p.soldDate && new Date(p.soldDate) >= sixMonthsAgo
    );
    
    const recentAvgPrice = recentSales.length > 0 ?
      recentSales.reduce((sum, p) => sum + parseFloat(p.soldPrice || '0'), 0) / recentSales.length : 0;
    
    return {
      totalProperties: propertiesInZip.length,
      soldProperties: soldProperties.length,
      activeListings: activeListings.length,
      avgListingPrice,
      avgSoldPrice,
      avgDaysOnMarket,
      avgSaleToListRatio,
      aboveAskingPercent,
      propertyTypes,
      recentSales: recentSales.length,
      recentAvgPrice,
      priceAppreciationLastSixMonths: avgSoldPrice > 0 && recentAvgPrice > 0 ?
        ((recentAvgPrice - avgSoldPrice) / avgSoldPrice) * 100 : 0,
      listings: {
        recent: listedProperties.slice(0, 5).map(p => ({
          address: p.address,
          listingPrice: parseFloat(p.listingPrice || '0'),
          propertyType: p.propertyType,
          bedrooms: p.bedrooms,
          bathrooms: parseFloat(p.bathrooms || '0'),
          squareFeet: p.squareFeet,
          daysOnMarket: p.daysOnMarket || 0,
          status: p.status
        }))
      },
      sales: {
        recent: soldProperties.slice(0, 5).map(p => ({
          address: p.address,
          soldPrice: parseFloat(p.soldPrice || '0'),
          listingPrice: parseFloat(p.listingPrice || '0'),
          propertyType: p.propertyType,
          bedrooms: p.bedrooms,
          bathrooms: parseFloat(p.bathrooms || '0'),
          squareFeet: p.squareFeet,
          daysOnMarket: p.daysOnMarket || 0,
          saleToListRatio: p.listingPrice && p.soldPrice ? 
            parseFloat(p.soldPrice) / parseFloat(p.listingPrice) : 0
        }))
      }
    };
  }

  // Commission operations
  async getCommissions(userId: string): Promise<Commission[]> {
    return await db
      .select()
      .from(commissions)
      .where(eq(commissions.userId, userId))
      .orderBy(desc(commissions.dateEarned));
  }

  async getCommissionsByProperty(propertyId: string, userId: string): Promise<Commission[]> {
    return await db
      .select()
      .from(commissions)
      .where(and(eq(commissions.propertyId, propertyId), eq(commissions.userId, userId)))
      .orderBy(desc(commissions.dateEarned));
  }

  async createCommission(commission: InsertCommission & { userId: string }): Promise<Commission> {
    const [newCommission] = await db.insert(commissions).values(commission).returning();
    return newCommission;
  }

  async updateCommission(id: string, commission: Partial<InsertCommission>, userId: string): Promise<Commission> {
    const [updatedCommission] = await db
      .update(commissions)
      .set(commission)
      .where(and(eq(commissions.id, id), eq(commissions.userId, userId)))
      .returning();
    return updatedCommission;
  }

  async deleteCommission(id: string, userId: string): Promise<void> {
    await db
      .delete(commissions)
      .where(and(eq(commissions.id, id), eq(commissions.userId, userId)));
  }

  // Expense operations
  async getExpenses(userId: string, startDate?: string, endDate?: string): Promise<Expense[]> {
    let query = db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId));

    if (startDate && endDate) {
      query = query.where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      ));
    }

    return await query.orderBy(desc(expenses.date));
  }

  async getExpensesByProperty(propertyId: string, userId: string, startDate?: string, endDate?: string): Promise<Expense[]> {
    let conditions = [eq(expenses.propertyId, propertyId), eq(expenses.userId, userId)];
    
    if (startDate && endDate) {
      conditions.push(gte(expenses.date, startDate));
      conditions.push(lte(expenses.date, endDate));
    }

    return await db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.date));
  }

  async getExpensesGroupedByProperty(userId: string, startDate?: string, endDate?: string): Promise<{ propertyId: string; propertyAddress: string; total: number; count: number; percentage: number; roi?: number }[]> {
    let expenseConditions = [eq(expenses.userId, userId), isNotNull(expenses.propertyId)];
    let commissionConditions = [eq(commissions.userId, userId)];
    
    if (startDate && endDate) {
      expenseConditions.push(gte(expenses.date, startDate));
      expenseConditions.push(lte(expenses.date, endDate));
      commissionConditions.push(gte(commissions.dateEarned, startDate));
      commissionConditions.push(lte(commissions.dateEarned, endDate));
    }

    const results = await db
      .select({
        propertyId: expenses.propertyId,
        propertyAddress: properties.address,
        total: sql<number>`sum(${expenses.amount}::numeric)`,
        count: count()
      })
      .from(expenses)
      .leftJoin(properties, eq(expenses.propertyId, properties.id))
      .where(and(...expenseConditions))
      .groupBy(expenses.propertyId, properties.address)
      .orderBy(sql`sum(${expenses.amount}::numeric) desc`);

    // Get commissions for each property to calculate ROI
    const commissionResults = await db
      .select({
        propertyId: commissions.propertyId,
        totalCommission: sql<number>`sum(${commissions.amount}::numeric)`
      })
      .from(commissions)
      .where(and(...commissionConditions))
      .groupBy(commissions.propertyId);

    const commissionMap = new Map<string, number>();
    commissionResults.forEach(comm => {
      if (comm.propertyId) {
        commissionMap.set(comm.propertyId, parseFloat(comm.totalCommission?.toString() || '0'));
      }
    });

    // Calculate total for percentage calculation
    const totalExpenses = results.reduce((sum, result) => sum + parseFloat(result.total.toString()), 0);

    // Format results with percentages and ROI
    const breakdown = results.map(result => {
      const expenseTotal = parseFloat(result.total.toString());
      const commissionAmount = commissionMap.get(result.propertyId || '') || 0;
      const roi = expenseTotal > 0 ? ((commissionAmount - expenseTotal) / expenseTotal) * 100 : 0;
      
      return {
        propertyId: result.propertyId || 'unknown',
        propertyAddress: result.propertyAddress || 'Unknown Property',
        total: expenseTotal,
        count: result.count,
        percentage: totalExpenses > 0 ? parseFloat(((expenseTotal / totalExpenses) * 100).toFixed(1)) : 0,
        roi: Math.round(roi * 100) / 100 // Round to 2 decimal places
      };
    });

    return breakdown.sort((a, b) => b.total - a.total);
  }

  async getExpenseBreakdown(userId: string): Promise<{ category: string; total: number; count: number; percentage: number }[]> {
    const results = await db
      .select({
        category: expenses.category,
        total: sql<number>`sum(${expenses.amount}::numeric)`,
        count: count()
      })
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .groupBy(expenses.category)
      .orderBy(sql`sum(${expenses.amount}::numeric) desc`);

    // Calculate total for percentage calculation
    const totalExpenses = results.reduce((sum, result) => sum + parseFloat(result.total.toString()), 0);

    // Add mileage gas costs to the breakdown
    const mileageGasData = await db
      .select({
        gasCost: sql<number>`sum(${mileageLogs.gasCost}::numeric)`
      })
      .from(mileageLogs)
      .where(eq(mileageLogs.userId, userId));

    const totalGasCosts = mileageGasData[0]?.gasCost ? parseFloat(mileageGasData[0].gasCost.toString()) : 0;
    const grandTotal = totalExpenses + totalGasCosts;

    // Format results with percentages
    const breakdown = results.map(result => ({
      category: result.category,
      total: parseFloat(result.total.toString()),
      count: result.count,
      percentage: grandTotal > 0 ? parseFloat(((parseFloat(result.total.toString()) / grandTotal) * 100).toFixed(1)) : 0
    }));

    // Add mileage/gas costs as separate category if there are any
    if (totalGasCosts > 0) {
      breakdown.push({
        category: 'mileage',
        total: totalGasCosts,
        count: 1, // Represents aggregated mileage entries
        percentage: grandTotal > 0 ? parseFloat(((totalGasCosts / grandTotal) * 100).toFixed(1)) : 0
      });
    }

    return breakdown.sort((a, b) => b.total - a.total);
  }

  async createExpense(expense: InsertExpense & { userId: string }): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: string, expense: Partial<InsertExpense>, userId: string): Promise<Expense> {
    const [updatedExpense] = await db
      .update(expenses)
      .set(expense)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
      .returning();
    return updatedExpense;
  }

  async deleteExpense(id: string, userId: string): Promise<void> {
    await db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));
  }

  // Time entry operations
  async getTimeEntries(userId: string): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(eq(timeEntries.userId, userId))
      .orderBy(desc(timeEntries.date));
  }

  async getTimeEntriesByProperty(propertyId: string, userId: string): Promise<TimeEntry[]> {
    return await db
      .select()
      .from(timeEntries)
      .where(and(eq(timeEntries.propertyId, propertyId), eq(timeEntries.userId, userId)))
      .orderBy(desc(timeEntries.date));
  }

  async createTimeEntry(timeEntry: InsertTimeEntry & { userId: string }): Promise<TimeEntry> {
    const [newTimeEntry] = await db.insert(timeEntries).values(timeEntry).returning();
    return newTimeEntry;
  }

  async updateTimeEntry(id: string, timeEntry: Partial<InsertTimeEntry>, userId: string): Promise<TimeEntry> {
    const [updatedTimeEntry] = await db
      .update(timeEntries)
      .set(timeEntry)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)))
      .returning();
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: string, userId: string): Promise<void> {
    await db
      .delete(timeEntries)
      .where(and(eq(timeEntries.id, id), eq(timeEntries.userId, userId)));
  }

  // Activity operations
  async getActivities(userId: string): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.userId, userId))
      .orderBy(desc(activities.date));
  }

  async createActivity(activity: InsertActivity & { userId: string }): Promise<Activity> {
    // Handle empty string propertyId by setting it to null
    const activityData = {
      ...activity,
      propertyId: activity.propertyId === "" || activity.propertyId === null ? null : activity.propertyId,
    };
    
    console.log("Creating activity with data:", activityData);
    const [newActivity] = await db.insert(activities).values(activityData).returning();
    console.log("Created activity:", newActivity);
    return newActivity;
  }

  // Activity Actuals operations
  async getActivityActuals(userId: string, startDate?: string, endDate?: string): Promise<ActivityActual[]> {
    let whereConditions = [eq(activityActuals.userId, userId)];
    
    if (startDate) {
      whereConditions.push(gte(activityActuals.date, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(activityActuals.date, endDate));
    }
    
    return await db
      .select()
      .from(activityActuals)
      .where(and(...whereConditions))
      .orderBy(desc(activityActuals.date));
  }

  async createActivityActual(activityActual: InsertActivityActual & { userId: string }): Promise<ActivityActual> {
    // Convert numeric fields to proper types for database storage
    const activityData = {
      ...activityActual,
      hoursWorked: activityActual.hoursWorked ? activityActual.hoursWorked.toString() : "0",
    };
    const [newActivityActual] = await db.insert(activityActuals).values(activityData).returning();
    return newActivityActual;
  }

  async updateActivityActual(id: string, activityActual: Partial<InsertActivityActual>, userId: string): Promise<ActivityActual> {
    // Convert numeric fields to proper types for database storage
    const activityData = {
      ...activityActual,
      hoursWorked: activityActual.hoursWorked ? activityActual.hoursWorked.toString() : undefined,
    };
    const [updatedActivityActual] = await db
      .update(activityActuals)
      .set(activityData)
      .where(and(eq(activityActuals.id, id), eq(activityActuals.userId, userId)))
      .returning();
    return updatedActivityActual;
  }

  // Efficiency Score operations
  async getEfficiencyScores(userId: string, startDate?: string, endDate?: string): Promise<EfficiencyScore[]> {
    let whereConditions = [eq(efficiencyScores.userId, userId)];
    
    if (startDate) {
      whereConditions.push(gte(efficiencyScores.date, startDate));
    }
    if (endDate) {
      whereConditions.push(lte(efficiencyScores.date, endDate));
    }
    
    return await db
      .select()
      .from(efficiencyScores)
      .where(and(...whereConditions))
      .orderBy(desc(efficiencyScores.date));
  }

  async createEfficiencyScore(efficiencyScore: InsertEfficiencyScore & { userId: string }): Promise<EfficiencyScore> {
    const [newScore] = await db.insert(efficiencyScores).values(efficiencyScore).returning();
    return newScore;
  }

  async getEfficiencyScoresByPeriod(userId: string, period: 'day' | 'week' | 'month', count: number): Promise<{ date: string; averageScore: number; scoreCount: number }[]> {
    const periodMap = {
      day: 'day',
      week: 'week', 
      month: 'month'
    };
    
    const periodTrunc = periodMap[period];
    
    const results = await db
      .select({
        date: sql<string>`DATE_TRUNC('${sql.raw(periodTrunc)}', ${efficiencyScores.date})::date`,
        averageScore: sql<number>`AVG(${efficiencyScores.overallScore})`,
        scoreCount: sql<number>`COUNT(*)`
      })
      .from(efficiencyScores)
      .where(eq(efficiencyScores.userId, userId))
      .groupBy(sql`DATE_TRUNC('${sql.raw(periodTrunc)}', ${efficiencyScores.date})`)
      .orderBy(sql`DATE_TRUNC('${sql.raw(periodTrunc)}', ${efficiencyScores.date}) DESC`)
      .limit(count);
    
    return results.map(r => ({
      date: r.date,
      averageScore: Math.round(Number(r.averageScore)),
      scoreCount: Number(r.scoreCount)
    }));
  }

  // CMA operations
  async getCmas(userId: string): Promise<Cma[]> {
    return await db
      .select()
      .from(cmas)
      .where(eq(cmas.userId, userId))
      .orderBy(desc(cmas.createdAt));
  }

  async createCma(cma: InsertCma & { userId: string }): Promise<Cma> {
    const [newCma] = await db.insert(cmas).values(cma as any).returning();
    return newCma;
  }

  async updateCma(id: string, cma: Partial<InsertCma>, userId: string): Promise<Cma> {
    const [updatedCma] = await db
      .update(cmas)
      .set({ ...cma, updatedAt: new Date() } as any)
      .where(and(eq(cmas.id, id), eq(cmas.userId, userId)))
      .returning();
    return updatedCma;
  }

  async deleteCma(id: string, userId: string): Promise<void> {
    await db
      .delete(cmas)
      .where(and(eq(cmas.id, id), eq(cmas.userId, userId)));
  }

  // Showing operations
  async getShowings(userId: string): Promise<Showing[]> {
    return await db
      .select()
      .from(showings)
      .where(eq(showings.userId, userId))
      .orderBy(desc(showings.date));
  }

  async createShowing(showing: InsertShowing & { userId: string }): Promise<Showing> {
    const [newShowing] = await db.insert(showings).values(showing).returning();
    return newShowing;
  }

  async updateShowing(id: string, showing: Partial<InsertShowing>, userId: string): Promise<Showing> {
    const [updatedShowing] = await db
      .update(showings)
      .set(showing)
      .where(and(eq(showings.id, id), eq(showings.userId, userId)))
      .returning();
    return updatedShowing;
  }

  async deleteShowing(id: string, userId: string): Promise<void> {
    await db
      .delete(showings)
      .where(and(eq(showings.id, id), eq(showings.userId, userId)));
  }

  // Mileage operations
  async getMileageLogs(userId: string): Promise<MileageLog[]> {
    return await db
      .select()
      .from(mileageLogs)
      .where(eq(mileageLogs.userId, userId))
      .orderBy(desc(mileageLogs.date));
  }

  async createMileageLog(mileageLog: InsertMileageLog & { userId: string }): Promise<MileageLog> {
    const [newMileageLog] = await db.insert(mileageLogs).values(mileageLog as any).returning();
    return newMileageLog;
  }

  // Goal operations
  async getGoals(userId: string): Promise<Goal[]> {
    return await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId))
      .orderBy(desc(goals.effectiveDate));
  }

  async createGoal(goal: InsertGoal & { userId: string }): Promise<Goal> {
    const [newGoal] = await db.insert(goals).values(goal).returning();
    return newGoal;
  }

  async updateGoal(id: string, goal: Partial<InsertGoal>, userId: string): Promise<Goal> {
    const [updatedGoal] = await db
      .update(goals)
      .set({ ...goal, updatedAt: new Date() })
      .where(and(eq(goals.id, id), eq(goals.userId, userId)))
      .returning();
    return updatedGoal;
  }

  async deleteGoal(id: string, userId: string): Promise<void> {
    await db
      .delete(goals)
      .where(and(eq(goals.id, id), eq(goals.userId, userId)));
  }

  async getDailyGoal(userId: string, date: string): Promise<Goal | undefined> {
    const [goal] = await db
      .select()
      .from(goals)
      .where(and(
        eq(goals.userId, userId),
        eq(goals.period, 'daily'),
        eq(goals.effectiveDate, date)
      ))
      .limit(1);
    return goal;
  }

  async getDailyActivityActuals(userId: string, date: string): Promise<ActivityActual | undefined> {
    const [actual] = await db
      .select()
      .from(activityActuals)
      .where(and(
        eq(activityActuals.userId, userId),
        eq(activityActuals.date, date)
      ))
      .limit(1);
    return actual;
  }

  // Dashboard metrics - complex calculations
  async getDashboardMetrics(userId: string): Promise<any> {
    // Get current year date range
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;
    const currentMonth = new Date().getMonth() + 1;
    const monthStart = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;

    // Get all required data
    const [
      userProperties,
      userCommissions,
      userExpenses,
      userTimeEntries,
      userActivities,
      userShowings,
      userMileageLogs,
    ] = await Promise.all([
      this.getProperties(userId),
      this.getCommissions(userId),
      this.getExpenses(userId),
      this.getTimeEntries(userId),
      this.getActivities(userId),
      this.getShowings(userId),
      this.getMileageLogs(userId),
    ]);

    // Calculate metrics
    const closedProperties = userProperties.filter(p => p.status === 'closed');
    const activeListings = userProperties.filter(p => p.status === 'listed').length;
    const underContract = userProperties.filter(p => p.status === 'active_under_contract');
    const pending = userProperties.filter(p => p.status === 'pending');
    const withdrawnProperties = userProperties.filter(p => p.status === 'withdrawn');
    const expiredProperties = userProperties.filter(p => p.status === 'expired');
    const terminatedProperties = userProperties.filter(p => p.status === 'terminated');

    // Total Revenue (from commissions for closed properties, fallback to property calculation)
    const totalRevenue = userCommissions
      .filter(c => c.dateEarned >= yearStart && c.dateEarned <= yearEnd)
      .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);

    // Total Volume (sum of closed property sold prices)
    const totalVolume = closedProperties
      .reduce((sum, p) => sum + parseFloat(p.soldPrice || p.listingPrice || '0'), 0);
    
    // Average home sale price
    const avgHomeSalePrice = closedProperties.length > 0 
      ? totalVolume / closedProperties.length 
      : 0;
    
    // Average commission
    const avgCommission = userCommissions.length > 0 
      ? totalRevenue / userCommissions.length 
      : 0;

    // This month revenue
    const thisMonthRevenue = userCommissions
      .filter(c => c.dateEarned >= monthStart)
      .reduce((sum, c) => sum + parseFloat(c.amount || '0'), 0);

    // Total expenses (including mileage gas costs)
    const expensesFromExpenseTable = userExpenses
      .filter(e => e.date >= yearStart && e.date <= yearEnd)
      .reduce((sum, e) => sum + parseFloat(e.amount || '0'), 0);
    
    const gasCostsFromMileage = userMileageLogs
      .filter(m => m.date >= yearStart && m.date <= yearEnd)
      .reduce((sum, m) => sum + parseFloat(m.gasCost || '0'), 0);
    
    const totalExpenses = expensesFromExpenseTable + gasCostsFromMileage;

    // YTD hours
    const ytdHours = userTimeEntries
      .filter(t => t.date >= yearStart && t.date <= yearEnd)
      .reduce((sum, t) => sum + parseFloat(t.hours || '0'), 0);

    // Calculate pipeline values
    const underContractValue = underContract
      .reduce((sum, p) => sum + parseFloat(p.acceptedPrice || p.listingPrice || '0'), 0);
    
    const pendingValue = pending
      .reduce((sum, p) => sum + parseFloat(p.acceptedPrice || p.listingPrice || '0'), 0);

    // Calculate average transaction period
    const avgTransactionPeriod = closedProperties.length > 0 
      ? closedProperties
          .filter(p => p.listingDate && p.soldDate)
          .reduce((sum, p) => {
            const listingDate = new Date(p.listingDate!);
            const soldDate = new Date(p.soldDate!);
            return sum + (soldDate.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24);
          }, 0) / closedProperties.length
      : 0;

    // Calculate separate buyer and seller conversion rates
    const buyerAppointments = userActivities.filter(a => 
      a.type === 'buyer_appointment'
    ).length;
    
    const buyerAgreements = userActivities.filter(a => 
      a.type === 'buyer_signed'
    ).length;
    
    const listingAppointments = userActivities.filter(a => 
      a.type === 'listing_appointment'
    ).length;
    
    const listingAgreements = userActivities.filter(a => 
      a.type === 'listing_taken'
    ).length;

    const buyerConversionRate = buyerAppointments > 0 
      ? (buyerAgreements / buyerAppointments) * 100 
      : 0;
      
    const sellerConversionRate = listingAppointments > 0 
      ? (listingAgreements / listingAppointments) * 100 
      : 0;
      
    // Overall conversion rate for backward compatibility
    const appointmentActivities = buyerAppointments + listingAppointments;
    const agreementActivities = buyerAgreements + listingAgreements;
    const conversionRate = appointmentActivities > 0 
      ? (agreementActivities / appointmentActivities) * 100 
      : 0;

    // Calculate offer acceptance rate based on property status
    const offersWritten = userProperties.filter(p => 
      p.status === 'offer_written' || p.status === 'active_under_contract' || 
      p.status === 'pending' || p.status === 'closed'
    ).length;
    const offersAccepted = userProperties.filter(p => 
      p.status === 'active_under_contract' || p.status === 'pending' || p.status === 'closed'
    ).length;
    const offerAcceptanceRate = offersWritten > 0 ? (offersAccepted / offersWritten) * 100 : 0;

    // Calculate agreement to sold conversion rates
    const buyerAgreementProperties = userProperties.filter(p => 
      p.representationType === 'buyer_rep' && p.buyerAgreementDate
    ).length;
    const buyerSoldProperties = userProperties.filter(p => 
      p.representationType === 'buyer_rep' && p.buyerAgreementDate && p.status === 'closed'
    ).length;
    const buyerAgreementToSoldRate = buyerAgreementProperties > 0 
      ? (buyerSoldProperties / buyerAgreementProperties) * 100 
      : 0;
    
    const sellerAgreementProperties = userProperties.filter(p => 
      p.representationType === 'seller_rep' && p.sellerAgreementDate
    ).length;
    const sellerSoldProperties = userProperties.filter(p => 
      p.representationType === 'seller_rep' && p.sellerAgreementDate && p.status === 'closed'
    ).length;
    const sellerAgreementToSoldRate = sellerAgreementProperties > 0 
      ? (sellerSoldProperties / sellerAgreementProperties) * 100 
      : 0;

    // Revenue per hour
    const revenuePerHour = ytdHours > 0 ? totalRevenue / ytdHours : 0;

    // ROI Performance
    const roiPerformance = totalExpenses > 0 ? ((totalRevenue - totalExpenses) / totalExpenses) * 100 : 0;

    return {
      totalRevenue,
      totalVolume,
      propertiesClosed: closedProperties.length,
      totalProperties: userProperties.length, // Add total property count
      activeListings,
      withdrawnProperties: withdrawnProperties.length,
      expiredProperties: expiredProperties.length,
      terminatedProperties: terminatedProperties.length,
      thisMonthRevenue,
      avgTransactionPeriod: Math.round(avgTransactionPeriod),
      conversionRate: Math.round(conversionRate),
      buyerConversionRate: Math.round(buyerConversionRate),
      sellerConversionRate: Math.round(sellerConversionRate),
      buyerAppointments,
      buyerAgreements,
      listingAppointments,
      listingAgreements,
      // Agreement to sold conversion rates
      buyerAgreementToSoldRate: Math.round(buyerAgreementToSoldRate),
      sellerAgreementToSoldRate: Math.round(sellerAgreementToSoldRate),
      buyerAgreementProperties,
      buyerSoldProperties,
      sellerAgreementProperties,
      sellerSoldProperties,
      offerAcceptanceRate: Math.round(offerAcceptanceRate),
      offersWritten,
      offersAccepted,
      revenuePerHour: Math.round(revenuePerHour),
      roiPerformance: Math.round(roiPerformance),
      underContractCount: underContract.length,
      underContractValue,
      pendingCount: pending.length,
      pendingValue,
      totalExpenses,
      ytdHours,
      totalShowings: userShowings.length,
      avgHomeSalePrice,
      avgCommission,
    };
  }

  // Referral operations
  async getReferrals(userId: string): Promise<Referral[]> {
    return await db
      .select()
      .from(referrals)
      .where(eq(referrals.referrerId, userId))
      .orderBy(desc(referrals.createdAt));
  }

  // Generate unique referral code
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789'; // Exclude confusing chars
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async createReferral(referral: InsertReferral & { referrerId: string }): Promise<Referral> {
    console.log("Storage createReferral received:", referral);
    console.log("referrerId field:", referral.referrerId);
    
    // Generate unique referral code
    let referralCode = this.generateReferralCode();
    
    // Ensure code is unique
    let codeExists = true;
    let attempts = 0;
    while (codeExists && attempts < 10) {
      const existingReferral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, referralCode))
        .limit(1);
      
      if (existingReferral.length === 0) {
        codeExists = false;
      } else {
        referralCode = this.generateReferralCode();
        attempts++;
      }
    }
    
    // Manually construct the values object to ensure proper field mapping
    const insertValues = {
      referrerId: referral.referrerId,
      refereeEmail: referral.refereeEmail,
      refereeName: referral.refereeName || null,
      referralCode,
      status: referral.status || 'pending',
      rewardClaimed: referral.rewardClaimed || false,
    };
    
    console.log("Insert values:", insertValues);
    
    const [newReferral] = await db
      .insert(referrals)
      .values(insertValues)
      .returning();
    return newReferral;
  }

  async updateReferralStatus(id: string, status: string, userId: string): Promise<Referral> {
    const [updatedReferral] = await db
      .update(referrals)
      .set({ 
        status, 
        updatedAt: new Date(),
        ...(status === 'signed_up' && { signUpAt: new Date() }),
        ...(status === 'subscribed' && { subscriptionAt: new Date() })
      })
      .where(and(eq(referrals.id, id), eq(referrals.referrerId, userId)))
      .returning();
    return updatedReferral;
  }

  async getReferralStats(userId: string): Promise<{ total: number; successful: number; pending: number; rewardsEarned: number }> {
    const userReferrals = await this.getReferrals(userId);
    const total = userReferrals.length;
    const successful = userReferrals.filter(r => r.status === 'subscribed').length;
    const pending = userReferrals.filter(r => r.status === 'pending').length;
    const rewardsEarned = Math.floor(successful / 3); // 1 month free per 3 successful referrals
    
    return { total, successful, pending, rewardsEarned };
  }

  async validateReferralCode(code: string): Promise<Referral | null> {
    const [referral] = await db
      .select()
      .from(referrals)
      .where(and(
        eq(referrals.referralCode, code),
        eq(referrals.status, 'pending')
      ))
      .limit(1);
    
    return referral || null;
  }

  async processPendingReferralByCode(code: string, userEmail: string): Promise<void> {
    console.log(`🔍 Processing referral with code: ${code} for email: ${userEmail}`);
    
    const referral = await this.validateReferralCode(code);
    if (referral && referral.refereeEmail === userEmail) {
      await db
        .update(referrals)
        .set({ 
          status: 'signed_up',
          signUpAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(referrals.id, referral.id));
      
      console.log(`✅ Updated referral ${referral.id} with code ${code} to 'signed_up' - referrer will get credit!`);
    }
  }

  async processPendingReferral(userEmail: string): Promise<void> {
    console.log(`🔍 Checking for pending referrals for email: ${userEmail}`);
    
    // Find pending referrals for this email
    const pendingReferrals = await db
      .select()
      .from(referrals)
      .where(and(
        eq(referrals.refereeEmail, userEmail),
        eq(referrals.status, 'pending')
      ));
    
    console.log(`📧 Found ${pendingReferrals.length} pending referral(s) for ${userEmail}`);
    
    // Update all pending referrals to 'signed_up' status
    for (const referral of pendingReferrals) {
      await db
        .update(referrals)
        .set({ 
          status: 'signed_up',
          signUpAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(referrals.id, referral.id));
      
      console.log(`✅ Updated referral ${referral.id} to 'signed_up' - referrer will get credit!`);
    }
  }

  async processSubscriptionUpgrade(userEmail: string): Promise<void> {
    console.log(`💳 Processing subscription upgrade for email: ${userEmail}`);
    
    // Find referrals that are in 'signed_up' status for this email
    const signedUpReferrals = await db
      .select()
      .from(referrals)
      .where(and(
        eq(referrals.refereeEmail, userEmail),
        eq(referrals.status, 'signed_up')
      ));
    
    console.log(`🎯 Found ${signedUpReferrals.length} referral(s) to upgrade to 'subscribed'`);
    
    // Update all signed_up referrals to 'subscribed' status
    for (const referral of signedUpReferrals) {
      await db
        .update(referrals)
        .set({ 
          status: 'subscribed',
          subscriptionAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(referrals.id, referral.id));
      
      console.log(`🎉 Upgraded referral ${referral.id} to 'subscribed' - referrer gets maximum credit!`);
    }
  }

  // Smart Task operations
  async getSmartTasks(userId: string, status?: string, priority?: string): Promise<SmartTask[]> {
    const whereConditions = [eq(smartTasks.userId, userId)];
    
    if (status) {
      whereConditions.push(eq(smartTasks.status, status as any));
    }
    if (priority) {
      whereConditions.push(eq(smartTasks.priority, priority as any));
    }
    
    return await db
      .select()
      .from(smartTasks)
      .where(and(...whereConditions))
      .orderBy(desc(smartTasks.createdAt));
  }

  async createSmartTask(userId: string, task: InsertSmartTask): Promise<SmartTask> {
    const taskData = {
      ...task,
      userId,
      dueDate: task.dueDate ? new Date(task.dueDate) : null
    };
    const [newTask] = await db
      .insert(smartTasks)
      .values(taskData as any)
      .returning();
    return newTask;
  }

  async updateSmartTask(userId: string, taskId: string, updates: Partial<InsertSmartTask>): Promise<SmartTask> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    if (updates.dueDate && typeof updates.dueDate === 'string') {
      updateData.dueDate = new Date(updates.dueDate);
    }
    const [updatedTask] = await db
      .update(smartTasks)
      .set(updateData as any)
      .where(and(eq(smartTasks.id, taskId), eq(smartTasks.userId, userId)))
      .returning();
    return updatedTask;
  }

  async deleteSmartTask(userId: string, taskId: string): Promise<void> {
    await db
      .delete(smartTasks)
      .where(and(eq(smartTasks.id, taskId), eq(smartTasks.userId, userId)));
  }

  async getDueTasks(): Promise<SmartTask[]> {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60000);
    
    return await db
      .select()
      .from(smartTasks)
      .where(
        and(
          gte(smartTasks.dueDate, oneMinuteAgo),
          lte(smartTasks.dueDate, now),
          eq(smartTasks.status, 'pending'),
          eq(smartTasks.automatedReminder, true),
          eq(smartTasks.reminderDueSent, false)
        )
      );
  }

  async getOverdueTasks(): Promise<SmartTask[]> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    const fourMinutesAgo = new Date(now.getTime() - 4 * 60 * 1000);
    
    return await db
      .select()
      .from(smartTasks)
      .where(
        and(
          gte(smartTasks.dueDate, fiveMinutesAgo),
          lte(smartTasks.dueDate, fourMinutesAgo),
          eq(smartTasks.status, 'pending'),
          eq(smartTasks.automatedReminder, true),
          eq(smartTasks.reminder5minOverdueSent, false)
        )
      );
  }

  async getTasksDueInMinutes(minutes: number): Promise<SmartTask[]> {
    const now = new Date();
    const targetTime = new Date(now.getTime() + (minutes * 60 * 1000));
    
    // Find tasks due within a 1-minute window around the target time
    const windowStart = new Date(targetTime.getTime() - 30000); // 30 seconds before
    const windowEnd = new Date(targetTime.getTime() + 30000);   // 30 seconds after
    
    const reminderField = minutes === 30 ? smartTasks.reminder30minSent :
                         minutes === 10 ? smartTasks.reminder10minSent :
                         minutes === 5 ? smartTasks.reminder5minSent :
                         null;
    
    if (!reminderField) return [];
    
    return await db
      .select()
      .from(smartTasks)
      .where(
        and(
          gte(smartTasks.dueDate, windowStart),
          lte(smartTasks.dueDate, windowEnd),
          eq(smartTasks.automatedReminder, true),
          eq(reminderField, false),
          eq(smartTasks.status, 'pending')
        )
      );
  }

  async markTaskReminderSent(taskId: string): Promise<void> {
    await db
      .update(smartTasks)
      .set({ reminderSent: true, updatedAt: new Date() })
      .where(eq(smartTasks.id, taskId));
  }

  async markTaskReminder30minSent(taskId: string): Promise<void> {
    await db
      .update(smartTasks)
      .set({ reminder30minSent: true, updatedAt: new Date() })
      .where(eq(smartTasks.id, taskId));
  }

  async markTaskReminder10minSent(taskId: string): Promise<void> {
    await db
      .update(smartTasks)
      .set({ reminder10minSent: true, updatedAt: new Date() })
      .where(eq(smartTasks.id, taskId));
  }

  async markTaskReminder5minSent(taskId: string): Promise<void> {
    await db
      .update(smartTasks)
      .set({ reminder5minSent: true, updatedAt: new Date() })
      .where(eq(smartTasks.id, taskId));
  }

  async markTaskReminderDueSent(taskId: string): Promise<void> {
    await db
      .update(smartTasks)
      .set({ reminderDueSent: true, updatedAt: new Date() })
      .where(eq(smartTasks.id, taskId));
  }

  async markTaskReminder5minOverdueSent(taskId: string): Promise<void> {
    await db
      .update(smartTasks)
      .set({ reminder5minOverdueSent: true, updatedAt: new Date() })
      .where(eq(smartTasks.id, taskId));
  }

  // Property Deadline operations
  async getPropertyDeadlines(userId: string, propertyId?: string): Promise<PropertyDeadline[]> {
    const whereConditions = [eq(propertyDeadlines.userId, userId)];
    
    if (propertyId) {
      whereConditions.push(eq(propertyDeadlines.propertyId, propertyId));
    }
    
    return await db
      .select()
      .from(propertyDeadlines)
      .where(and(...whereConditions))
      .orderBy(asc(propertyDeadlines.dueDate));
  }

  async createPropertyDeadline(userId: string, deadline: InsertPropertyDeadline): Promise<PropertyDeadline> {
    const [newDeadline] = await db
      .insert(propertyDeadlines)
      .values({ ...deadline, userId })
      .returning();
    return newDeadline;
  }

  async updatePropertyDeadline(userId: string, deadlineId: string, updates: Partial<InsertPropertyDeadline>): Promise<PropertyDeadline> {
    const [updatedDeadline] = await db
      .update(propertyDeadlines)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(propertyDeadlines.id, deadlineId), eq(propertyDeadlines.userId, userId)))
      .returning();
    return updatedDeadline;
  }

  // Office Competition operations
  async getOfficeCompetitions(officeId: string): Promise<OfficeCompetition[]> {
    return await db
      .select()
      .from(officeCompetitions)
      .where(eq(officeCompetitions.officeId, officeId))
      .orderBy(desc(officeCompetitions.createdAt));
  }

  async isUserInCompetition(competitionId: string, userId: string): Promise<boolean> {
    const [participant] = await db
      .select()
      .from(competitionParticipants)
      .where(and(
        eq(competitionParticipants.competitionId, competitionId),
        eq(competitionParticipants.userId, userId)
      ));
    return !!participant;
  }

  async createOfficeCompetition(userId: string, competition: InsertOfficeCompetition): Promise<OfficeCompetition> {
    // Get user's office or default to sample office for now
    const user = await this.getUser(userId);
    const officeId = user?.officeId || 'sample-office';
    
    
    const [newCompetition] = await db
      .insert(officeCompetitions)
      .values({ ...competition, createdBy: userId, officeId })
      .returning();
    return newCompetition;
  }

  async joinCompetition(competitionId: string, userId: string): Promise<CompetitionParticipant> {
    // Insert the participant
    const [participant] = await db
      .insert(competitionParticipants)
      .values({ competitionId, userId, currentScore: '0' })
      .returning();
    
    // Update competition status to 'active' and increment participant count
    await db
      .update(officeCompetitions)
      .set({ 
        status: 'active', 
        participantCount: sql`${officeCompetitions.participantCount} + 1`,
        updatedAt: new Date()
      })
      .where(eq(officeCompetitions.id, competitionId));
    
    return participant;
  }

  async getCompetitionLeaderboard(competitionId: string): Promise<any[]> {
    return await db
      .select({
        id: competitionParticipants.id,
        userId: competitionParticipants.userId,
        currentScore: competitionParticipants.currentScore,
        rank: competitionParticipants.rank,
        joinedAt: competitionParticipants.joinedAt,
        userEmail: users.email,
        userName: sql<string>`COALESCE(${users.firstName} || ' ' || ${users.lastName}, ${users.email})`.as('userName')
      })
      .from(competitionParticipants)
      .leftJoin(users, eq(competitionParticipants.userId, users.id))
      .where(eq(competitionParticipants.competitionId, competitionId))
      .orderBy(desc(competitionParticipants.currentScore));
  }

  // GPS Location operations
  async getGpsLocations(userId: string, startDate?: string, endDate?: string): Promise<GpsLocation[]> {
    const whereConditions = [eq(gpsLocations.userId, userId)];
    
    if (startDate) {
      whereConditions.push(gte(gpsLocations.createdAt, new Date(startDate)));
    }
    if (endDate) {
      whereConditions.push(lte(gpsLocations.createdAt, new Date(endDate)));
    }
    
    return await db
      .select()
      .from(gpsLocations)
      .where(and(...whereConditions))
      .orderBy(desc(gpsLocations.createdAt));
  }

  async createGpsLocation(userId: string, location: InsertGpsLocation): Promise<GpsLocation> {
    const [newLocation] = await db
      .insert(gpsLocations)
      .values({ ...location, userId })
      .returning();
    return newLocation;
  }

  async getGpsInsights(userId: string, period: string): Promise<any> {
    // Mock GPS insights - in production would calculate from real GPS data
    return {
      totalMiles: 1245,
      averageDailyMiles: 62,
      mostVisitedAreas: ['Downtown', 'Suburban North', 'East Side'],
      timeOnRoad: 45, // hours
      fuelCosts: 287.50,
      co2Savings: 15.2, // kg from efficient routing
      routeOptimizationSavings: 23.5, // miles saved
      topDestinations: [
        { name: '123 Oak Street', visits: 12, totalTime: 4.5 },
        { name: '456 Pine Avenue', visits: 8, totalTime: 3.2 },
        { name: '789 Maple Drive', visits: 6, totalTime: 2.8 }
      ]
    };
  }

  // Notification operations
  async getNotifications(userId: string, unreadOnly?: boolean): Promise<Notification[]> {
    const whereConditions = [eq(notifications.userId, userId)];
    
    if (unreadOnly) {
      whereConditions.push(eq(notifications.isRead, false));
    }
    
    return await db
      .select()
      .from(notifications)
      .where(and(...whereConditions))
      .orderBy(desc(notifications.createdAt));
  }

  async createNotification(userId: string, notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values({ ...notification, userId })
      .returning();
    return newNotification;
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<Notification> {
    const [updatedNotification] = await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .returning();
    return updatedNotification;
  }

  // Market Intelligence operations
  async getMarketIntelligence(city?: string, state?: string, propertyType?: string): Promise<MarketIntelligence[]> {
    // Import the Redfin API service
    const { redfinAPI } = await import('./redfin-api');
    
    // Try to get fresh data from Redfin first
    if (city && state) {
      try {
        await redfinAPI.getMarketData(city, state);
      } catch (error) {
        console.log('Could not fetch fresh Redfin data, using cached data');
      }
    }

    // Query the database for cached data using simple queries to avoid SQL errors
    try {
      if (city && state) {
        // Simple query for city and state data
        return await db
          .select()
          .from(marketIntelligence)
          .where(eq(marketIntelligence.dataSource, 'redfin'))
          .orderBy(desc(marketIntelligence.lastUpdated))
          .limit(10);
      } else {
        return await db
          .select()
          .from(marketIntelligence)
          .orderBy(desc(marketIntelligence.lastUpdated))
          .limit(20);
      }
    } catch (error) {
      console.error('Database query error:', error);
      return [];
    }
  }

  async getMarketTimingIntelligence(city: string, state: string, zipcode?: string): Promise<any> {
    // Import the Redfin API service
    const { redfinAPI } = await import('./redfin-api');
    
    let realMarketData = null;
    let realDataInsights: string[] = [];
    let marketData = null;

    // Get real market data from Redfin
    try {
      marketData = await redfinAPI.getMarketData(city, state, zipcode);
      if (marketData) {
        const locationString = zipcode ? `${city}, ${state} (${zipcode})` : `${city}, ${state}`;
        realDataInsights.push(`📊 Redfin Market Data: ${locationString} median price $${marketData.medianPrice.toLocaleString()}`);
        realDataInsights.push(`⏱️ Average Days on Market: ${marketData.averageDaysOnMarket} days`);
        realDataInsights.push(`🏠 Price per Sq Ft: $${marketData.pricePerSqft.toLocaleString()}`);
        realDataInsights.push(`💰 Sale-to-List Ratio: ${(marketData.saleToListRatio * 100).toFixed(1)}%`);
        
        if (marketData.priceChange > 0) {
          realDataInsights.push(`📈 Price Trend: Up ${marketData.priceChange.toFixed(1)}% from last period`);
        } else if (marketData.priceChange < 0) {
          realDataInsights.push(`📉 Price Trend: Down ${Math.abs(marketData.priceChange).toFixed(1)}% from last period`);
        }

        if (marketData.inventoryCount < 30) {
          realDataInsights.push(`🔥 Low Inventory: Only ${marketData.inventoryCount} properties available - ${marketData.marketCondition.replace(/_/g, ' ')}`);
        } else if (marketData.inventoryCount > 80) {
          realDataInsights.push(`📦 High Inventory: ${marketData.inventoryCount} properties available - ${marketData.marketCondition.replace(/_/g, ' ')}`);
        } else {
          realDataInsights.push(`📈 Inventory Level: ${marketData.inventoryCount} properties - ${marketData.marketCondition.replace(/_/g, ' ')}`);
        }

        realDataInsights.push(`🏆 Competition Level: ${marketData.competitionLevel.toUpperCase()}`);
        realDataInsights.push(`📊 Recent Sales: ${marketData.soldProperties} properties sold`);
        realDataInsights.push(`🏗️ New Listings: ${marketData.newListings} properties added`);

        if (zipcode) {
          const zipcodeInfo = redfinAPI.getZipcodeInfo(zipcode);
          if (zipcodeInfo) {
            realDataInsights.push(`📍 Neighborhood: ${zipcodeInfo.description}`);
            realDataInsights.push(`🏘️ Area Type: ${zipcodeInfo.neighborhoodType.replace(/_/g, ' ')}`);
          }
        }
      }
    } catch (error) {
      console.error('Error getting Redfin market data:', error);
    }
    
    // If we have a zipcode, get real property data for enhanced AI strategies
    if (zipcode) {
      realMarketData = await this.getZipcodeMarketMetrics(zipcode);
      
      if (realMarketData && realMarketData.totalProperties > 0) {
        // Generate AI strategies based on real local data
        const { avgSoldPrice, avgListingPrice, avgDaysOnMarket, avgSaleToListRatio, 
                aboveAskingPercent, activeListings, soldProperties, recentSales } = realMarketData;
        
        // Price strategy insights
        if (avgSaleToListRatio > 1.02) {
          realDataInsights.push(`🔥 Hot Market Alert: Properties sell for ${((avgSaleToListRatio - 1) * 100).toFixed(1)}% above asking on average in ${city}`);
          realDataInsights.push(`💰 Pricing Strategy: Consider listing at asking price or slightly below to generate multiple offers`);
        } else if (avgSaleToListRatio < 0.95) {
          realDataInsights.push(`📉 Buyer's Market: Properties sell for ${((1 - avgSaleToListRatio) * 100).toFixed(1)}% below asking in ${city}`);
          realDataInsights.push(`💡 Pricing Strategy: Price realistically and be prepared to negotiate`);
        }
        
        // Days on market insights
        if (avgDaysOnMarket < 20 && avgDaysOnMarket > 0) {
          const daysDisplay = Math.max(1, Math.round(avgDaysOnMarket)); // Ensure minimum of 1 day
          realDataInsights.push(`⚡ Fast Sales: Properties average only ${daysDisplay} days on market - move quickly!`);
        } else if (avgDaysOnMarket > 60) {
          realDataInsights.push(`🐌 Slower Market: Properties average ${Math.round(avgDaysOnMarket)} days on market - focus on strong staging and marketing`);
        }
        
        // Competition insights
        if (aboveAskingPercent > 50) {
          realDataInsights.push(`🎯 Bidding Wars: ${aboveAskingPercent.toFixed(0)}% of sales go above asking - expect competition`);
        }
        
        // Inventory insights
        if (activeListings < 5) {
          realDataInsights.push(`📦 Low Inventory: Only ${activeListings} active listings - great time for sellers`);
        } else if (activeListings > 20) {
          realDataInsights.push(`🏪 High Inventory: ${activeListings} active listings - buyers have choices, price competitively`);
        }
        
        // Recent activity insights
        if (recentSales > 0) {
          const recentAvgPrice = realMarketData.recentAvgPrice;
          if (recentAvgPrice > avgSoldPrice * 1.05) {
            realDataInsights.push(`📈 Rising Prices: Recent sales ${((recentAvgPrice/avgSoldPrice - 1) * 100).toFixed(1)}% higher than historical average`);
          }
        }
        
        // Property type insights
        const topPropertyType = Object.entries(realMarketData.propertyTypes || {})
          .sort(([,a], [,b]) => (b as number) - (a as number))[0];
        
        if (topPropertyType) {
          realDataInsights.push(`🏠 Market Focus: ${topPropertyType[1]} ${topPropertyType[0].replace('_', ' ')} properties in local data`);
        }
        
        // Recent transaction examples
        if (realMarketData.sales?.recent?.length > 0) {
          const recentSale = realMarketData.sales.recent[0];
          realDataInsights.push(`📋 Recent Sale Example: ${recentSale.address} sold for $${recentSale.soldPrice.toLocaleString()} (${recentSale.saleToListRatio > 1 ? `${((recentSale.saleToListRatio - 1) * 100).toFixed(1)}% above` : `${((1 - recentSale.saleToListRatio) * 100).toFixed(1)}% below`} asking)`);
        }
        
        // Active listing examples  
        if (realMarketData.listings?.recent?.length > 0) {
          const recentListing = realMarketData.listings.recent[0];
          realDataInsights.push(`🏷️ Current Listing: ${recentListing.address} listed at $${recentListing.listingPrice.toLocaleString()} (${recentListing.daysOnMarket} days on market)`);
        }
      }
    }
    
    // Combine real insights with general market timing recommendations
    const baseRecommendations = [
      'List in March-May for fastest sales',
      'Avoid December-January listings',
      'Focus on staging and photography in current market'
    ];
    
    // Add real data recommendations if available
    const allRecommendations = realDataInsights.length > 0 
      ? [...realDataInsights, ...baseRecommendations]
      : baseRecommendations;
    
    return {
      bestListingMonths: ['March', 'April', 'May', 'September'],
      worstListingMonths: ['November', 'December', 'January'],
      averageDaysOnMarket: marketData ? {
        actual: marketData.averageDaysOnMarket,
        spring: Math.max(marketData.averageDaysOnMarket - 10, 5),
        summer: Math.max(marketData.averageDaysOnMarket - 5, 8),
        fall: marketData.averageDaysOnMarket + 5,
        winter: marketData.averageDaysOnMarket + 15
      } : realMarketData ? {
        actual: Math.round(realMarketData.avgDaysOnMarket),
        spring: 23,
        summer: 28,
        fall: 35,
        winter: 42
      } : {
        spring: 23,
        summer: 28,
        fall: 35,
        winter: 42
      },
      priceAppreciation: {
        quarterly: marketData ? marketData.priceChange / 4 : 2.3,
        yearly: marketData ? marketData.priceChange : 8.7,
        trend: marketData ? (marketData.priceChange > 5 ? 'rapidly_rising' : marketData.priceChange > 0 ? 'rising' : 'declining') : 'rising',
        local: realMarketData ? realMarketData.priceAppreciationLastSixMonths : null
      },
      marketConditions: {
        current: marketData ? marketData.marketCondition : 
          (realMarketData && realMarketData.avgSaleToListRatio > 1.0 ? 'seller_market' : 'balanced_market'),
        inventoryMonths: marketData ? (marketData.inventoryCount / 30) : 2.1,
        competitionLevel: marketData ? marketData.competitionLevel :
          (realMarketData && realMarketData.aboveAskingPercent > 40 ? 'high' : 'medium'),
        activeListings: marketData ? marketData.inventoryCount : (realMarketData ? realMarketData.activeListings : null),
        averageSaleToListRatio: realMarketData ? realMarketData.avgSaleToListRatio : null,
        medianPrice: marketData ? marketData.medianPrice : null,
        pricePerSqft: marketData ? marketData.pricePerSqft : null
      },
      localData: realMarketData ? {
        totalProperties: realMarketData.totalProperties,
        recentSales: realMarketData.recentSales,
        avgListingPrice: realMarketData.avgListingPrice,
        avgSoldPrice: realMarketData.avgSoldPrice,
        examples: {
          sales: realMarketData.sales?.recent?.slice(0, 3) || [],
          listings: realMarketData.listings?.recent?.slice(0, 3) || []
        }
      } : null,
      recommendations: allRecommendations,
      dataSource: realMarketData ? 'local_property_data' : 'market_averages'
    };
  }

  // Automation operations
  async processAutomationTrigger(userId: string, event: string, entityId: string, entityType: string): Promise<any> {
    const automatedTasks: any[] = [];
    
    // Process different automation triggers
    switch (event) {
      case 'property_under_contract':
        // Create deadline tasks for contract milestones
        if (entityType === 'property') {
          const deadlineTasks = [
            { type: 'inspection', days: 7, title: 'Schedule Inspection' },
            { type: 'appraisal', days: 14, title: 'Order Appraisal' },
            { type: 'financing', days: 21, title: 'Finalize Financing' },
            { type: 'earnest_money', days: 3, title: 'Collect Earnest Money' }
          ];
          
          for (const task of deadlineTasks) {
            const dueDate = new Date();
            dueDate.setDate(dueDate.getDate() + task.days);
            
            const newTask = await this.createSmartTask(userId, {
              title: task.title,
              description: `Automated reminder for ${entityType} ${entityId}`,
              priority: 'high',
              dueDate,
              isAutomated: true,
              propertyId: entityId,
              triggerCondition: JSON.stringify({ event, entityId, entityType })
            });
            automatedTasks.push(newTask);
          }
        }
        break;
        
      case 'showing_scheduled':
        // Create follow-up task
        const followUpDate = new Date();
        followUpDate.setHours(followUpDate.getHours() + 24);
        
        const followUpTask = await this.createSmartTask(userId, {
          title: 'Follow up on showing feedback',
          description: `Follow up with client after showing at ${entityId}`,
          priority: 'medium',
          dueDate: followUpDate,
          isAutomated: true,
          triggerCondition: JSON.stringify({ event, entityId, entityType })
        });
        automatedTasks.push(followUpTask);
        break;
        
      case 'new_lead':
        // Create lead nurturing tasks
        const contactDate = new Date();
        contactDate.setHours(contactDate.getHours() + 2);
        
        const contactTask = await this.createSmartTask(userId, {
          title: 'Contact new lead within 2 hours',
          description: `Reach out to new lead: ${entityId}`,
          priority: 'urgent',
          dueDate: contactDate,
          isAutomated: true,
          triggerCondition: JSON.stringify({ event, entityId, entityType })
        });
        automatedTasks.push(contactTask);
        break;
    }
    
    return { 
      tasksCreated: automatedTasks.length,
      tasks: automatedTasks,
      message: `Created ${automatedTasks.length} automated tasks for ${event} event`
    };
  }

  // Personalized Insights methods
  async getPersonalizedInsights(userId: string, includeArchived: boolean = false): Promise<PersonalizedInsight[]> {
    let baseQuery = db.select()
      .from(personalizedInsights)
      .where(eq(personalizedInsights.userId, userId))
      .orderBy(desc(personalizedInsights.generatedAt));
    
    if (!includeArchived) {
      baseQuery = baseQuery.where(and(
        eq(personalizedInsights.userId, userId),
        eq(personalizedInsights.isArchived, false)
      )) as any;
    }
    
    return await baseQuery;
  }

  async createPersonalizedInsights(insights: InsertPersonalizedInsight[]): Promise<PersonalizedInsight[]> {
    if (insights.length === 0) return [];
    
    return await db.insert(personalizedInsights)
      .values(insights)
      .returning();
  }

  async markInsightAsViewed(userId: string, insightId: string): Promise<PersonalizedInsight> {
    const [insight] = await db.update(personalizedInsights)
      .set({ isViewed: true, updatedAt: new Date() })
      .where(and(
        eq(personalizedInsights.id, insightId),
        eq(personalizedInsights.userId, userId)
      ))
      .returning();
    return insight;
  }

  async archiveInsight(userId: string, insightId: string): Promise<PersonalizedInsight> {
    const [insight] = await db.update(personalizedInsights)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(and(
        eq(personalizedInsights.id, insightId),
        eq(personalizedInsights.userId, userId)
      ))
      .returning();
    return insight;
  }

  async getPersonalizedInsightsCount(userId: string): Promise<{ active: number; unviewed: number; highPriority: number; archived: number; }> {
    const activeResult = await db.select({ count: sql<number>`count(*)` })
      .from(personalizedInsights)
      .where(and(
        eq(personalizedInsights.userId, userId),
        eq(personalizedInsights.isArchived, false)
      ));
    
    const unviewedResult = await db.select({ count: sql<number>`count(*)` })
      .from(personalizedInsights)
      .where(and(
        eq(personalizedInsights.userId, userId),
        eq(personalizedInsights.isViewed, false),
        eq(personalizedInsights.isArchived, false)
      ));
    
    const highPriorityResult = await db.select({ count: sql<number>`count(*)` })
      .from(personalizedInsights)
      .where(and(
        eq(personalizedInsights.userId, userId),
        eq(personalizedInsights.priority, 'high'),
        eq(personalizedInsights.isArchived, false)
      ));
    
    const archivedResult = await db.select({ count: sql<number>`count(*)` })
      .from(personalizedInsights)
      .where(and(
        eq(personalizedInsights.userId, userId),
        eq(personalizedInsights.isArchived, true)
      ));
    
    return {
      active: activeResult[0]?.count || 0,
      unviewed: unviewedResult[0]?.count || 0,
      highPriority: highPriorityResult[0]?.count || 0,
      archived: archivedResult[0]?.count || 0,
    };
  }

  async getActiveInsightsCount(userId: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(personalizedInsights)
      .where(and(
        eq(personalizedInsights.userId, userId),
        eq(personalizedInsights.isArchived, false),
        eq(personalizedInsights.isViewed, false)
      ));
    
    return result[0]?.count || 0;
  }

  // Feature Request operations
  async createFeatureRequest(featureRequest: InsertFeatureRequest): Promise<FeatureRequest> {
    const [request] = await db
      .insert(featureRequests)
      .values(featureRequest)
      .returning();
    return request;
  }

  async getFeatureRequests(): Promise<FeatureRequest[]> {
    return await db
      .select()
      .from(featureRequests)
      .orderBy(desc(featureRequests.createdAt));
  }

  async updateFeatureRequestStatus(id: string, status: string): Promise<FeatureRequest> {
    const [request] = await db
      .update(featureRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(featureRequests.id, id))
      .returning();
    return request;
  }

  // MLS Settings operations
  async getMLSSettings(userId: string): Promise<MLSSetting | undefined> {
    const [settings] = await db
      .select()
      .from(mlsSettings)
      .where(eq(mlsSettings.userId, userId));
    return settings;
  }

  async upsertMLSSettings(userId: string, settings: Omit<InsertMLSSetting, 'userId'>): Promise<MLSSetting> {
    const [mlsSetting] = await db
      .insert(mlsSettings)
      .values({ ...settings, userId })
      .onConflictDoUpdate({
        target: mlsSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return mlsSetting;
  }

  async deleteMLSSettings(userId: string): Promise<void> {
    await db
      .delete(mlsSettings)
      .where(eq(mlsSettings.userId, userId));
  }

  // Learning System operations
  async getLearningPaths(): Promise<LearningPath[]> {
    return await db
      .select()
      .from(learningPaths)
      .where(eq(learningPaths.isActive, true))
      .orderBy(asc(learningPaths.sortOrder));
  }

  async getLearningPath(id: string): Promise<LearningPath | undefined> {
    const [path] = await db
      .select()
      .from(learningPaths)
      .where(eq(learningPaths.id, id));
    return path;
  }

  async getCoursesByPath(learningPathId: string): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(and(
        eq(courses.learningPathId, learningPathId),
        eq(courses.isActive, true)
      ))
      .orderBy(asc(courses.sortOrder));
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db
      .select()
      .from(courses)
      .where(eq(courses.id, id));
    return course;
  }

  async getLessonsByCourse(courseId: string): Promise<Lesson[]> {
    return await db
      .select()
      .from(lessons)
      .where(and(
        eq(lessons.courseId, courseId),
        eq(lessons.isActive, true)
      ))
      .orderBy(asc(lessons.sortOrder));
  }

  async getLesson(id: string): Promise<Lesson | undefined> {
    const [lesson] = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, id));
    return lesson;
  }

  // User Progress operations
  async getUserLearningProgress(userId: string): Promise<UserLearningProgress[]> {
    return await db
      .select()
      .from(userLearningProgress)
      .where(eq(userLearningProgress.userId, userId))
      .orderBy(desc(userLearningProgress.lastAccessedAt));
  }

  async getUserLearningPathProgress(userId: string, learningPathId: string): Promise<UserLearningProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userLearningProgress)
      .where(and(
        eq(userLearningProgress.userId, userId),
        eq(userLearningProgress.learningPathId, learningPathId)
      ));
    return progress;
  }

  async getUserCourseProgress(userId: string, courseId: string): Promise<UserCourseProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userCourseProgress)
      .where(and(
        eq(userCourseProgress.userId, userId),
        eq(userCourseProgress.courseId, courseId)
      ));
    return progress;
  }

  async getUserLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress | undefined> {
    const [progress] = await db
      .select()
      .from(userLessonProgress)
      .where(and(
        eq(userLessonProgress.userId, userId),
        eq(userLessonProgress.lessonId, lessonId)
      ));
    return progress;
  }

  async startLearningPath(userId: string, learningPathId: string): Promise<UserLearningProgress> {
    const [progress] = await db
      .insert(userLearningProgress)
      .values({
        userId,
        learningPathId,
        status: 'in_progress',
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userLearningProgress.userId, userLearningProgress.learningPathId],
        set: {
          status: 'in_progress',
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  async startCourse(userId: string, courseId: string): Promise<UserCourseProgress> {
    const [progress] = await db
      .insert(userCourseProgress)
      .values({
        userId,
        courseId,
        status: 'in_progress',
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userCourseProgress.userId, userCourseProgress.courseId],
        set: {
          status: 'in_progress',
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  async startLesson(userId: string, lessonId: string): Promise<UserLessonProgress> {
    const [progress] = await db
      .insert(userLessonProgress)
      .values({
        userId,
        lessonId,
        status: 'in_progress',
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userLessonProgress.userId, userLessonProgress.lessonId],
        set: {
          status: 'in_progress',
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();
    return progress;
  }

  async completeLesson(userId: string, lessonId: string, timeSpent: number, quizScore?: number, maxScore?: number): Promise<UserLessonProgress> {
    const existingProgress = await this.getUserLessonProgress(userId, lessonId);
    const totalTimeSpent = (existingProgress?.timeSpent || 0) + timeSpent;

    const [progress] = await db
      .insert(userLessonProgress)
      .values({
        userId,
        lessonId,
        status: 'completed',
        timeSpent: totalTimeSpent,
        quizScore,
        maxScore,
        attempts: (existingProgress?.attempts || 0) + 1,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userLessonProgress.userId, userLessonProgress.lessonId],
        set: {
          status: 'completed',
          timeSpent: totalTimeSpent,
          quizScore,
          maxScore,
          attempts: sql`${userLessonProgress.attempts} + 1`,
          completedAt: new Date(),
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    // Update learning streak
    await this.updateLearningStreak(userId);

    return progress;
  }

  async updateLessonProgress(userId: string, lessonId: string, timeSpent: number, notes?: string): Promise<UserLessonProgress> {
    const existingProgress = await this.getUserLessonProgress(userId, lessonId);
    const totalTimeSpent = (existingProgress?.timeSpent || 0) + timeSpent;

    const [progress] = await db
      .insert(userLessonProgress)
      .values({
        userId,
        lessonId,
        status: 'in_progress',
        timeSpent: totalTimeSpent,
        notes,
        lastAccessedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [userLessonProgress.userId, userLessonProgress.lessonId],
        set: {
          timeSpent: totalTimeSpent,
          notes,
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        },
      })
      .returning();

    return progress;
  }

  async getLearningStreak(userId: string): Promise<LearningStreak | undefined> {
    const [streak] = await db
      .select()
      .from(learningStreaks)
      .where(eq(learningStreaks.userId, userId));
    return streak;
  }

  async updateLearningStreak(userId: string): Promise<LearningStreak> {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const existingStreak = await this.getLearningStreak(userId);
    
    if (!existingStreak) {
      const [streak] = await db
        .insert(learningStreaks)
        .values({
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastActivityDate: today,
          isActive: true,
        })
        .returning();
      return streak;
    }

    const lastActivityDate = existingStreak.lastActivityDate;
    let newCurrentStreak = existingStreak.currentStreak;
    
    if (lastActivityDate === yesterday) {
      // Continue streak
      newCurrentStreak = existingStreak.currentStreak + 1;
    } else if (lastActivityDate !== today) {
      // Reset streak if more than 1 day gap
      newCurrentStreak = 1;
    }

    const newLongestStreak = Math.max(existingStreak.longestStreak, newCurrentStreak);

    const [streak] = await db
      .update(learningStreaks)
      .set({
        currentStreak: newCurrentStreak,
        longestStreak: newLongestStreak,
        lastActivityDate: today,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(learningStreaks.userId, userId))
      .returning();

    return streak;
  }

  // Learning Achievements
  async getLearningAchievements(): Promise<LearningAchievement[]> {
    return await db
      .select()
      .from(learningAchievements)
      .where(eq(learningAchievements.isActive, true))
      .orderBy(asc(learningAchievements.pointsReward));
  }

  async getUserLearningAchievements(userId: string): Promise<UserLearningAchievement[]> {
    return await db
      .select()
      .from(userLearningAchievements)
      .where(eq(userLearningAchievements.userId, userId))
      .orderBy(desc(userLearningAchievements.unlockedAt));
  }

  async checkLearningAchievements(userId: string): Promise<UserLearningAchievement[]> {
    // This would contain logic to check and award new achievements
    // For now, return empty array - will be implemented with specific achievement logic
    return [];
  }

  // Feedback operations
  async getAllFeedback(): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .orderBy(desc(feedback.createdAt));
  }

  async getUserFeedback(userId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(desc(feedback.createdAt));
  }

  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [newFeedback] = await db.insert(feedback).values(feedbackData).returning();
    return newFeedback;
  }

  async updateFeedback(id: string, updates: Partial<InsertFeedback>): Promise<Feedback> {
    const [updatedFeedback] = await db
      .update(feedback)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(feedback.id, id))
      .returning();
    return updatedFeedback;
  }

  async getFeedbackUpdates(feedbackId: string): Promise<FeedbackUpdate[]> {
    return await db
      .select()
      .from(feedbackUpdates)
      .where(eq(feedbackUpdates.feedbackId, feedbackId))
      .orderBy(desc(feedbackUpdates.createdAt));
  }

  async createFeedbackUpdate(updateData: InsertFeedbackUpdate): Promise<FeedbackUpdate> {
    const [newUpdate] = await db.insert(feedbackUpdates).values(updateData).returning();
    return newUpdate;
  }

  // Admin-specific methods
  async getUserCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(users);
    return result[0]?.count || 0;
  }

  async getActiveUserCount(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const result = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.updatedAt, thirtyDaysAgo));
    
    return result[0]?.count || 0;
  }

  async getTotalPropertiesCount(): Promise<number> {
    const result = await db.select({ count: count() }).from(properties);
    return result[0]?.count || 0;
  }

  async getTotalPlatformRevenue(): Promise<number> {
    const result = await db
      .select({ total: sql<number>`sum(${commissions.amount}::numeric)` })
      .from(commissions);
    
    return Number(result[0]?.total) || 0;
  }

  async getDatabaseSize(): Promise<string> {
    try {
      // This is a simplified version - actual implementation would depend on database type
      return "~50MB"; // Placeholder
    } catch (error) {
      return "Unknown";
    }
  }

  async getLastBackupDate(): Promise<string> {
    // Placeholder - in real implementation, this would check actual backup system
    return "2025-09-01";
  }

  async getAllUsersWithStats(): Promise<any[]> {
    const usersWithStats = await db
      .select({
        id: users.id,
        email: users.email,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        propertyCount: count(properties.id),
        totalRevenue: sql<number>`sum(${commissions.amount}::numeric)`
      })
      .from(users)
      .leftJoin(properties, eq(users.id, properties.userId))
      .leftJoin(commissions, eq(users.id, commissions.userId))
      .groupBy(users.id, users.email, users.createdAt, users.updatedAt);

    return usersWithStats.map(user => ({
      id: user.id,
      email: user.email,
      plan: 'starter', // Placeholder - would be stored in user table
      properties: user.propertyCount || 0,
      lastActive: user.updatedAt?.toISOString().split('T')[0] || 'Never',
      totalRevenue: Number(user.totalRevenue) || 0
    }));
  }

  async upgradeUserPlan(userId: string, plan: string): Promise<void> {
    // Placeholder - in real implementation, this would update user plan in database
    console.log(`Upgrading user ${userId} to ${plan} plan`);
  }

  async suspendUser(userId: string): Promise<void> {
    // Placeholder - in real implementation, this would set user as suspended
    console.log(`Suspending user ${userId}`);
  }

  async activateUser(userId: string): Promise<void> {
    // Placeholder - in real implementation, this would activate suspended user
    console.log(`Activating user ${userId}`);
  }

  async resetUserPassword(userId: string): Promise<void> {
    // Placeholder - in real implementation, this would trigger password reset
    console.log(`Resetting password for user ${userId}`);
  }

  async runMaintenance(): Promise<void> {
    // Placeholder - in real implementation, this would run database maintenance tasks
    console.log('Running database maintenance...');
  }

  async testConnection(): Promise<void> {
    // Test database connection
    await db.select({ test: sql`1` });
  }
}

export const storage = new DatabaseStorage();
