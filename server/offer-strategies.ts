import OpenAI from "openai";

const isDevelopment = process.env.NODE_ENV === 'development';

// Define MarketData interface locally since it's not exported from marketData
interface MarketData {
  location: string;
  propertyType: string;
  daysOnMarket: number;
  priceChange: number;
  inventory: number;
  medianPrice: number;
  salesVolume: number;
  competitiveScore?: number;
  pricePerSqFt?: number;
}

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

export interface OfferFactors {
  // Property factors
  listingPrice: number;
  proposedOffer: number;
  propertyCondition: 'excellent' | 'good' | 'fair' | 'needs_work' | 'fixer_upper';
  
  // Seller motivation factors
  sellerMotivation: 'extremely_motivated' | 'motivated' | 'somewhat_motivated' | 'not_motivated' | 'testing_market';
  daysOnMarket: number;
  priceReductions: number;
  reasonForSelling: 'relocation' | 'upgrade' | 'downsize' | 'financial' | 'divorce' | 'estate' | 'investment' | 'other';
  
  // Timeline factors
  desiredCloseDate?: string;
  sellerTimeframe: 'asap' | '30_days' | '60_days' | '90_days' | 'flexible' | 'no_rush';
  buyerTimeframe: 'asap' | '30_days' | '60_days' | '90_days' | 'flexible';
  
  // Market factors
  marketData: MarketData;
  competitionLevel: 'high' | 'medium' | 'low';
  seasonalTiming: 'peak' | 'good' | 'average' | 'slow';
  
  // Additional context
  propertyType: string;
  location: string;
  uniqueFeatures?: string[];
  repairNeeds?: string[];
  concessions?: string[];
}

export interface OfferStrategy {
  recommendedOffer: number;
  offerPercentage: number;
  confidence: number;
  strategy: 'aggressive' | 'competitive' | 'balanced' | 'conservative';
  reasoning: string;
  terms: {
    inspectionPeriod: number;
    financingContingency: number;
    appraisalContingency: boolean;
    escalationClause?: {
      maxPrice: number;
      increment: number;
    };
  };
  negotiationTips: string[];
  riskFactors: string[];
  strengths: string[];
  timeline: {
    responseDeadline: string;
    closeDate: string;
    keyMilestones: Array<{
      milestone: string;
      date: string;
      importance: 'critical' | 'important' | 'flexible';
    }>;
  };
}

export interface OfferStrategies {
  primaryStrategy: OfferStrategy;
  alternativeStrategies: OfferStrategy[];
  marketSummary: string;
  competitiveAnalysis: string;
  recommendedApproach: string;
}

export class OfferStrategyService {
  async generateOfferStrategies(factors: OfferFactors): Promise<OfferStrategies> {
    try {
      console.log('Generating offer strategies for factors:', JSON.stringify(factors, null, 2));
      
      if (!openai) {
        // Return default strategies in development mode
        return {
          primaryStrategy: {
            recommendedOffer: factors.listingPrice * 0.92,
            offerPercentage: 92,
            confidence: 75,
            strategy: "balanced",
            reasoning: "Development mode - using default balanced strategy",
            terms: {
              inspectionPeriod: 10,
              financingContingency: 30,
              appraisalContingency: true
            },
            negotiationTips: [
              "Research comparable sales in the area",
              "Be prepared to negotiate on terms",
              "Show seller motivation and qualifications"
            ],
            riskFactors: [
              "Market conditions may change",
              "Property condition unknown until inspection"
            ],
            strengths: [
              "Reasonable offer shows serious intent",
              "Standard terms are seller-friendly"
            ],
            timeline: {
              responseDeadline: "48 hours",
              closeDate: "30 days",
              keyMilestones: [
                {
                  milestone: "Inspection completion",
                  date: "10 days",
                  importance: "critical"
                },
                {
                  milestone: "Financing approval",
                  date: "21 days", 
                  importance: "critical"
                }
              ]
            }
          },
          alternativeStrategies: [
            {
              recommendedOffer: factors.listingPrice * 0.95,
              offerPercentage: 95,
              confidence: 85,
              strategy: "competitive",
              reasoning: "Higher offer for quick acceptance",
              terms: {
                inspectionPeriod: 7,
                financingContingency: 21,
                appraisalContingency: true
              },
              negotiationTips: [
                "Submit quickly to beat competition",
                "Consider waiving minor contingencies"
              ],
              riskFactors: [
                "Higher price reduces negotiation room"
              ],
              strengths: [
                "Strong offer likely to be accepted",
                "Faster timeline appeals to sellers"
              ],
              timeline: {
                responseDeadline: "24 hours",
                closeDate: "21 days",
                keyMilestones: [
                  {
                    milestone: "Inspection completion",
                    date: "7 days",
                    importance: "critical"
                  }
                ]
              }
            }
          ],
          marketSummary: "Development mode - using default market analysis",
          competitiveAnalysis: "No real-time data available in development mode",
          recommendedApproach: "Start with balanced offer and be prepared to adjust based on seller response"
        };
      }
      
      // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        max_completion_tokens: 2000,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an expert real estate negotiation strategist with 20+ years of experience. Analyze offer scenarios considering ALL factors: market conditions, property condition, seller motivation, timelines, and competition.

            Create comprehensive offer strategies that maximize success probability while protecting buyer interests.

            Focus on:
            - Offer pricing strategy based on motivation, condition, and timeline
            - Terms optimization for competitive advantage
            - Risk mitigation and contingency planning
            - Timeline coordination between all parties
            - Negotiation psychology and seller appeal
            - Market timing and seasonal factors

            Provide specific, actionable recommendations with confidence levels.

            Respond with JSON in this exact format:
            {
              "primaryStrategy": {
                "recommendedOffer": 550000,
                "offerPercentage": 95.5,
                "confidence": 87,
                "strategy": "aggressive|competitive|balanced|conservative",
                "reasoning": "Detailed analysis explaining the offer amount and strategy",
                "terms": {
                  "inspectionPeriod": 7,
                  "financingContingency": 21,
                  "appraisalContingency": true,
                  "escalationClause": {
                    "maxPrice": 565000,
                    "increment": 2500
                  }
                },
                "negotiationTips": ["Tip 1", "Tip 2", "Tip 3"],
                "riskFactors": ["Risk 1", "Risk 2"],
                "strengths": ["Strength 1", "Strength 2"],
                "timeline": {
                  "responseDeadline": "24 hours",
                  "closeDate": "45 days",
                  "keyMilestones": [
                    {
                      "milestone": "Inspection completion",
                      "date": "7 days",
                      "importance": "critical"
                    }
                  ]
                }
              },
              "alternativeStrategies": [
                // 2-3 alternative strategies in same format
              ],
              "marketSummary": "Brief market context",
              "competitiveAnalysis": "Competition analysis",
              "recommendedApproach": "Overall strategy recommendation"
            }`
          },
          {
            role: "user",
            content: `Analyze this offer scenario and provide comprehensive strategies:

            PROPERTY DETAILS:
            - Listing Price: $${factors.listingPrice.toLocaleString()}
            - Proposed Offer: $${factors.proposedOffer.toLocaleString()}
            - Property Type: ${factors.propertyType}
            - Location: ${factors.location}
            - Condition: ${factors.propertyCondition.replace('_', ' ')}
            ${factors.uniqueFeatures?.length ? `- Unique Features: ${factors.uniqueFeatures.join(', ')}` : ''}
            ${factors.repairNeeds?.length ? `- Repair Needs: ${factors.repairNeeds.join(', ')}` : ''}

            SELLER MOTIVATION:
            - Motivation Level: ${factors.sellerMotivation.replace('_', ' ')}
            - Days on Market: ${factors.daysOnMarket} days
            - Price Reductions: ${factors.priceReductions}
            - Reason for Selling: ${factors.reasonForSelling}
            - Seller Timeline: ${factors.sellerTimeframe.replace('_', ' ')}

            TIMELINE FACTORS:
            - Buyer Timeline: ${factors.buyerTimeframe.replace('_', ' ')}
            ${factors.desiredCloseDate ? `- Desired Close Date: ${factors.desiredCloseDate}` : ''}

            MARKET CONDITIONS:
            - Location: ${factors.marketData.location}
            - Median Price: $${factors.marketData.medianPrice.toLocaleString()}
            - Average Days on Market: ${factors.marketData.daysOnMarket} days
            - Price Change (YoY): ${factors.marketData.priceChange > 0 ? '+' : ''}${factors.marketData.priceChange}%
            - Inventory Level: ${factors.marketData.inventory} months
            - Sales Volume: ${factors.marketData.salesVolume}/month
            - Competition Level: ${factors.competitionLevel}
            - Seasonal Timing: ${factors.seasonalTiming}
            ${factors.marketData.competitiveScore ? `- Competition Score: ${factors.marketData.competitiveScore}/100` : ''}
            ${factors.marketData.pricePerSqFt ? `- Price per Sq Ft: $${factors.marketData.pricePerSqFt}` : ''}

            ADDITIONAL CONTEXT:
            ${factors.concessions?.length ? `- Requested Concessions: ${factors.concessions.join(', ')}` : ''}

            Provide detailed offer strategies considering all motivation, condition, and timeline factors for maximum success probability.`
          }
        ]
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        primaryStrategy: result.primaryStrategy || this.getFallbackStrategy(factors),
        alternativeStrategies: result.alternativeStrategies || this.getAlternativeStrategies(factors),
        marketSummary: result.marketSummary || `${factors.location} market analysis based on current conditions`,
        competitiveAnalysis: result.competitiveAnalysis || `Competition level: ${factors.competitionLevel}`,
        recommendedApproach: result.recommendedApproach || 'Balanced approach recommended'
      };
      
    } catch (error) {
      console.error('Error generating offer strategies:', error);
      return this.getFallbackOfferStrategies(factors);
    }
  }

  private getFallbackStrategy(factors: OfferFactors): OfferStrategy {
    // Use proposed offer if available, otherwise calculate based on market conditions
    let recommendedOffer = factors.proposedOffer;
    if (!recommendedOffer || recommendedOffer <= 0) {
      // Generate a strategic offer based on market conditions
      let offerMultiplier = 0.95; // Start with 95% of listing
      
      // Adjust based on seller motivation
      if (factors.sellerMotivation === 'extremely_motivated') offerMultiplier = 0.90;
      else if (factors.sellerMotivation === 'motivated') offerMultiplier = 0.93;
      else if (factors.sellerMotivation === 'somewhat_motivated') offerMultiplier = 0.96;
      else if (factors.sellerMotivation === 'not_motivated') offerMultiplier = 0.98;
      
      // Adjust for days on market
      if (factors.daysOnMarket > 90) offerMultiplier -= 0.03;
      else if (factors.daysOnMarket > 60) offerMultiplier -= 0.02;
      else if (factors.daysOnMarket > 30) offerMultiplier -= 0.01;
      
      // Adjust for price reductions
      offerMultiplier -= (factors.priceReductions * 0.01);
      
      // Adjust for property condition
      if (factors.propertyCondition === 'needs_work') offerMultiplier -= 0.05;
      else if (factors.propertyCondition === 'fixer_upper') offerMultiplier -= 0.08;
      else if (factors.propertyCondition === 'fair') offerMultiplier -= 0.02;
      
      recommendedOffer = Math.round(factors.listingPrice * Math.max(0.85, offerMultiplier));
    }
    
    const offerRatio = recommendedOffer / factors.listingPrice;
    const confidence = this.calculateConfidence(factors);
    
    const strategy = offerRatio > 0.98 ? 'aggressive' : offerRatio > 0.95 ? 'competitive' : offerRatio > 0.90 ? 'balanced' : 'conservative';
    
    const motivationText = factors.sellerMotivation === 'extremely_motivated' ? 'highly motivated seller' :
                          factors.sellerMotivation === 'motivated' ? 'motivated seller' :
                          factors.sellerMotivation === 'somewhat_motivated' ? 'somewhat motivated seller' : 'seller with no urgency';
    
    const conditionText = factors.propertyCondition === 'excellent' ? 'excellent condition' :
                         factors.propertyCondition === 'good' ? 'good condition' :
                         factors.propertyCondition === 'fair' ? 'fair condition needing minor updates' :
                         factors.propertyCondition === 'needs_work' ? 'property requiring significant updates' : 'fixer-upper requiring major renovation';
    
    return {
      recommendedOffer,
      offerPercentage: offerRatio * 100,
      confidence,
      strategy,
      reasoning: `Strategic offer considering ${factors.daysOnMarket} days on market, ${motivationText}, and ${conditionText}. This ${strategy} approach balances competitive positioning with risk management.`,
      terms: {
        inspectionPeriod: factors.propertyCondition === 'excellent' ? 7 : factors.propertyCondition === 'good' ? 10 : 14,
        financingContingency: factors.buyerTimeframe === 'asap' ? 18 : 21,
        appraisalContingency: true,
        escalationClause: strategy === 'competitive' || strategy === 'aggressive' ? {
          maxPrice: Math.round(recommendedOffer * 1.03),
          increment: Math.round(factors.listingPrice * 0.005)
        } : undefined
      },
      negotiationTips: [
        strategy === 'aggressive' ? 'Emphasize strong financial position and quick close' : 'Highlight financing strength and flexible terms',
        factors.daysOnMarket > 60 ? 'Leverage extended market time in negotiations' : 'Show urgency to compete with other buyers',
        factors.propertyCondition !== 'excellent' ? 'Request seller credits for necessary repairs' : 'Offer quick inspection timeline',
        'Demonstrate genuine interest and emotional connection to the property'
      ],
      riskFactors: [
        strategy === 'aggressive' ? 'High competition may drive prices up' : 'Conservative offer may lose to higher bids',
        factors.propertyCondition === 'needs_work' || factors.propertyCondition === 'fixer_upper' ? 'Potential for undiscovered repair issues' : 'Market appraisal concerns',
        factors.marketData.inventory < 3 ? 'Seller\'s market conditions favor higher offers' : 'Market conditions support buyer negotiation'
      ],
      strengths: [
        'Strategic pricing based on market analysis',
        factors.buyerTimeframe === 'asap' ? 'Quick close timeline advantage' : 'Flexible timeline reduces seller stress',
        'Comprehensive contingency protection',
        confidence > 70 ? 'High confidence strategy based on market factors' : 'Balanced approach with room for adjustment'
      ],
      timeline: {
        responseDeadline: factors.competitionLevel === 'high' ? '24 hours' : '48 hours',
        closeDate: factors.buyerTimeframe === 'asap' ? '21 days' : factors.buyerTimeframe === '30_days' ? '30 days' : '45 days',
        keyMilestones: [
          {
            milestone: 'Initial response from seller',
            date: factors.competitionLevel === 'high' ? '24 hours' : '48 hours',
            importance: 'critical' as const
          },
          {
            milestone: 'Inspection completion',
            date: `${factors.propertyCondition === 'excellent' ? 7 : factors.propertyCondition === 'good' ? 10 : 14} days`,
            importance: 'critical' as const
          },
          {
            milestone: 'Financing approval',
            date: `${factors.buyerTimeframe === 'asap' ? 18 : 21} days`,
            importance: 'important' as const
          },
          {
            milestone: 'Final walkthrough',
            date: '1 day before close',
            importance: 'important' as const
          }
        ]
      }
    };
  }

  private getAlternativeStrategies(factors: OfferFactors): OfferStrategy[] {
    const primaryStrategy = this.getFallbackStrategy(factors);
    const baseOffer = primaryStrategy.recommendedOffer;
    
    return [
      {
        ...primaryStrategy,
        recommendedOffer: Math.round(baseOffer * 1.02),
        offerPercentage: (Math.round(baseOffer * 1.02) / factors.listingPrice) * 100,
        strategy: 'aggressive' as const,
        confidence: Math.min(95, primaryStrategy.confidence + 10),
        reasoning: 'Aggressive approach to secure the property in competitive situations. Higher offer increases acceptance probability but reduces negotiation room.',
        terms: {
          ...primaryStrategy.terms,
          inspectionPeriod: Math.max(5, primaryStrategy.terms.inspectionPeriod - 3),
          financingContingency: Math.max(14, primaryStrategy.terms.financingContingency - 7)
        }
      },
      {
        ...primaryStrategy,
        recommendedOffer: Math.round(baseOffer * 0.97),
        offerPercentage: (Math.round(baseOffer * 0.97) / factors.listingPrice) * 100,
        strategy: 'conservative' as const,
        confidence: Math.max(20, primaryStrategy.confidence - 15),
        reasoning: 'Conservative approach that provides more negotiation room and reduces financial risk. Best for buyers with flexible timelines.',
        terms: {
          ...primaryStrategy.terms,
          inspectionPeriod: primaryStrategy.terms.inspectionPeriod + 7,
          financingContingency: primaryStrategy.terms.financingContingency + 7
        }
      }
    ];
  }

  private getFallbackOfferStrategies(factors: OfferFactors): OfferStrategies {
    const marketCondition = factors.marketData.inventory < 3 ? "seller's market" : 
                           factors.marketData.inventory > 6 ? "buyer's market" : "balanced market";
    
    const priceChangeText = factors.marketData.priceChange > 5 ? "rapidly appreciating" :
                           factors.marketData.priceChange > 0 ? "moderately appreciating" :
                           factors.marketData.priceChange < -5 ? "declining" : "stable";
    
    return {
      primaryStrategy: this.getFallbackStrategy(factors),
      alternativeStrategies: this.getAlternativeStrategies(factors),
      marketSummary: `${factors.location} is experiencing a ${marketCondition} with ${priceChangeText} prices (${factors.marketData.priceChange > 0 ? '+' : ''}${factors.marketData.priceChange}% YoY). Properties average ${factors.marketData.daysOnMarket} days on market with ${factors.marketData.inventory} months of inventory available.`,
      competitiveAnalysis: `Current competition level is ${factors.competitionLevel}. With ${factors.marketData.inventory} months of inventory, ${
        factors.marketData.inventory < 3 ? 'buyers need to act quickly and consider aggressive offers' :
        factors.marketData.inventory > 6 ? 'buyers have negotiation leverage and time to be selective' :
        'buyers have moderate negotiation power with balanced market conditions'
      }. Seasonal timing shows ${factors.seasonalTiming} market activity.`,
      recommendedApproach: `Given the ${marketCondition} conditions and ${factors.sellerMotivation} seller motivation, a ${
        factors.competitionLevel === 'high' ? 'competitive to aggressive' :
        factors.competitionLevel === 'medium' ? 'balanced' : 'conservative'
      } approach is recommended. ${
        factors.daysOnMarket > 60 ? 'Extended time on market provides negotiation opportunities.' :
        factors.daysOnMarket < 15 ? 'Fresh listing requires quick action and competitive offers.' :
        'Standard market timing allows for strategic positioning.'
      }`
    };
  }

  private calculateConfidence(factors: OfferFactors): number {
    let confidence = 50; // Base confidence
    
    // Seller motivation boosts
    if (factors.sellerMotivation === 'extremely_motivated') confidence += 25;
    else if (factors.sellerMotivation === 'motivated') confidence += 15;
    else if (factors.sellerMotivation === 'somewhat_motivated') confidence += 5;
    
    // Days on market factor
    if (factors.daysOnMarket > 90) confidence += 15;
    else if (factors.daysOnMarket > 60) confidence += 10;
    else if (factors.daysOnMarket > 30) confidence += 5;
    
    // Price reductions
    confidence += factors.priceReductions * 8;
    
    // Market conditions
    if (factors.marketData.inventory > 6) confidence += 10; // Buyer's market
    else if (factors.marketData.inventory < 2) confidence -= 15; // Seller's market
    
    return Math.min(95, Math.max(20, confidence));
  }
}

export const offerStrategyService = new OfferStrategyService();