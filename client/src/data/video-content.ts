import { VideoContent } from "@/components/ui/video-embed";

export const videoContent: VideoContent[] = [
  // Comprehensive Training Series
  {
    id: "getting-started-video",
    title: "Getting Started with EliteKPI",
    description: "Complete platform introduction and initial setup guide",
    duration: 15,
    category: "getting-started",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    relatedTutorial: "getting-started"
  },
  {
    id: "property-management-video",
    title: "Property Management Walkthrough",
    description: "Master property pipeline management and tracking from lead to closing",
    duration: 22,
    category: "properties",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    relatedTutorial: "property-management"
  },
  {
    id: "financial-tracking-video",
    title: "Financial Tracking & Reporting",
    description: "Learn commission tracking, expense management, and ROI optimization",
    duration: 18,
    category: "financial",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    relatedTutorial: "financial-tracking"
  },

  // Sidebar Tab Quick Tours (3-5 minutes each)
  {
    id: "dashboard-tour",
    title: "Dashboard Overview",
    description: "Your business command center in 4 minutes",
    duration: 4,
    category: "getting-started",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Dashboard - Video Script
**Duration:** 4 minutes  
**Focus:** Your real estate business command center

## INTRO (0:00-0:30)
**[Screen: Dashboard overview]**

"Welcome to your EliteKPI Dashboard - your complete business command center! In 4 minutes, you'll master the central hub that tracks your revenue, properties, and business performance in real-time."

## KEY METRICS CARDS (0:30-1:15)
**[Screen: Top metrics row]**

"Your dashboard starts with four critical business metrics:

**Total Revenue:** All commission earnings from closed deals
**Total Volume:** Combined value of properties you've transacted
**Properties Closed:** Number of successful closings this year
**Active Properties:** Current deals in your pipeline

These metrics update automatically as you log activities and close deals."

## EFFICIENCY TRACKER (1:15-2:15)
**[Screen: Efficiency tracking section]**

"The Efficiency Tracker shows your overall business performance score based on:
- Deal conversion rates
- Time management effectiveness
- Revenue per hour worked
- Client satisfaction metrics

Watch this score improve as you optimize your processes and track activities consistently."

## SECONDARY METRICS (2:15-3:00)
**[Screen: Revenue, conversion, and transaction metrics]**

"Below the main metrics, you'll see:
- **This Month Revenue:** Current month's commission earnings
- **Average Transaction Period:** Time from listing to closing
- **Conversion Rates:** Appointment to agreement percentages for both buyers and sellers

These insights help you understand your business rhythm and identify improvement opportunities."

## REAL-TIME UPDATES (3:00-3:30)
**[Screen: Dashboard refresh and data flow]**

"Your dashboard updates automatically when you:
- Add new properties to your pipeline
- Log completed activities
- Record business expenses
- Update property statuses

This ensures you always have current business intelligence at your fingertips."

## WRAP-UP (3:30-4:00)
**[Screen: Full dashboard overview]**

"Use your dashboard daily to:
- Start each day with clear performance visibility
- Track progress toward your revenue goals
- Identify trends in your business patterns
- Make data-driven decisions for growth

Your dashboard is your business GPS - check it regularly to stay on course!"`
  },
  {
    id: "properties-tour",
    title: "Properties Pipeline",
    description: "Managing deals from lead to closing",
    duration: 5,
    category: "properties",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Properties - Video Script
**Duration:** 5 minutes  
**Focus:** Complete pipeline management from lead to closing

## INTRO (0:00-0:30)
**[Screen: Properties page with property grid]**

"Your Properties section is the heart of your business - where every deal lives from first contact to closing. In 5 minutes, you'll master the pipeline that drives your income!"

## PROPERTY GRID OVERVIEW (0:30-1:15)
**[Screen: Property cards layout]**

"Your properties display as cards showing essential information:
- Property address and key details
- Current status (In Progress, Listed, Under Contract, etc.)
- Your role (Buyer Agent or Listing Agent)
- Commission potential and current value
- Days in pipeline and recent activity

This grid view gives you instant pipeline visibility."

## ADDING NEW PROPERTIES (1:15-2:15)
**[Screen: Add Property modal]**

"Click 'Add Property' to create new deals. Complete these key sections:
- **Property Details:** Address, bedrooms, bathrooms, square footage
- **Financial Information:** List price, commission rate, estimated earnings
- **Lead Source:** Track which marketing channels work best
- **Status:** Start with 'In Progress' for new prospects
- **Representation:** Specify if you're buyer or listing agent

Rich data entry enables powerful analytics and ROI tracking."

## PROPERTY DETAILS & TRACKING (2:15-3:30)
**[Screen: Property detail popup with tabs]**

"Click any property to access comprehensive management with 5 tabs:
- **Overview:** Complete property summary and client information
- **Commissions:** Automatic calculations and payment tracking
- **Financial:** ROI analysis and profitability metrics
- **Expenses:** Property-specific cost tracking
- **Time:** Hours invested and activity logging

This detailed view helps you manage every aspect of each deal."

## QUICK ACTIONS & WORKFLOW (3:30-4:30)
**[Screen: Quick action buttons and status updates]**

"Streamline your daily workflow with quick actions:
- **Schedule Showing:** Book appointments with clients
- **Log Mileage:** Track travel for tax deductions
- **Log Hours:** Record time investment for ROI calculations
- **Update Status:** Move properties through your pipeline

These actions create a complete activity history for each property."

## WRAP-UP (4:30-5:00)
**[Screen: Full properties overview]**

"Effective property management means:
- Complete initial data entry for accurate analytics
- Regular status updates as deals progress
- Consistent activity and time tracking
- Monitoring financial performance per property

Your property pipeline is your income pipeline - manage it like your business depends on it!"`
  },
  {
    id: "activities-tour",
    title: "Activities Tracking",
    description: "Track your daily work and time investment",
    duration: 3,
    category: "getting-started",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Activities - Video Script
**Duration:** 3 minutes  
**Focus:** Track your daily work for maximum ROI

## INTRO (0:00-0:30)
**[Screen: Activities page with recent activity list]**

"Activities tracking is where you capture the work that drives your income. Every call, showing, and task you log builds a complete picture of your business effectiveness!"

## ACTIVITY LOGGING WORKFLOW (0:30-1:15)
**[Screen: Add Activity modal]**

"Log activities throughout your day:
- **Activity Type:** Client calls, showings, listing appointments, or administrative work
- **Associated Property:** Link activities to specific deals for ROI tracking
- **Time Investment:** Hours and minutes spent for productivity analysis
- **Notes:** Key outcomes, next steps, and important details
- **Date & Time:** When the activity occurred

This data becomes the foundation for understanding your business efficiency."

## ACTIVITY ANALYTICS (1:15-2:15)
**[Screen: Activity performance charts]**

"Your activity data reveals powerful insights:
- **Revenue per Hour:** Which activities generate the most commission per time invested
- **Activity Efficiency:** Conversion rates from different activity types
- **Time Distribution:** How you spend your business hours
- **Peak Performance:** Your most productive days and times
- **Property-Specific ROI:** Time investment versus commission earned per deal

Use these insights to optimize your daily schedule and focus on high-value activities."

## ACTIVITY BEST PRACTICES (2:15-2:45)
**[Screen: Activity filtering and organization]**

"Maximize your activity tracking by:
- Logging activities in real-time or immediately after completion
- Always associating activities with specific properties when possible
- Recording accurate time investments for precise ROI calculations
- Adding detailed notes for future reference and client relationship building

Consistent tracking reveals the activities that truly drive your success."

## WRAP-UP (2:45-3:00)
**[Screen: Activity dashboard overview]**

"Remember: Every activity you track helps you:
- Understand your true hourly earnings
- Identify your most profitable work
- Optimize your time allocation
- Build detailed client interaction histories

Track everything - optimize everything!"`
  },
  {
    id: "cmas-tour",
    title: "CMA Management",
    description: "Create and track comparative market analyses",
    duration: 4,
    category: "properties",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# CMAs - Video Script
**Duration:** 4 minutes  
**Focus:** Master comparative market analyses for listing success

## INTRO (0:00-0:30)
**[Screen: CMAs page with CMA grid]**

"CMAs are your secret weapon for winning listings! This powerful tool helps you create professional market analyses, track prospect interactions, and convert homeowners into loyal clients."

## CREATING PROFESSIONAL CMAS (0:30-1:30)
**[Screen: Add CMA form and address lookup]**

"Create compelling CMAs with our comprehensive system:
- **Property Address:** Use our address lookup for accurate property details
- **Market Analysis:** Access recent sales data and current market trends
- **Pricing Strategy:** Provide data-driven price recommendations
- **Comparable Properties:** Select the most relevant recent sales
- **Market Insights:** Include neighborhood trends and buyer behavior

Professional CMAs position you as the local market expert."

## CMA WORKFLOW MANAGEMENT (1:30-2:30)
**[Screen: CMA status tracking and updates]**

"Track each CMA through its complete lifecycle:
- **Active:** Research and preparation phase
- **Completed:** Ready for client presentation
- **Presented:** Delivered to potential client
- **Converted to Listing:** Client chose you as their agent
- **Follow-up Required:** Needs additional client contact
- **Lost to Competitor:** Client selected another agent

This workflow tracking helps you identify conversion patterns and optimize your approach."

## CMA PERFORMANCE OPTIMIZATION (2:30-3:30)
**[Screen: CMA analytics and conversion metrics]**

"Monitor your CMA effectiveness with key metrics:
- **Conversion Rate:** Percentage of CMAs that become listings
- **Response Time:** How quickly prospects engage after receiving CMAs
- **Pricing Accuracy:** How your estimates compare to actual market prices
- **Market Segment Performance:** Which property types and price ranges convert best

Use this data to refine your CMA process and improve your listing conversion rate."

## WRAP-UP (3:30-4:00)
**[Screen: CMA success dashboard]**

"Maximize your CMA success by:
- Creating thorough, data-driven analyses
- Following up promptly and professionally
- Tracking outcomes to improve your process
- Using market data to build credibility

Great CMAs don't just win listings - they establish you as the neighborhood expert!"`
  },
  {
    id: "market-trends-tour",
    title: "Market Trends Analysis",
    description: "Understanding market conditions and predictions",
    duration: 4,
    category: "advanced",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Market Trends - Video Script
**Duration:** 4 minutes  
**Focus:** Leverage market intelligence for competitive advantage

## INTRO (0:00-0:30)
**[Screen: Market Trends dashboard with charts]**

"Market Trends transforms you into a data-driven market expert! In 4 minutes, you'll master the intelligence tools that help you advise clients with confidence and time your strategies perfectly."

## REAL-TIME MARKET METRICS (0:30-1:30)
**[Screen: Current market data display]**

"Access comprehensive market intelligence:
- **Price Trends:** Historical and current pricing movements across multiple metro areas
- **Sales Volume:** Transaction activity levels showing market health
- **Days on Market:** How quickly properties sell in different segments
- **Market Velocity:** Speed of price changes and buyer activity
- **Inventory Analysis:** Supply levels affecting pricing power

This real-time data keeps you ahead of market shifts."

## PREDICTIVE FORECASTING (1:30-2:30)
**[Screen: AI-powered forecasting charts]**

"Our AI-powered forecasting provides 5-month predictions:
- **Price Trajectory:** Expected price movements with confidence intervals
- **Market Timing:** Optimal listing and buying windows
- **Seasonal Adjustments:** How time of year affects your market
- **Risk Assessment:** Market volatility and uncertainty levels

Use these predictions to guide client timing and pricing decisions."

## LOCATION-BASED ANALYSIS (2:30-3:30)
**[Screen: Geographic market comparison]**

"Compare markets across different regions:
- **Metro Area Analysis:** Performance across San Francisco, Austin, Miami, Seattle, and more
- **Zip Code Intelligence:** Nationwide coverage with 40,000+ zip codes
- **Micro-Market Trends:** Neighborhood-level price and activity data
- **Investment Opportunities:** Areas showing strong growth potential

Target your marketing and client advice with precision market intelligence."

## WRAP-UP (3:30-4:00)
**[Screen: Market trends summary view]**

"Master Market Trends to:
- Position yourself as the local market authority
- Provide data-backed pricing recommendations
- Time listings for maximum market impact
- Identify emerging investment opportunities

When you speak with market data, clients listen!"`
  },
  {
    id: "reports-tour",
    title: "Reports & Analytics",
    description: "Comprehensive business analytics and reporting",
    duration: 4,
    category: "financial",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Reports - Video Script
**Duration:** 4 minutes  
**Focus:** Transform your data into business intelligence

## INTRO (0:00-0:30)
**[Screen: Reports dashboard with charts and metrics]**

"Reports turn your daily activities into powerful business intelligence! In 4 minutes, you'll master the analytics that reveal what's working, what's not, and where your biggest opportunities lie."

## FINANCIAL PERFORMANCE REPORTS (0:30-1:30)
**[Screen: Revenue and expense analytics]**

"Access comprehensive financial insights:
- **Revenue Analysis:** Track commission earnings by month, quarter, and year
- **Expense Breakdown:** Understand spending patterns across all business categories
- **ROI by Property:** See which deals generate the highest returns
- **Commission Pipeline:** Forecast future earnings from pending transactions
- **Profitability Trends:** Monitor your business's financial health over time

These reports provide the financial clarity you need for smart business decisions."

## ACTIVITY & PRODUCTIVITY REPORTS (1:30-2:30)
**[Screen: Activity analysis and time tracking reports]**

"Optimize your business operations with:
- **Time Investment Analysis:** See where your hours generate the most revenue
- **Activity Efficiency:** Identify which activities lead to closed deals
- **Lead Source Performance:** Track which marketing channels produce results
- **Conversion Rate Analysis:** Understand your sales funnel effectiveness
- **Daily Productivity Patterns:** Discover your peak performance times

Use these insights to focus your efforts on high-impact activities."

## PROPERTY & MARKET REPORTS (2:30-3:30)
**[Screen: Property performance and market analysis]**

"Gain deeper property and market insights:
- **Property Performance:** Analyze individual deal profitability and timelines
- **Market Segment Analysis:** Compare performance across price ranges and property types
- **Geographic Performance:** See which areas drive your best results
- **Listing vs. Buyer Performance:** Understand your strengths in each role
- **Seasonal Trends:** Identify the best times for different activities

Tailor your strategy based on concrete performance data."

## WRAP-UP (3:30-4:00)
**[Screen: Report summary and export options]**

"Master your Reports section to:
- Make data-driven business decisions
- Identify your most profitable strategies
- Optimize time allocation and focus
- Track progress toward your goals

Data without analysis is just noise - turn yours into competitive advantage!"`
  },
  {
    id: "goals-tour",
    title: "Goals & Target Setting",
    description: "Setting and tracking meaningful business goals",
    duration: 3,
    category: "advanced",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Goals - Video Script
**Duration:** 3 minutes  
**Focus:** Set and achieve meaningful business targets

## INTRO (0:00-0:30)
**[Screen: Goals page with visual progress indicators]**

"Goals transform dreams into achievements! In 3 minutes, you'll master the goal-setting system that successful agents use to build consistent, growing businesses."

## COMPREHENSIVE GOAL SETTING (0:30-1:15)
**[Screen: Add Goal modal with all options]**

"Set powerful goals across every aspect of your business:
- **Revenue Goals:** Annual, quarterly, and monthly income targets
- **Activity Goals:** Daily calls, appointments, and follow-ups
- **Listing Goals:** New listings and CMA completion targets
- **Time Management:** Hours worked and productivity goals
- **Personal Development:** Skill building and education objectives

Comprehensive goal setting ensures balanced business growth."

## GOAL TRACKING & PROGRESS (1:15-2:15)
**[Screen: Goal progress dashboard and calendar view]**

"Track your progress with powerful visual tools:
- **Progress Bars:** Instant visual feedback on goal completion
- **Daily Calendar:** See daily targets and achievements
- **Milestone Celebrations:** Automatic recognition when you hit targets
- **Trend Analysis:** Understand your goal achievement patterns
- **Adjustment Capabilities:** Modify goals as circumstances change

Consistent tracking keeps you motivated and on track."

## GOAL ACHIEVEMENT STRATEGIES (2:15-2:45)
**[Screen: Goal management interface]**

"Maximize your success with proven strategies:
- Set both stretch goals and achievable milestones
- Link daily activities directly to bigger objectives
- Review and adjust goals monthly for relevance
- Celebrate small wins to maintain momentum
- Use goal locking to maintain focus on priorities

Smart goal management accelerates business growth."

## WRAP-UP (2:45-3:00)
**[Screen: Goal achievement dashboard]**

"Remember: Goals without systems are just wishes. Use EliteKPI to:
- Set clear, measurable targets
- Track progress consistently
- Celebrate every achievement
- Build momentum toward bigger success

Your goals define your future - make them count!"`
  },
  {
    id: "performance-tour",
    title: "Performance Analytics",
    description: "Advanced analytics and performance optimization",
    duration: 5,
    category: "advanced",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Performance - Video Script
**Duration:** 5 minutes  
**Focus:** Advanced analytics for business optimization

## INTRO (0:00-0:30)
**[Screen: Performance page with comprehensive analytics]**

"The Performance section is your advanced analytics center! In 5 minutes, you'll master the deep insights that separate top performers from average agents in today's competitive market."

## EFFICIENCY SCORING SYSTEM (0:30-1:30)
**[Screen: Efficiency breakdown with 8 metrics]**

"Your business efficiency score analyzes 8 critical performance areas:
- **Conversion Effectiveness:** How well you turn leads into closings
- **Call Productivity:** Quality and outcomes of client communications
- **ROI Optimization:** Return on time and financial investment
- **Market Performance:** How quickly your listings sell compared to market average
- **Pricing Accuracy:** CMA precision versus actual sale prices
- **Negotiation Skills:** List-to-sale price ratio achievement
- **Time Management:** Productive hours versus total hours worked
- **Deal Retention:** Percentage of contracts that successfully close

This comprehensive analysis reveals exactly where to focus for maximum improvement."

## CONVERSION ANALYTICS DEEP DIVE (1:30-2:30)
**[Screen: Buyer and seller conversion charts]**

"Master your conversion performance with detailed analytics:
- **Buyer Conversion Funnel:** Track prospects from initial contact to purchase
- **Seller Conversion Pipeline:** Monitor CMAs through to signed listing agreements
- **Lead Source Effectiveness:** Identify which marketing channels produce the best clients
- **Conversion Timeline Analysis:** Understand how long your sales process takes
- **Seasonal Conversion Patterns:** Discover when you're most effective

Optimize every step of your sales process with data-driven insights."

## COMPETITIVE PERFORMANCE TRACKING (2:30-3:30)
**[Screen: Achievement system and competitive rankings]**

"Stay motivated with comprehensive achievement tracking:
- **Achievement Badges:** Earn recognition across sales, activity, time, streak, and milestone categories
- **Agent Level System:** Progress from Rookie Agent to Legendary Realtor status
- **Performance Streaks:** Track consistency in daily activities and goal achievement
- **Regional Comparisons:** See how you rank among local market competitors
- **Skill Progression:** Monitor improvement across all business competencies

Gameified performance tracking keeps you motivated and competitive."

## PERFORMANCE OPTIMIZATION INSIGHTS (3:30-4:30)
**[Screen: AI-powered recommendations and trends]**

"Receive intelligent recommendations for business growth:
- **Priority Action Items:** Highest-impact improvements for your specific situation
- **Skill Development Focus:** Areas where improvement will drive the most revenue
- **Process Optimization:** Workflow changes that increase efficiency
- **Resource Allocation:** How to invest time and money for maximum ROI
- **Market Timing Strategies:** When to focus on different activities for best results

Personalized insights help you work smarter, not just harder."

## WRAP-UP (4:30-5:00)
**[Screen: Performance analytics summary]**

"Use Performance analytics to:
- Identify and leverage your natural strengths
- Systematically improve weaker areas
- Track long-term progress and growth
- Stay competitive in an evolving market

Consistent performance tracking is what separates top agents from the rest!"`
  },

  // Premium Features
  {
    id: "smart-tasks-tour",
    title: "Smart Tasks (Premium)",
    description: "AI-powered task automation and intelligent reminders",
    duration: 4,
    category: "advanced",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Smart Tasks - Video Script (Premium Feature)
**Duration:** 4 minutes  
**Focus:** AI-powered productivity and business automation

## INTRO (0:00-0:30)
**[Screen: Smart Tasks interface with AI-generated tasks]**

"Smart Tasks is your AI-powered business assistant! This premium feature analyzes your real estate business and automatically creates, prioritizes, and tracks the tasks that matter most for your success."

## INTELLIGENT TASK CREATION (0:30-1:30)
**[Screen: AI task generation in action]**

"Watch AI transform your business data into actionable tasks:
- **Property-Based Tasks:** Automatic reminders for listing updates, price adjustments, and marketing pushes
- **Client Follow-Up Intelligence:** AI determines optimal contact timing based on client behavior patterns
- **Deal Pipeline Management:** Contract deadline tracking with early warning systems
- **Lead Nurturing Automation:** Personalized follow-up sequences for different lead types
- **Market Opportunity Alerts:** Tasks generated from market trend analysis

Never miss a critical business opportunity again!"

## SMART PRIORITIZATION ENGINE (1:30-2:30)
**[Screen: Task priority scoring and organization]**

"AI prioritizes your tasks using sophisticated algorithms:
- **Revenue Impact Scoring:** Higher commission potential = higher priority
- **Time Sensitivity Analysis:** Deadline proximity and consequences
- **Client Value Assessment:** VIP clients and referral sources get priority
- **Historical Success Patterns:** Tasks that historically lead to closings
- **Market Timing Factors:** Seasonal and market condition influences

Focus your energy where it generates the biggest returns."

## AUTOMATION & EFFICIENCY (2:30-3:30)
**[Screen: Automation dashboard and workflows]**

"Streamline your business with intelligent automation:
- **Workflow Templates:** Pre-built sequences for common scenarios
- **Smart Scheduling:** AI suggests optimal timing for different activities
- **Integration Capabilities:** Connect with your CRM, email, and calendar systems
- **Performance Analytics:** Track which automated tasks drive the best results
- **Custom Rule Creation:** Build automation rules specific to your business style

Automate the routine, amplify the exceptional."

## WRAP-UP (3:30-4:00)
**[Screen: Smart Tasks success metrics]**

"Smart Tasks transforms your business by:
- Eliminating missed opportunities and deadlines
- Focusing your attention on high-value activities
- Automating routine processes for efficiency
- Scaling your business without adding stress

Let AI handle the details while you focus on building relationships and closing deals!"`
  },
  {
    id: "market-timing-ai-tour",
    title: "Market Timing AI (Premium)",
    description: "Predictive market analysis and optimal timing strategies",
    duration: 4,
    category: "advanced",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Market Timing AI - Video Script (Premium Feature)
**Duration:** 4 minutes  
**Focus:** AI-powered market intelligence and strategic timing

## INTRO (0:00-0:30)
**[Screen: Market Timing AI dashboard with predictive charts]**

"Market Timing AI is your crystal ball for real estate success! This premium feature combines advanced machine learning with comprehensive market data to predict optimal timing for every major business decision."

## ADVANCED PREDICTIVE ANALYTICS (0:30-1:30)
**[Screen: AI-powered market forecasting models]**

"AI analyzes hundreds of market variables to provide:
- **5-Month Price Forecasting:** Precise price trajectory predictions with confidence intervals
- **Market Cycle Analysis:** Identify whether you're in a buyer's or seller's market phase
- **Inventory Predictions:** Upcoming supply and demand shifts that affect pricing
- **Seasonal Performance Modeling:** Best months for listings, purchases, and client acquisition
- **Economic Impact Forecasting:** How interest rates, employment, and demographic changes affect your market

Make strategic decisions based on data-driven predictions, not market rumors."

## STRATEGIC LISTING OPTIMIZATION (1:30-2:30)
**[Screen: Listing strategy recommendations]**

"Optimize every listing with AI-powered insights:
- **Perfect Timing Windows:** Precise dates to list for maximum buyer activity
- **Dynamic Pricing Strategies:** Starting prices that generate optimal buyer response
- **Competition Intelligence:** When competitors are listing and how to differentiate
- **Buyer Behavior Predictions:** When your target buyers are most active
- **Market Window Alerts:** Limited-time opportunities for premium pricing

Timing isn't everything - it's the only thing that matters in real estate."

## CLIENT ADVISORY INTELLIGENCE (2:30-3:30)
**[Screen: Client recommendation engine with scenarios]**

"Become the market authority your clients trust:
- **Buy vs. Wait Analysis:** Data-driven recommendations for buyer clients
- **Sell vs. Hold Intelligence:** Investment timing advice for seller clients
- **Market Entry Strategies:** Best times for first-time buyers and investors
- **Portfolio Optimization:** When to buy, sell, or refinance investment properties
- **Risk Assessment Modeling:** Market stability predictions and scenario planning

Position yourself as the market expert with AI-powered market intelligence."

## WRAP-UP (3:30-4:00)
**[Screen: Market timing success dashboard]**

"Market Timing AI transforms your business by:
- Providing data-driven market predictions
- Optimizing listing timing for maximum results
- Enhancing client advisory capabilities
- Giving you competitive intelligence advantages

When you master market timing, you master real estate success!"`
  },
  {
    id: "office-challenges-tour",
    title: "Office Challenges (Premium)",
    description: "Team competitions and brokerage-wide challenges",
    duration: 3,
    category: "advanced",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Office Challenges - Video Script (Premium Feature)
**Duration:** 3 minutes  
**Focus:** Team competitions and brokerage-wide challenges

## INTRO (0:00-0:30)
**[Screen: Office challenges overview]**

"Turn your brokerage into a high-performance team with Office Challenges! Create friendly competitions that motivate agents, build camaraderie, and drive results across your entire office."

## CHALLENGE TYPES (0:30-1:00)
**[Screen: Challenge categories]**

"Create various competition formats:
- **Sales Contests:** Monthly closing competitions
- **Activity Challenges:** Most calls, showings, or listings
- **Team Challenges:** Collaborative group goals
- **Skill Competitions:** CMA accuracy, client satisfaction
- **Seasonal Events:** Holiday-themed contests and bonuses

Keep engagement high with diverse challenge types."

## TEAM MANAGEMENT (1:00-2:00)
**[Screen: Team setup and tracking]**

"Manage office-wide competitions with:
- **Team Creation:** Organize agents into competitive groups
- **Progress Tracking:** Real-time leaderboards and updates
- **Achievement Badges:** Recognition for various accomplishments
- **Point Systems:** Weighted scoring for different activities
- **Prize Management:** Reward distribution and recognition

Foster healthy competition and team spirit."

## PERFORMANCE INSIGHTS (2:00-2:30)
**[Screen: Challenge analytics]**

"Track the impact of challenges on:
- **Overall Office Performance:** Revenue and volume increases
- **Agent Motivation:** Participation and engagement levels
- **Team Collaboration:** Cross-referrals and cooperation
- **Skill Development:** Improvement in key metrics
- **Retention Rates:** Agent satisfaction and loyalty

Measure what motivates your team most effectively."

## WRAP-UP (2:30-3:00)
**[Screen: Challenge leaderboard]**

"Office Challenges help you:
- Motivate agents with friendly competition
- Build stronger team relationships
- Drive office-wide performance improvements
- Create a culture of excellence

Competition brings out everyone's best!"`
  },
  {
    id: "achievements-tour",
    title: "Achievements System (Premium)",
    description: "Gamified success tracking and motivation system",
    duration: 3,
    category: "advanced",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Achievements - Video Script (Premium Feature)
**Duration:** 3 minutes  
**Focus:** Gamified success tracking and motivation system

## INTRO (0:00-0:30)
**[Screen: Achievements overview]**

"Celebrate every win with EliteKPI's Achievement system! Gamify your real estate success with badges, levels, and rewards that recognize your hard work and motivate continued excellence."

## ACHIEVEMENT CATEGORIES (0:30-1:00)
**[Screen: Badge categories]**

"Earn achievements across five categories:
- **Sales Achievements:** Commission milestones from $1K to $1M+
- **Activity Badges:** Client interactions, calls, and showings
- **Time Tracking:** Hours logged from 10 to 2,000+
- **Streak Rewards:** Consistency from 3 days to full year
- **Milestone Celebrations:** Weekly, monthly, and annual achievements

Every effort gets recognized and celebrated!"

## LEVELING SYSTEM (1:00-1:30)
**[Screen: Agent levels and progression]**

"Progress through agent levels:
- **Rookie Agent:** Just getting started
- **Rising Star:** Building momentum
- **Experienced Professional:** Proven performer
- **Market Leader:** Top tier results
- **Legendary Realtor:** Elite status

Each level unlocks new features and recognition."

## MOTIVATION & TRACKING (1:30-2:30)
**[Screen: Progress tracking]**

"Stay motivated with:
- **Progress Bars:** Visual tracking toward next achievements
- **Unlock Notifications:** Instant recognition for new badges
- **Achievement History:** Complete record of your accomplishments
- **Social Sharing:** Celebrate wins with your team
- **Points System:** Accumulate points for various activities

Turn daily work into rewarding game-like progression."

## WRAP-UP (2:30-3:00)
**[Screen: Achievement collection]**

"Achievements help you:
- Stay motivated during challenging periods
- Celebrate incremental progress
- Build confidence through recognition
- Track long-term growth and development

Every achievement earned represents real business success!"`
  },
  {
    id: "leaderboard-tour",
    title: "Leaderboard (Premium)",
    description: "Competitive rankings and peer benchmarking",
    duration: 4,
    category: "advanced",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Leaderboard - Video Script (Premium Feature)
**Duration:** 4 minutes  
**Focus:** Competitive rankings and peer benchmarking

## INTRO (0:00-0:30)
**[Screen: Leaderboard overview]**

"See how you stack up against the competition! The Leaderboard provides competitive rankings that motivate excellence and show where you stand in your market."

## RANKING SYSTEMS (0:30-1:30)
**[Screen: Different ranking categories]**

"Compete across multiple metrics:
- **Overall Performance:** Comprehensive business scoring
- **Revenue Rankings:** Total commission earnings
- **Sales Volume:** Dollar value of transactions
- **Activity Leaders:** Most client interactions and showings
- **Efficiency Rankings:** Best ROI and productivity scores

Find your strengths and competitive advantages."

## GEOGRAPHIC FILTERING (1:30-2:30)
**[Screen: Location-based rankings]**

"Filter rankings by:
- **National Rankings:** Compare against all EliteKPI users
- **Regional Performance:** Your metropolitan area
- **Local Market:** City or county level
- **Office Rankings:** Compete within your brokerage
- **Similar Markets:** Areas with comparable demographics

Compete at the level that matters most to your business."

## COMPETITIVE CHALLENGES (2:30-3:30)
**[Screen: Challenge participation]**

"Join competitive events:
- **Weekly Revenue Sprints:** Short-term income competitions
- **Monthly Activity Contests:** Client interaction challenges
- **Quarterly Goals:** Longer-term achievement contests
- **Annual Championships:** Year-long performance competitions
- **Special Events:** Holiday and seasonal challenges

Stay engaged with ongoing competitive opportunities."

## WRAP-UP (3:30-4:00)
**[Screen: Personal ranking summary]**

"Use the Leaderboard to:
- Benchmark your performance against peers
- Find motivation through friendly competition
- Identify areas for improvement
- Celebrate your competitive achievements

Healthy competition drives extraordinary results!"`
  },

  // Utility Features
  {
    id: "gci-calculator-tour",
    title: "GCI Calculator",
    description: "Gross Commission Income planning and projection",
    duration: 3,
    category: "financial",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# GCI Calculator - Video Script
**Duration:** 3 minutes  
**Focus:** Gross Commission Income planning and projection

## INTRO (0:00-0:30)
**[Screen: GCI Calculator interface]**

"Plan your financial future with the GCI Calculator! This powerful tool helps you project Gross Commission Income based on different scenarios and goals."

## INCOME PROJECTIONS (0:30-1:30)
**[Screen: Calculator inputs and outputs]**

"Calculate projections using:
- **Average Sale Price:** Your typical transaction value
- **Commission Rate:** Your standard commission percentage
- **Transactions Per Month:** Realistic closing frequency
- **Seasonal Adjustments:** Account for market variations
- **Growth Assumptions:** How you expect to scale

Get realistic income projections for planning and goal setting."

## SCENARIO PLANNING (1:30-2:00)
**[Screen: Multiple scenario comparisons]**

"Compare different scenarios:
- **Conservative Estimates:** Safe, achievable projections
- **Aggressive Growth:** Stretch goals and ambitious targets
- **Market Variations:** How market changes affect income
- **Activity Levels:** Impact of increased prospecting
- **Price Point Changes:** Moving to higher/lower price segments

Plan for multiple futures and adjust strategies accordingly."

## FINANCIAL PLANNING (2:00-2:30)
**[Screen: Financial planning features]**

"Use projections for:
- **Monthly Budgeting:** Plan expenses based on expected income
- **Tax Planning:** Estimate quarterly tax obligations
- **Investment Decisions:** When to reinvest in business growth
- **Lifestyle Planning:** Sustainable spending levels
- **Goal Setting:** Realistic yet ambitious targets

Turn projections into actionable financial plans."

## WRAP-UP (2:30-3:00)
**[Screen: GCI summary dashboard]**

"The GCI Calculator helps you:
- Set realistic income goals
- Plan for different scenarios
- Make informed business decisions
- Track progress toward targets

Financial planning drives business success!"`
  },
  {
    id: "billing-tour",
    title: "Billing & Subscriptions",
    description: "Subscription management and billing features",
    duration: 3,
    category: "getting-started",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Billing - Video Script
**Duration:** 3 minutes  
**Focus:** Manage your subscription with confidence

## INTRO (0:00-0:30)
**[Screen: Billing page with subscription overview]**

"Take control of your EliteKPI investment! The Billing section gives you complete transparency and control over your subscription, helping you optimize costs as your business grows."

## SUBSCRIPTION PLAN OPTIONS (0:30-1:15)
**[Screen: Plan comparison with features highlighted]**

"Choose the perfect plan for your business stage:
- **Starter ($29/month):** Essential tracking tools for new agents starting their journey
- **Professional ($29.99/month):** Advanced analytics and productivity features for growing businesses
- **Elite ($79/month):** Premium automation and AI-powered insights for established professionals
- **Enterprise ($199/month):** Complete feature suite with priority support for top performers

Each tier unlocks specific capabilities designed for different business stages."

## BILLING MANAGEMENT & CONTROL (1:15-2:15)
**[Screen: Payment management and billing history]**

"Manage your account with complete transparency:
- **Secure Payment Processing:** Update payment methods with bank-level security
- **Detailed Billing History:** Access all invoices and payment records instantly
- **Usage Analytics:** See exactly how you're using premium features
- **Plan Changes:** Upgrade or downgrade based on your current business needs
- **Subscription Control:** Pause, resume, or modify your plan anytime

No surprises, no hidden fees - just clear, transparent billing."

## BUSINESS GROWTH OPTIMIZATION (2:15-2:45)
**[Screen: Usage optimization dashboard]**

"Optimize your subscription investment by:
- Monitoring which features drive the most value for your business
- Upgrading when premium features can significantly increase your income
- Downgrading during slower seasons to control costs
- Tracking ROI on your EliteKPI investment versus commission increases

Your subscription should pay for itself many times over through increased efficiency and earnings."

## WRAP-UP (2:45-3:00)
**[Screen: Billing summary and next steps]**

"Smart billing management means:
- Choosing the right plan for your current business stage
- Upgrading when premium features can boost your income
- Monitoring usage to ensure you're getting maximum value
- Scaling your subscription with your business growth

Invest in the tools that multiply your success!"`
  },
  {
    id: "settings-tour",
    title: "Settings & Configuration",
    description: "Account configuration and customization options",
    duration: 4,
    category: "getting-started",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Settings - Video Script
**Duration:** 4 minutes  
**Focus:** Account configuration and customization options

## INTRO (0:00-0:30)
**[Screen: Settings overview]**

"Customize EliteKPI to work exactly how you want! The Settings section provides comprehensive control over your account, preferences, and system configuration."

## PROFILE SETTINGS (0:30-1:00)
**[Screen: Profile configuration]**

"Configure your professional profile:
- **Personal Information:** Name, contact details, photo
- **Professional Details:** License number, brokerage affiliation
- **Market Areas:** Geographic regions you serve
- **Specializations:** Property types and client focus
- **Bio and Marketing:** Professional description and website

Present yourself professionally to clients and colleagues."

## BUSINESS PREFERENCES (1:00-2:00)
**[Screen: Business configuration]**

"Customize business settings:
- **Commission Rates:** Default percentages for calculations
- **Target Hourly Rate:** For ROI and time value calculations
- **Business Hours:** When you're available for showings
- **Calendar Integration:** Sync with Google, Outlook, or Apple
- **Notification Preferences:** Email, SMS, and in-app alerts

Configure EliteKPI to match your business practices."

## SYSTEM CUSTOMIZATION (2:00-3:00)
**[Screen: System preferences]**

"Personalize your experience with:
- **Dashboard Layout:** Choose widgets and metrics display
- **Theme Options:** Light, dark, or auto-switching themes
- **Language Settings:** Interface language preferences
- **Time Zone:** Ensure accurate scheduling and reporting
- **Data Export Options:** Choose formats for reports and backups

Make EliteKPI feel like your own personalized system."

## PRIVACY & SECURITY (3:00-3:30)
**[Screen: Security settings]**

"Protect your data with:
- **Password Management:** Update login credentials
- **Two-Factor Authentication:** Enhanced account security
- **Data Privacy:** Control information sharing and visibility
- **Session Management:** Control active login sessions
- **Backup Preferences:** Automatic data protection settings

Keep your business information secure and private."

## WRAP-UP (3:30-4:00)
**[Screen: Settings summary]**

"Settings help you:
- Personalize your EliteKPI experience
- Configure business-specific preferences
- Maintain security and privacy
- Optimize system performance

A properly configured system works better for your business!"`
  },
  {
    id: "help-tour",
    title: "Help & Support Resources",
    description: "Support resources and learning materials",
    duration: 3,
    category: "getting-started",
    platform: "youtube",
    embedId: "placeholder",
    hasScript: true,
    scriptContent: `# Help - Video Script
**Duration:** 3 minutes  
**Focus:** Master EliteKPI with comprehensive training resources

## INTRO (0:00-0:30)
**[Screen: Help center with video library]**

"Welcome to your EliteKPI training center! In 3 minutes, you'll discover how to access all the learning resources, video tutorials, and support tools that help you master every feature and maximize your success."

## COMPREHENSIVE VIDEO TRAINING (0:30-1:15)
**[Screen: Video library with categories]**

"Access professional training videos across four key categories:
- **Getting Started:** Master the fundamentals with Dashboard, Properties, and Activities tutorials
- **Financial Management:** Learn advanced tracking with CMAs, Commissions, and Expense management
- **Advanced Analytics:** Dive deep into Market Trends, Reports, Goals, and Performance optimization
- **Premium Features:** Unlock the power of Smart Tasks, Market Timing AI, Achievements, and competitive Leaderboards

Each video includes detailed scripts, practical examples, and step-by-step instructions."

## INTERACTIVE LEARNING TOOLS (1:15-2:00)
**[Screen: Script viewing and feature navigation]**

"Enhance your learning experience with:
- **Detailed Video Scripts:** Read along while watching or study offline
- **Feature Categories:** Organized learning paths from beginner to advanced
- **Quick Reference Guides:** Fast access to key information when you need it
- **Progressive Training:** Start with basics and advance to premium features
- **Practical Examples:** Real-world scenarios and best practices

Learn at your pace with resources designed for busy real estate professionals."

## ONGOING SUPPORT & DEVELOPMENT (2:00-2:45)
**[Screen: Support resources and updates]**

"Stay current and get help with:
- **Regular Content Updates:** New videos as features are added and improved
- **Support Documentation:** Comprehensive guides for troubleshooting and optimization
- **Feature Release Notes:** Stay informed about new capabilities and improvements
- **Best Practice Updates:** Learn from successful users and industry changes
- **Personalized Assistance:** Access support when you need specific help with your business setup

Continuous learning drives continuous success."

## WRAP-UP (2:45-3:00)
**[Screen: Complete Help center overview]**

"Use the Help center to:
- Master every EliteKPI feature with professional video training
- Access detailed scripts and reference materials
- Stay updated on new features and capabilities
- Get support when you need assistance

Your success with EliteKPI depends on how well you use it - let us help you excel!"`
  }
];

export function getVideoById(id: string): VideoContent | undefined {
  return videoContent.find(video => video.id === id);
}

export function getVideosByCategory(category: VideoContent['category']): VideoContent[] {
  return videoContent.filter(video => video.category === category);
}

// Function to load script content from files
export async function loadVideoScript(scriptPath: string): Promise<string> {
  try {
    const response = await fetch(`/training-scripts/${scriptPath}`);
    if (response.ok) {
      return await response.text();
    }
    return 'Script content not available.';
  } catch (error) {
    console.error('Failed to load script:', error);
    return 'Script content not available.';
  }
}

// Enhanced video content with script loading
export async function getEnhancedVideoContent(): Promise<VideoContent[]> {
  const enhanced = await Promise.all(videoContent.map(async (video) => {
    if (video.hasScript && video.id.includes('video')) {
      const scriptFileName = video.id.replace('-video', '-script.md');
      const scriptContent = await loadVideoScript(scriptFileName);
      return { ...video, scriptContent };
    }
    return video;
  }));
  
  return enhanced;
}