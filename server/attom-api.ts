import axios from 'axios';
import { db } from './db';
import { marketIntelligence } from '@shared/schema';

interface AttomMarketData {
  city: string;
  state: string;
  zipcode?: string;
  medianPrice: number;
  averageDaysOnMarket: number;
  priceChange: number;
  inventoryCount: number;
  marketCondition: string;
  competitionLevel: string;
  pricePerSqft: number;
  lastUpdated: Date;
}

interface AttomAreaResponse {
  status: {
    version: string;
    code: number;
    msg: string;
  };
  area?: {
    name: string;
    state: string;
    zipcode?: string;
    market?: {
      medianSalePrice: number;
      averageDaysOnMarket: number;
      pricePerSqft: number;
      salesCount: number;
      listingCount: number;
      priceChange?: {
        period: string;
        percentage: number;
      };
    };
  };
}

interface AttomPropertyResponse {
  status: {
    version: string;
    code: number;
    msg: string;
  };
  property?: any[];
}

export class AttomDataService {
  private baseURL = 'https://api.gateway.attomdata.com/propertyapi/v1.0.0';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.ATTOM_API_KEY!;
    if (!this.apiKey || this.apiKey === 'your_attom_api_key_here') {
      console.warn('ATTOM_API_KEY not configured. Real estate market data features will be disabled.');
      this.apiKey = '';
    }
  }

  // Get market data for any city/state combination using ATTOM API
  async getMarketDataByCity(city: string, state: string): Promise<AttomMarketData | null> {
    if (!this.apiKey) {
      console.warn('ATTOM API key not configured, returning null for market data');
      return null;
    }
    
    try {
      // First try to get data using city/state lookup
      const response = await axios.get<AttomAreaResponse>(`${this.baseURL}/area/city/${city}/state/${state}`, {
        headers: {
          'ApiKey': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          show: 'market'
        },
        timeout: 10000
      });

      if (response.data && response.data.area && response.data.area.market) {
        const market = response.data.area.market;
        return {
          city,
          state,
          medianPrice: market.medianSalePrice || 0,
          averageDaysOnMarket: market.averageDaysOnMarket || 0,
          priceChange: market.priceChange?.percentage || 0,
          inventoryCount: market.listingCount || 0,
          marketCondition: this.determineMarketCondition(market),
          competitionLevel: this.determineCompetitionLevel(market),
          pricePerSqft: market.pricePerSqft || 0,
          lastUpdated: new Date()
        };
      }

      return null;
    } catch (error) {
      console.error(`Error fetching ATTOM market data for ${city}, ${state}:`, error);
      return null;
    }
  }

  // Enhanced method to get comprehensive market insights
  async getComprehensiveMarketData(city: string, state: string, zipcode?: string): Promise<AttomMarketData | null> {
    if (!this.apiKey) {
      console.warn('ATTOM API key not configured, returning null for comprehensive market data');
      return null;
    }
    
    try {
      // Try zipcode first if available, then fall back to city/state
      if (zipcode) {
        const zipcodeData = await this.getMarketDataByZipcode(zipcode);
        if (zipcodeData) return zipcodeData;
      }

      // Fall back to city/state lookup
      return await this.getMarketDataByCity(city, state);
    } catch (error) {
      console.error(`Error fetching comprehensive market data:`, error);
      return null;
    }
  }

  private determineMarketCondition(market: any): string {
    const daysOnMarket = market.averageDaysOnMarket || 30;
    const salesRatio = (market.salesCount || 1) / (market.listingCount || 1);

    if (daysOnMarket < 15 && salesRatio > 0.8) return 'extremely_hot_seller_market';
    if (daysOnMarket < 25 && salesRatio > 0.6) return 'hot_seller_market';
    if (daysOnMarket < 35) return 'seller_market';
    if (daysOnMarket < 50) return 'balanced_market';
    return 'buyer_market';
  }

  private determineCompetitionLevel(market: any): string {
    const daysOnMarket = market.averageDaysOnMarket || 30;
    const salesRatio = (market.salesCount || 1) / (market.listingCount || 1);

    if (daysOnMarket < 15 && salesRatio > 0.8) return 'extreme';
    if (daysOnMarket < 25 && salesRatio > 0.6) return 'high';
    if (daysOnMarket < 40) return 'medium';
    return 'low';
  }

  async getMarketDataByZipcode(zipcode: string): Promise<AttomMarketData | null> {
    if (!this.apiKey) {
      console.warn('ATTOM API key not configured, returning null for zipcode market data');
      return null;
    }
    
    try {
      // Use ATTOM's area API to get market statistics for the zipcode
      const response = await axios.get<AttomAreaResponse>(`${this.baseURL}/area/zipcode/${zipcode}`, {
        headers: {
          'ApiKey': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          show: 'market'
        },
        timeout: 10000
      });

      if (response.data.status.code === 0 && response.data.area?.market) {
        const area = response.data.area;
        const market = area.market;

        // Calculate market condition based on days on market and inventory
        let marketCondition = 'balanced_market';
        let competitionLevel = 'medium';

        if (market.averageDaysOnMarket < 15) {
          marketCondition = 'hot_seller_market';
          competitionLevel = 'extreme';
        } else if (market.averageDaysOnMarket < 25) {
          marketCondition = 'seller_market';
          competitionLevel = 'high';
        } else if (market.averageDaysOnMarket > 45) {
          marketCondition = 'buyer_market';
          competitionLevel = 'low';
        }

        const marketData: AttomMarketData = {
          city: area.name,
          state: area.state,
          zipcode: area.zipcode || zipcode,
          medianPrice: market.medianSalePrice || 0,
          averageDaysOnMarket: market.averageDaysOnMarket || 0,
          priceChange: market.priceChange?.percentage || 0,
          inventoryCount: market.listingCount || 0,
          marketCondition,
          competitionLevel,
          pricePerSqft: market.pricePerSqft || 0,
          lastUpdated: new Date()
        };

        // Store in database
        await this.storeMarketData(marketData);
        return marketData;
      }

      console.log(`ATTOM API: No market data found for zipcode ${zipcode}`);
      return null;

    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error(`ATTOM API Error for zipcode ${zipcode}:`, {
          status: error.response?.status,
          message: error.response?.data?.status?.msg || error.message
        });
      } else {
        console.error(`ATTOM API Error for zipcode ${zipcode}:`, error);
      }
      return null;
    }
  }


  private async storeMarketData(data: AttomMarketData): Promise<void> {
    try {
      const location = data.zipcode ? `${data.city}, ${data.state} ${data.zipcode}` : `${data.city}, ${data.state}`;
      
      await db
        .insert(marketIntelligence)
        .values({
          city: data.city,
          state: data.state,
          zipCode: data.zipcode || null,
          propertyType: 'single_family',
          avgDaysOnMarket: data.averageDaysOnMarket,
          medianSoldPrice: data.medianPrice.toString(),
          pricePerSquareFoot: data.pricePerSqft.toString(),
          inventoryLevel: Math.round(data.inventoryCount / 30), // Convert to months of supply
          marketTrend: data.marketCondition.includes('seller') ? 'rising' : data.marketCondition.includes('buyer') ? 'declining' : 'stable',
          dataSource: 'attom_data',
          lastUpdated: data.lastUpdated
        })
        .onConflictDoUpdate({
          target: [marketIntelligence.city, marketIntelligence.state, marketIntelligence.propertyType],
          set: {
            zipCode: data.zipcode || null,
            avgDaysOnMarket: data.averageDaysOnMarket,
            medianSoldPrice: data.medianPrice.toString(),
            pricePerSquareFoot: data.pricePerSqft.toString(),
            inventoryLevel: Math.round(data.inventoryCount / 30),
            marketTrend: data.marketCondition.includes('seller') ? 'rising' : data.marketCondition.includes('buyer') ? 'declining' : 'stable',
            dataSource: 'attom_data',
            lastUpdated: data.lastUpdated
          }
        });
    } catch (error) {
      console.error('Error storing ATTOM market data:', error);
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test with a simple property search in a major city
      const response = await axios.get(`${this.baseURL}/property/address`, {
        headers: {
          'ApiKey': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          postalcode: '10001', // NYC zipcode for testing
          pagesize: 1
        },
        timeout: 10000
      });

      return response.data.status.code === 0;
    } catch (error) {
      console.error('ATTOM API connection test failed:', error);
      return false;
    }
  }

  // Search for real properties by location
  async searchProperties(city: string, state: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get<AttomPropertyResponse>(`${this.baseURL}/property/address`, {
        headers: {
          'ApiKey': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          locality: city,
          region: state,
          pagesize: limit
        },
        timeout: 10000
      });

      if (response.data.status.code === 0 && response.data.property) {
        return response.data.property.map((prop: any) => ({
          address: prop.address?.oneLine || '',
          streetNumber: prop.address?.house || '',
          streetName: prop.address?.street || '',
          city: prop.address?.locality || city,
          state: prop.address?.region || state,
          zipCode: prop.address?.postal || '',
          propertyType: prop.summary?.proptype || 'single_family',
          yearBuilt: prop.summary?.yearbuilt || null,
          lotSize: prop.lot?.lotsize1 || null,
          livingArea: prop.building?.size?.livingsize || null,
          bedrooms: prop.building?.rooms?.beds || null,
          bathrooms: prop.building?.rooms?.bathstotal || null,
          price: prop.assessment?.market?.mktttlvalue || null,
          lastSalePrice: prop.sale?.amount?.saleamt || null,
          lastSaleDate: prop.sale?.amount?.salerecdate || null
        }));
      }

      return [];
    } catch (error) {
      console.error(`ATTOM Property Search Error for ${city}, ${state}:`, error);
      return [];
    }
  }

  // Search properties by zipcode
  async searchPropertiesByZipcode(zipcode: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await axios.get<AttomPropertyResponse>(`${this.baseURL}/property/address`, {
        headers: {
          'ApiKey': this.apiKey,
          'Accept': 'application/json'
        },
        params: {
          postalcode: zipcode,
          pagesize: limit
        },
        timeout: 10000
      });

      if (response.data.status.code === 0 && response.data.property) {
        return response.data.property.map((prop: any) => ({
          address: prop.address?.oneLine || '',
          streetNumber: prop.address?.house || '',
          streetName: prop.address?.street || '',
          city: prop.address?.locality || '',
          state: prop.address?.region || '',
          zipCode: prop.address?.postal || zipcode,
          propertyType: prop.summary?.proptype || 'single_family',
          yearBuilt: prop.summary?.yearbuilt || null,
          lotSize: prop.lot?.lotsize1 || null,
          livingArea: prop.building?.size?.livingsize || null,
          bedrooms: prop.building?.rooms?.beds || null,
          bathrooms: prop.building?.rooms?.bathstotal || null,
          price: prop.assessment?.market?.mktttlvalue || null,
          lastSalePrice: prop.sale?.amount?.saleamt || null,
          lastSaleDate: prop.sale?.amount?.salerecdate || null
        }));
      }

      return [];
    } catch (error) {
      console.error(`ATTOM Property Search Error for zipcode ${zipcode}:`, error);
      return [];
    }
  }
}

export const attomAPI = new AttomDataService();