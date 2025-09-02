// Achievement System - Gamification for Real Estate Agents

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'sales' | 'activity' | 'time' | 'streak' | 'milestone';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: number;
  points: number;
  icon: string;
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedDate: string;
  currentProgress: number;
}

export interface PerformanceStreak {
  userId: string;
  type: string;
  current: number;
  longest: number;
  lastActiveDate: string;
  isActive: boolean;
}

// Base achievements configuration
export const ACHIEVEMENTS: Achievement[] = [
  // Sales Achievements
  {
    id: "first_sale",
    title: "First Sale",
    description: "Close your first property transaction",
    category: "sales",
    tier: "bronze",
    requirement: 1,
    points: 100,
    icon: "home"
  },
  {
    id: "deal_closer",
    title: "Deal Closer", 
    description: "Close 5 property transactions",
    category: "sales",
    tier: "silver",
    requirement: 5,
    points: 500,
    icon: "handshake"
  },
  {
    id: "top_producer",
    title: "Top Producer",
    description: "Close 10 property transactions",
    category: "sales",
    tier: "gold",
    requirement: 10,
    points: 1000,
    icon: "star"
  },
  {
    id: "sales_master",
    title: "Sales Master",
    description: "Close 25 property transactions",
    category: "sales", 
    tier: "platinum",
    requirement: 25,
    points: 2500,
    icon: "crown"
  },
  {
    id: "elite_closer",
    title: "Elite Closer",
    description: "Close 50 property transactions",
    category: "sales",
    tier: "diamond",
    requirement: 50,
    points: 5000,
    icon: "trophy"
  },

  // Revenue Achievements - Expanded Levels
  {
    id: "first_commission",
    title: "First Commission",
    description: "Earn your first $1,000 in commissions",
    category: "sales",
    tier: "bronze",
    requirement: 1000,
    points: 50,
    icon: "dollar-sign"
  },
  {
    id: "five_thousand",
    title: "Getting Started",
    description: "Earn $5,000 in commissions",
    category: "sales",
    tier: "bronze",
    requirement: 5000,
    points: 150,
    icon: "coins"
  },
  {
    id: "ten_thousand", 
    title: "Rising Agent",
    description: "Earn $10,000 in commissions",
    category: "sales",
    tier: "silver",
    requirement: 10000,
    points: 300,
    icon: "banknote"
  },
  {
    id: "twenty_five_thousand",
    title: "Solid Producer",
    description: "Earn $25,000 in commissions", 
    category: "sales",
    tier: "silver",
    requirement: 25000,
    points: 600,
    icon: "trending-up"
  },
  {
    id: "fifty_thousand",
    title: "Strong Performer",
    description: "Earn $50,000 in commissions",
    category: "sales",
    tier: "gold",
    requirement: 50000,
    points: 1000,
    icon: "target"
  },
  {
    id: "seventy_five_thousand",
    title: "High Achiever",
    description: "Earn $75,000 in commissions",
    category: "sales",
    tier: "gold", 
    requirement: 75000,
    points: 1400,
    icon: "zap"
  },
  {
    id: "six_figure",
    title: "Six Figure Agent",
    description: "Earn $100,000 in commissions",
    category: "sales",
    tier: "gold",
    requirement: 100000,
    points: 2000,
    icon: "badge-dollar-sign"
  },
  {
    id: "one_fifty_thousand",
    title: "Elite Producer",
    description: "Earn $150,000 in commissions",
    category: "sales",
    tier: "platinum",
    requirement: 150000,
    points: 2800,
    icon: "award"
  },
  {
    id: "two_hundred_thousand",
    title: "Top 5% Agent",
    description: "Earn $200,000 in commissions",
    category: "sales",
    tier: "platinum",
    requirement: 200000,
    points: 3500,
    icon: "crown"
  },
  {
    id: "quarter_million",
    title: "Quarter Million Club",
    description: "Earn $250,000 in commissions",
    category: "sales",
    tier: "platinum",
    requirement: 250000,
    points: 4500,
    icon: "gem"
  },
  {
    id: "half_million",
    title: "Half Million Master",
    description: "Earn $500,000 in commissions",
    category: "sales",
    tier: "diamond",
    requirement: 500000,
    points: 8000,
    icon: "diamond"
  },
  {
    id: "million_commission",
    title: "Million Dollar Earner",
    description: "Earn $1,000,000 in commissions",
    category: "sales",
    tier: "diamond",
    requirement: 1000000,
    points: 15000,
    icon: "banknote"
  },

  // Volume Achievements
  {
    id: "million_volume",
    title: "Million Dollar Agent",
    description: "Sell $1,000,000+ in property volume",
    category: "sales",
    tier: "gold",
    requirement: 1000000,
    points: 2000,
    icon: "building-2"
  },
  {
    id: "five_million_volume",
    title: "Five Million Producer",
    description: "Sell $5,000,000+ in property volume",
    category: "sales",
    tier: "platinum",
    requirement: 5000000,
    points: 5000,
    icon: "buildings"
  },

  // Activity Achievements - Expanded Levels
  {
    id: "first_activity",
    title: "Getting Started",
    description: "Complete your first client activity",
    category: "activity",
    tier: "bronze",
    requirement: 1,
    points: 25,
    icon: "play-circle"
  },
  {
    id: "ten_activities",
    title: "Active Agent",
    description: "Complete 10 client activities",
    category: "activity",
    tier: "bronze",
    requirement: 10,
    points: 100,
    icon: "check-circle"
  },
  {
    id: "busy_agent",
    title: "Busy Agent",
    description: "Complete 25 client activities",
    category: "activity",
    tier: "silver",
    requirement: 25,
    points: 250,
    icon: "users"
  },
  {
    id: "fifty_activities",
    title: "Engaged Professional",
    description: "Complete 50 client activities",
    category: "activity",
    tier: "silver",
    requirement: 50,
    points: 450,
    icon: "phone"
  },
  {
    id: "networker",
    title: "Super Networker",
    description: "Complete 100 client activities",
    category: "activity",
    tier: "gold",
    requirement: 100,
    points: 750,
    icon: "network"
  },
  {
    id: "two_hundred_activities",
    title: "Relationship Builder",
    description: "Complete 200 client activities",
    category: "activity",
    tier: "gold",
    requirement: 200,
    points: 1200,
    icon: "handshake"
  },
  {
    id: "activity_master",
    title: "Activity Master",
    description: "Complete 500 client activities", 
    category: "activity",
    tier: "platinum",
    requirement: 500,
    points: 2500,
    icon: "zap"
  },
  {
    id: "thousand_activities",
    title: "Networking Legend",
    description: "Complete 1,000 client activities",
    category: "activity",
    tier: "diamond",
    requirement: 1000,
    points: 5000,
    icon: "globe"
  },

  // Time Tracking Achievements - Expanded Levels
  {
    id: "time_tracker",
    title: "Time Tracker",
    description: "Log your first 10 hours of work time",
    category: "time",
    tier: "bronze", 
    requirement: 10,
    points: 50,
    icon: "clock"
  },
  {
    id: "twenty_five_hours",
    title: "Getting Serious",
    description: "Log 25 hours of work time",
    category: "time",
    tier: "bronze",
    requirement: 25,
    points: 125,
    icon: "timer"
  },
  {
    id: "fifty_hours",
    title: "Committed Agent",
    description: "Log 50 hours of work time",
    category: "time",
    tier: "silver",
    requirement: 50,
    points: 250,
    icon: "watch"
  },
  {
    id: "dedicated_worker",
    title: "Dedicated Worker", 
    description: "Log 100 hours of work time",
    category: "time",
    tier: "silver",
    requirement: 100,
    points: 500,
    icon: "briefcase"
  },
  {
    id: "two_hundred_hours",
    title: "Time Investment Pro",
    description: "Log 200 hours of work time",
    category: "time",
    tier: "gold",
    requirement: 200,
    points: 900,
    icon: "calendar-clock"
  },
  {
    id: "workaholic",
    title: "Workaholic",
    description: "Log 500 hours of work time",
    category: "time",
    tier: "gold", 
    requirement: 500,
    points: 2000,
    icon: "laptop"
  },
  {
    id: "thousand_hours",
    title: "Time Master",
    description: "Log 1,000 hours of work time",
    category: "time",
    tier: "platinum",
    requirement: 1000,
    points: 4000,
    icon: "hourglass"
  },
  {
    id: "time_legend",
    title: "Time Legend",
    description: "Log 2,000+ hours of work time",
    category: "time",
    tier: "diamond",
    requirement: 2000,
    points: 8000,
    icon: "infinity"
  },

  // Streak Achievements - Expanded Time Periods
  {
    id: "three_day_streak",
    title: "Getting Momentum",
    description: "Complete activities for 3 consecutive days",
    category: "streak",
    tier: "bronze",
    requirement: 3,
    points: 150,
    icon: "flame"
  },
  {
    id: "daily_habit",
    title: "Daily Habit",
    description: "Complete activities for 7 consecutive days",
    category: "streak",
    tier: "silver",
    requirement: 7,
    points: 350,
    icon: "calendar-days"
  },
  {
    id: "two_week_streak",
    title: "Two Week Warrior",
    description: "Complete activities for 14 consecutive days",
    category: "streak",
    tier: "silver",
    requirement: 14,
    points: 700,
    icon: "target"
  },
  {
    id: "monthly_master",
    title: "Monthly Master",
    description: "Complete activities for 30 consecutive days",
    category: "streak",
    tier: "gold",
    requirement: 30,
    points: 1500,
    icon: "calendar"
  },
  {
    id: "sixty_day_streak",
    title: "60 Day Champion",
    description: "Complete activities for 60 consecutive days",
    category: "streak",
    tier: "gold",
    requirement: 60,
    points: 2800,
    icon: "medal"
  },
  {
    id: "quarterly_champion",
    title: "Quarterly Champion",
    description: "Complete activities for 90 consecutive days",
    category: "streak",
    tier: "platinum",
    requirement: 90,
    points: 4000,
    icon: "trophy"
  },
  {
    id: "half_year_hero",
    title: "Half Year Hero",
    description: "Complete activities for 180 consecutive days",
    category: "streak",
    tier: "platinum",
    requirement: 180,
    points: 7500,
    icon: "crown"
  },
  {
    id: "year_long_legend",
    title: "Year Long Legend", 
    description: "Complete activities for 365 consecutive days",
    category: "streak",
    tier: "diamond",
    requirement: 365,
    points: 15000,
    icon: "star"
  },

  // Milestone Achievements - Expanded Time Periods
  {
    id: "first_week",
    title: "First Week Complete",
    description: "Complete your first week of activity",
    category: "milestone",
    tier: "bronze",
    requirement: 1,
    points: 100,
    icon: "calendar-check"
  },
  {
    id: "first_month",
    title: "First Month Complete",
    description: "Complete your first full month of activity",
    category: "milestone",
    tier: "bronze",
    requirement: 1,
    points: 300,
    icon: "calendar-days"
  },
  {
    id: "three_months",
    title: "Quarter Veteran",
    description: "Complete three months of activity",
    category: "milestone",
    tier: "silver",
    requirement: 1,
    points: 750,
    icon: "calendar-range"
  },
  {
    id: "six_months",
    title: "Half Year Milestone",
    description: "Complete six months of activity",
    category: "milestone", 
    tier: "gold",
    requirement: 1,
    points: 1500,
    icon: "calendar-heart"
  },
  {
    id: "first_year",
    title: "One Year Strong",
    description: "Complete your first year in the system",
    category: "milestone", 
    tier: "platinum",
    requirement: 1,
    points: 3000,
    icon: "cake"
  },
  {
    id: "two_years",
    title: "Seasoned Professional",
    description: "Complete two years in the system",
    category: "milestone",
    tier: "platinum",
    requirement: 1,
    points: 5000,
    icon: "award"
  },
  {
    id: "five_years",
    title: "Platform Veteran",
    description: "Complete five years in the system",
    category: "milestone",
    tier: "diamond",
    requirement: 1,
    points: 10000,
    icon: "shield"
  },

  // Lead Generation Achievements
  {
    id: "first_lead",
    title: "Lead Magnet",
    description: "Generate your first lead",
    category: "activity",
    tier: "bronze",
    requirement: 1,
    points: 50,
    icon: "user-plus"
  },
  {
    id: "ten_leads",
    title: "Lead Generator",
    description: "Generate 10 qualified leads",
    category: "activity",
    tier: "bronze",
    requirement: 10,
    points: 200,
    icon: "users"
  },
  {
    id: "fifty_leads",
    title: "Lead Master",
    description: "Generate 50 qualified leads",
    category: "activity",
    tier: "silver",
    requirement: 50,
    points: 750,
    icon: "target"
  },
  {
    id: "hundred_leads",
    title: "Lead Champion",
    description: "Generate 100 qualified leads",
    category: "activity",
    tier: "gold",
    requirement: 100,
    points: 1500,
    icon: "magnet"
  },
  {
    id: "five_hundred_leads",
    title: "Lead Legend",
    description: "Generate 500 qualified leads",
    category: "activity",
    tier: "platinum",
    requirement: 500,
    points: 5000,
    icon: "rocket"
  },

  // Showing Achievements
  {
    id: "first_showing",
    title: "First Showing",
    description: "Complete your first property showing",
    category: "activity",
    tier: "bronze",
    requirement: 1,
    points: 75,
    icon: "key"
  },
  {
    id: "ten_showings",
    title: "Showing Pro",
    description: "Complete 10 property showings",
    category: "activity",
    tier: "bronze",
    requirement: 10,
    points: 300,
    icon: "home"
  },
  {
    id: "fifty_showings",
    title: "Showing Expert",
    description: "Complete 50 property showings",
    category: "activity",
    tier: "silver",
    requirement: 50,
    points: 1000,
    icon: "map-pin"
  },
  {
    id: "hundred_showings",
    title: "Showing Master",
    description: "Complete 100 property showings",
    category: "activity",
    tier: "gold",
    requirement: 100,
    points: 2000,
    icon: "building-2"
  },

  // Listing Achievements
  {
    id: "first_listing",
    title: "First Listing",
    description: "Secure your first property listing",
    category: "sales",
    tier: "bronze",
    requirement: 1,
    points: 100,
    icon: "clipboard-list"
  },
  {
    id: "five_listings",
    title: "Listing Agent",
    description: "Secure 5 property listings",
    category: "sales",
    tier: "bronze",
    requirement: 5,
    points: 400,
    icon: "file-text"
  },
  {
    id: "twenty_listings",
    title: "Listing Specialist",
    description: "Secure 20 property listings",
    category: "sales",
    tier: "silver",
    requirement: 20,
    points: 1200,
    icon: "folder"
  },
  {
    id: "fifty_listings",
    title: "Listing Pro",
    description: "Secure 50 property listings",
    category: "sales",
    tier: "gold",
    requirement: 50,
    points: 2500,
    icon: "briefcase"
  },

  // Marketing Achievements
  {
    id: "social_media_start",
    title: "Social Media Start",
    description: "Complete first social media marketing activity",
    category: "activity",
    tier: "bronze",
    requirement: 1,
    points: 50,
    icon: "share-2"
  },
  {
    id: "marketing_maven",
    title: "Marketing Maven",
    description: "Complete 25 marketing activities",
    category: "activity",
    tier: "silver",
    requirement: 25,
    points: 500,
    icon: "megaphone"
  },
  {
    id: "brand_builder",
    title: "Brand Builder",
    description: "Complete 100 marketing activities",
    category: "activity",
    tier: "gold",
    requirement: 100,
    points: 1500,
    icon: "trending-up"
  },
  {
    id: "marketing_guru",
    title: "Marketing Guru",
    description: "Complete 250 marketing activities",
    category: "activity",
    tier: "platinum",
    requirement: 250,
    points: 3500,
    icon: "bullhorn"
  },

  // Client Satisfaction Achievements
  {
    id: "five_star_review",
    title: "Five Star Service",
    description: "Receive your first 5-star client review",
    category: "milestone",
    tier: "bronze",
    requirement: 1,
    points: 100,
    icon: "star"
  },
  {
    id: "ten_reviews",
    title: "Review Champion",
    description: "Receive 10 client reviews",
    category: "milestone",
    tier: "silver",
    requirement: 10,
    points: 750,
    icon: "thumbs-up"
  },
  {
    id: "client_advocate",
    title: "Client Advocate",
    description: "Maintain 4.8+ average rating with 25+ reviews",
    category: "milestone",
    tier: "gold",
    requirement: 25,
    points: 2000,
    icon: "heart"
  },
  {
    id: "service_legend",
    title: "Service Legend",
    description: "Maintain 4.9+ average rating with 100+ reviews",
    category: "milestone",
    tier: "platinum",
    requirement: 100,
    points: 5000,
    icon: "award"
  },

  // Referral Achievements
  {
    id: "first_referral",
    title: "Referral Starter",
    description: "Receive your first client referral",
    category: "sales",
    tier: "bronze",
    requirement: 1,
    points: 150,
    icon: "user-check"
  },
  {
    id: "referral_network",
    title: "Referral Network",
    description: "Receive 10 client referrals",
    category: "sales",
    tier: "silver",
    requirement: 10,
    points: 1000,
    icon: "users-2"
  },
  {
    id: "referral_master",
    title: "Referral Master",
    description: "Receive 50 client referrals",
    category: "sales",
    tier: "gold",
    requirement: 50,
    points: 3000,
    icon: "share"
  },
  {
    id: "referral_king",
    title: "Referral Royalty",
    description: "Receive 100 client referrals",
    category: "sales",
    tier: "platinum",
    requirement: 100,
    points: 7500,
    icon: "crown"
  },

  // Negotiation Achievements
  {
    id: "first_negotiation",
    title: "First Deal",
    description: "Successfully negotiate your first contract",
    category: "sales",
    tier: "bronze",
    requirement: 1,
    points: 100,
    icon: "handshake"
  },
  {
    id: "skilled_negotiator",
    title: "Skilled Negotiator",
    description: "Successfully negotiate 10 contracts",
    category: "sales",
    tier: "silver",
    requirement: 10,
    points: 600,
    icon: "scale"
  },
  {
    id: "deal_maker",
    title: "Deal Maker",
    description: "Successfully negotiate 25 contracts",
    category: "sales",
    tier: "gold",
    requirement: 25,
    points: 1500,
    icon: "gavel"
  },
  {
    id: "negotiation_expert",
    title: "Negotiation Expert",
    description: "Successfully negotiate 50 contracts",
    category: "sales",
    tier: "platinum",
    requirement: 50,
    points: 3000,
    icon: "badge"
  },

  // Speed Achievements
  {
    id: "quick_closer",
    title: "Quick Closer",
    description: "Close a deal in under 30 days",
    category: "milestone",
    tier: "bronze",
    requirement: 1,
    points: 200,
    icon: "zap"
  },
  {
    id: "speed_demon",
    title: "Speed Demon",
    description: "Close 5 deals in under 30 days each",
    category: "milestone",
    tier: "silver",
    requirement: 5,
    points: 750,
    icon: "flash"
  },
  {
    id: "lightning_fast",
    title: "Lightning Fast",
    description: "Close 10 deals in under 21 days each",
    category: "milestone",
    tier: "gold",
    requirement: 10,
    points: 1500,
    icon: "bolt"
  },

  // Expense Management Achievements
  {
    id: "expense_tracker",
    title: "Expense Tracker",
    description: "Log your first business expense",
    category: "sales",
    tier: "bronze",
    requirement: 1,
    points: 25,
    icon: "receipt"
  },
  {
    id: "budget_conscious",
    title: "Budget Conscious",
    description: "Track 50 business expenses",
    category: "sales",
    tier: "silver",
    requirement: 50,
    points: 300,
    icon: "calculator"
  },
  {
    id: "financial_pro",
    title: "Financial Pro",
    description: "Track 200 business expenses",
    category: "sales",
    tier: "gold",
    requirement: 200,
    points: 800,
    icon: "pie-chart"
  },

  // Technology Achievements
  {
    id: "tech_adopter",
    title: "Tech Adopter",
    description: "Use the platform for 30 consecutive days",
    category: "milestone",
    tier: "bronze",
    requirement: 30,
    points: 300,
    icon: "smartphone"
  },
  {
    id: "digital_agent",
    title: "Digital Agent",
    description: "Complete 100 digital activities",
    category: "milestone",
    tier: "silver",
    requirement: 100,
    points: 750,
    icon: "laptop"
  },
  {
    id: "tech_master",
    title: "Tech Master",
    description: "Use all platform features at least once",
    category: "milestone",
    tier: "gold",
    requirement: 1,
    points: 1000,
    icon: "cpu"
  },

  // Communication Achievements
  {
    id: "communicator",
    title: "Great Communicator",
    description: "Log 100 client communications",
    category: "activity",
    tier: "silver",
    requirement: 100,
    points: 500,
    icon: "message-circle"
  },
  {
    id: "relationship_builder",
    title: "Relationship Builder",
    description: "Log 500 client communications",
    category: "activity",
    tier: "gold",
    requirement: 500,
    points: 1500,
    icon: "phone"
  },
  {
    id: "connection_expert",
    title: "Connection Expert",
    description: "Log 1000 client communications",
    category: "activity",
    tier: "platinum",
    requirement: 1000,
    points: 3000,
    icon: "users"
  }
];

// Calculate user's current progress for each achievement
export function calculateAchievementProgress(metrics: any, activities: any[], timeEntries: any[], properties: any[]): UserAchievement[] {
  const progress: UserAchievement[] = [];
  
  // Calculate closed properties from actual data
  const closedProperties = properties?.filter((p: any) => p.status === 'closed') || [];
  const propertiesClosed = closedProperties.length;
  
  // Calculate total revenue from closed properties and commissions
  const totalRevenue = metrics?.totalRevenue || 0;
  const totalVolume = metrics?.totalVolume || 0;
  
  for (const achievement of ACHIEVEMENTS) {
    let currentProgress = 0;
    let isUnlocked = false;
    
    switch (achievement.id) {
      // Sales achievements - use actual closed properties
      case "first_sale":
      case "deal_closer":
      case "top_producer":
      case "sales_master":
      case "elite_closer":
        currentProgress = propertiesClosed;
        isUnlocked = currentProgress >= achievement.requirement;
        break;
        
      // Revenue achievements - use actual revenue data
      case "first_commission":
      case "five_thousand":
      case "ten_thousand":
      case "twenty_five_thousand":
      case "fifty_thousand":
      case "seventy_five_thousand":
      case "six_figure":
      case "one_fifty_thousand":
      case "two_hundred_thousand":
      case "quarter_million":
      case "half_million":
      case "million_commission":
        currentProgress = totalRevenue;
        isUnlocked = currentProgress >= achievement.requirement;
        break;
        
      // Volume achievements - use actual volume data
      case "million_volume":
      case "five_million_volume":
        currentProgress = totalVolume;
        isUnlocked = currentProgress >= achievement.requirement;
        break;
        
      // Activity achievements - use actual activities
      case "first_activity":
      case "ten_activities":
      case "busy_agent":
      case "fifty_activities":
      case "networker":
      case "two_hundred_activities":
      case "activity_master":
      case "thousand_activities":
        currentProgress = activities?.length || 0;
        isUnlocked = currentProgress >= achievement.requirement;
        break;
        
      // Time achievements - use actual time entries
      case "time_tracker":
      case "twenty_five_hours":
      case "fifty_hours":
      case "dedicated_worker":
      case "two_hundred_hours":
      case "workaholic":
      case "thousand_hours":
      case "time_legend":
        currentProgress = metrics?.ytdHours || 0;
        isUnlocked = currentProgress >= achievement.requirement;
        break;
        
      // Milestone achievements
      case "first_week":
      case "first_month":
      case "three_months":
      case "six_months":
      case "first_year":
      case "two_years":
      case "five_years":
        // Check if user has been active for the required period
        currentProgress = 1; // Simplified - would check actual registration date
        isUnlocked = true;
        break;
        
      // Streak achievements - simplified for now
      case "three_day_streak":
      case "daily_habit":
      case "two_week_streak":
      case "monthly_master":
      case "sixty_day_streak":
      case "quarterly_champion":
      case "half_year_hero":
      case "year_long_legend":
        currentProgress = 4; // Mock streak data
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Lead Generation achievements - mock data for now
      case "first_lead":
      case "ten_leads":
      case "fifty_leads":
      case "hundred_leads":
      case "five_hundred_leads":
        currentProgress = 15; // Mock lead count
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Showing achievements - use actual showing data
      case "first_showing":
      case "ten_showings":
      case "fifty_showings":
      case "hundred_showings":
        const showingCount = activities?.filter((a: any) => a.type === 'showing')?.length || 0;
        currentProgress = showingCount;
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Listing achievements - count listing properties
      case "first_listing":
      case "five_listings":
      case "twenty_listings":
      case "fifty_listings":
        const listingCount = properties?.filter((p: any) => p.representationType === 'seller')?.length || 0;
        currentProgress = listingCount;
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Marketing achievements - count marketing activities
      case "social_media_start":
      case "marketing_maven":
      case "brand_builder":
      case "marketing_guru":
        const marketingCount = activities?.filter((a: any) => a.type === 'marketing')?.length || 0;
        currentProgress = marketingCount;
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Client Satisfaction achievements - mock review data
      case "five_star_review":
      case "ten_reviews":
      case "client_advocate":
      case "service_legend":
        currentProgress = 18; // Mock review count
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Referral achievements - count referral activities
      case "first_referral":
      case "referral_network":
      case "referral_master":
      case "referral_king":
        const referralCount = activities?.filter((a: any) => a.type === 'referral')?.length || 0;
        currentProgress = referralCount;
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Negotiation achievements - count contract activities
      case "first_negotiation":
      case "skilled_negotiator":
      case "deal_maker":
      case "negotiation_expert":
        const negotiationCount = activities?.filter((a: any) => a.type === 'contract_negotiation')?.length || 0;
        currentProgress = negotiationCount;
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Speed achievements - check closed properties with quick timelines
      case "quick_closer":
      case "speed_demon":
      case "lightning_fast":
        const quickDeals = closedProperties?.filter((p: any) => {
          if (!p.listingDate || !p.soldDate) return false;
          const listingDate = new Date(p.listingDate);
          const soldDate = new Date(p.soldDate);
          const daysDiff = (soldDate.getTime() - listingDate.getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= 30;
        })?.length || 0;
        currentProgress = quickDeals;
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Financial achievements - use expense data
      case "expense_tracker":
      case "budget_conscious":
      case "financial_pro":
        currentProgress = 85; // Mock expense count
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Technology achievements - platform usage tracking
      case "tech_adopter":
      case "digital_agent":
      case "tech_master":
        currentProgress = 45; // Mock tech usage days
        isUnlocked = currentProgress >= achievement.requirement;
        break;

      // Communication achievements - count communication activities
      case "communicator":
      case "relationship_builder":
      case "connection_expert":
        const commCount = activities?.filter((a: any) => 
          a.type === 'call' || a.type === 'email' || a.type === 'text'
        )?.length || 0;
        currentProgress = commCount;
        isUnlocked = currentProgress >= achievement.requirement;
        break;
        
      default:
        currentProgress = 0;
        isUnlocked = false;
    }
    
    progress.push({
      userId: "current_user",
      achievementId: achievement.id,
      unlockedDate: isUnlocked ? new Date().toISOString() : "",
      currentProgress
    });
  }
  
  return progress;
}

// Calculate agent level based on total points
export function calculateAgentLevel(totalPoints: number) {
  const level = Math.floor(totalPoints / 1000) + 1;
  
  const titles = [
    "Rookie Agent",      // Level 1-2
    "Rising Star",       // Level 3-5  
    "Skilled Professional", // Level 6-10
    "Top Producer",      // Level 11-20
    "Elite Agent",       // Level 21-35
    "Market Leader",     // Level 36-50
    "Industry Expert",   // Level 51-75
    "Legendary Realtor"  // Level 76+
  ];
  
  const titleIndex = Math.min(
    level <= 2 ? 0 :
    level <= 5 ? 1 :
    level <= 10 ? 2 :
    level <= 20 ? 3 :
    level <= 35 ? 4 :
    level <= 50 ? 5 :
    level <= 75 ? 6 : 7,
    titles.length - 1
  );
  
  return {
    level,
    title: titles[titleIndex],
    totalPoints,
    pointsToNext: 1000 - (totalPoints % 1000),
    pointsRequired: Math.ceil(totalPoints / 1000) * 1000
  };
}

// Track performance streaks
export function updatePerformanceStreaks(userId: string, activities: any[]): PerformanceStreak[] {
  // This would track daily/weekly/monthly activity streaks
  // For now, return mock data
  return [
    {
      userId,
      type: "Daily Activities",
      current: 4,
      longest: 12,
      lastActiveDate: new Date().toISOString(),
      isActive: true
    },
    {
      userId,
      type: "Weekly Goals Met", 
      current: 2,
      longest: 8,
      lastActiveDate: new Date().toISOString(),
      isActive: true
    }
  ];
}