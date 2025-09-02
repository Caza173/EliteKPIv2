import OpenAI from "openai";
import type { PersonalizedInsight, InsertPersonalizedInsight, DashboardMetrics, User } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface UserPerformanceData {
  totalRevenue: number;
  propertiesClosed: number;
  averageDaysOnMarket: number;
  conversionRate: number;
  revenuePerHour: number;
  totalExpenses: number;
  activeListings: number;
  underContractValue: number;
  ytdHours: number;
  avgTransactionPeriod: number;
  // Market focus areas
  primaryMarkets: string[];
  propertyTypes: string[];
  clientTypes: string[];
}

interface MarketContextData {
  location?: string;
  averagePrice: number;
  daysOnMarket: number;
  inventoryLevel: number;
  priceChange: number;
  competitionLevel: string;
  marketCondition?: string;
  pricePerSqft?: number;
  seasonalTrends?: string;
  zipcodeFactors?: string;
}

interface InsightGenerationRequest {
  userId: string;
  userProfile: User;
  performanceData: UserPerformanceData;
  marketData: MarketContextData;
  timeframe: 'weekly' | 'monthly' | 'quarterly';
}

export class PersonalizedInsightsService {
  
  async generateInsights(request: InsightGenerationRequest): Promise<InsertPersonalizedInsight[]> {
    try {
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          {
            role: "system",
            content: `You are an AI business consultant specializing in real estate agent performance optimization. 
            
            Analyze the agent's performance data, user profile, and market conditions to generate personalized business insights.
            
            Focus on:
            - Performance gaps and improvement opportunities
            - Market opportunities based on current conditions
            - Operational efficiency recommendations
            - Business growth strategies
            - Client relationship optimization
            - Pricing and marketing strategies
            - Time management and productivity
            
            Provide actionable, specific recommendations with clear metrics and timeframes.
            
            Respond with JSON in this exact format:
            {
              "insights": [
                {
                  "insightType": "market_opportunity|performance_improvement|business_growth|efficiency",
                  "title": "Clear, compelling insight title",
                  "description": "Detailed explanation of the insight and why it matters",
                  "priority": "high|medium|low",
                  "category": "pricing|marketing|prospecting|operations|client_relations",
                  "actionableSteps": [
                    "Specific step 1",
                    "Specific step 2",
                    "Specific step 3"
                  ],
                  "metrics": {
                    "currentValue": "Current metric value",
                    "targetValue": "Target metric value", 
                    "expectedImpact": "Expected business impact",
                    "kpiToTrack": "Key metric to monitor"
                  },
                  "confidence": 85,
                  "potentialImpact": "high|medium|low",
                  "timeframe": "immediate|7_days|30_days|90_days|1_year"
                }
              ]
            }`
          },
          {
            role: "user",
            content: `Generate personalized business insights for this real estate agent:

            USER PROFILE:
            - Email: ${request.userProfile.email}
            - Hourly Rate: $${request.userProfile.hourlyRate}
            - Default Commission Split: ${request.userProfile.defaultCommissionSplit}%
            - Experience Level: ${request.performanceData.propertiesClosed > 20 ? 'Experienced' : request.performanceData.propertiesClosed > 5 ? 'Intermediate' : 'Beginner'}

            PERFORMANCE DATA:
            - Total Revenue: $${request.performanceData.totalRevenue.toLocaleString()}
            - Properties Closed: ${request.performanceData.propertiesClosed}
            - Active Listings: ${request.performanceData.activeListings}
            - Under Contract Value: $${request.performanceData.underContractValue.toLocaleString()}
            - Average Days on Market: ${request.performanceData.averageDaysOnMarket} days
            - Conversion Rate: ${request.performanceData.conversionRate}%
            - Revenue per Hour: $${request.performanceData.revenuePerHour}/hr
            - Total Expenses: $${request.performanceData.totalExpenses.toLocaleString()}
            - YTD Hours: ${request.performanceData.ytdHours}
            - Avg Transaction Period: ${request.performanceData.avgTransactionPeriod} days

            MARKET CONDITIONS (${request.marketData.location || 'Local Market'}):
            - Location: ${request.marketData.location || 'Not specified'}
            - Average Market Price: $${request.marketData.averagePrice.toLocaleString()}
            - Market Days on Market: ${request.marketData.daysOnMarket} days
            - Inventory Level: ${request.marketData.inventoryLevel} months
            - Price Change YoY: ${request.marketData.priceChange > 0 ? '+' : ''}${request.marketData.priceChange}%
            - Competition Level: ${request.marketData.competitionLevel}
            - Market Condition: ${request.marketData.marketCondition || 'Unknown'}
            - Price per Sq Ft: $${request.marketData.pricePerSqft || 'N/A'}
            - Seasonal Trends: ${request.marketData.seasonalTrends || 'Standard seasonal patterns'}

            ANALYSIS TIMEFRAME: ${request.timeframe}

            Generate 4-6 personalized insights covering different categories with specific, actionable recommendations. Focus on location-specific strategies that leverage the unique market conditions of this area. Include zipcode-specific opportunities and challenges.`
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_completion_tokens: 2000
      });

      const aiResponse = JSON.parse(response.choices[0].message.content || '{}');
      
      if (!aiResponse.insights || !Array.isArray(aiResponse.insights)) {
        throw new Error('Invalid AI response format');
      }

      // Convert AI insights to database format
      const insights: InsertPersonalizedInsight[] = aiResponse.insights.map((insight: any) => ({
        userId: request.userId,
        insightType: insight.insightType,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        category: insight.category,
        actionableSteps: insight.actionableSteps,
        metrics: insight.metrics,
        confidence: insight.confidence || 85,
        potentialImpact: insight.potentialImpact,
        timeframe: insight.timeframe,
        marketData: request.marketData,
        performanceData: request.performanceData,
        validUntil: this.calculateValidUntil(insight.timeframe),
        isViewed: false,
        isArchived: false
      }));

      return insights;

    } catch (error: any) {
      console.error('Error generating personalized insights:', error);
      
      // Return fallback insights if AI fails
      return this.getFallbackInsights(request);
    }
  }

  private calculateValidUntil(timeframe: string): Date {
    const now = new Date();
    switch (timeframe) {
      case 'immediate':
      case '7_days':
        return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
      case '30_days':
        return new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000); // 45 days
      case '90_days':
        return new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000); // 120 days
      case '1_year':
        return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000); // 1 year
      default:
        return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
  }

  private getFallbackInsights(request: InsightGenerationRequest): InsertPersonalizedInsight[] {
    const insights: InsertPersonalizedInsight[] = [];
    const { performanceData, marketData } = request;

    // Performance-based fallback insights
    if (performanceData.conversionRate < 15) {
      insights.push({
        userId: request.userId,
        insightType: 'performance_improvement',
        title: 'Improve Lead Conversion Rate',
        description: `Your current conversion rate of ${performanceData.conversionRate}% is below the industry average of 20%. Focus on improving your follow-up systems and client qualification process.`,
        priority: 'high',
        category: 'prospecting',
        actionableSteps: [
          'Implement a CRM system for systematic follow-up',
          'Create a lead qualification questionnaire',
          'Set up automated email sequences for new leads',
          'Schedule weekly lead review sessions'
        ],
        metrics: {
          currentValue: `${performanceData.conversionRate}%`,
          targetValue: '20%',
          expectedImpact: 'Increase closed deals by 30%',
          kpiToTrack: 'Monthly conversion rate'
        },
        confidence: 88,
        potentialImpact: 'high',
        timeframe: '30_days',
        marketData: request.marketData,
        performanceData: request.performanceData,
        validUntil: this.calculateValidUntil('30_days'),
        isViewed: false,
        isArchived: false
      });
    }

    if (marketData.daysOnMarket < 20 && performanceData.averageDaysOnMarket > marketData.daysOnMarket) {
      insights.push({
        userId: request.userId,
        insightType: 'market_opportunity',
        title: 'Capitalize on Fast-Moving Market',
        description: `The market is moving quickly with properties selling in ${marketData.daysOnMarket} days on average. Your listings average ${performanceData.averageDaysOnMarket} days. Optimize your pricing and marketing strategy.`,
        priority: 'high',
        category: 'pricing',
        actionableSteps: [
          'Review current listing pricing strategies',
          'Enhance property photography and staging',
          'Increase digital marketing investment',
          'Consider slight price reductions for quicker sales'
        ],
        metrics: {
          currentValue: `${performanceData.averageDaysOnMarket} days`,
          targetValue: `${marketData.daysOnMarket} days`,
          expectedImpact: 'Faster inventory turnover, higher client satisfaction',
          kpiToTrack: 'Average days on market'
        },
        confidence: 92,
        potentialImpact: 'high',
        timeframe: 'immediate',
        marketData: request.marketData,
        performanceData: request.performanceData,
        validUntil: this.calculateValidUntil('immediate'),
        isViewed: false,
        isArchived: false
      });
    }

    if (performanceData.revenuePerHour < 150) {
      insights.push({
        userId: request.userId,
        insightType: 'efficiency',
        title: 'Increase Revenue per Hour',
        description: `Your revenue per hour of $${performanceData.revenuePerHour} indicates opportunities for efficiency improvements. Focus on higher-value activities and streamline processes.`,
        priority: 'medium',
        category: 'operations',
        actionableSteps: [
          'Delegate administrative tasks to support staff',
          'Use showing assistants for initial viewings',
          'Implement time-blocking for high-value activities',
          'Automate routine communications and follow-ups'
        ],
        metrics: {
          currentValue: `$${performanceData.revenuePerHour}/hr`,
          targetValue: '$200/hr',
          expectedImpact: 'Increase hourly productivity by 33%',
          kpiToTrack: 'Weekly revenue per hour worked'
        },
        confidence: 85,
        potentialImpact: 'medium',
        timeframe: '90_days',
        marketData: request.marketData,
        performanceData: request.performanceData,
        validUntil: this.calculateValidUntil('90_days'),
        isViewed: false,
        isArchived: false
      });
    }

    return insights;
  }

  async generateWeeklyInsights(userId: string, userProfile: User, metrics: DashboardMetrics, marketData: any) {
    const performanceData: UserPerformanceData = {
      totalRevenue: metrics.totalRevenue || 0,
      propertiesClosed: metrics.propertiesClosed || 0,
      averageDaysOnMarket: marketData?.daysOnMarket || 30,
      conversionRate: metrics.conversionRate || 0,
      revenuePerHour: metrics.revenuePerHour || 0,
      totalExpenses: metrics.totalExpenses || 0,
      activeListings: metrics.activeListings || 0,
      underContractValue: metrics.underContractValue || 0,
      ytdHours: metrics.ytdHours || 0,
      avgTransactionPeriod: metrics.avgTransactionPeriod || 0,
      primaryMarkets: ['General'], // Could be enhanced with actual data
      propertyTypes: ['Single Family'], // Could be enhanced with actual data
      clientTypes: ['Buyers', 'Sellers'] // Could be enhanced with actual data
    };

    const marketContextData: MarketContextData = {
      averagePrice: marketData?.medianPrice || 500000,
      daysOnMarket: marketData?.daysOnMarket || 30,
      inventoryLevel: marketData?.inventory || 2,
      priceChange: marketData?.priceChange || 5,
      competitionLevel: marketData?.competitionLevel || 'medium',
      seasonalTrends: marketData?.seasonalTrends || {}
    };

    return await this.generateInsights({
      userId,
      userProfile,
      performanceData,
      marketData: marketContextData,
      timeframe: 'weekly'
    });
  }
}

export const personalizedInsightsService = new PersonalizedInsightsService();