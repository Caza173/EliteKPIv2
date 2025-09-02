import OpenAI from 'openai';

const isDevelopment = process.env.NODE_ENV === 'development';

if (!process.env.OPENAI_API_KEY && !isDevelopment) {
  throw new Error("OPENAI_API_KEY environment variable must be set");
}

// Create OpenAI client only if API key is available
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

interface MarketData {
  daysOnMarket: number;
  priceChange: number;
  inventory: number;
  medianPrice: number;
  salesVolume: number;
  competitiveScore?: number;
  location: string;
  propertyType: string;
  marketCondition?: string;
  pricePerSqft?: number;
  inventoryLevel?: number;
  competitionLevel?: string;
  seasonalTrends?: string;
  zipcodeFactors?: string;
}

interface ListingStrategy {
  title: string;
  strategy: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

interface MarketingStrategy {
  title: string;
  strategy: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

interface AIStrategies {
  listingStrategies: ListingStrategy[];
  marketingStrategies: MarketingStrategy[];
  marketSummary: string;
}

export class AIStrategyService {
  async generateListingAndMarketingStrategies(marketData: MarketData): Promise<AIStrategies> {
    try {
      if (!openai) {
        // Return default strategies in development mode
        return {
          listingStrategies: [
            {
              title: "Competitive Pricing",
              strategy: "Price competitively based on comparable sales",
              reasoning: "Market analysis shows optimal pricing attracts more buyers",
              priority: "high" as const
            },
            {
              title: "Feature Highlighting",
              strategy: "Highlight unique property features",
              reasoning: "Unique features differentiate from competition",
              priority: "medium" as const
            },
            {
              title: "Professional Presentation",
              strategy: "Professional photography and staging",
              reasoning: "Quality presentation increases buyer interest",
              priority: "high" as const
            }
          ],
          marketingStrategies: [
            {
              title: "Platform Marketing",
              strategy: "List on major real estate platforms",
              reasoning: "Maximum exposure to potential buyers",
              priority: "high" as const
            },
            {
              title: "Social Media",
              strategy: "Social media marketing campaign",
              reasoning: "Reach broader audience through social channels",
              priority: "medium" as const
            },
            {
              title: "Open House",
              strategy: "Open house events",
              reasoning: "Direct buyer engagement and feedback",
              priority: "medium" as const
            }
          ],
          marketSummary: "Development mode - using default strategies. Configure OpenAI API key for AI-generated insights."
        };
      }

      // Using gpt-3.5-turbo for faster response times as requested by user
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        max_completion_tokens: 1500,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are a real estate market expert AI assistant. Analyze market data and provide specific, actionable listing and marketing strategies for real estate agents. 

            Focus on:
            - Pricing strategies based on market conditions
            - Optimal timing recommendations
            - Competition analysis
            - Marketing channel recommendations
            - Property staging and presentation tips
            - Target buyer demographics

            Always provide practical, data-driven recommendations that agents can implement immediately.

            Respond with JSON in this exact format:
            {
              "listingStrategies": [
                {
                  "title": "Strategy Title",
                  "strategy": "Detailed strategy description",
                  "reasoning": "Why this strategy works for current market",
                  "priority": "high/medium/low"
                }
              ],
              "marketingStrategies": [
                {
                  "title": "Marketing Title", 
                  "strategy": "Detailed marketing approach",
                  "reasoning": "Market-based reasoning",
                  "priority": "high/medium/low"
                }
              ],
              "marketSummary": "Brief 2-3 sentence market overview"
            }`
          },
          {
            role: "user",
            content: `Analyze this market data and provide listing and marketing strategies:

            Location: ${marketData.location}
            Property Type: ${marketData.propertyType}
            
            Comprehensive Market Analysis:
            - Average Days on Market: ${marketData.daysOnMarket} days
            - Price Change (YoY): ${marketData.priceChange > 0 ? '+' : ''}${marketData.priceChange}%
            - Market Inventory: ${marketData.inventory} months supply
            - Median Price: $${marketData.medianPrice.toLocaleString()}
            - Sales Volume: ${marketData.salesVolume} transactions/month
            ${marketData.competitiveScore ? `- Competition Score: ${marketData.competitiveScore}/100` : ''}
            - Market Condition: ${marketData.marketCondition || 'Unknown'}
            - Price per Sq Ft: $${marketData.pricePerSqft || 'N/A'}
            - Inventory Level: ${marketData.inventoryLevel || marketData.inventory} months
            - Local Competition Level: ${marketData.competitionLevel || 'Medium'}
            - Seasonal Patterns: ${marketData.seasonalTrends || 'Standard seasonal trends'}
            - Zipcode-specific factors: ${marketData.zipcodeFactors || 'Standard location metrics'}

            Provide 3-4 listing strategies and 3-4 marketing strategies with clear priorities. Leverage ALL available market data to create location-specific, zipcode-aware recommendations that address the unique characteristics of this market area. Focus on competitive advantages based on local market conditions, seasonal patterns, and neighborhood-specific buyer preferences.`
          }
        ]
      });

      const content = response.choices[0].message.content;
      console.log('OpenAI AI Strategies Response:', content);
      
      if (!content) {
        console.log('No content received from OpenAI, using fallback strategies');
        return this.generateFallbackStrategies(marketData);
      }
      
      const result = JSON.parse(content);
      
      // Validate that we have the required structure
      if (!result.listingStrategies || !result.marketingStrategies) {
        console.log('Invalid AI response structure, using fallback strategies');
        return this.generateFallbackStrategies(marketData);
      }
      
      return result as AIStrategies;
    } catch (error) {
      console.error("Error generating AI strategies:", error);
      
      // Fallback strategies based on market conditions
      return this.generateFallbackStrategies(marketData);
    }
  }

  private generateFallbackStrategies(marketData: MarketData): AIStrategies {
    const isHotMarket = marketData.daysOnMarket < 15;
    const isAppreciating = marketData.priceChange > 5;
    const isLowInventory = marketData.inventory < 2;
    const isHighPriced = marketData.medianPrice > 600000;

    console.log('Generating fallback strategies for:', {
      location: marketData.location,
      daysOnMarket: marketData.daysOnMarket,
      priceChange: marketData.priceChange,
      isHotMarket,
      isAppreciating,
      isLowInventory
    });

    return {
      listingStrategies: [
        {
          title: isHotMarket ? "Aggressive Pricing Strategy" : "Strategic Market Positioning",
          strategy: isHotMarket 
            ? "Price at 98-102% of market value to capture multiple offers while maintaining competitive advantage"
            : "Price at 95-98% of market value to attract buyers and allow negotiation room",
          reasoning: `With ${marketData.daysOnMarket} average days on market, ${isHotMarket ? 'aggressive' : 'strategic'} pricing maximizes returns`,
          priority: "high"
        },
        {
          title: "Optimal Listing Timing",
          strategy: isHotMarket
            ? "List Thursday-Saturday to maximize weekend showing traffic and quick multiple offers"
            : "List Tuesday-Thursday to build momentum through the weekend showing cycle",
          reasoning: "Market pace and buyer behavior patterns determine optimal timing strategy",
          priority: "high"
        },
        {
          title: "Property Preparation Strategy",
          strategy: isHotMarket
            ? "Focus on curb appeal and major systems - buyers will overlook minor cosmetics in this market"
            : "Invest in staging and minor improvements to differentiate from competition",
          reasoning: `Market conditions ${isHotMarket ? 'allow minimal preparation' : 'require extra effort to stand out'}`,
          priority: "medium"
        }
      ],
      marketingStrategies: [
        {
          title: "Digital Marketing Approach",
          strategy: isHotMarket
            ? "Heavy MLS presence, social media blitz, and targeted ads to motivated buyers - speed is key"
            : "Comprehensive online marketing with virtual tours, detailed descriptions, and multi-platform exposure",
          reasoning: `${marketData.location} market velocity requires ${isHotMarket ? 'rapid exposure' : 'thorough presentation'}`,
          priority: "high"
        },
        {
          title: "Professional Photography & Media",
          strategy: isHotMarket
            ? "Professional photos essential, consider drone footage for unique properties over $500k"
            : "Premium photography package with virtual staging, twilight shots, and detailed interior focus",
          reasoning: "Visual presentation drives buyer interest and determines showing volume",
          priority: "high"
        },
        {
          title: "Target Buyer Strategy",
          strategy: isHighPriced
            ? "Focus on affluent buyer networks, luxury lifestyle marketing, and executive relocation services"
            : "Broad market appeal with first-time buyer programs, local community features, and family-focused messaging",
          reasoning: `${marketData.medianPrice > 500000 ? 'Higher price point' : 'Market price point'} determines buyer demographics and messaging`,
          priority: "medium"
        },
        {
          title: "Competition Analysis Response",
          strategy: isLowInventory
            ? "Highlight unique property features and create urgency with 'limited inventory' messaging"
            : "Emphasize value proposition and property advantages over similar listings",
          reasoning: `${isLowInventory ? 'Low inventory' : 'Normal inventory'} levels shape competitive positioning`,
          priority: "medium"
        }
      ],
      marketSummary: `${marketData.location} shows ${isHotMarket ? 'extremely hot' : isLowInventory ? 'competitive' : 'balanced'} market conditions with ${marketData.daysOnMarket} days average sale time, ${marketData.priceChange > 0 ? '+' : ''}${marketData.priceChange}% price change, and ${marketData.inventory} months inventory supply. ${isAppreciating ? 'Strong appreciation trends favor sellers.' : 'Stable market conditions provide good opportunity for strategic pricing.'}`
    };
  }
}

export const aiStrategyService = new AIStrategyService();