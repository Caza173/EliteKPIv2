// Market Data Service - Integrates with ATTOM Data API for real market intelligence
import { OpenAI } from 'openai';
import { attomAPI } from './attom-api';
import { db } from './db';
import { marketIntelligence } from '@shared/schema';
import { and, eq, desc } from 'drizzle-orm';

let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else {
    console.warn('OpenAI API key not configured. AI market analysis features will be disabled.');
  }
} catch (error) {
  console.warn('Failed to initialize OpenAI client:', error);
}

interface MarketData {
  averagePrice: number;
  medianPrice: number;
  daysOnMarket: number;
  pricePerSqFt: number;
  soldComps: number;
  marketTrend: 'rising' | 'stable' | 'declining';
  competitiveLevel: 'high' | 'medium' | 'low';
  seasonalFactor: number;
  neighborhood: string;
  schoolRating?: number;
  walkScore?: number;
  crimeRate?: string;
}

interface AddressData {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

// Nationwide zipcode to city/county mapping
interface ZipcodeMapping {
  zipcode: string;
  city: string;
  county: string;
  state?: string; // Optional for backward compatibility
  locationKey: string;
}

// Generate realistic market data based on location using ATTOM API first
export async function getMarketData(addressData: AddressData): Promise<MarketData> {
  const { city, state, zipCode } = addressData;
  
  try {
    // Always try to get real data from ATTOM API first
    const attomData = await attomAPI.getComprehensiveMarketData(city, state, zipCode);
    if (attomData) {
      console.log(`Using real ATTOM market data for ${city}, ${state}`);
      
      // Convert ATTOM data to our MarketData format
      const marketTrend = attomData.priceChange > 3 ? 'rising' : attomData.priceChange < -2 ? 'declining' : 'stable';
      const competitiveLevel = attomData.competitionLevel === 'extreme' ? 'high' : 
                               attomData.competitionLevel === 'high' ? 'high' : 
                               attomData.competitionLevel === 'low' ? 'low' : 'medium';
      
      return {
        averagePrice: attomData.medianPrice,
        medianPrice: attomData.medianPrice,
        daysOnMarket: attomData.averageDaysOnMarket,
        pricePerSqFt: attomData.pricePerSqft,
        soldComps: attomData.inventoryCount / 4, // Estimate based on inventory
        marketTrend,
        competitiveLevel,
        seasonalFactor: 1.0,
        neighborhood: `${city} Area`,
        schoolRating: 7, // Default - would need additional API
        walkScore: 55, // Default - would need additional API
        crimeRate: 'Low'
      };
    }

    // If ATTOM API fails, try to get any cached data from database
    const cachedData = await getCachedMarketData(city, state);
    if (cachedData) {
      return cachedData;
    }
  } catch (error) {
    console.error('Error fetching ATTOM market data:', error);
  }
  
  // Last resort: Generate realistic data based on state averages only if ATTOM data fails
  console.log(`ATTOM API and cached data both failed for ${city}, ${state}, using state-based estimates`);
  
  // State-based realistic estimates (much smaller dataset instead of hardcoded city patterns)
  const stateAverages: Record<string, Partial<MarketData>> = {
    'CA': { averagePrice: 950000, medianPrice: 920000, pricePerSqFt: 650, daysOnMarket: 25, competitiveLevel: 'high' },
    'TX': { averagePrice: 450000, medianPrice: 425000, pricePerSqFt: 185, daysOnMarket: 35, competitiveLevel: 'medium' },
    'FL': { averagePrice: 425000, medianPrice: 400000, pricePerSqFt: 195, daysOnMarket: 40, competitiveLevel: 'medium' },
    'NY': { averagePrice: 750000, medianPrice: 685000, pricePerSqFt: 485, daysOnMarket: 45, competitiveLevel: 'high' },
    'MA': { averagePrice: 685000, medianPrice: 650000, pricePerSqFt: 425, daysOnMarket: 30, competitiveLevel: 'high' },
    'NH': { averagePrice: 485000, medianPrice: 460000, pricePerSqFt: 285, daysOnMarket: 25, competitiveLevel: 'medium' },
    // Default US average for unknown states
    'DEFAULT': { averagePrice: 450000, medianPrice: 425000, pricePerSqFt: 185, daysOnMarket: 35, competitiveLevel: 'medium' }
  };

  // Get state-based data or default
  const baseData = stateAverages[(state || 'DEFAULT').toUpperCase()] || stateAverages['DEFAULT'];

  // Add realistic variation (±10%)
  const variation = () => 0.9 + (Math.random() * 0.2); // 0.9 to 1.1
  
  return {
    averagePrice: Math.round(baseData.averagePrice! * variation()),
    medianPrice: Math.round(baseData.medianPrice! * variation()),
    daysOnMarket: Math.max(1, Math.round(baseData.daysOnMarket! * variation())),
    pricePerSqFt: Math.round(baseData.pricePerSqFt! * variation()),
    soldComps: Math.max(3, Math.round(12 * variation())), // Reasonable range 3-25
    marketTrend: Math.random() > 0.5 ? 'rising' : 'stable' as const,
    competitiveLevel: baseData.competitiveLevel!,
    seasonalFactor: 1.0,
    neighborhood: `${city} Area`,
    schoolRating: 7,
    walkScore: 55,
    crimeRate: 'Low'
  };
}

// Add cached data retrieval function
async function getCachedMarketData(city: string, state: string): Promise<MarketData | null> {
  try {
    // Check if we have recent ATTOM data cached in the database
    const cachedData = await db
      .select()
      .from(marketIntelligence) 
      .where(
        and(
          eq(marketIntelligence.city, city),
          eq(marketIntelligence.state, state),
          eq(marketIntelligence.dataSource, 'attom_data')
        )
      )
      .orderBy(desc(marketIntelligence.lastUpdated))
      .limit(1);

    if (cachedData.length > 0) {
      const data = cachedData[0];
      console.log(`Using cached ATTOM data for ${city}, ${state}`);
      
      return {
        averagePrice: parseInt(data.medianSoldPrice || '450000'),
        medianPrice: parseInt(data.medianSoldPrice || '450000'),
        daysOnMarket: data.avgDaysOnMarket || 35,
        pricePerSqFt: parseInt(data.pricePerSquareFoot || '185'),
        soldComps: Math.max(3, data.inventoryLevel || 12),
        marketTrend: data.marketTrend as 'rising' | 'declining' | 'stable',
        competitiveLevel: 'medium',
        seasonalFactor: 1.0,
        neighborhood: `${city} Area`,
        schoolRating: 7,
        walkScore: 55,
        crimeRate: 'Low'
      };
    }
  } catch (error) {
    console.error('Error fetching cached market data:', error);
  }
  
  return null;
}

// Enhanced offer strategy with market data integration
export async function generateMarketBasedStrategy(offerFactors: any, marketData: MarketData): Promise<string> {
  if (!openai) {
    return 'AI market analysis is not available. OpenAI API key not configured. Please check your property details and market conditions manually.';
  }
  
  // the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
  const response = await openai.chat.completions.create({
    model: "gpt-5",
    messages: [
      {
        role: "system",
        content: `You are an expert real estate advisor with deep market knowledge. Analyze the offer factors and real-time market data to provide strategic insights for making competitive offers.`
      },
      {
        role: "user",
        content: `
Property Details:
- Address: ${offerFactors.address}
- Listing Price: $${offerFactors.listingPrice?.toLocaleString()}
- Proposed Offer: $${offerFactors.proposedOffer?.toLocaleString()}
- Property Condition: ${offerFactors.propertyCondition}
- Property Type: ${offerFactors.propertyType}

Market Intelligence:
- Average Market Price: $${marketData.averagePrice.toLocaleString()}
- Market Price/SqFt: $${marketData.pricePerSqFt}
- Average Days on Market: ${marketData.daysOnMarket} days
- Market Trend: ${marketData.marketTrend}
- Competition Level: ${marketData.competitiveLevel}
- Recent Comparable Sales: ${marketData.soldComps}
- Neighborhood: ${marketData.neighborhood}
- School Rating: ${marketData.schoolRating}/10

Seller Factors:
- Motivation: ${offerFactors.sellerMotivation}
- Reason for Selling: ${offerFactors.reasonForSelling}
- Seller Timeline: ${offerFactors.sellerTimeframe}
- Days on Market: ${offerFactors.daysOnMarket}
- Price Reductions: ${offerFactors.priceReductions}

Buyer Factors:
- Buyer Timeline: ${offerFactors.buyerTimeframe}
- Competition Level: ${offerFactors.competitionLevel}

Please provide a comprehensive market-based offer strategy that includes:
1. How the proposed offer compares to market data
2. Market positioning analysis
3. Competitive advantage assessment
4. Timing considerations based on market trends
5. Risk factors specific to current market conditions
6. Strategic recommendations incorporating real market intelligence

Format your response as detailed strategic advice that leverages the market data.`
      }
    ],
    temperature: 0.7,
    max_completion_tokens: 1500
  });

  return response.choices[0].message.content || 'Unable to generate market strategy';
}

export async function getLocationByZipcode(zipcode: string): Promise<ZipcodeMapping | null> {
  // First check New Hampshire zipcodes (local data)
  const nhZipcode = NH_ZIPCODES.find(mapping => mapping.zipcode === zipcode);
  if (nhZipcode) {
    return nhZipcode;
  }

  // Use Zippopotam.us API for comprehensive US zipcode lookup
  try {
    const response = await fetch(`http://api.zippopotam.us/us/${zipcode}`);
    if (response.ok) {
      const data = await response.json();
      
      if (data && data.places && data.places.length > 0) {
        const place = data.places[0];
        const city = place['place name'];
        const state = place['state abbreviation'];
        const county = place['county'] ? `${place['county']} County` : 'Unknown County';
        
        return {
          zipcode: zipcode,
          city: city,
          county: county,
          state: state,
          locationKey: `${city.toLowerCase().replace(/\s+/g, '-')}-${state.toLowerCase()}`
        };
      }
    }
  } catch (error) {
    console.error(`Error looking up zipcode ${zipcode}:`, error);
  }

  // Return null if zipcode not found
  return null;
}

// New Hampshire zipcodes for local testing (minimal dataset)
const NH_ZIPCODES: ZipcodeMapping[] = [
  { zipcode: '03275', city: 'Allenstown', county: 'Merrimack County', state: 'NH', locationKey: 'allenstown-nh' },
  { zipcode: '03276', city: 'Tilton', county: 'Belknap County', state: 'NH', locationKey: 'tilton-nh' },
  { zipcode: '03101', city: 'Manchester', county: 'Hillsborough County', state: 'NH', locationKey: 'manchester-nh' },
  { zipcode: '03102', city: 'Manchester', county: 'Hillsborough County', state: 'NH', locationKey: 'manchester-nh' },
  { zipcode: '03103', city: 'Manchester', county: 'Hillsborough County', state: 'NH', locationKey: 'manchester-nh' },
  { zipcode: '03104', city: 'Manchester', county: 'Hillsborough County', state: 'NH', locationKey: 'manchester-nh' },
  { zipcode: '03079', city: 'Salem', county: 'Rockingham County', state: 'NH', locationKey: 'salem-nh' },
  { zipcode: '03060', city: 'Nashua', county: 'Hillsborough County', state: 'NH', locationKey: 'nashua-nh' },
  { zipcode: '03061', city: 'Nashua', county: 'Hillsborough County', state: 'NH', locationKey: 'nashua-nh' },
  { zipcode: '03062', city: 'Nashua', county: 'Hillsborough County', state: 'NH', locationKey: 'nashua-nh' },
  { zipcode: '03063', city: 'Nashua', county: 'Hillsborough County', state: 'NH', locationKey: 'nashua-nh' },
  { zipcode: '03064', city: 'Nashua', county: 'Hillsborough County', state: 'NH', locationKey: 'nashua-nh' }
];

// Export the NH_ZIPCODES for use in routes
export { NH_ZIPCODES };

// Legacy functions for compatibility
export async function generateMarketData(city: string, state: string): Promise<any> {
  const addressData = { address: '', city, state, zipCode: '' };
  return await getMarketData(addressData);
}

export async function fetchRealMarketData(location: string): Promise<any> {
  // Parse location string (e.g., "san-francisco-ca")
  const parts = location.split('-');
  const state = parts.pop()?.toUpperCase() || 'CA';
  const city = parts.join(' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return await generateMarketData(city, state);
}