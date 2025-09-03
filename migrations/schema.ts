import { pgTable, foreignKey, varchar, text, date, integer, numeric, boolean, timestamp, index, jsonb, unique, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const activityType = pgEnum("activity_type", ['showing', 'inspection', 'appraisal', 'buyer_meeting', 'seller_meeting', 'closing', 'client_call', 'call_answered', 'buyer_appointment', 'listing_appointment', 'buyer_signed', 'listing_taken', 'offer_written', 'offer_accepted', 'cma_completed'])
export const cmaStatus = pgEnum("cma_status", ['active', 'completed', 'presented', 'converted_to_listing', 'rejected', 'did_not_convert'])
export const commissionType = pgEnum("commission_type", ['buyer_side', 'seller_side', 'referral'])
export const competitionStatus = pgEnum("competition_status", ['active', 'upcoming', 'completed', 'cancelled'])
export const competitionType = pgEnum("competition_type", ['sales_volume', 'commission_earned', 'properties_closed', 'activities_completed', 'hours_logged', 'revenue_target'])
export const deadlineType = pgEnum("deadline_type", ['inspection', 'appraisal', 'financing', 'earnest_money', 'closing', 'contingency_removal'])
export const difficultyLevel = pgEnum("difficulty_level", ['easy', 'medium', 'hard'])
export const expenseCategory = pgEnum("expense_category", ['marketing', 'gas', 'mileage', 'meals', 'supplies', 'professional_services', 'education', 'other'])
export const feedbackPriority = pgEnum("feedback_priority", ['low', 'medium', 'high', 'urgent'])
export const feedbackStatus = pgEnum("feedback_status", ['open', 'in_progress', 'resolved', 'closed', 'declined'])
export const feedbackType = pgEnum("feedback_type", ['general', 'bug_report', 'feature_request', 'improvement_suggestion', 'performance_issue'])
export const goalPeriod = pgEnum("goal_period", ['daily', 'weekly', 'monthly'])
export const leadSource = pgEnum("lead_source", ['referral', 'soi', 'online', 'sign_call', 'open_house', 'cold_call', 'social_media', 'advertising', 'agent_referral', 'homelight', 'zillow', 'opcity', 'upnest', 'facebook', 'instagram', 'direct_mail', 'other'])
export const learningPathType = pgEnum("learning_path_type", ['beginner', 'intermediate', 'advanced', 'specialty'])
export const lessonType = pgEnum("lesson_type", ['video', 'text', 'quiz', 'interactive', 'document'])
export const notificationMethod = pgEnum("notification_method", ['email', 'sms', 'push', 'in_app'])
export const propertyStatus = pgEnum("property_status", ['in_progress', 'listed', 'offer_written', 'active_under_contract', 'pending', 'closed', 'lost_deal', 'withdrawn', 'expired', 'terminated'])
export const propertyType = pgEnum("property_type", ['single_family', 'condo', 'townhouse', 'multi_family', 'land', 'commercial'])
export const representationType = pgEnum("representation_type", ['buyer_rep', 'seller_rep'])
export const taskPriority = pgEnum("task_priority", ['low', 'medium', 'high', 'urgent'])
export const taskStatus = pgEnum("task_status", ['pending', 'in_progress', 'completed', 'cancelled'])


export const showings = pgTable("showings", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	propertyAddress: text("property_address").notNull(),
	clientName: varchar("client_name", { length: 200 }),
	date: date().notNull(),
	interestLevel: integer("interest_level"),
	durationMinutes: integer("duration_minutes"),
	milesDriven: numeric("miles_driven", { precision: 8, scale:  2 }),
	gasCost: numeric("gas_cost", { precision: 8, scale:  2 }),
	hoursSpent: numeric("hours_spent", { precision: 5, scale:  2 }),
	feedback: text(),
	internalNotes: text("internal_notes"),
	followUpRequired: boolean("follow_up_required").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "showings_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "showings_property_id_properties_id_fk"
		}).onDelete("set null"),
]);

export const sessions = pgTable("sessions", {
	sid: varchar().primaryKey().notNull(),
	sess: jsonb().notNull(),
	expire: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	index("IDX_session_expire").using("btree", table.expire.asc().nullsLast().op("timestamp_ops")),
]);

export const smartTasks = pgTable("smart_tasks", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	priority: taskPriority().default('medium'),
	status: taskStatus().default('pending'),
	dueDate: timestamp("due_date", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	automatedReminder: boolean("automated_reminder").default(true),
	reminderSent: boolean("reminder_sent").default(false),
	reminder30MinSent: boolean("reminder_30min_sent").default(false),
	reminder10MinSent: boolean("reminder_10min_sent").default(false),
	reminder5MinSent: boolean("reminder_5min_sent").default(false),
	reminderDueSent: boolean("reminder_due_sent").default(false),
	reminder5MinOverdueSent: boolean("reminder_5min_overdue_sent").default(false),
	tags: varchar({ length: 500 }),
	isAutomated: boolean("is_automated").default(false),
	triggerCondition: text("trigger_condition"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "smart_tasks_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "smart_tasks_property_id_properties_id_fk"
		}).onDelete("cascade"),
]);

export const userCourseProgress = pgTable("user_course_progress", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	courseId: varchar("course_id").notNull(),
	status: varchar({ length: 20 }).default('not_started').notNull(),
	progressPercentage: numeric("progress_percentage", { precision: 5, scale:  2 }).default('0.00'),
	timeSpent: integer("time_spent").default(0),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_course_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "user_course_progress_course_id_courses_id_fk"
		}).onDelete("cascade"),
]);

export const userLearningAchievements = pgTable("user_learning_achievements", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	achievementId: varchar("achievement_id").notNull(),
	unlockedAt: timestamp("unlocked_at", { mode: 'string' }).defaultNow(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_learning_achievements_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.achievementId],
			foreignColumns: [learningAchievements.id],
			name: "user_learning_achievements_achievement_id_learning_achievements"
		}).onDelete("cascade"),
]);

export const userLearningProgress = pgTable("user_learning_progress", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	learningPathId: varchar("learning_path_id").notNull(),
	status: varchar({ length: 20 }).default('not_started').notNull(),
	progressPercentage: numeric("progress_percentage", { precision: 5, scale:  2 }).default('0.00'),
	totalTimeSpent: integer("total_time_spent").default(0),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }),
	certificateIssued: boolean("certificate_issued").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_learning_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.learningPathId],
			foreignColumns: [learningPaths.id],
			name: "user_learning_progress_learning_path_id_learning_paths_id_fk"
		}).onDelete("cascade"),
]);

export const timeEntries = pgTable("time_entries", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	activity: varchar({ length: 200 }).notNull(),
	hours: numeric({ precision: 5, scale:  2 }).notNull(),
	date: date().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	amount: numeric({ precision: 10, scale:  2 }).default('0').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "time_entries_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "time_entries_property_id_properties_id_fk"
		}).onDelete("set null"),
]);

export const referrals = pgTable("referrals", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	referrerId: varchar("referrer_id").notNull(),
	refereeEmail: varchar("referee_email", { length: 255 }).notNull(),
	refereeName: varchar("referee_name", { length: 255 }),
	referralCode: varchar("referral_code", { length: 10 }).notNull(),
	status: varchar({ length: 20 }).default('pending'),
	rewardClaimed: boolean("reward_claimed").default(false),
	inviteSentAt: timestamp("invite_sent_at", { mode: 'string' }).defaultNow(),
	signUpAt: timestamp("sign_up_at", { mode: 'string' }),
	subscriptionAt: timestamp("subscription_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.referrerId],
			foreignColumns: [users.id],
			name: "referrals_referrer_id_users_id_fk"
		}).onDelete("cascade"),
	unique("referrals_referral_code_unique").on(table.referralCode),
]);

export const activityActuals = pgTable("activity_actuals", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	date: date().notNull(),
	calls: integer().default(0),
	appointments: integer().default(0),
	sellerAppts: integer("seller_appts").default(0),
	buyerAppts: integer("buyer_appts").default(0),
	appointmentsSet: integer("appointments_set").default(0),
	cmasCompleted: integer("cmas_completed").default(0),
	hoursWorked: numeric("hours_worked", { precision: 5, scale:  2 }).default('0'),
	offersWritten: integer("offers_written").default(0),
	showings: integer().default(0),
	buyersSignedUp: integer("buyers_signed_up").default(0),
	listingsSigned: integer("listings_signed").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("activity_actuals_user_date_idx").using("btree", table.userId.asc().nullsLast().op("date_ops"), table.date.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activity_actuals_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const cmas = pgTable("cmas", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	address: text().notNull(),
	suggestedListPrice: numeric("suggested_list_price", { precision: 12, scale:  2 }),
	lowEstimate: numeric("low_estimate", { precision: 12, scale:  2 }),
	highEstimate: numeric("high_estimate", { precision: 12, scale:  2 }),
	status: cmaStatus().default('active'),
	notes: text(),
	comparables: text(),
	dateCompleted: date("date_completed"),
	datePresentedToClient: date("date_presented_to_client"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "cmas_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "cmas_property_id_properties_id_fk"
		}).onDelete("set null"),
]);

export const commissions = pgTable("commissions", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	amount: numeric({ precision: 12, scale:  2 }).notNull(),
	commissionRate: numeric("commission_rate", { precision: 5, scale:  2 }),
	type: commissionType().notNull(),
	dateEarned: date("date_earned").notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "commissions_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "commissions_property_id_properties_id_fk"
		}).onDelete("cascade"),
]);

export const activities = pgTable("activities", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	type: activityType().notNull(),
	date: date().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "activities_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "activities_property_id_properties_id_fk"
		}).onDelete("set null"),
]);

export const competitionParticipants = pgTable("competition_participants", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	competitionId: varchar("competition_id").notNull(),
	userId: varchar("user_id").notNull(),
	currentScore: numeric("current_score", { precision: 12, scale:  2 }).default('0'),
	rank: integer(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "competition_participants_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.competitionId],
			foreignColumns: [officeCompetitions.id],
			name: "competition_participants_competition_id_office_competitions_id_"
		}).onDelete("cascade"),
]);

export const expenses = pgTable("expenses", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	category: expenseCategory().notNull(),
	amount: numeric({ precision: 10, scale:  2 }).notNull(),
	description: text(),
	date: date().notNull(),
	notes: text(),
	receiptUrl: varchar("receipt_url"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "expenses_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "expenses_property_id_properties_id_fk"
		}).onDelete("set null"),
]);

export const featureRequests = pgTable("feature_requests", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id"),
	type: varchar().notNull(),
	title: varchar().notNull(),
	description: text().notNull(),
	email: varchar().notNull(),
	status: varchar().default('submitted'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feature_requests_user_id_users_id_fk"
		}),
]);

export const feedback = pgTable("feedback", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	type: feedbackType().notNull(),
	subject: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	status: feedbackStatus().default('open'),
	priority: feedbackPriority().default('medium'),
	assignedToId: varchar("assigned_to_id"),
	resolution: text(),
	userEmail: varchar("user_email", { length: 255 }),
	userName: varchar("user_name", { length: 255 }),
	browserInfo: text("browser_info"),
	pageUrl: varchar("page_url", { length: 500 }),
	attachmentUrls: jsonb("attachment_urls"),
	adminNotes: text("admin_notes"),
	resolvedAt: timestamp("resolved_at", { mode: 'string' }),
	resolvedById: varchar("resolved_by_id"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feedback_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedToId],
			foreignColumns: [users.id],
			name: "feedback_assigned_to_id_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.resolvedById],
			foreignColumns: [users.id],
			name: "feedback_resolved_by_id_users_id_fk"
		}).onDelete("set null"),
]);

export const feedbackUpdates = pgTable("feedback_updates", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	feedbackId: varchar("feedback_id").notNull(),
	userId: varchar("user_id").notNull(),
	updateType: varchar("update_type", { length: 50 }).notNull(),
	oldValue: varchar("old_value", { length: 200 }),
	newValue: varchar("new_value", { length: 200 }),
	comment: text(),
	isInternal: boolean("is_internal").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.feedbackId],
			foreignColumns: [feedback.id],
			name: "feedback_updates_feedback_id_feedback_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "feedback_updates_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const goals = pgTable("goals", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	period: goalPeriod().notNull(),
	calls: integer(),
	appointments: integer(),
	cmas: integer(),
	hours: numeric({ precision: 5, scale:  2 }),
	offersToWrite: integer("offers_to_write"),
	monthlyClosings: integer("monthly_closings"),
	isLocked: boolean("is_locked").default(false),
	effectiveDate: date("effective_date").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "goals_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const gpsLocations = pgTable("gps_locations", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	latitude: numeric({ precision: 10, scale:  7 }).notNull(),
	longitude: numeric({ precision: 10, scale:  7 }).notNull(),
	address: text(),
	activityType: varchar("activity_type", { length: 100 }),
	arrivalTime: timestamp("arrival_time", { mode: 'string' }),
	departureTime: timestamp("departure_time", { mode: 'string' }),
	durationMinutes: integer("duration_minutes"),
	autoDetected: boolean("auto_detected").default(true),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "gps_locations_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "gps_locations_property_id_properties_id_fk"
		}).onDelete("set null"),
]);

export const courses = pgTable("courses", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	learningPathId: varchar("learning_path_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	estimatedHours: integer("estimated_hours").notNull(),
	prerequisites: text().array().default(["RAY"]),
	learningObjectives: text("learning_objectives").array().default(["RAY"]),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.learningPathId],
			foreignColumns: [learningPaths.id],
			name: "courses_learning_path_id_learning_paths_id_fk"
		}).onDelete("cascade"),
]);

export const efficiencyScores = pgTable("efficiency_scores", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	date: date().notNull(),
	overallScore: integer("overall_score").notNull(),
	callsScore: numeric("calls_score", { precision: 5, scale:  2 }),
	appointmentsScore: numeric("appointments_score", { precision: 5, scale:  2 }),
	hoursScore: numeric("hours_score", { precision: 5, scale:  2 }),
	cmasScore: numeric("cmas_score", { precision: 5, scale:  2 }),
	scoreBreakdown: jsonb("score_breakdown"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	index("efficiency_scores_user_date_idx").using("btree", table.userId.asc().nullsLast().op("date_ops"), table.date.asc().nullsLast().op("date_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "efficiency_scores_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const learningStreaks = pgTable("learning_streaks", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	currentStreak: integer("current_streak").default(0),
	longestStreak: integer("longest_streak").default(0),
	lastActivityDate: date("last_activity_date"),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "learning_streaks_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const lessons = pgTable("lessons", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	courseId: varchar("course_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	type: lessonType().notNull(),
	content: jsonb().notNull(),
	duration: integer().notNull(),
	pointsReward: integer("points_reward").default(10),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "lessons_course_id_courses_id_fk"
		}).onDelete("cascade"),
]);

export const mileageLogs = pgTable("mileage_logs", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	propertyId: varchar("property_id"),
	date: date().notNull(),
	startLocation: varchar("start_location", { length: 300 }),
	endLocation: varchar("end_location", { length: 300 }),
	miles: numeric({ precision: 8, scale:  2 }).notNull(),
	driveTime: varchar("drive_time", { length: 100 }),
	gasCost: numeric("gas_cost", { precision: 8, scale:  2 }),
	purpose: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mileage_logs_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "mileage_logs_property_id_properties_id_fk"
		}).onDelete("set null"),
]);

export const marketIntelligence = pgTable("market_intelligence", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	city: varchar({ length: 100 }).notNull(),
	state: varchar({ length: 2 }).notNull(),
	zipCode: varchar("zip_code", { length: 10 }),
	propertyType: propertyType("property_type").notNull(),
	avgDaysOnMarket: integer("avg_days_on_market"),
	medianListPrice: numeric("median_list_price", { precision: 12, scale:  2 }),
	medianSoldPrice: numeric("median_sold_price", { precision: 12, scale:  2 }),
	inventoryLevel: integer("inventory_level"),
	pricePerSquareFoot: numeric("price_per_square_foot", { precision: 8, scale:  2 }),
	saleToListRatio: numeric("sale_to_list_ratio", { precision: 5, scale:  4 }),
	bestListingMonths: varchar("best_listing_months", { length: 100 }),
	marketTrend: varchar("market_trend", { length: 20 }),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow(),
	dataSource: varchar("data_source", { length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const mlsSettings = pgTable("mls_settings", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	mlsSystem: varchar("mls_system").notNull(),
	mlsSystemName: varchar("mls_system_name").notNull(),
	apiKey: varchar("api_key"),
	region: varchar().notNull(),
	states: varchar().array().notNull(),
	coverage: varchar().notNull(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mls_settings_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const notifications = pgTable("notifications", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	message: text().notNull(),
	type: varchar({ length: 50 }).notNull(),
	method: notificationMethod().notNull(),
	isRead: boolean("is_read").default(false),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	scheduledFor: timestamp("scheduled_for", { mode: 'string' }),
	relatedEntityId: varchar("related_entity_id"),
	relatedEntityType: varchar("related_entity_type", { length: 50 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "notifications_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const learningAchievements = pgTable("learning_achievements", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	type: varchar({ length: 50 }).notNull(),
	requirement: jsonb().notNull(),
	pointsReward: integer("points_reward").default(50),
	badgeIconName: varchar("badge_icon_name", { length: 50 }).default('graduation-cap'),
	badgeColor: varchar("badge_color", { length: 50 }).default('blue'),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const learningPaths = pgTable("learning_paths", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	type: learningPathType().notNull(),
	difficulty: difficultyLevel().notNull(),
	estimatedHours: integer("estimated_hours").notNull(),
	prerequisites: text().array().default(["RAY"]),
	learningObjectives: text("learning_objectives").array().default(["RAY"]),
	iconName: varchar("icon_name", { length: 50 }).default('book'),
	colorTheme: varchar("color_theme", { length: 50 }).default('blue'),
	isActive: boolean("is_active").default(true),
	sortOrder: integer("sort_order").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const propertyDeadlines = pgTable("property_deadlines", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	propertyId: varchar("property_id").notNull(),
	userId: varchar("user_id").notNull(),
	type: deadlineType().notNull(),
	dueDate: date("due_date").notNull(),
	description: text(),
	isCompleted: boolean("is_completed").default(false),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	reminderDays: integer("reminder_days").default(3),
	reminderSent: boolean("reminder_sent").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_deadlines_property_id_properties_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "property_deadlines_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const personalizedInsights = pgTable("personalized_insights", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	insightType: varchar("insight_type").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text().notNull(),
	priority: varchar().default('medium'),
	category: varchar().notNull(),
	actionableSteps: jsonb("actionable_steps"),
	metrics: jsonb(),
	confidence: integer().default(85),
	potentialImpact: varchar("potential_impact"),
	timeframe: varchar().default('30_days'),
	isViewed: boolean("is_viewed").default(false),
	isArchived: boolean("is_archived").default(false),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow(),
	validUntil: timestamp("valid_until", { mode: 'string' }),
	marketData: jsonb("market_data"),
	performanceData: jsonb("performance_data"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "personalized_insights_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const properties = pgTable("properties", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	address: text().notNull(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 2 }),
	zipCode: varchar("zip_code", { length: 10 }),
	representationType: representationType("representation_type").notNull(),
	status: propertyStatus().default('in_progress'),
	propertyType: propertyType("property_type"),
	bedrooms: integer(),
	bathrooms: numeric({ precision: 3, scale:  1 }),
	squareFeet: integer("square_feet"),
	listingPrice: numeric("listing_price", { precision: 12, scale:  2 }),
	offerPrice: numeric("offer_price", { precision: 12, scale:  2 }),
	acceptedPrice: numeric("accepted_price", { precision: 12, scale:  2 }),
	soldPrice: numeric("sold_price", { precision: 12, scale:  2 }),
	commissionRate: numeric("commission_rate", { precision: 5, scale:  2 }),
	clientName: varchar("client_name", { length: 200 }),
	leadSource: leadSource("lead_source"),
	listingDate: date("listing_date"),
	soldDate: date("sold_date"),
	daysOnMarket: integer("days_on_market"),
	buyerAgreementDate: date("buyer_agreement_date"),
	sellerAgreementDate: date("seller_agreement_date"),
	lossReason: text("loss_reason"),
	notes: text(),
	imageUrl: varchar("image_url"),
	referralFee: numeric("referral_fee", { precision: 10, scale:  2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "properties_user_id_users_id_fk"
		}).onDelete("cascade"),
]);

export const officeCompetitions = pgTable("office_competitions", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	officeId: varchar("office_id").notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	type: competitionType().notNull(),
	status: competitionStatus().default('upcoming'),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	targetValue: numeric("target_value", { precision: 12, scale:  2 }),
	prize: text(),
	rules: text(),
	winnerId: varchar("winner_id"),
	participantCount: integer("participant_count").default(0),
	createdBy: varchar("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.winnerId],
			foreignColumns: [users.id],
			name: "office_competitions_winner_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "office_competitions_created_by_users_id_fk"
		}),
]);

export const userLessonProgress = pgTable("user_lesson_progress", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	userId: varchar("user_id").notNull(),
	lessonId: varchar("lesson_id").notNull(),
	status: varchar({ length: 20 }).default('not_started').notNull(),
	timeSpent: integer("time_spent").default(0),
	quizScore: numeric("quiz_score", { precision: 5, scale:  2 }),
	maxScore: numeric("max_score", { precision: 5, scale:  2 }),
	attempts: integer().default(0),
	startedAt: timestamp("started_at", { mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	lastAccessedAt: timestamp("last_accessed_at", { mode: 'string' }),
	bookmarked: boolean().default(false),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_lesson_progress_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.lessonId],
			foreignColumns: [lessons.id],
			name: "user_lesson_progress_lesson_id_lessons_id_fk"
		}).onDelete("cascade"),
]);

export const users = pgTable("users", {
	id: varchar().default(gen_random_uuid()).primaryKey().notNull(),
	email: varchar(),
	firstName: varchar("first_name"),
	lastName: varchar("last_name"),
	profileImageUrl: varchar("profile_image_url"),
	isAdmin: boolean("is_admin").default(false),
	isActive: boolean("is_active").default(true),
	subscriptionStatus: varchar("subscription_status").default('trial'),
	subscriptionId: varchar("subscription_id"),
	customerId: varchar("customer_id"),
	stripeCustomerId: varchar("stripe_customer_id"),
	stripeSubscriptionId: varchar("stripe_subscription_id"),
	hourlyRate: numeric("hourly_rate", { precision: 10, scale:  2 }).default('75.00'),
	vehicleMpg: numeric("vehicle_mpg", { precision: 5, scale:  2 }).default('25.00'),
	avgGasPrice: numeric("avg_gas_price", { precision: 5, scale:  2 }).default('3.50'),
	defaultCommissionSplit: numeric("default_commission_split", { precision: 5, scale:  2 }).default('70.00'),
	enableGpsTracking: boolean("enable_gps_tracking").default(false),
	emailNotifications: boolean("email_notifications").default(true),
	smsNotifications: boolean("sms_notifications").default(false),
	phoneNumber: varchar("phone_number", { length: 20 }),
	officeId: varchar("office_id"),
	officeName: varchar("office_name"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	planId: varchar("plan_id").default('starter'),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);
