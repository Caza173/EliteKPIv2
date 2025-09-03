import { relations } from "drizzle-orm/relations";
import { users, showings, properties, smartTasks, userCourseProgress, courses, userLearningAchievements, learningAchievements, userLearningProgress, learningPaths, timeEntries, referrals, activityActuals, cmas, commissions, activities, competitionParticipants, officeCompetitions, expenses, featureRequests, feedback, feedbackUpdates, goals, gpsLocations, efficiencyScores, learningStreaks, lessons, mileageLogs, mlsSettings, notifications, propertyDeadlines, personalizedInsights, userLessonProgress } from "./schema";

export const showingsRelations = relations(showings, ({one}) => ({
	user: one(users, {
		fields: [showings.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [showings.propertyId],
		references: [properties.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	showings: many(showings),
	smartTasks: many(smartTasks),
	userCourseProgresses: many(userCourseProgress),
	userLearningAchievements: many(userLearningAchievements),
	userLearningProgresses: many(userLearningProgress),
	timeEntries: many(timeEntries),
	referrals: many(referrals),
	activityActuals: many(activityActuals),
	cmas: many(cmas),
	commissions: many(commissions),
	activities: many(activities),
	competitionParticipants: many(competitionParticipants),
	expenses: many(expenses),
	featureRequests: many(featureRequests),
	feedbacks_userId: many(feedback, {
		relationName: "feedback_userId_users_id"
	}),
	feedbacks_assignedToId: many(feedback, {
		relationName: "feedback_assignedToId_users_id"
	}),
	feedbacks_resolvedById: many(feedback, {
		relationName: "feedback_resolvedById_users_id"
	}),
	feedbackUpdates: many(feedbackUpdates),
	goals: many(goals),
	gpsLocations: many(gpsLocations),
	efficiencyScores: many(efficiencyScores),
	learningStreaks: many(learningStreaks),
	mileageLogs: many(mileageLogs),
	mlsSettings: many(mlsSettings),
	notifications: many(notifications),
	propertyDeadlines: many(propertyDeadlines),
	personalizedInsights: many(personalizedInsights),
	properties: many(properties),
	officeCompetitions_winnerId: many(officeCompetitions, {
		relationName: "officeCompetitions_winnerId_users_id"
	}),
	officeCompetitions_createdBy: many(officeCompetitions, {
		relationName: "officeCompetitions_createdBy_users_id"
	}),
	userLessonProgresses: many(userLessonProgress),
}));

export const propertiesRelations = relations(properties, ({one, many}) => ({
	showings: many(showings),
	smartTasks: many(smartTasks),
	timeEntries: many(timeEntries),
	cmas: many(cmas),
	commissions: many(commissions),
	activities: many(activities),
	expenses: many(expenses),
	gpsLocations: many(gpsLocations),
	mileageLogs: many(mileageLogs),
	propertyDeadlines: many(propertyDeadlines),
	user: one(users, {
		fields: [properties.userId],
		references: [users.id]
	}),
}));

export const smartTasksRelations = relations(smartTasks, ({one}) => ({
	user: one(users, {
		fields: [smartTasks.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [smartTasks.propertyId],
		references: [properties.id]
	}),
}));

export const userCourseProgressRelations = relations(userCourseProgress, ({one}) => ({
	user: one(users, {
		fields: [userCourseProgress.userId],
		references: [users.id]
	}),
	course: one(courses, {
		fields: [userCourseProgress.courseId],
		references: [courses.id]
	}),
}));

export const coursesRelations = relations(courses, ({one, many}) => ({
	userCourseProgresses: many(userCourseProgress),
	learningPath: one(learningPaths, {
		fields: [courses.learningPathId],
		references: [learningPaths.id]
	}),
	lessons: many(lessons),
}));

export const userLearningAchievementsRelations = relations(userLearningAchievements, ({one}) => ({
	user: one(users, {
		fields: [userLearningAchievements.userId],
		references: [users.id]
	}),
	learningAchievement: one(learningAchievements, {
		fields: [userLearningAchievements.achievementId],
		references: [learningAchievements.id]
	}),
}));

export const learningAchievementsRelations = relations(learningAchievements, ({many}) => ({
	userLearningAchievements: many(userLearningAchievements),
}));

export const userLearningProgressRelations = relations(userLearningProgress, ({one}) => ({
	user: one(users, {
		fields: [userLearningProgress.userId],
		references: [users.id]
	}),
	learningPath: one(learningPaths, {
		fields: [userLearningProgress.learningPathId],
		references: [learningPaths.id]
	}),
}));

export const learningPathsRelations = relations(learningPaths, ({many}) => ({
	userLearningProgresses: many(userLearningProgress),
	courses: many(courses),
}));

export const timeEntriesRelations = relations(timeEntries, ({one}) => ({
	user: one(users, {
		fields: [timeEntries.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [timeEntries.propertyId],
		references: [properties.id]
	}),
}));

export const referralsRelations = relations(referrals, ({one}) => ({
	user: one(users, {
		fields: [referrals.referrerId],
		references: [users.id]
	}),
}));

export const activityActualsRelations = relations(activityActuals, ({one}) => ({
	user: one(users, {
		fields: [activityActuals.userId],
		references: [users.id]
	}),
}));

export const cmasRelations = relations(cmas, ({one}) => ({
	user: one(users, {
		fields: [cmas.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [cmas.propertyId],
		references: [properties.id]
	}),
}));

export const commissionsRelations = relations(commissions, ({one}) => ({
	user: one(users, {
		fields: [commissions.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [commissions.propertyId],
		references: [properties.id]
	}),
}));

export const activitiesRelations = relations(activities, ({one}) => ({
	user: one(users, {
		fields: [activities.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [activities.propertyId],
		references: [properties.id]
	}),
}));

export const competitionParticipantsRelations = relations(competitionParticipants, ({one}) => ({
	user: one(users, {
		fields: [competitionParticipants.userId],
		references: [users.id]
	}),
	officeCompetition: one(officeCompetitions, {
		fields: [competitionParticipants.competitionId],
		references: [officeCompetitions.id]
	}),
}));

export const officeCompetitionsRelations = relations(officeCompetitions, ({one, many}) => ({
	competitionParticipants: many(competitionParticipants),
	user_winnerId: one(users, {
		fields: [officeCompetitions.winnerId],
		references: [users.id],
		relationName: "officeCompetitions_winnerId_users_id"
	}),
	user_createdBy: one(users, {
		fields: [officeCompetitions.createdBy],
		references: [users.id],
		relationName: "officeCompetitions_createdBy_users_id"
	}),
}));

export const expensesRelations = relations(expenses, ({one}) => ({
	user: one(users, {
		fields: [expenses.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [expenses.propertyId],
		references: [properties.id]
	}),
}));

export const featureRequestsRelations = relations(featureRequests, ({one}) => ({
	user: one(users, {
		fields: [featureRequests.userId],
		references: [users.id]
	}),
}));

export const feedbackRelations = relations(feedback, ({one, many}) => ({
	user_userId: one(users, {
		fields: [feedback.userId],
		references: [users.id],
		relationName: "feedback_userId_users_id"
	}),
	user_assignedToId: one(users, {
		fields: [feedback.assignedToId],
		references: [users.id],
		relationName: "feedback_assignedToId_users_id"
	}),
	user_resolvedById: one(users, {
		fields: [feedback.resolvedById],
		references: [users.id],
		relationName: "feedback_resolvedById_users_id"
	}),
	feedbackUpdates: many(feedbackUpdates),
}));

export const feedbackUpdatesRelations = relations(feedbackUpdates, ({one}) => ({
	feedback: one(feedback, {
		fields: [feedbackUpdates.feedbackId],
		references: [feedback.id]
	}),
	user: one(users, {
		fields: [feedbackUpdates.userId],
		references: [users.id]
	}),
}));

export const goalsRelations = relations(goals, ({one}) => ({
	user: one(users, {
		fields: [goals.userId],
		references: [users.id]
	}),
}));

export const gpsLocationsRelations = relations(gpsLocations, ({one}) => ({
	user: one(users, {
		fields: [gpsLocations.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [gpsLocations.propertyId],
		references: [properties.id]
	}),
}));

export const efficiencyScoresRelations = relations(efficiencyScores, ({one}) => ({
	user: one(users, {
		fields: [efficiencyScores.userId],
		references: [users.id]
	}),
}));

export const learningStreaksRelations = relations(learningStreaks, ({one}) => ({
	user: one(users, {
		fields: [learningStreaks.userId],
		references: [users.id]
	}),
}));

export const lessonsRelations = relations(lessons, ({one, many}) => ({
	course: one(courses, {
		fields: [lessons.courseId],
		references: [courses.id]
	}),
	userLessonProgresses: many(userLessonProgress),
}));

export const mileageLogsRelations = relations(mileageLogs, ({one}) => ({
	user: one(users, {
		fields: [mileageLogs.userId],
		references: [users.id]
	}),
	property: one(properties, {
		fields: [mileageLogs.propertyId],
		references: [properties.id]
	}),
}));

export const mlsSettingsRelations = relations(mlsSettings, ({one}) => ({
	user: one(users, {
		fields: [mlsSettings.userId],
		references: [users.id]
	}),
}));

export const notificationsRelations = relations(notifications, ({one}) => ({
	user: one(users, {
		fields: [notifications.userId],
		references: [users.id]
	}),
}));

export const propertyDeadlinesRelations = relations(propertyDeadlines, ({one}) => ({
	property: one(properties, {
		fields: [propertyDeadlines.propertyId],
		references: [properties.id]
	}),
	user: one(users, {
		fields: [propertyDeadlines.userId],
		references: [users.id]
	}),
}));

export const personalizedInsightsRelations = relations(personalizedInsights, ({one}) => ({
	user: one(users, {
		fields: [personalizedInsights.userId],
		references: [users.id]
	}),
}));

export const userLessonProgressRelations = relations(userLessonProgress, ({one}) => ({
	user: one(users, {
		fields: [userLessonProgress.userId],
		references: [users.id]
	}),
	lesson: one(lessons, {
		fields: [userLessonProgress.lessonId],
		references: [lessons.id]
	}),
}));