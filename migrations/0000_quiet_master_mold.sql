CREATE TYPE "public"."activity_type" AS ENUM('showing', 'inspection', 'appraisal', 'buyer_meeting', 'seller_meeting', 'closing', 'client_call', 'call_answered', 'buyer_appointment', 'listing_appointment', 'buyer_signed', 'listing_taken', 'offer_written', 'offer_accepted', 'cma_completed');--> statement-breakpoint
CREATE TYPE "public"."cma_status" AS ENUM('active', 'completed', 'presented', 'converted_to_listing', 'rejected', 'did_not_convert');--> statement-breakpoint
CREATE TYPE "public"."commission_type" AS ENUM('buyer_side', 'seller_side', 'referral');--> statement-breakpoint
CREATE TYPE "public"."competition_status" AS ENUM('active', 'upcoming', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."competition_type" AS ENUM('sales_volume', 'commission_earned', 'properties_closed', 'activities_completed', 'hours_logged', 'revenue_target');--> statement-breakpoint
CREATE TYPE "public"."deadline_type" AS ENUM('inspection', 'appraisal', 'financing', 'earnest_money', 'closing', 'contingency_removal');--> statement-breakpoint
CREATE TYPE "public"."difficulty_level" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."expense_category" AS ENUM('marketing', 'gas', 'mileage', 'meals', 'supplies', 'professional_services', 'education', 'other');--> statement-breakpoint
CREATE TYPE "public"."feedback_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."feedback_status" AS ENUM('open', 'in_progress', 'resolved', 'closed', 'declined');--> statement-breakpoint
CREATE TYPE "public"."feedback_type" AS ENUM('general', 'bug_report', 'feature_request', 'improvement_suggestion', 'performance_issue');--> statement-breakpoint
CREATE TYPE "public"."goal_period" AS ENUM('daily', 'weekly', 'monthly');--> statement-breakpoint
CREATE TYPE "public"."lead_source" AS ENUM('referral', 'soi', 'online', 'sign_call', 'open_house', 'cold_call', 'social_media', 'advertising', 'agent_referral', 'homelight', 'zillow', 'opcity', 'upnest', 'facebook', 'instagram', 'direct_mail', 'other');--> statement-breakpoint
CREATE TYPE "public"."learning_path_type" AS ENUM('beginner', 'intermediate', 'advanced', 'specialty');--> statement-breakpoint
CREATE TYPE "public"."lesson_type" AS ENUM('video', 'text', 'quiz', 'interactive', 'document');--> statement-breakpoint
CREATE TYPE "public"."notification_method" AS ENUM('email', 'sms', 'push', 'in_app');--> statement-breakpoint
CREATE TYPE "public"."property_status" AS ENUM('in_progress', 'listed', 'offer_written', 'active_under_contract', 'pending', 'closed', 'lost_deal', 'withdrawn', 'expired', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('single_family', 'condo', 'townhouse', 'multi_family', 'land', 'commercial');--> statement-breakpoint
CREATE TYPE "public"."representation_type" AS ENUM('buyer_rep', 'seller_rep');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high', 'urgent');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('pending', 'in_progress', 'completed', 'cancelled');--> statement-breakpoint
CREATE TABLE "activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"type" "activity_type" NOT NULL,
	"date" date NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "activity_actuals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"date" date NOT NULL,
	"calls" integer DEFAULT 0,
	"appointments" integer DEFAULT 0,
	"seller_appts" integer DEFAULT 0,
	"buyer_appts" integer DEFAULT 0,
	"appointments_set" integer DEFAULT 0,
	"cmas_completed" integer DEFAULT 0,
	"hours_worked" numeric(5, 2) DEFAULT '0',
	"offers_written" integer DEFAULT 0,
	"showings" integer DEFAULT 0,
	"buyers_signed_up" integer DEFAULT 0,
	"listings_signed" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "cmas" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"address" text NOT NULL,
	"suggested_list_price" numeric(12, 2),
	"low_estimate" numeric(12, 2),
	"high_estimate" numeric(12, 2),
	"status" "cma_status" DEFAULT 'active',
	"notes" text,
	"comparables" text,
	"date_completed" date,
	"date_presented_to_client" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "commissions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"amount" numeric(12, 2) NOT NULL,
	"commission_rate" numeric(5, 2),
	"type" "commission_type" NOT NULL,
	"date_earned" date NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "competition_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"competition_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"current_score" numeric(12, 2) DEFAULT '0',
	"rank" integer,
	"joined_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"learning_path_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"estimated_hours" integer NOT NULL,
	"prerequisites" text[] DEFAULT ARRAY[]::text[],
	"learning_objectives" text[] DEFAULT ARRAY[]::text[],
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "efficiency_scores" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"date" date NOT NULL,
	"overall_score" integer NOT NULL,
	"calls_score" numeric(5, 2),
	"appointments_score" numeric(5, 2),
	"hours_score" numeric(5, 2),
	"cmas_score" numeric(5, 2),
	"score_breakdown" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"category" "expense_category" NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"description" text,
	"date" date NOT NULL,
	"notes" text,
	"receipt_url" varchar,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feature_requests" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar,
	"type" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text NOT NULL,
	"email" varchar NOT NULL,
	"status" varchar DEFAULT 'submitted',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "feedback_type" NOT NULL,
	"subject" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"status" "feedback_status" DEFAULT 'open',
	"priority" "feedback_priority" DEFAULT 'medium',
	"assigned_to_id" varchar,
	"resolution" text,
	"user_email" varchar(255),
	"user_name" varchar(255),
	"browser_info" text,
	"page_url" varchar(500),
	"attachment_urls" jsonb,
	"admin_notes" text,
	"resolved_at" timestamp,
	"resolved_by_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "feedback_updates" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"feedback_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"update_type" varchar(50) NOT NULL,
	"old_value" varchar(200),
	"new_value" varchar(200),
	"comment" text,
	"is_internal" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"period" "goal_period" NOT NULL,
	"calls" integer,
	"appointments" integer,
	"cmas" integer,
	"hours" numeric(5, 2),
	"offers_to_write" integer,
	"monthly_closings" integer,
	"is_locked" boolean DEFAULT false,
	"effective_date" date NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gps_locations" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"latitude" numeric(10, 7) NOT NULL,
	"longitude" numeric(10, 7) NOT NULL,
	"address" text,
	"activity_type" varchar(100),
	"arrival_time" timestamp,
	"departure_time" timestamp,
	"duration_minutes" integer,
	"auto_detected" boolean DEFAULT true,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"type" varchar(50) NOT NULL,
	"requirement" jsonb NOT NULL,
	"points_reward" integer DEFAULT 50,
	"badge_icon_name" varchar(50) DEFAULT 'graduation-cap',
	"badge_color" varchar(50) DEFAULT 'blue',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_paths" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"type" "learning_path_type" NOT NULL,
	"difficulty" "difficulty_level" NOT NULL,
	"estimated_hours" integer NOT NULL,
	"prerequisites" text[] DEFAULT ARRAY[]::text[],
	"learning_objectives" text[] DEFAULT ARRAY[]::text[],
	"icon_name" varchar(50) DEFAULT 'book',
	"color_theme" varchar(50) DEFAULT 'blue',
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "learning_streaks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_activity_date" date,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"type" "lesson_type" NOT NULL,
	"content" jsonb NOT NULL,
	"duration" integer NOT NULL,
	"points_reward" integer DEFAULT 10,
	"is_active" boolean DEFAULT true,
	"sort_order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "market_intelligence" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"city" varchar(100) NOT NULL,
	"state" varchar(2) NOT NULL,
	"zip_code" varchar(10),
	"property_type" "property_type" NOT NULL,
	"avg_days_on_market" integer,
	"median_list_price" numeric(12, 2),
	"median_sold_price" numeric(12, 2),
	"inventory_level" integer,
	"price_per_square_foot" numeric(8, 2),
	"sale_to_list_ratio" numeric(5, 4),
	"best_listing_months" varchar(100),
	"market_trend" varchar(20),
	"last_updated" timestamp DEFAULT now(),
	"data_source" varchar(100),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mileage_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"date" date NOT NULL,
	"start_location" varchar(300),
	"end_location" varchar(300),
	"miles" numeric(8, 2) NOT NULL,
	"drive_time" varchar(100),
	"gas_cost" numeric(8, 2),
	"purpose" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mls_settings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"mls_system" varchar NOT NULL,
	"mls_system_name" varchar NOT NULL,
	"api_key" varchar,
	"region" varchar NOT NULL,
	"states" varchar[] NOT NULL,
	"coverage" varchar NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"message" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"method" "notification_method" NOT NULL,
	"is_read" boolean DEFAULT false,
	"sent_at" timestamp,
	"scheduled_for" timestamp,
	"related_entity_id" varchar,
	"related_entity_type" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "office_competitions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"office_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"type" "competition_type" NOT NULL,
	"status" "competition_status" DEFAULT 'upcoming',
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"target_value" numeric(12, 2),
	"prize" text,
	"rules" text,
	"winner_id" varchar,
	"participant_count" integer DEFAULT 0,
	"created_by" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "personalized_insights" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"insight_type" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"priority" varchar DEFAULT 'medium',
	"category" varchar NOT NULL,
	"actionable_steps" jsonb,
	"metrics" jsonb,
	"confidence" integer DEFAULT 85,
	"potential_impact" varchar,
	"timeframe" varchar DEFAULT '30_days',
	"is_viewed" boolean DEFAULT false,
	"is_archived" boolean DEFAULT false,
	"generated_at" timestamp DEFAULT now(),
	"valid_until" timestamp,
	"market_data" jsonb,
	"performance_data" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"address" text NOT NULL,
	"city" varchar(100),
	"state" varchar(2),
	"zip_code" varchar(10),
	"representation_type" "representation_type" NOT NULL,
	"status" "property_status" DEFAULT 'in_progress',
	"property_type" "property_type",
	"bedrooms" integer,
	"bathrooms" numeric(3, 1),
	"square_feet" integer,
	"listing_price" numeric(12, 2),
	"offer_price" numeric(12, 2),
	"accepted_price" numeric(12, 2),
	"sold_price" numeric(12, 2),
	"commission_rate" numeric(5, 2),
	"client_name" varchar(200),
	"lead_source" "lead_source",
	"listing_date" date,
	"sold_date" date,
	"days_on_market" integer,
	"buyer_agreement_date" date,
	"seller_agreement_date" date,
	"loss_reason" text,
	"notes" text,
	"image_url" varchar,
	"referral_fee" numeric(10, 2),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_deadlines" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"property_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"type" "deadline_type" NOT NULL,
	"due_date" date NOT NULL,
	"description" text,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"reminder_days" integer DEFAULT 3,
	"reminder_sent" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referrer_id" varchar NOT NULL,
	"referee_email" varchar(255) NOT NULL,
	"referee_name" varchar(255),
	"referral_code" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"reward_claimed" boolean DEFAULT false,
	"invite_sent_at" timestamp DEFAULT now(),
	"sign_up_at" timestamp,
	"subscription_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "referrals_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "showings" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"property_address" text NOT NULL,
	"client_name" varchar(200),
	"date" date NOT NULL,
	"interest_level" integer,
	"duration_minutes" integer,
	"miles_driven" numeric(8, 2),
	"gas_cost" numeric(8, 2),
	"hours_spent" numeric(5, 2),
	"feedback" text,
	"internal_notes" text,
	"follow_up_required" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "smart_tasks" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"title" varchar(200) NOT NULL,
	"description" text,
	"priority" "task_priority" DEFAULT 'medium',
	"status" "task_status" DEFAULT 'pending',
	"due_date" timestamp,
	"completed_at" timestamp,
	"automated_reminder" boolean DEFAULT true,
	"reminder_sent" boolean DEFAULT false,
	"reminder_30min_sent" boolean DEFAULT false,
	"reminder_10min_sent" boolean DEFAULT false,
	"reminder_5min_sent" boolean DEFAULT false,
	"reminder_due_sent" boolean DEFAULT false,
	"reminder_5min_overdue_sent" boolean DEFAULT false,
	"tags" varchar(500),
	"is_automated" boolean DEFAULT false,
	"trigger_condition" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "time_entries" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"property_id" varchar,
	"activity" varchar(200) NOT NULL,
	"hours" numeric(5, 2) NOT NULL,
	"amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"date" date NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_course_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"course_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"progress_percentage" numeric(5, 2) DEFAULT '0.00',
	"time_spent" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_accessed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_learning_achievements" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"achievement_id" varchar NOT NULL,
	"unlocked_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_learning_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"learning_path_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"progress_percentage" numeric(5, 2) DEFAULT '0.00',
	"total_time_spent" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_accessed_at" timestamp,
	"certificate_issued" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_lesson_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"lesson_id" varchar NOT NULL,
	"status" varchar(20) DEFAULT 'not_started' NOT NULL,
	"time_spent" integer DEFAULT 0,
	"quiz_score" numeric(5, 2),
	"max_score" numeric(5, 2),
	"attempts" integer DEFAULT 0,
	"started_at" timestamp,
	"completed_at" timestamp,
	"last_accessed_at" timestamp,
	"bookmarked" boolean DEFAULT false,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"is_admin" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"subscription_status" varchar DEFAULT 'trial',
	"subscription_id" varchar,
	"customer_id" varchar,
	"stripe_customer_id" varchar,
	"stripe_subscription_id" varchar,
	"plan_id" varchar DEFAULT 'starter',
	"hourly_rate" numeric(10, 2) DEFAULT '75.00',
	"vehicle_mpg" numeric(5, 2) DEFAULT '25.00',
	"avg_gas_price" numeric(5, 2) DEFAULT '3.50',
	"default_commission_split" numeric(5, 2) DEFAULT '70.00',
	"enable_gps_tracking" boolean DEFAULT false,
	"email_notifications" boolean DEFAULT true,
	"sms_notifications" boolean DEFAULT false,
	"phone_number" varchar(20),
	"office_id" varchar,
	"office_name" varchar,
	"password_hash" varchar,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_actuals" ADD CONSTRAINT "activity_actuals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cmas" ADD CONSTRAINT "cmas_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cmas" ADD CONSTRAINT "cmas_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_participants" ADD CONSTRAINT "competition_participants_competition_id_office_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."office_competitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competition_participants" ADD CONSTRAINT "competition_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "efficiency_scores" ADD CONSTRAINT "efficiency_scores_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feature_requests" ADD CONSTRAINT "feature_requests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_resolved_by_id_users_id_fk" FOREIGN KEY ("resolved_by_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_updates" ADD CONSTRAINT "feedback_updates_feedback_id_feedback_id_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "feedback_updates" ADD CONSTRAINT "feedback_updates_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gps_locations" ADD CONSTRAINT "gps_locations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gps_locations" ADD CONSTRAINT "gps_locations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "learning_streaks" ADD CONSTRAINT "learning_streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mileage_logs" ADD CONSTRAINT "mileage_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mileage_logs" ADD CONSTRAINT "mileage_logs_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mls_settings" ADD CONSTRAINT "mls_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_competitions" ADD CONSTRAINT "office_competitions_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "office_competitions" ADD CONSTRAINT "office_competitions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "personalized_insights" ADD CONSTRAINT "personalized_insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_deadlines" ADD CONSTRAINT "property_deadlines_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_deadlines" ADD CONSTRAINT "property_deadlines_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showings" ADD CONSTRAINT "showings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "showings" ADD CONSTRAINT "showings_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_tasks" ADD CONSTRAINT "smart_tasks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "smart_tasks" ADD CONSTRAINT "smart_tasks_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "time_entries" ADD CONSTRAINT "time_entries_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_course_progress" ADD CONSTRAINT "user_course_progress_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_achievements" ADD CONSTRAINT "user_learning_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_achievements" ADD CONSTRAINT "user_learning_achievements_achievement_id_learning_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."learning_achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_learning_progress" ADD CONSTRAINT "user_learning_progress_learning_path_id_learning_paths_id_fk" FOREIGN KEY ("learning_path_id") REFERENCES "public"."learning_paths"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_lesson_progress" ADD CONSTRAINT "user_lesson_progress_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activity_actuals_user_date_idx" ON "activity_actuals" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "efficiency_scores_user_date_idx" ON "efficiency_scores" USING btree ("user_id","date");--> statement-breakpoint
CREATE INDEX "IDX_session_expire" ON "sessions" USING btree ("expire");