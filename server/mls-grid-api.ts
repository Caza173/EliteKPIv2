import axios from 'axios';

// MLS Grid API Types
export interface MLSGridProperty {
  ListingId: string;
  ListPrice: number;
  PropertyType: string;
  City: string;
  StateOrProvince: string;
  PostalCode: string;
  MlgCanView: boolean;
  MlgCanUse: string[];
  ModificationTimestamp: string;
  ListingAgent?: string;
  ListingOffice?: string;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  LivingArea?: number;
  LotSizeAcres?: number;
  YearBuilt?: number;
  PhotosCount?: number;
  DaysOnMarket?: number;
  OriginalListPrice?: number;
  PropertySubType?: string;
  StreetName?: string;
  StreetNumber?: string;
  UnparsedAddress?: string;
  ListingDate?: string;
  ExpirationDate?: string;
  PropertyCondition?: string;
  PublicRemarks?: string;
}

export interface MLSGridMember {
  MemberKey: string;
  MemberMlsId: string;
  MemberFirstName: string;
  MemberLastName: string;
  MemberEmail: string;
  MemberPhoneNumber: string;
  MemberStateLicense: string;
  OfficeMlsId: string;
  OriginatingSystemName: string;
}

export interface MLSGridOffice {
  OfficeKey: string;
  OfficeMlsId: string;
  OfficeName: string;
  OfficeAddress1: string;
  OfficeCity: string;
  OfficeStateOrProvince: string;
  OfficePostalCode: string;
  OfficePhoneNumber: string;
  OriginatingSystemName: string;
}

export interface MLSGridMedia {
  MediaKey: string;
  ResourceRecordKey: string;
  MediaURL: string;
  MediaCategory: string;
  MediaType: string;
  Order: number;
  Description?: string;
  Caption?: string;
}

// MLS Grid System Configuration
export interface MLSGridSystem {
  name: string;
  displayName: string;
  region: string;
  states: string[];
  cities: string[];
  coverage: string;
  type: 'metropolitan' | 'regional' | 'statewide' | 'national';
}

export class MLSGridAPIService {
  private baseURL = 'https://api.mlsgrid.com/v2';
  private apiToken: string;
  private rateLimitDelay = 500; // 2 requests per second = 500ms delay

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    try {
      // Rate limiting - wait 500ms between requests
      await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));

      const response = await axios.get(`${this.baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        params,
        timeout: 30000,
      });

      return response.data;
    } catch (error: any) {
      console.error(`MLS Grid API Error for ${endpoint}:`, error.response?.data || error.message);
      throw new Error(`MLS Grid API request failed: ${error.response?.status || error.message}`);
    }
  }

  // Get properties from MLS Grid
  async getProperties(
    originatingSystem: string, 
    options: {
      modificationTimestamp?: string;
      city?: string;
      stateOrProvince?: string;
      postalCode?: string;
      propertyType?: string;
      minPrice?: number;
      maxPrice?: number;
      limit?: number;
    } = {}
  ): Promise<MLSGridProperty[]> {
    const params: Record<string, any> = {
      OriginatingSystemName: originatingSystem,
      '$select': 'ListingId,ListPrice,PropertyType,City,StateOrProvince,PostalCode,MlgCanView,MlgCanUse,ModificationTimestamp,ListingAgent,ListingOffice,BedroomsTotal,BathroomsTotalInteger,LivingArea,LotSizeAcres,YearBuilt,PhotosCount,DaysOnMarket,OriginalListPrice,PropertySubType,StreetName,StreetNumber,UnparsedAddress,ListingDate,ExpirationDate,PropertyCondition,PublicRemarks',
    };

    // Build filter conditions
    const filters: string[] = [];
    
    if (options.modificationTimestamp) {
      filters.push(`ModificationTimestamp gt ${options.modificationTimestamp}`);
    }
    
    if (options.city) {
      filters.push(`City eq '${options.city}'`);
    }
    
    if (options.stateOrProvince) {
      filters.push(`StateOrProvince eq '${options.stateOrProvince}'`);
    }
    
    if (options.postalCode) {
      filters.push(`PostalCode eq '${options.postalCode}'`);
    }
    
    if (options.propertyType) {
      filters.push(`PropertyType eq '${options.propertyType}'`);
    }
    
    if (options.minPrice) {
      filters.push(`ListPrice ge ${options.minPrice}`);
    }
    
    if (options.maxPrice) {
      filters.push(`ListPrice le ${options.maxPrice}`);
    }

    if (filters.length > 0) {
      params['$filter'] = filters.join(' and ');
    }

    if (options.limit) {
      params['$top'] = options.limit;
    }

    const data = await this.makeRequest('/Property', params);
    return data.value || [];
  }

  // Get property with media
  async getPropertyWithMedia(listingId: string, originatingSystem: string): Promise<MLSGridProperty & { Media?: MLSGridMedia[] }> {
    const params = {
      OriginatingSystemName: originatingSystem,
      '$filter': `ListingId eq '${listingId}'`,
      '$expand': 'Media',
    };

    const data = await this.makeRequest('/Property', params);
    return data.value?.[0] || null;
  }

  // Get agents/members
  async getMembers(originatingSystem: string, options: { limit?: number } = {}): Promise<MLSGridMember[]> {
    const params: Record<string, any> = {
      OriginatingSystemName: originatingSystem,
      '$select': 'MemberKey,MemberMlsId,MemberFirstName,MemberLastName,MemberEmail,MemberPhoneNumber,MemberStateLicense,OfficeMlsId',
    };

    if (options.limit) {
      params['$top'] = options.limit;
    }

    const data = await this.makeRequest('/Member', params);
    return data.value || [];
  }

  // Get offices
  async getOffices(originatingSystem: string, options: { limit?: number } = {}): Promise<MLSGridOffice[]> {
    const params: Record<string, any> = {
      OriginatingSystemName: originatingSystem,
      '$select': 'OfficeKey,OfficeMlsId,OfficeName,OfficeAddress1,OfficeCity,OfficeStateOrProvince,OfficePostalCode,OfficePhoneNumber',
    };

    if (options.limit) {
      params['$top'] = options.limit;
    }

    const data = await this.makeRequest('/Office', params);
    return data.value || [];
  }

  // Get lookup values (metadata)
  async getLookupValues(originatingSystem: string, resource: string, lookupName: string): Promise<any[]> {
    const params = {
      OriginatingSystemName: originatingSystem,
    };

    const data = await this.makeRequest(`/Lookup/${resource}/${lookupName}`, params);
    return data.value || [];
  }

  // Test API connection
  async testConnection(originatingSystem: string): Promise<{ success: boolean; message: string }> {
    try {
      const properties = await this.getProperties(originatingSystem, { limit: 1 });
      return {
        success: true,
        message: `Successfully connected to MLS Grid. Found ${properties.length > 0 ? 'properties' : 'no properties'}.`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Connection failed: ${error.message}`,
      };
    }
  }
}

// MLS Systems available through MLS Grid
export const MLS_GRID_SYSTEMS: MLSGridSystem[] = [
  // Northeast
  {
    name: 'NEREN',
    displayName: 'New England Real Estate Network',
    region: 'Northeast',
    states: ['MA', 'NH', 'VT', 'ME', 'RI', 'CT'],
    cities: ['Boston', 'Manchester', 'Burlington', 'Portland', 'Providence', 'Hartford'],
    coverage: 'Massachusetts, New Hampshire, Vermont, Maine, Rhode Island, Connecticut',
    type: 'regional',
  },
  {
    name: 'NJMLS',
    displayName: 'New Jersey Multiple Listing Service',
    region: 'Northeast',
    states: ['NJ'],
    cities: ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Woodbridge'],
    coverage: 'New Jersey statewide',
    type: 'statewide',
  },
  {
    name: 'NYMLS',
    displayName: 'OneKey MLS (New York)',
    region: 'Northeast',
    states: ['NY'],
    cities: ['New York', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany'],
    coverage: 'New York State',
    type: 'statewide',
  },

  // Southeast
  {
    name: 'FMLS',
    displayName: 'Florida MLS',
    region: 'Southeast',
    states: ['FL'],
    cities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 'Tallahassee'],
    coverage: 'Florida statewide',
    type: 'statewide',
  },
  {
    name: 'GAMLS',
    displayName: 'Georgia MLS',
    region: 'Southeast',
    states: ['GA'],
    cities: ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens'],
    coverage: 'Georgia statewide',
    type: 'statewide',
  },
  {
    name: 'CMLSX',
    displayName: 'Carolina MLS',
    region: 'Southeast',
    states: ['NC', 'SC'],
    cities: ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Charleston', 'Columbia'],
    coverage: 'North Carolina and South Carolina',
    type: 'regional',
  },

  // Midwest
  {
    name: 'MRED',
    displayName: 'Midwest Real Estate Data',
    region: 'Midwest',
    states: ['IL', 'IN', 'WI'],
    cities: ['Chicago', 'Indianapolis', 'Milwaukee', 'Rockford', 'Peoria', 'Evansville'],
    coverage: 'Illinois, Indiana, Wisconsin',
    type: 'regional',
  },
  {
    name: 'NORTHSTAR',
    displayName: 'NorthstarMLS',
    region: 'Midwest',
    states: ['MN', 'WI'],
    cities: ['Minneapolis', 'Saint Paul', 'Duluth', 'Rochester', 'Bloomington'],
    coverage: 'Minnesota and Western Wisconsin',
    type: 'regional',
  },
  {
    name: 'OHIOMLS',
    displayName: 'Ohio MLS',
    region: 'Midwest',
    states: ['OH'],
    cities: ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
    coverage: 'Ohio statewide',
    type: 'statewide',
  },

  // Southwest
  {
    name: 'NTREIS',
    displayName: 'North Texas Real Estate Information Systems',
    region: 'Southwest',
    states: ['TX'],
    cities: ['Dallas', 'Fort Worth', 'Plano', 'Irving', 'Garland', 'Arlington'],
    coverage: 'North Texas',
    type: 'metropolitan',
  },
  {
    name: 'HAR',
    displayName: 'Houston Association of Realtors',
    region: 'Southwest',
    states: ['TX'],
    cities: ['Houston', 'The Woodlands', 'Sugar Land', 'Pearland', 'League City'],
    coverage: 'Greater Houston Area',
    type: 'metropolitan',
  },
  {
    name: 'SABOR',
    displayName: 'San Antonio Board of Realtors',
    region: 'Southwest',
    states: ['TX'],
    cities: ['San Antonio', 'New Braunfels', 'Seguin', 'Boerne'],
    coverage: 'South Central Texas',
    type: 'metropolitan',
  },

  // West
  {
    name: 'CRMLS',
    displayName: 'California Regional MLS',
    region: 'West',
    states: ['CA'],
    cities: ['Los Angeles', 'San Diego', 'Riverside', 'San Bernardino', 'Orange County'],
    coverage: 'Southern California',
    type: 'regional',
  },
  {
    name: 'SFARMLS',
    displayName: 'San Francisco Association of Realtors MLS',
    region: 'West',
    states: ['CA'],
    cities: ['San Francisco', 'Oakland', 'San Jose', 'Fremont', 'Hayward'],
    coverage: 'San Francisco Bay Area',
    type: 'metropolitan',
  },
  {
    name: 'RMLS',
    displayName: 'Regional Multiple Listing Service (Oregon)',
    region: 'West',
    states: ['OR', 'WA'],
    cities: ['Portland', 'Eugene', 'Salem', 'Bend', 'Vancouver'],
    coverage: 'Oregon and Southwest Washington',
    type: 'regional',
  },
  {
    name: 'NWMLS',
    displayName: 'Northwest Multiple Listing Service',
    region: 'West',
    states: ['WA'],
    cities: ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Everett'],
    coverage: 'Washington State',
    type: 'statewide',
  },

  // Additional Northeast States
  {
    name: 'PAMLS',
    displayName: 'Pennsylvania MLS',
    region: 'Northeast',
    states: ['PA'],
    cities: ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton'],
    coverage: 'Pennsylvania statewide',
    type: 'statewide',
  },
  {
    name: 'DELAWARE',
    displayName: 'Delaware MLS',
    region: 'Northeast',
    states: ['DE'],
    cities: ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna'],
    coverage: 'Delaware statewide',
    type: 'statewide',
  },
  {
    name: 'MDMLS',
    displayName: 'Maryland Regional MLS',
    region: 'Northeast',
    states: ['MD', 'DC'],
    cities: ['Baltimore', 'Washington', 'Rockville', 'Frederick', 'Gaithersburg', 'Annapolis'],
    coverage: 'Maryland and Washington DC',
    type: 'regional',
  },

  // Additional Southeast States
  {
    name: 'VAMLS',
    displayName: 'Virginia MLS',
    region: 'Southeast',
    states: ['VA'],
    cities: ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria'],
    coverage: 'Virginia statewide',
    type: 'statewide',
  },
  {
    name: 'WVMLS',
    displayName: 'West Virginia MLS',
    region: 'Southeast',
    states: ['WV'],
    cities: ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
    coverage: 'West Virginia statewide',
    type: 'statewide',
  },
  {
    name: 'KYMLS',
    displayName: 'Kentucky MLS',
    region: 'Southeast',
    states: ['KY'],
    cities: ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington'],
    coverage: 'Kentucky statewide',
    type: 'statewide',
  },
  {
    name: 'TNMLS',
    displayName: 'Tennessee MLS',
    region: 'Southeast',
    states: ['TN'],
    cities: ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville'],
    coverage: 'Tennessee statewide',
    type: 'statewide',
  },
  {
    name: 'ALMLS',
    displayName: 'Alabama MLS',
    region: 'Southeast',
    states: ['AL'],
    cities: ['Birmingham', 'Montgomery', 'Mobile', 'Huntsville', 'Tuscaloosa'],
    coverage: 'Alabama statewide',
    type: 'statewide',
  },
  {
    name: 'MSMLS',
    displayName: 'Mississippi MLS',
    region: 'Southeast',
    states: ['MS'],
    cities: ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi'],
    coverage: 'Mississippi statewide',
    type: 'statewide',
  },
  {
    name: 'LAMLS',
    displayName: 'Louisiana MLS',
    region: 'Southeast',
    states: ['LA'],
    cities: ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles'],
    coverage: 'Louisiana statewide',
    type: 'statewide',
  },
  {
    name: 'ARMLS',
    displayName: 'Arkansas MLS',
    region: 'Southeast',
    states: ['AR'],
    cities: ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro'],
    coverage: 'Arkansas statewide',
    type: 'statewide',
  },

  // Additional Midwest States
  {
    name: 'MIMLS',
    displayName: 'Michigan MLS',
    region: 'Midwest',
    states: ['MI'],
    cities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Lansing'],
    coverage: 'Michigan statewide',
    type: 'statewide',
  },
  {
    name: 'IAMLS',
    displayName: 'Iowa MLS',
    region: 'Midwest',
    states: ['IA'],
    cities: ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City'],
    coverage: 'Iowa statewide',
    type: 'statewide',
  },
  {
    name: 'MOMLS',
    displayName: 'Missouri MLS',
    region: 'Midwest',
    states: ['MO'],
    cities: ['Kansas City', 'St. Louis', 'Springfield', 'Independence', 'Columbia'],
    coverage: 'Missouri statewide',
    type: 'statewide',
  },
  {
    name: 'NDMLS',
    displayName: 'North Dakota MLS',
    region: 'Midwest',
    states: ['ND'],
    cities: ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
    coverage: 'North Dakota statewide',
    type: 'statewide',
  },
  {
    name: 'SDMLS',
    displayName: 'South Dakota MLS',
    region: 'Midwest',
    states: ['SD'],
    cities: ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
    coverage: 'South Dakota statewide',
    type: 'statewide',
  },
  {
    name: 'NEMLS',
    displayName: 'Nebraska MLS',
    region: 'Midwest',
    states: ['NE'],
    cities: ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney'],
    coverage: 'Nebraska statewide',
    type: 'statewide',
  },
  {
    name: 'KSMLS',
    displayName: 'Kansas MLS',
    region: 'Midwest',
    states: ['KS'],
    cities: ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe'],
    coverage: 'Kansas statewide',
    type: 'statewide',
  },

  // Additional Southwest States
  {
    name: 'AUSTINMLS',
    displayName: 'Austin Board of Realtors',
    region: 'Southwest',
    states: ['TX'],
    cities: ['Austin', 'Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville'],
    coverage: 'Central Texas',
    type: 'metropolitan',
  },
  {
    name: 'ELPASO',
    displayName: 'El Paso Association of Realtors',
    region: 'Southwest',
    states: ['TX'],
    cities: ['El Paso', 'Socorro', 'Horizon City'],
    coverage: 'West Texas',
    type: 'metropolitan',
  },
  {
    name: 'NMMLS',
    displayName: 'New Mexico MLS',
    region: 'Southwest',
    states: ['NM'],
    cities: ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell'],
    coverage: 'New Mexico statewide',
    type: 'statewide',
  },
  {
    name: 'ARMLS_AZ',
    displayName: 'Arizona Regional MLS',
    region: 'Southwest',
    states: ['AZ'],
    cities: ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale'],
    coverage: 'Arizona statewide',
    type: 'statewide',
  },
  {
    name: 'NVMLS',
    displayName: 'Nevada MLS',
    region: 'Southwest',
    states: ['NV'],
    cities: ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks'],
    coverage: 'Nevada statewide',
    type: 'statewide',
  },
  {
    name: 'UTMLS',
    displayName: 'Utah MLS',
    region: 'Southwest',
    states: ['UT'],
    cities: ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem'],
    coverage: 'Utah statewide',
    type: 'statewide',
  },
  {
    name: 'COMLS',
    displayName: 'Colorado MLS',
    region: 'Southwest',
    states: ['CO'],
    cities: ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood'],
    coverage: 'Colorado statewide',
    type: 'statewide',
  },
  {
    name: 'WYMLS',
    displayName: 'Wyoming MLS',
    region: 'Southwest',
    states: ['WY'],
    cities: ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs'],
    coverage: 'Wyoming statewide',
    type: 'statewide',
  },
  {
    name: 'MTMLS',
    displayName: 'Montana MLS',
    region: 'Southwest',
    states: ['MT'],
    cities: ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte'],
    coverage: 'Montana statewide',
    type: 'statewide',
  },
  {
    name: 'IDMLS',
    displayName: 'Idaho MLS',
    region: 'Southwest',
    states: ['ID'],
    cities: ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello'],
    coverage: 'Idaho statewide',
    type: 'statewide',
  },

  // Additional West Coast States
  {
    name: 'BAYMLS',
    displayName: 'Bay Area Real Estate Information Services',
    region: 'West',
    states: ['CA'],
    cities: ['San Francisco', 'Oakland', 'San Jose', 'Fremont', 'Santa Clara'],
    coverage: 'San Francisco Bay Area',
    type: 'metropolitan',
  },
  {
    name: 'SDMLS_CA',
    displayName: 'San Diego MLS',
    region: 'West',
    states: ['CA'],
    cities: ['San Diego', 'Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad'],
    coverage: 'San Diego County',
    type: 'metropolitan',
  },
  {
    name: 'CVMLS',
    displayName: 'Central Valley MLS',
    region: 'West',
    states: ['CA'],
    cities: ['Fresno', 'Bakersfield', 'Stockton', 'Modesto', 'Salinas'],
    coverage: 'Central Valley California',
    type: 'regional',
  },
  {
    name: 'SACRAMENTO',
    displayName: 'Sacramento Association of Realtors',
    region: 'West',
    states: ['CA'],
    cities: ['Sacramento', 'Elk Grove', 'Roseville', 'Folsom', 'Davis'],
    coverage: 'Sacramento Metropolitan Area',
    type: 'metropolitan',
  },
  {
    name: 'AKMLS',
    displayName: 'Alaska MLS',
    region: 'West',
    states: ['AK'],
    cities: ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan'],
    coverage: 'Alaska statewide',
    type: 'statewide',
  },
  {
    name: 'HIMLS',
    displayName: 'Hawaii MLS',
    region: 'West',
    states: ['HI'],
    cities: ['Honolulu', 'Pearl City', 'Hilo', 'Kailua', 'Waipahu'],
    coverage: 'Hawaii statewide',
    type: 'statewide',
  },
];

// Helper function to get MLS systems by state
export function getMLSSystemsByState(state: string): MLSGridSystem[] {
  return MLS_GRID_SYSTEMS.filter(system => system.states.includes(state.toUpperCase()));
}

// Helper function to get MLS systems by city
export function getMLSSystemsByCity(city: string, state?: string): MLSGridSystem[] {
  return MLS_GRID_SYSTEMS.filter(system => {
    const cityMatch = system.cities.some(c => c.toLowerCase().includes(city.toLowerCase()));
    const stateMatch = !state || system.states.includes(state.toUpperCase());
    return cityMatch && stateMatch;
  });
}

// Helper function to get all available states
export function getAvailableStates(): string[] {
  const states = new Set<string>();
  MLS_GRID_SYSTEMS.forEach(system => {
    system.states.forEach(state => states.add(state));
  });
  return Array.from(states).sort();
}

// Helper function to get all available cities for a state
export function getCitiesForState(state: string): string[] {
  const cities = new Set<string>();
  MLS_GRID_SYSTEMS
    .filter(system => system.states.includes(state.toUpperCase()))
    .forEach(system => {
      system.cities.forEach(city => cities.add(city));
    });
  return Array.from(cities).sort();
}

export const mlsGridAPI = new MLSGridAPIService(process.env.MLS_GRID_API_KEY || '');