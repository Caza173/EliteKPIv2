import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  date,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table - required for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Admin and subscription fields
  isAdmin: boolean("is_admin").default(false),
  isActive: boolean("is_active").default(true),
  subscriptionStatus: varchar("subscription_status").default('trial'), // trial, active, canceled, suspended
  subscriptionId: varchar("subscription_id"),
  customerId: varchar("customer_id"),
  // Stripe fields
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  // User defaults for calculations
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }).default('75.00'),
  vehicleMpg: decimal("vehicle_mpg", { precision: 5, scale: 2 }).default('25.00'),
  avgGasPrice: decimal("avg_gas_price", { precision: 5, scale: 2 }).default('3.50'),
  defaultCommissionSplit: decimal("default_commission_split", { precision: 5, scale: 2 }).default('70.00'),
  // GPS and location settings
  enableGpsTracking: boolean("enable_gps_tracking").default(false),
  // Notification preferences
  emailNotifications: boolean("email_notifications").default(true),
  smsNotifications: boolean("sms_notifications").default(false),
  phoneNumber: varchar("phone_number", { length: 20 }),
  // Office information
  officeId: varchar("office_id"),
  officeName: varchar("office_name"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const representationTypeEnum = pgEnum('representation_type', ['buyer_rep', 'seller_rep']);
export const propertyStatusEnum = pgEnum('property_status', [
  'in_progress', 'listed', 'offer_written', 'active_under_contract', 'pending', 'closed', 'lost_deal', 'withdrawn', 'expired', 'terminated'
]);
export const propertyTypeEnum = pgEnum('property_type', ['single_family', 'condo', 'townhouse', 'multi_family', 'land', 'commercial']);
export const leadSourceEnum = pgEnum('lead_source', [
  'referral', 'soi', 'online', 'sign_call', 'open_house', 'cold_call', 'social_media', 'advertising',
  'agent_referral', 'homelight', 'zillow', 'opcity', 'upnest', 'facebook', 'instagram', 'direct_mail', 'other'
]);
export const expenseCategoryEnum = pgEnum('expense_category', [
  'marketing', 'gas', 'mileage', 'meals', 'supplies', 'professional_services', 'education', 'other'
]);
export const activityTypeEnum = pgEnum('activity_type', [
  'showing', 'inspection', 'appraisal', 'buyer_meeting', 'seller_meeting', 'closing',
  'client_call', 'call_answered', 'buyer_appointment', 'listing_appointment', 
  'buyer_signed', 'listing_taken', 'offer_written', 'offer_accepted', 'cma_completed'
]);
export const commissionTypeEnum = pgEnum('commission_type', ['buyer_side', 'seller_side', 'referral']);
export const cmaStatusEnum = pgEnum('cma_status', ['active', 'completed', 'presented', 'converted_to_listing', 'rejected', 'did_not_convert']);
export const goalPeriodEnum = pgEnum('goal_period', ['daily', 'weekly', 'monthly']);
export const taskPriorityEnum = pgEnum('task_priority', ['low', 'medium', 'high', 'urgent']);
export const taskStatusEnum = pgEnum('task_status', ['pending', 'in_progress', 'completed', 'cancelled']);
export const competitionTypeEnum = pgEnum('competition_type', ['sales_volume', 'commission_earned', 'properties_closed', 'activities_completed', 'hours_logged', 'revenue_target']);
export const competitionStatusEnum = pgEnum('competition_status', ['active', 'upcoming', 'completed', 'cancelled']);
export const deadlineTypeEnum = pgEnum('deadline_type', ['inspection', 'appraisal', 'financing', 'earnest_money', 'closing', 'contingency_removal']);
export const notificationMethodEnum = pgEnum('notification_method', ['email', 'sms', 'push', 'in_app']);
export const feedbackTypeEnum = pgEnum('feedback_type', ['general', 'bug_report', 'feature_request', 'improvement_suggestion', 'performance_issue']);
export const feedbackStatusEnum = pgEnum('feedback_status', ['open', 'in_progress', 'resolved', 'closed', 'declined']);
export const feedbackPriorityEnum = pgEnum('feedback_priority', ['low', 'medium', 'high', 'urgent']);

// Properties table
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zip_code", { length: 10 }),
  representationType: representationTypeEnum("representation_type").notNull(),
  status: propertyStatusEnum("status").default('in_progress'),
  propertyType: propertyTypeEnum("property_type"),
  bedrooms: integer("bedrooms"),
  bathrooms: decimal("bathrooms", { precision: 3, scale: 1 }),
  squareFeet: integer("square_feet"),
  listingPrice: decimal("listing_price", { precision: 12, scale: 2 }),
  offerPrice: decimal("offer_price", { precision: 12, scale: 2 }),
  acceptedPrice: decimal("accepted_price", { precision: 12, scale: 2 }),
  soldPrice: decimal("sold_price", { precision: 12, scale: 2 }),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  clientName: varchar("client_name", { length: 200 }),
  leadSource: leadSourceEnum("lead_source"),
  listingDate: date("listing_date"),
  soldDate: date("sold_date"),
  daysOnMarket: integer("days_on_market"),
  // Agreement tracking for conversion rates
  buyerAgreementDate: date("buyer_agreement_date"),
  sellerAgreementDate: date("seller_agreement_date"), 
  lossReason: text("loss_reason"),
  notes: text("notes"),
  imageUrl: varchar("image_url"),
  referralFee: decimal("referral_fee", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Commissions table
export const commissions = pgTable("commissions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'cascade' }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  commissionRate: decimal("commission_rate", { precision: 5, scale: 2 }),
  type: commissionTypeEnum("type").notNull(),
  dateEarned: date("date_earned").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'set null' }),
  category: expenseCategoryEnum("category").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  notes: text("notes"),
  receiptUrl: varchar("receipt_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Time Entries table
export const timeEntries = pgTable("time_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'set null' }),
  activity: varchar("activity", { length: 200 }).notNull(),
  hours: decimal("hours", { precision: 5, scale: 2 }).notNull(),
  date: date("date").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activities table (for goal tracking and performance metrics)
export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'set null' }),
  type: activityTypeEnum("type").notNull(),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activity Actuals table (daily totals for goal comparison)
export const activityActuals = pgTable("activity_actuals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  calls: integer("calls").default(0),
  appointments: integer("appointments").default(0),
  sellerAppts: integer("seller_appts").default(0),
  buyerAppts: integer("buyer_appts").default(0),
  appointmentsSet: integer("appointments_set").default(0),
  cmasCompleted: integer("cmas_completed").default(0),
  hoursWorked: decimal("hours_worked", { precision: 5, scale: 2 }).default('0'),
  offersWritten: integer("offers_written").default(0),
  showings: integer("showings").default(0),
  buyersSignedUp: integer("buyers_signed_up").default(0),
  listingsSigned: integer("listings_signed").default(0),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("activity_actuals_user_date_idx").on(table.userId, table.date),
]);

// Efficiency Scores table (historical efficiency tracking)
export const efficiencyScores = pgTable("efficiency_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  date: date("date").notNull(),
  overallScore: integer("overall_score").notNull(),
  callsScore: decimal("calls_score", { precision: 5, scale: 2 }),
  appointmentsScore: decimal("appointments_score", { precision: 5, scale: 2 }),
  hoursScore: decimal("hours_score", { precision: 5, scale: 2 }),
  cmasScore: decimal("cmas_score", { precision: 5, scale: 2 }),
  scoreBreakdown: jsonb("score_breakdown"), // Store detailed breakdown
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  index("efficiency_scores_user_date_idx").on(table.userId, table.date),
]);

// CMAs table
export const cmas = pgTable("cmas", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'set null' }),
  address: text("address").notNull(),
  suggestedListPrice: decimal("suggested_list_price", { precision: 12, scale: 2 }),
  lowEstimate: decimal("low_estimate", { precision: 12, scale: 2 }),
  highEstimate: decimal("high_estimate", { precision: 12, scale: 2 }),
  status: cmaStatusEnum("status").default('active'),
  notes: text("notes"),
  comparables: text("comparables"),
  dateCompleted: date("date_completed"),
  datePresentedToClient: date("date_presented_to_client"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Showings table
export const showings = pgTable("showings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'set null' }),
  propertyAddress: text("property_address").notNull(),
  clientName: varchar("client_name", { length: 200 }),
  date: date("date").notNull(),
  interestLevel: integer("interest_level"), // 1-5 scale
  durationMinutes: integer("duration_minutes"),
  milesDriven: decimal("miles_driven", { precision: 8, scale: 2 }),
  gasCost: decimal("gas_cost", { precision: 8, scale: 2 }),
  hoursSpent: decimal("hours_spent", { precision: 5, scale: 2 }),
  feedback: text("feedback"),
  internalNotes: text("internal_notes"),
  followUpRequired: boolean("follow_up_required").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Mileage Log table
export const mileageLogs = pgTable("mileage_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'set null' }),
  date: date("date").notNull(),
  startLocation: varchar("start_location", { length: 300 }),
  endLocation: varchar("end_location", { length: 300 }),
  miles: decimal("miles", { precision: 8, scale: 2 }).notNull(),
  driveTime: varchar("drive_time", { length: 100 }), // e.g., "45 mins", "1 hour 20 mins"
  gasCost: decimal("gas_cost", { precision: 8, scale: 2 }),
  purpose: text("purpose"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals table
export const goals = pgTable("goals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  period: goalPeriodEnum("period").notNull(),
  calls: integer("calls"),
  appointments: integer("appointments"),
  cmas: integer("cmas"),
  hours: decimal("hours", { precision: 5, scale: 2 }),
  offersToWrite: integer("offers_to_write"),
  monthlyClosings: integer("monthly_closings"),
  isLocked: boolean("is_locked").default(false),
  effectiveDate: date("effective_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Referrals table
export const referrals = pgTable("referrals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  referrerId: varchar("referrer_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  refereeEmail: varchar("referee_email", { length: 255 }).notNull(),
  refereeName: varchar("referee_name", { length: 255 }),
  referralCode: varchar("referral_code", { length: 10 }).unique().notNull(),
  status: varchar("status", { length: 20 }).default('pending'), // pending, signed_up, subscribed
  rewardClaimed: boolean("reward_claimed").default(false),
  inviteSentAt: timestamp("invite_sent_at").defaultNow(),
  signUpAt: timestamp("sign_up_at"),
  subscriptionAt: timestamp("subscription_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Smart Tasks table
export const smartTasks = pgTable("smart_tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  priority: taskPriorityEnum("priority").default('medium'),
  status: taskStatusEnum("status").default('pending'),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  automatedReminder: boolean("automated_reminder").default(true),
  reminderSent: boolean("reminder_sent").default(false),
  reminder30minSent: boolean("reminder_30min_sent").default(false),
  reminder10minSent: boolean("reminder_10min_sent").default(false),
  reminder5minSent: boolean("reminder_5min_sent").default(false),
  reminderDueSent: boolean("reminder_due_sent").default(false),
  reminder5minOverdueSent: boolean("reminder_5min_overdue_sent").default(false),
  tags: varchar("tags", { length: 500 }), // comma-separated tags
  isAutomated: boolean("is_automated").default(false), // true if created by automation
  triggerCondition: text("trigger_condition"), // JSON condition that triggered this task
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Property Deadlines table
export const propertyDeadlines = pgTable("property_deadlines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: deadlineTypeEnum("type").notNull(),
  dueDate: date("due_date").notNull(),
  description: text("description"),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
  reminderDays: integer("reminder_days").default(3), // days before to send reminder
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Office Competitions table
export const officeCompetitions = pgTable("office_competitions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  officeId: varchar("office_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: competitionTypeEnum("type").notNull(),
  status: competitionStatusEnum("status").default('upcoming'),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  targetValue: decimal("target_value", { precision: 12, scale: 2 }),
  prize: text("prize"),
  rules: text("rules"),
  winnerId: varchar("winner_id").references(() => users.id),
  participantCount: integer("participant_count").default(0),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Competition Participants table
export const competitionParticipants = pgTable("competition_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  competitionId: varchar("competition_id").notNull().references(() => officeCompetitions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  currentScore: decimal("current_score", { precision: 12, scale: 2 }).default('0'),
  rank: integer("rank"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// GPS Locations table
export const gpsLocations = pgTable("gps_locations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'set null' }),
  latitude: decimal("latitude", { precision: 10, scale: 7 }).notNull(),
  longitude: decimal("longitude", { precision: 10, scale: 7 }).notNull(),
  address: text("address"),
  activityType: varchar("activity_type", { length: 100 }), // showing, inspection, meeting, etc
  arrivalTime: timestamp("arrival_time"),
  departureTime: timestamp("departure_time"),
  durationMinutes: integer("duration_minutes"),
  autoDetected: boolean("auto_detected").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // deadline, task, achievement, etc
  method: notificationMethodEnum("method").notNull(),
  isRead: boolean("is_read").default(false),
  sentAt: timestamp("sent_at"),
  scheduledFor: timestamp("scheduled_for"),
  relatedEntityId: varchar("related_entity_id"), // ID of property, task, etc
  relatedEntityType: varchar("related_entity_type", { length: 50 }), // property, task, deadline
  createdAt: timestamp("created_at").defaultNow(),
});

// Market Intelligence table
export const marketIntelligence = pgTable("market_intelligence", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 2 }).notNull(),
  zipCode: varchar("zip_code", { length: 10 }),
  propertyType: propertyTypeEnum("property_type").notNull(),
  avgDaysOnMarket: integer("avg_days_on_market"),
  medianListPrice: decimal("median_list_price", { precision: 12, scale: 2 }),
  medianSoldPrice: decimal("median_sold_price", { precision: 12, scale: 2 }),
  inventoryLevel: integer("inventory_level"), // months of supply
  pricePerSquareFoot: decimal("price_per_square_foot", { precision: 8, scale: 2 }),
  saleToListRatio: decimal("sale_to_list_ratio", { precision: 5, scale: 4 }),
  bestListingMonths: varchar("best_listing_months", { length: 100 }), // "March,April,May"
  marketTrend: varchar("market_trend", { length: 20 }), // rising, stable, declining
  lastUpdated: timestamp("last_updated").defaultNow(),
  dataSource: varchar("data_source", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Personalized Insights table
export const personalizedInsights = pgTable("personalized_insights", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  insightType: varchar("insight_type").notNull(), // 'market_opportunity', 'performance_improvement', 'business_growth', 'efficiency'
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").default('medium'), // 'high', 'medium', 'low'
  category: varchar("category").notNull(), // 'pricing', 'marketing', 'prospecting', 'operations', 'client_relations'
  actionableSteps: jsonb("actionable_steps"), // Array of specific steps user can take
  metrics: jsonb("metrics"), // Supporting data/metrics that led to this insight
  confidence: integer("confidence").default(85), // 0-100 confidence score in recommendation
  potentialImpact: varchar("potential_impact"), // 'high', 'medium', 'low' expected business impact
  timeframe: varchar("timeframe").default('30_days'), // 'immediate', '7_days', '30_days', '90_days', '1_year'
  isViewed: boolean("is_viewed").default(false),
  isArchived: boolean("is_archived").default(false),
  generatedAt: timestamp("generated_at").defaultNow(),
  validUntil: timestamp("valid_until"), // When this insight becomes stale
  marketData: jsonb("market_data"), // Market conditions used to generate insight
  performanceData: jsonb("performance_data"), // User performance data used
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feedback table for user feedback and complaints
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: feedbackTypeEnum("type").notNull(),
  subject: varchar("subject", { length: 200 }).notNull(),
  description: text("description").notNull(),
  status: feedbackStatusEnum("status").default('open'),
  priority: feedbackPriorityEnum("priority").default('medium'),
  assignedToId: varchar("assigned_to_id").references(() => users.id, { onDelete: 'set null' }),
  resolution: text("resolution"),
  userEmail: varchar("user_email", { length: 255 }),
  userName: varchar("user_name", { length: 255 }),
  browserInfo: text("browser_info"),
  pageUrl: varchar("page_url", { length: 500 }),
  attachmentUrls: jsonb("attachment_urls"), // Array of file URLs
  adminNotes: text("admin_notes"),
  resolvedAt: timestamp("resolved_at"),
  resolvedById: varchar("resolved_by_id").references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Feedback Updates table for tracking status changes and communication
export const feedbackUpdates = pgTable("feedback_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  feedbackId: varchar("feedback_id").notNull().references(() => feedback.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  updateType: varchar("update_type", { length: 50 }).notNull(), // 'status_change', 'comment', 'assignment', 'resolution'
  oldValue: varchar("old_value", { length: 200 }),
  newValue: varchar("new_value", { length: 200 }),
  comment: text("comment"),
  isInternal: boolean("is_internal").default(false), // true for admin notes, false for user-visible updates
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  commissions: many(commissions),
  expenses: many(expenses),
  timeEntries: many(timeEntries),
  activities: many(activities),
  activityActuals: many(activityActuals),
  cmas: many(cmas),
  showings: many(showings),
  mileageLogs: many(mileageLogs),
  goals: many(goals),
  smartTasks: many(smartTasks),
  propertyDeadlines: many(propertyDeadlines),
  gpsLocations: many(gpsLocations),
  notifications: many(notifications),
  officeCompetitionsCreated: many(officeCompetitions),
  feedbackSubmitted: many(feedback),
  feedbackUpdates: many(feedbackUpdates),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  user: one(users, {
    fields: [properties.userId],
    references: [users.id],
  }),
  commissions: many(commissions),
  expenses: many(expenses),
  timeEntries: many(timeEntries),
  activities: many(activities),
  cmas: many(cmas),
  showings: many(showings),
  mileageLogs: many(mileageLogs),
  smartTasks: many(smartTasks),
  propertyDeadlines: many(propertyDeadlines),
  gpsLocations: many(gpsLocations),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  user: one(users, {
    fields: [commissions.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [commissions.propertyId],
    references: [properties.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [expenses.propertyId],
    references: [properties.id],
  }),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  user: one(users, {
    fields: [timeEntries.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [timeEntries.propertyId],
    references: [properties.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [activities.propertyId],
    references: [properties.id],
  }),
}));

export const activityActualsRelations = relations(activityActuals, ({ one }) => ({
  user: one(users, {
    fields: [activityActuals.userId],
    references: [users.id],
  }),
}));

export const cmasRelations = relations(cmas, ({ one }) => ({
  user: one(users, {
    fields: [cmas.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [cmas.propertyId],
    references: [properties.id],
  }),
}));

export const showingsRelations = relations(showings, ({ one }) => ({
  user: one(users, {
    fields: [showings.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [showings.propertyId],
    references: [properties.id],
  }),
}));

export const mileageLogsRelations = relations(mileageLogs, ({ one }) => ({
  user: one(users, {
    fields: [mileageLogs.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [mileageLogs.propertyId],
    references: [properties.id],
  }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, {
    fields: [goals.userId],
    references: [users.id],
  }),
}));

export const smartTasksRelations = relations(smartTasks, ({ one }) => ({
  user: one(users, {
    fields: [smartTasks.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [smartTasks.propertyId],
    references: [properties.id],
  }),
}));

export const propertyDeadlinesRelations = relations(propertyDeadlines, ({ one }) => ({
  user: one(users, {
    fields: [propertyDeadlines.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [propertyDeadlines.propertyId],
    references: [properties.id],
  }),
}));

export const officeCompetitionsRelations = relations(officeCompetitions, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [officeCompetitions.createdBy],
    references: [users.id],
  }),
  winner: one(users, {
    fields: [officeCompetitions.winnerId],
    references: [users.id],
  }),
  participants: many(competitionParticipants),
}));

export const competitionParticipantsRelations = relations(competitionParticipants, ({ one }) => ({
  competition: one(officeCompetitions, {
    fields: [competitionParticipants.competitionId],
    references: [officeCompetitions.id],
  }),
  user: one(users, {
    fields: [competitionParticipants.userId],
    references: [users.id],
  }),
}));

export const gpsLocationsRelations = relations(gpsLocations, ({ one }) => ({
  user: one(users, {
    fields: [gpsLocations.userId],
    references: [users.id],
  }),
  property: one(properties, {
    fields: [gpsLocations.propertyId],
    references: [properties.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertPropertySchema = createInsertSchema(properties, {
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  squareFeet: z.coerce.number().optional(),
  listingPrice: z.coerce.number().optional(),
  offerPrice: z.coerce.number().optional(),
  acceptedPrice: z.coerce.number().optional(),
  soldPrice: z.coerce.number().optional(),
  commissionRate: z.coerce.number().optional(),
  daysOnMarket: z.coerce.number().optional(),
  referralFee: z.coerce.number().optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommissionSchema = createInsertSchema(commissions).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).extend({
  amount: z.coerce.string(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).extend({
  hours: z.coerce.string(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  userId: true,
  createdAt: true,
}).extend({
  propertyId: z.string().optional().nullable(),
});

export const insertActivityActualSchema = createInsertSchema(activityActuals).extend({
  calls: z.coerce.number().optional(),
  appointments: z.coerce.number().optional(),
  sellerAppts: z.coerce.number().optional(),
  buyerAppts: z.coerce.number().optional(),
  appointmentsSet: z.coerce.number().optional(),
  cmasCompleted: z.coerce.number().optional(),
  hoursWorked: z.coerce.string().optional(),
  offersWritten: z.coerce.number().optional(),
  showings: z.coerce.number().optional(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertEfficiencyScoreSchema = createInsertSchema(efficiencyScores).extend({
  overallScore: z.coerce.number(),
  callsScore: z.coerce.number().optional().nullable(),
  appointmentsScore: z.coerce.number().optional().nullable(),
  hoursScore: z.coerce.number().optional().nullable(),
  cmasScore: z.coerce.number().optional().nullable(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertCmaSchema = createInsertSchema(cmas).extend({
  suggestedListPrice: z.coerce.number().optional().nullable(),
  lowEstimate: z.coerce.number().optional().nullable(),
  highEstimate: z.coerce.number().optional().nullable(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertShowingSchema = createInsertSchema(showings).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertMileageLogSchema = createInsertSchema(mileageLogs).extend({
  miles: z.coerce.number(),
  gasCost: z.coerce.number().optional().nullable(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).extend({
  calls: z.coerce.number().optional().nullable(),
  appointments: z.coerce.number().optional().nullable(),
  cmas: z.coerce.number().optional().nullable(),
  hours: z.coerce.number().optional().nullable(),
  offersToWrite: z.coerce.number().optional().nullable(),
  monthlyClosings: z.coerce.number().optional().nullable(),
}).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// MLS Settings table
export const mlsSettings = pgTable("mls_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  mlsSystem: varchar("mls_system").notNull(), // e.g., 'NEREN', 'NTREIS', etc.
  mlsSystemName: varchar("mls_system_name").notNull(), // Display name
  apiKey: varchar("api_key"), // User's MLS Grid API key
  region: varchar("region").notNull(),
  states: varchar("states").array().notNull(),
  coverage: varchar("coverage").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MLSSetting = typeof mlsSettings.$inferSelect;
export type InsertMLSSetting = typeof mlsSettings.$inferInsert;

// Feature requests table
export const featureRequests = pgTable("feature_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // 'feature', 'improvement', 'bug', 'integration'
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  email: varchar("email").notNull(),
  status: varchar("status").default("submitted"), // 'submitted', 'in-progress', 'completed', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type FeatureRequest = typeof featureRequests.$inferSelect;
export type InsertFeatureRequest = typeof featureRequests.$inferInsert;

// Dashboard metrics type
export interface DashboardMetrics {
  totalRevenue: number;
  totalVolume: number;
  propertiesClosed: number;
  activeListings: number;
  thisMonthRevenue: number;
  avgTransactionPeriod: number;
  conversionRate: number;
  buyerConversionRate: number;
  sellerConversionRate: number;
  buyerAppointments: number;
  buyerAgreements: number;
  listingAppointments: number;
  listingAgreements: number;
  offerAcceptanceRate: number;
  revenuePerHour: number;
  roiPerformance: number;
  underContractCount: number;
  underContractValue: number;
  pendingCount: number;
  pendingValue: number;
  totalExpenses: number;
  ytdHours: number;
  totalShowings: number;
}
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = z.infer<typeof insertCommissionSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type ActivityActual = typeof activityActuals.$inferSelect;
export type InsertActivityActual = z.infer<typeof insertActivityActualSchema>;
export type EfficiencyScore = typeof efficiencyScores.$inferSelect;
export type InsertEfficiencyScore = z.infer<typeof insertEfficiencyScoreSchema>;
export type Cma = typeof cmas.$inferSelect;
export type InsertCma = z.infer<typeof insertCmaSchema>;
export type Showing = typeof showings.$inferSelect;
export type InsertShowing = z.infer<typeof insertShowingSchema>;
export type MileageLog = typeof mileageLogs.$inferSelect;
export type InsertMileageLog = z.infer<typeof insertMileageLogSchema>;
export type Goal = typeof goals.$inferSelect;
export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = z.infer<typeof insertReferralSchema>;
export type SmartTask = typeof smartTasks.$inferSelect;
export type InsertSmartTask = z.infer<typeof insertSmartTaskSchema>;
export type PropertyDeadline = typeof propertyDeadlines.$inferSelect;
export type InsertPropertyDeadline = z.infer<typeof insertPropertyDeadlineSchema>;
export type OfficeCompetition = typeof officeCompetitions.$inferSelect;
export type InsertOfficeCompetition = z.infer<typeof insertOfficeCompetitionSchema>;
export type CompetitionParticipant = typeof competitionParticipants.$inferSelect;
export type InsertCompetitionParticipant = z.infer<typeof insertCompetitionParticipantSchema>;
export type GpsLocation = typeof gpsLocations.$inferSelect;
export type InsertGpsLocation = z.infer<typeof insertGpsLocationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type MarketIntelligence = typeof marketIntelligence.$inferSelect;
export type InsertMarketIntelligence = z.infer<typeof insertMarketIntelligenceSchema>;
export type PersonalizedInsight = typeof personalizedInsights.$inferSelect;
export type InsertPersonalizedInsight = typeof personalizedInsights.$inferInsert;

// Referral insert schema
export const insertReferralSchema = createInsertSchema(referrals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSmartTaskSchema = createInsertSchema(smartTasks).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  reminderSent: true,
}).extend({
  dueDate: z.string().datetime().optional().nullable().or(z.date().optional().nullable()),
});

export const insertPropertyDeadlineSchema = createInsertSchema(propertyDeadlines).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOfficeCompetitionSchema = createInsertSchema(officeCompetitions).omit({
  id: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  officeId: true, // This will be set by the server
}).extend({
  targetValue: z.string().optional().nullable().transform((val) => val ? parseFloat(val) : null),
});

export const insertCompetitionParticipantSchema = createInsertSchema(competitionParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertGpsLocationSchema = createInsertSchema(gpsLocations).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export const insertMarketIntelligenceSchema = createInsertSchema(marketIntelligence).omit({
  id: true,
  createdAt: true,
  lastUpdated: true,
});

// Learning System Tables
export const learningPathsEnum = pgEnum('learning_path_type', ['beginner', 'intermediate', 'advanced', 'specialty']);
export const lessonTypeEnum = pgEnum('lesson_type', ['video', 'text', 'quiz', 'interactive', 'document']);
export const difficultyEnum = pgEnum('difficulty_level', ['easy', 'medium', 'hard']);

// Learning Paths - Main curriculum tracks
export const learningPaths = pgTable("learning_paths", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: learningPathsEnum("type").notNull(),
  difficulty: difficultyEnum("difficulty").notNull(),
  estimatedHours: integer("estimated_hours").notNull(),
  prerequisites: text("prerequisites").array().default(sql`ARRAY[]::text[]`),
  learningObjectives: text("learning_objectives").array().default(sql`ARRAY[]::text[]`),
  iconName: varchar("icon_name", { length: 50 }).default('book'),
  colorTheme: varchar("color_theme", { length: 50 }).default('blue'),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Courses - Collections of lessons within a learning path
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  learningPathId: varchar("learning_path_id").notNull().references(() => learningPaths.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  estimatedHours: integer("estimated_hours").notNull(),
  prerequisites: text("prerequisites").array().default(sql`ARRAY[]::text[]`),
  learningObjectives: text("learning_objectives").array().default(sql`ARRAY[]::text[]`),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lessons - Individual learning units
export const lessons = pgTable("lessons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: lessonTypeEnum("type").notNull(),
  content: jsonb("content").notNull(), // Flexible content structure for different lesson types
  duration: integer("duration").notNull(), // Duration in minutes
  pointsReward: integer("points_reward").default(10),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Learning Progress - Track user progress through learning paths
export const userLearningProgress = pgTable("user_learning_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  learningPathId: varchar("learning_path_id").notNull().references(() => learningPaths.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 20 }).notNull().default('not_started'), // not_started, in_progress, completed, paused
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).default('0.00'),
  totalTimeSpent: integer("total_time_spent").default(0), // Total time in minutes
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  certificateIssued: boolean("certificate_issued").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Course Progress
export const userCourseProgress = pgTable("user_course_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 20 }).notNull().default('not_started'),
  progressPercentage: decimal("progress_percentage", { precision: 5, scale: 2 }).default('0.00'),
  timeSpent: integer("time_spent").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Lesson Progress
export const userLessonProgress = pgTable("user_lesson_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  lessonId: varchar("lesson_id").notNull().references(() => lessons.id, { onDelete: 'cascade' }),
  status: varchar("status", { length: 20 }).notNull().default('not_started'),
  timeSpent: integer("time_spent").default(0),
  quizScore: decimal("quiz_score", { precision: 5, scale: 2 }),
  maxScore: decimal("max_score", { precision: 5, scale: 2 }),
  attempts: integer("attempts").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  lastAccessedAt: timestamp("last_accessed_at"),
  bookmarked: boolean("bookmarked").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning Achievements - Special achievements for learning milestones
export const learningAchievements = pgTable("learning_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // course_completion, path_completion, streak, quiz_score, etc.
  requirement: jsonb("requirement").notNull(), // Flexible requirement structure
  pointsReward: integer("points_reward").default(50),
  badgeIconName: varchar("badge_icon_name", { length: 50 }).default('graduation-cap'),
  badgeColor: varchar("badge_color", { length: 50 }).default('blue'),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Learning Achievements
export const userLearningAchievements = pgTable("user_learning_achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementId: varchar("achievement_id").notNull().references(() => learningAchievements.id, { onDelete: 'cascade' }),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Learning Streaks - Track consecutive learning activity
export const learningStreaks = pgTable("learning_streaks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastActivityDate: date("last_activity_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Learning System Relations
export const learningPathsRelations = relations(learningPaths, ({ many }) => ({
  courses: many(courses),
  userProgress: many(userLearningProgress),
}));

export const coursesRelations = relations(courses, ({ one, many }) => ({
  learningPath: one(learningPaths, {
    fields: [courses.learningPathId],
    references: [learningPaths.id],
  }),
  lessons: many(lessons),
  userProgress: many(userCourseProgress),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, {
    fields: [lessons.courseId],
    references: [courses.id],
  }),
  userProgress: many(userLessonProgress),
}));

export const userLearningProgressRelations = relations(userLearningProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLearningProgress.userId],
    references: [users.id],
  }),
  learningPath: one(learningPaths, {
    fields: [userLearningProgress.learningPathId],
    references: [learningPaths.id],
  }),
}));

export const userCourseProgressRelations = relations(userCourseProgress, ({ one }) => ({
  user: one(users, {
    fields: [userCourseProgress.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [userCourseProgress.courseId],
    references: [courses.id],
  }),
}));

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userLessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export const learningAchievementsRelations = relations(learningAchievements, ({ many }) => ({
  userAchievements: many(userLearningAchievements),
}));

export const userLearningAchievementsRelations = relations(userLearningAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userLearningAchievements.userId],
    references: [users.id],
  }),
  achievement: one(learningAchievements, {
    fields: [userLearningAchievements.achievementId],
    references: [learningAchievements.id],
  }),
}));

export const learningStreaksRelations = relations(learningStreaks, ({ one }) => ({
  user: one(users, {
    fields: [learningStreaks.userId],
    references: [users.id],
  }),
}));

// Feedback Relations
export const feedbackRelations = relations(feedback, ({ one, many }) => ({
  user: one(users, {
    fields: [feedback.userId],
    references: [users.id],
  }),
  assignedTo: one(users, {
    fields: [feedback.assignedToId],
    references: [users.id],
  }),
  resolvedBy: one(users, {
    fields: [feedback.resolvedById],
    references: [users.id],
  }),
  updates: many(feedbackUpdates),
}));

export const feedbackUpdatesRelations = relations(feedbackUpdates, ({ one }) => ({
  feedback: one(feedback, {
    fields: [feedbackUpdates.feedbackId],
    references: [feedback.id],
  }),
  user: one(users, {
    fields: [feedbackUpdates.userId],
    references: [users.id],
  }),
}));

// Learning System Type Exports
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = z.infer<typeof insertLearningPathSchema>;
export type Course = typeof courses.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Lesson = typeof lessons.$inferSelect;
export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = z.infer<typeof insertUserLearningProgressSchema>;
export type UserCourseProgress = typeof userCourseProgress.$inferSelect;
export type InsertUserCourseProgress = z.infer<typeof insertUserCourseProgressSchema>;
export type UserLessonProgress = typeof userLessonProgress.$inferSelect;
export type InsertUserLessonProgress = z.infer<typeof insertUserLessonProgressSchema>;
export type LearningAchievement = typeof learningAchievements.$inferSelect;
export type InsertLearningAchievement = z.infer<typeof insertLearningAchievementSchema>;
export type UserLearningAchievement = typeof userLearningAchievements.$inferSelect;
export type InsertUserLearningAchievement = z.infer<typeof insertUserLearningAchievementSchema>;
export type LearningStreak = typeof learningStreaks.$inferSelect;
export type InsertLearningStreak = z.infer<typeof insertLearningStreakSchema>;

// Feedback System Type Exports
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type FeedbackUpdate = typeof feedbackUpdates.$inferSelect;
export type InsertFeedbackUpdate = z.infer<typeof insertFeedbackUpdateSchema>;

// Learning System Insert Schemas
export const insertLearningPathSchema = createInsertSchema(learningPaths).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLearningProgressSchema = createInsertSchema(userLearningProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserCourseProgressSchema = createInsertSchema(userCourseProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLessonProgressSchema = createInsertSchema(userLessonProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLearningAchievementSchema = createInsertSchema(learningAchievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserLearningAchievementSchema = createInsertSchema(userLearningAchievements).omit({
  id: true,
  createdAt: true,
});

export const insertLearningStreakSchema = createInsertSchema(learningStreaks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Feedback System Insert Schemas
export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackUpdateSchema = createInsertSchema(feedbackUpdates).omit({
  id: true,
  createdAt: true,
});
