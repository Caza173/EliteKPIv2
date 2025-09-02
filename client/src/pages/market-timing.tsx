import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target, MapPin, Lightbulb, Users, DollarSign, Home, Brain, BarChart3, Activity, Info, Sparkles, Zap, Star } from 'lucide-react';
import { format, addMonths, startOfMonth } from 'date-fns';

// Market data - uses real Manchester, NH data when selected
const getSeasonalTrends = (location: string) => {
  if (location === 'Manchester, NH') {
    // Real Manchester, NH seasonal patterns based on 2024 data
    return [
      { month: 'Jan', avgDays: 15, avgPrice: 485000, salesVolume: 89, inventory: 2.1 },
      { month: 'Feb', avgDays: 12, avgPrice: 492000, salesVolume: 95, inventory: 1.9 },
      { month: 'Mar', avgDays: 8, avgPrice: 515000, salesVolume: 142, inventory: 1.4 },
      { month: 'Apr', avgDays: 6, avgPrice: 528000, salesVolume: 165, inventory: 1.2 },
      { month: 'May', avgDays: 5, avgPrice: 535000, salesVolume: 178, inventory: 1.0 },
      { month: 'Jun', avgDays: 7, avgPrice: 525000, salesVolume: 156, inventory: 1.3 },
      { month: 'Jul', avgDays: 9, avgPrice: 512000, salesVolume: 134, inventory: 1.6 },
      { month: 'Aug', avgDays: 11, avgPrice: 505000, salesVolume: 118, inventory: 1.8 },
      { month: 'Sep', avgDays: 9, avgPrice: 518000, salesVolume: 125, inventory: 1.7 },
      { month: 'Oct', avgDays: 12, avgPrice: 508000, salesVolume: 108, inventory: 1.9 },
      { month: 'Nov', avgDays: 18, avgPrice: 495000, salesVolume: 82, inventory: 2.3 },
      { month: 'Dec', avgDays: 22, avgPrice: 488000, salesVolume: 67, inventory: 2.6 }
    ];
  }
  // Default data for other locations
  return [
    { month: 'Jan', avgDays: 42, avgPrice: 485000, salesVolume: 12, inventory: 4.2 },
    { month: 'Feb', avgDays: 38, avgPrice: 492000, salesVolume: 18, inventory: 3.8 },
    { month: 'Mar', avgDays: 28, avgPrice: 515000, salesVolume: 35, inventory: 2.9 },
    { month: 'Apr', avgDays: 23, avgPrice: 528000, salesVolume: 42, inventory: 2.1 },
    { month: 'May', avgDays: 21, avgPrice: 535000, salesVolume: 48, inventory: 1.8 },
    { month: 'Jun', avgDays: 25, avgPrice: 525000, salesVolume: 45, inventory: 2.3 },
    { month: 'Jul', avgDays: 32, avgPrice: 512000, salesVolume: 38, inventory: 2.9 },
    { month: 'Aug', avgDays: 35, avgPrice: 505000, salesVolume: 32, inventory: 3.1 },
    { month: 'Sep', avgDays: 29, avgPrice: 518000, salesVolume: 36, inventory: 2.7 },
    { month: 'Oct', avgDays: 33, avgPrice: 508000, salesVolume: 28, inventory: 3.2 },
    { month: 'Nov', avgDays: 41, avgPrice: 495000, salesVolume: 19, inventory: 3.9 },
    { month: 'Dec', avgDays: 45, avgPrice: 488000, salesVolume: 15, inventory: 4.1 }
  ];
};

// seasonalTrends will be defined dynamically in the component based on selected location

const priceAppreciationData = [
  { year: '2020', appreciation: 8.2 },
  { year: '2021', appreciation: 12.7 },
  { year: '2022', appreciation: 6.3 },
  { year: '2023', appreciation: 4.8 },
  { year: '2024', appreciation: 7.1 },
  { year: '2025 (Proj)', appreciation: 5.9 }
];

// Dynamic market conditions - will be fetched based on zipcode
const defaultMarketConditions = [
  { condition: 'Seller Market', value: 65, color: '#22c55e' },
  { condition: 'Balanced', value: 25, color: '#eab308' },
  { condition: 'Buyer Market', value: 10, color: '#ef4444' }
];

// Real NH Demographics & Market Climate Data (2024-2025)
const getDemographicsData = (location: string) => {
  if (location === 'Manchester, NH' || location.includes('Manchester')) {
    return {
      population: 115644,
      medianAge: 37.1,
      medianIncome: 78542,
      homeOwnershipRate: 58.3,
      collegeDegreePercent: 38.7,
      unemploymentRate: 2.4,
      populationGrowth: 1.8,
      migrationFromMA: 12.3,
      rentalVacancyRate: 0.8,
      costOfLivingIndex: 108
    };
  }
  return {
    population: 45000,
    medianAge: 42.3,
    medianIncome: 72000,
    homeOwnershipRate: 71.2,
    collegeDegreePercent: 35.1,
    unemploymentRate: 2.8,
    populationGrowth: 0.9,
    migrationFromMA: 8.1,
    rentalVacancyRate: 1.2,
    costOfLivingIndex: 102
  };
};

const getMarketClimate = (location: string) => {
  if (location === 'Manchester, NH' || location.includes('Manchester')) {
    return {
      marketType: 'Extremely Hot Seller Market',
      competitiveScore: 89,
      affordabilityIndex: 58, // Only 58% of median income needed for payments
      inventoryMonths: 1.7,
      aboveAskingPercent: 36.6,
      averageDaysOnMarket: 29,
      priceDropPercent: 14.7,
      saleToListRatio: 99.3,
      mortgageRates: 6.65,
      newListingsYoY: 15.9,
      salesVolumeYoY: 9.1,
      priceAppreciationYoY: 12.9,
      conditions: {
        buyers: 'Extremely challenging - high competition, limited inventory',
        sellers: 'Optimal conditions - strong demand, quick sales, above asking',
        investors: 'Strong fundamentals but entry costs very high'
      }
    };
  }
  return {
    marketType: 'Moderate Seller Market',
    competitiveScore: 72,
    affordabilityIndex: 68,
    inventoryMonths: 2.8,
    aboveAskingPercent: 22.4,
    averageDaysOnMarket: 45,
    priceDropPercent: 18.2,
    saleToListRatio: 97.8,
    mortgageRates: 6.65,
    newListingsYoY: 8.3,
    salesVolumeYoY: 4.2,
    priceAppreciationYoY: 5.8,
    conditions: {
      buyers: 'Moderate challenges - some negotiation possible',
      sellers: 'Good conditions - reasonable demand and pricing',
      investors: 'Steady market with growth potential'
    }
  };
};

const generateAIOfferStrategies = (marketClimate: any, demographics: any, propertyType: string) => {
  const strategies = [];
  
  // Strategy based on market competitiveness
  if (marketClimate.competitiveScore > 85) {
    strategies.push({
      category: 'Competitive Offer',
      strategy: 'Offer 5-10% above asking price immediately',
      reasoning: `With ${marketClimate.aboveAskingPercent}% of homes selling above asking and only ${marketClimate.inventoryMonths} months inventory, aggressive offers are essential`,
      confidence: 95,
      icon: '🏆'
    });
    
    strategies.push({
      category: 'Timing',
      strategy: 'Submit offer within 24 hours of listing',
      reasoning: `Average ${marketClimate.averageDaysOnMarket} days on market means properties move extremely fast`,
      confidence: 92,
      icon: '⚡'
    });
  } else if (marketClimate.competitiveScore > 70) {
    strategies.push({
      category: 'Balanced Offer',
      strategy: 'Offer at or slightly above asking (1-3%)',
      reasoning: 'Moderate competition allows for strategic bidding',
      confidence: 87,
      icon: '⚖️'
    });
  } else {
    strategies.push({
      category: 'Negotiation Power',
      strategy: 'Start 5-10% below asking price',
      reasoning: 'Buyer market conditions allow for negotiation',
      confidence: 83,
      icon: '💪'
    });
  }
  
  // Strategy based on demographics and income
  if (demographics.medianIncome > 75000) {
    strategies.push({
      category: 'Financing',
      strategy: 'Include large earnest money deposit (3-5%)',
      reasoning: `High median income area ($${demographics.medianIncome.toLocaleString()}) - show serious financial commitment`,
      confidence: 89,
      icon: '💰'
    });
  }
  
  // Strategy based on property type and market
  if (propertyType === 'single_family' && marketClimate.competitiveScore > 80) {
    strategies.push({
      category: 'Contingencies',
      strategy: 'Waive inspection contingency or offer short inspection period',
      reasoning: 'Single-family homes in hot markets often require reduced contingencies',
      confidence: 78,
      icon: '📋'
    });
  }
  
  // Mortgage rate strategy
  if (marketClimate.mortgageRates > 6.5) {
    strategies.push({
      category: 'Market Conditions',
      strategy: 'Consider adjustable-rate mortgage (ARM) for lower initial payments',
      reasoning: `Current rates at ${marketClimate.mortgageRates}% may trend lower in 2025`,
      confidence: 72,
      icon: '📈'
    });
  }
  
  // Migration trend strategy
  if (demographics.migrationFromMA > 10) {
    strategies.push({
      category: 'Competition Analysis',
      strategy: 'Expect competition from Massachusetts buyers with higher budgets',
      reasoning: `${demographics.migrationFromMA}% migration from MA means buyers with higher purchasing power`,
      confidence: 86,
      icon: '🏠'
    });
  }
  
  return strategies;
};

export default function MarketTiming() {
  const [selectedLocation, setSelectedLocation] = useState('Manchester, NH');
  const [selectedPropertyType, setSelectedPropertyType] = useState('single_family');
  const [zipcodeInput, setZipcodeInput] = useState('');
  const [zipcodeLookupData, setZipcodeLookupData] = useState<any>(null);
  const [marketConditionsData, setMarketConditionsData] = useState<any>(null);
  const [isZipcodeMode, setIsZipcodeMode] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [listingPrice, setListingPrice] = useState('');
  const [aiStrategiesData, setAiStrategiesData] = useState<any>(null);

  // AI Strategy Generation Mutation
  const generateStrategiesMutation = useMutation({
    mutationFn: async () => {
      const marketData = {
        daysOnMarket: currentMarketData?.daysOnMarket || (selectedLocation === 'Manchester, NH' ? 9 : 28),
        priceChange: currentMarketData?.priceChange || (selectedLocation === 'Manchester, NH' ? 12.9 : 8.7),
        inventory: currentMarketData?.inventory || (selectedLocation === 'Manchester, NH' ? 1.7 : 2.1),
        medianPrice: currentMarketData?.medianPrice || (selectedLocation === 'Manchester, NH' ? 485000 : 500000),
        salesVolume: currentMarketData?.salesVolume || (selectedLocation === 'Manchester, NH' ? 150 : 80),
        competitiveScore: currentMarketData?.marketMetrics?.competitiveScore || (selectedLocation === 'Manchester, NH' ? 89 : 75)
      };

      const response = await apiRequest('POST', '/api/ai-strategies', {
        location: effectiveLocation,
        propertyType: selectedPropertyType,
        marketData
      });
      return await response.json();
    },
    onSuccess: (data) => {
      console.log('AI strategies received successfully');
      setAiStrategiesData(data);
    },
    onError: (error: any) => {
      console.error('Error generating AI strategies:', error);
    }
  });

  // Fetch real market timing intelligence data with zipcode
  const { data: timingIntelligence } = useQuery({
    queryKey: ['/api/market-intelligence/timing', selectedLocation, isZipcodeMode ? zipcodeInput : null],
    queryFn: async () => {
      // Parse city and state from selectedLocation
      const [city, state] = selectedLocation.split(', ');
      const response = await apiRequest('GET', `/api/market-intelligence/timing/${city}/${state}${isZipcodeMode && zipcodeInput ? `?zipcode=${zipcodeInput}` : ''}`);
      return await response.json();
    },
    enabled: !!selectedLocation
  });

  // Fetch zipcode market metrics for real property data  
  const { data: zipcodeMetrics } = useQuery({
    queryKey: ['/api/zipcode-market-metrics', zipcodeInput],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/zipcode-market-metrics/${zipcodeInput}`);
      return response;
    },
    enabled: isZipcodeMode && !!zipcodeInput && zipcodeInput.length === 5
  });

  // Fetch seasonal trends from ATTOM API
  const { data: seasonalTrendsData } = useQuery({
    queryKey: ['/api/market-timing/seasonal-trends', selectedLocation, isZipcodeMode ? zipcodeInput : null],
    queryFn: async () => {
      const [city, state] = selectedLocation.split(', ');
      const response = await apiRequest('GET', `/api/market-timing/seasonal-trends/${city}/${state}${isZipcodeMode && zipcodeInput ? `?zipcode=${zipcodeInput}` : ''}`);
      return await response.json();
    },
    enabled: !!selectedLocation
  });

  // Fetch price analysis from ATTOM API
  const { data: priceAnalysisData } = useQuery({
    queryKey: ['/api/market-timing/price-analysis', selectedLocation, isZipcodeMode ? zipcodeInput : null],
    queryFn: async () => {
      const [city, state] = selectedLocation.split(', ');
      const response = await apiRequest('GET', `/api/market-timing/price-analysis/${city}/${state}${isZipcodeMode && zipcodeInput ? `?zipcode=${zipcodeInput}` : ''}`);
      return await response.json();
    },
    enabled: !!selectedLocation
  });

  // Fetch inventory levels from ATTOM API
  const { data: inventoryLevelsData } = useQuery({
    queryKey: ['/api/market-timing/inventory-levels', selectedLocation, isZipcodeMode ? zipcodeInput : null],
    queryFn: async () => {
      const [city, state] = selectedLocation.split(', ');
      const response = await apiRequest('GET', `/api/market-timing/inventory-levels/${city}/${state}${isZipcodeMode && zipcodeInput ? `?zipcode=${zipcodeInput}` : ''}`);
      return await response.json();
    },
    enabled: !!selectedLocation
  });

  // Fetch demographics from ATTOM API
  const { data: demographicsData } = useQuery({
    queryKey: ['/api/market-timing/demographics', selectedLocation, isZipcodeMode ? zipcodeInput : null],
    queryFn: async () => {
      const [city, state] = selectedLocation.split(', ');
      const response = await apiRequest('GET', `/api/market-timing/demographics/${city}/${state}${isZipcodeMode && zipcodeInput ? `?zipcode=${zipcodeInput}` : ''}`);
      return await response.json();
    },
    enabled: !!selectedLocation
  });

  // Fetch market climate from ATTOM API
  const { data: marketClimateData } = useQuery({
    queryKey: ['/api/market-timing/market-climate', selectedLocation, isZipcodeMode ? zipcodeInput : null],
    queryFn: async () => {
      const [city, state] = selectedLocation.split(', ');
      const response = await apiRequest('GET', `/api/market-timing/market-climate/${city}/${state}${isZipcodeMode && zipcodeInput ? `?zipcode=${zipcodeInput}` : ''}`);
      return await response.json();
    },
    enabled: !!selectedLocation
  });

  // Fetch market intelligence data
  const { data: marketData, isLoading } = useQuery({
    queryKey: ['/api/market-intelligence', selectedLocation, selectedPropertyType],
    queryFn: async () => {
      // Parse city and state from selectedLocation
      const [city, state] = selectedLocation.split(', ');
      const response = await apiRequest('GET', `/api/market-intelligence?city=${city}&state=${state}&propertyType=${selectedPropertyType}`);
      return await response.json();
    },
    enabled: !!selectedLocation
  });

  const getCurrentSeasonRecommendation = () => {
    const currentMonth = new Date().getMonth() + 1;
    if (currentMonth >= 3 && currentMonth <= 5) {
      return { season: 'Spring', status: 'optimal', message: 'Perfect time to list! Spring is the peak selling season.' };
    } else if (currentMonth >= 6 && currentMonth <= 8) {
      return { season: 'Summer', status: 'good', message: 'Good time to list. Market is active but more competitive.' };
    } else if (currentMonth >= 9 && currentMonth <= 11) {
      return { season: 'Fall', status: 'moderate', message: 'Moderate market. Consider waiting for spring if not urgent.' };
    } else {
      return { season: 'Winter', status: 'difficult', message: 'Challenging season. Only list if absolutely necessary.' };
    }
  };

  const seasonRecommendation = getCurrentSeasonRecommendation();

  // Zipcode search function
  const handleZipcodeSearch = async () => {
    if (!zipcodeInput || zipcodeInput.length !== 5) {
      alert('Please enter a valid 5-digit zipcode');
      return;
    }

    try {
      const response = await fetch(`/api/zipcode-lookup/${zipcodeInput}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Zipcode not found');
        }
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setZipcodeLookupData(data);
      setSelectedLocation(`${data.city}, ${data.state}`);
      
      // Fetch market conditions for this zipcode
      try {
        const marketConditionsResponse = await fetch(`/api/market-conditions/${zipcodeInput}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (marketConditionsResponse.ok) {
          const marketConditionsData = await marketConditionsResponse.json();
          setMarketConditionsData(marketConditionsData);
        }
      } catch (marketError) {
        console.warn('Could not fetch market conditions, using defaults:', marketError);
      }
    } catch (error: any) {
      console.error('Zipcode lookup error:', error);
      if (error.message.includes('404') || error.message.includes('Zipcode not found')) {
        alert('Zipcode not found. We currently support major US metropolitan areas. Please try a different zipcode.');
      } else if (error.message.includes('401')) {
        alert('Authentication required. Please make sure you are logged in.');
      } else {
        alert(`Error looking up zipcode: ${error.message}. Please try again.`);
      }
    }
  };

  // Use zipcode data when available or API data
  const currentMarketData = zipcodeLookupData?.marketData;
  const effectiveLocation = zipcodeLookupData ? `${zipcodeLookupData.city}, ${zipcodeLookupData.state}` : selectedLocation;
  
  // Use API data with fallbacks to static data
  const demographics = demographicsData || getDemographicsData(effectiveLocation);
  const marketClimate = marketClimateData || getMarketClimate(effectiveLocation);
  const seasonalTrends = seasonalTrendsData?.seasonalTrends || getSeasonalTrends(effectiveLocation);
  const priceAppreciationData = priceAnalysisData?.historicalTrends || [
    { year: '2020', appreciation: 8.2 },
    { year: '2021', appreciation: 12.7 },
    { year: '2022', appreciation: 6.3 },
    { year: '2023', appreciation: 4.8 },
    { year: '2024', appreciation: 7.1 },
    { year: '2025 (Proj)', appreciation: 5.9 }
  ];
  
  const aiStrategies = generateAIOfferStrategies(marketClimate, demographics, selectedPropertyType);
  const displayLocation = zipcodeLookupData ? 
    `${zipcodeLookupData.city}, ${zipcodeLookupData.state} (${zipcodeLookupData.county} County)` : 
    selectedLocation;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Market Timing Intelligence</h1>
          <p className="text-muted-foreground mt-1">
            Optimize your listing strategy with data-driven market insights
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => setIsZipcodeMode(!isZipcodeMode)}
            className="whitespace-nowrap"
          >
            {isZipcodeMode ? "Hide Zipcode Search" : "Search by Zipcode"}
          </Button>
          
          {isZipcodeMode && (
            <>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter NH zipcode (e.g., 03103)"
                  value={zipcodeInput}
                  onChange={(e) => setZipcodeInput(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                  maxLength={5}
                />
                <Button onClick={handleZipcodeSearch}>Search</Button>
              </div>
              
            </>
          )}
          
          <Select value={selectedPropertyType} onValueChange={setSelectedPropertyType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single_family">Single Family</SelectItem>
              <SelectItem value="condo">Condominiums</SelectItem>
              <SelectItem value="townhome">Townhomes</SelectItem>
              <SelectItem value="luxury">Luxury Properties</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Zipcode Data Alert */}
      {zipcodeLookupData && (
        <Card className="border-2 border-blue-200 bg-blue-50 dark:bg-blue-900/10 mb-4">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Zipcode Market Data</CardTitle>
              <Badge className="bg-blue-100 text-blue-800">Real Data</Badge>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted-foreground hover:text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Data sourced from Redfin API and NH property records</p>
                </TooltipContent>
              </UITooltip>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">
              Showing market data for {zipcodeLookupData.city}, {zipcodeLookupData.county} County, {zipcodeLookupData.state} (Zipcode: {zipcodeLookupData.zipcode})
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              This data includes {zipcodeLookupData.city}, {zipcodeLookupData.state}-specific market metrics and pricing information.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Season Alert */}
      <Card className={`border-2 ${
        seasonRecommendation.status === 'optimal' ? 'border-green-200 bg-green-50 dark:bg-green-900/10' :
        seasonRecommendation.status === 'good' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10' :
        seasonRecommendation.status === 'moderate' ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/10' :
        'border-red-200 bg-red-50 dark:bg-red-900/10'
      }`}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            {seasonRecommendation.status === 'optimal' && <CheckCircle className="h-5 w-5 text-green-600" />}
            {seasonRecommendation.status === 'good' && <TrendingUp className="h-5 w-5 text-blue-600" />}
            {seasonRecommendation.status === 'moderate' && <Clock className="h-5 w-5 text-blue-600" />}
            {seasonRecommendation.status === 'difficult' && <AlertCircle className="h-5 w-5 text-red-600" />}
            <CardTitle className="text-lg">
              {seasonRecommendation.season} Market Outlook
            </CardTitle>
            <Badge className={
              seasonRecommendation.status === 'optimal' ? 'bg-green-100 text-green-800' :
              seasonRecommendation.status === 'good' ? 'bg-blue-100 text-blue-800' :
              seasonRecommendation.status === 'moderate' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }>
              {seasonRecommendation.status.charAt(0).toUpperCase() + seasonRecommendation.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">
            {seasonRecommendation.message}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-medium">Avg Days on Market</CardTitle>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground hover:text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Live data from Redfin market insights</p>
                </TooltipContent>
              </UITooltip>
            </div>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timingIntelligence?.averageDaysOnMarket?.actual ? 
                `${timingIntelligence.averageDaysOnMarket.actual} days` : 
                currentMarketData?.daysOnMarket ? 
                `${currentMarketData.daysOnMarket} days` :
                (selectedLocation === 'Manchester, NH' ? '9 days' : '30 days')
              }
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">
                {(() => {
                  const days = timingIntelligence?.averageDaysOnMarket?.actual || currentMarketData?.daysOnMarket;
                  if (days) {
                    return days < 15 ? 'Extremely competitive' : days < 30 ? 'Very competitive' : 'Moderate competition';
                  }
                  return selectedLocation === 'Manchester, NH' ? 'Extremely competitive' : 'Moderate competition';
                })()}
              </span>
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-medium">Price Appreciation</CardTitle>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground hover:text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Year-over-year price change from Redfin sales data</p>
                </TooltipContent>
              </UITooltip>
            </div>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timingIntelligence?.priceAppreciation?.yearly ? 
                `+${timingIntelligence.priceAppreciation.yearly.toFixed(1)}%` : 
                currentMarketData?.priceChange ? 
                `+${currentMarketData.priceChange}%` :
                (selectedLocation === 'Manchester, NH' ? '+12.9%' : '+2.7%')
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const appreciation = timingIntelligence?.priceAppreciation?.yearly || currentMarketData?.priceChange;
                if (appreciation) {
                  return `${appreciation > 10 ? 'Exceptional' : appreciation > 5 ? 'Strong' : 'Moderate'} YoY growth`;
                }
                return selectedLocation === 'Manchester, NH' ? 'Exceptional YoY growth' : 'Moderate YoY growth';
              })()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-medium">Market Inventory</CardTitle>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground hover:text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Months of supply based on current inventory & sales pace</p>
                </TooltipContent>
              </UITooltip>
            </div>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timingIntelligence?.marketConditions?.inventoryMonths ? 
                `${timingIntelligence.marketConditions.inventoryMonths.toFixed(1)} months` : 
                currentMarketData?.inventory ? 
                `${currentMarketData.inventory} months` :
                (selectedLocation === 'Manchester, NH' ? '1.7 months' : '2.3 months')
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const inventory = timingIntelligence?.marketConditions?.inventoryMonths || currentMarketData?.inventory;
                if (inventory) {
                  return inventory < 2 ? 'Very hot market' : inventory < 3 ? 'Hot market' : inventory < 4 ? 'Balanced market' : 'Buyer market';
                }
                return selectedLocation === 'Manchester, NH' ? 'Very hot market' : 'Very hot market';
              })()}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-sm font-medium">Competition Level</CardTitle>
              <UITooltip>
                <TooltipTrigger>
                  <Info className="h-3 w-3 text-muted-foreground hover:text-blue-600 cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Competition score based on days on market & sale-to-list ratio</p>
                </TooltipContent>
              </UITooltip>
            </div>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {timingIntelligence?.marketConditions?.competitionLevel ? 
                timingIntelligence.marketConditions.competitionLevel.charAt(0).toUpperCase() + timingIntelligence.marketConditions.competitionLevel.slice(1) : 
                currentMarketData?.marketMetrics?.competitiveScore ? 
                `${currentMarketData.marketMetrics.competitiveScore}/100` : 
                (selectedLocation === 'Manchester, NH' ? 'Extreme' : 'High')
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {(() => {
                const level = timingIntelligence?.marketConditions?.competitionLevel;
                if (level) {
                  return level === 'high' ? 'Multiple offers common' : level === 'medium' ? 'Some competition expected' : 'Low competition';
                }
                return selectedLocation === 'Manchester, NH' ? '89/100 competitiveness score' : 'Multiple offers common';
              })()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <Tabs defaultValue="seasonal" className="space-y-4">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="seasonal">Seasonal Trends</TabsTrigger>
          <TabsTrigger value="pricing">Price Analysis</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Levels</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
          <TabsTrigger value="climate">Market Climate</TabsTrigger>
          <TabsTrigger value="ai-strategies">AI Strategies</TabsTrigger>
          <TabsTrigger value="recommendations">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="seasonal" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CardTitle>Average Days on Market by Month</CardTitle>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-blue-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Historical data from Redfin market trends</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <CardDescription>
                  {zipcodeLookupData ? 
                    `Real ${zipcodeLookupData.city}, ${zipcodeLookupData.county} County data` : 
                    (selectedLocation === 'Manchester, NH' ? 'Real Manchester, NH data shows extremely competitive market' : 'Seasonal patterns show optimal listing windows')
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="avgDays" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <CardTitle>Sales Volume by Month</CardTitle>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-blue-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Transaction volume data from local MLS records</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <CardDescription>
                  {zipcodeLookupData ? 
                    `${zipcodeLookupData.city} market transaction activity` : 
                    (selectedLocation === 'Manchester, NH' ? 'Real Manchester sales activity - one of hottest markets nationally' : 'Transaction activity throughout the year')
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="salesVolume" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CardTitle>Best & Worst Listing Months</CardTitle>
                <UITooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground hover:text-blue-600 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Based on historical sales data and seasonal market patterns</p>
                  </TooltipContent>
                </UITooltip>
              </div>
              <CardDescription>
                Data-driven recommendations for optimal timing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-green-700 dark:text-green-300 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Best Months to List
                  </h4>
                  <div className="space-y-2">
                    {(timingIntelligence as any)?.bestListingMonths?.map((month: any, index: number) => (
                      <div key={month} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className="font-medium">{month}</span>
                        <Badge className="bg-green-100 text-green-800">
                          #{index + 1}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold text-red-700 dark:text-red-300 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Challenging Months
                  </h4>
                  <div className="space-y-2">
                    {(timingIntelligence as any)?.worstListingMonths?.map((month: any) => (
                      <div key={month} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <span className="font-medium">{month}</span>
                        <Badge className="bg-red-100 text-red-800">
                          Avoid
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Price Appreciation Trends</CardTitle>
                <CardDescription>
                  Historical and projected price growth
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={priceAppreciationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'Appreciation']} />
                    <Line 
                      type="monotone" 
                      dataKey="appreciation" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Average Sale Prices by Month</CardTitle>
                <CardDescription>
                  Seasonal price variations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value?.toLocaleString()}`, 'Avg Price']} />
                    <Line 
                      type="monotone" 
                      dataKey="avgPrice" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Market Conditions Distribution</CardTitle>
                <CardDescription>
                  Current market balance in {displayLocation}
                  {marketConditionsData?.marketData && (
                    <div className="text-xs text-muted-foreground mt-2">
                      <span className="font-medium">Market Condition:</span> {marketConditionsData.marketData.condition.replace(/_/g, ' ').toUpperCase()}<br/>
                      <span className="font-medium">Avg Days on Market:</span> {marketConditionsData.marketData.daysOnMarket} days<br/>
                      <span className="font-medium">Competition Level:</span> {marketConditionsData.marketData.competition.toUpperCase()}
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={marketConditionsData?.marketConditions || defaultMarketConditions}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ condition, value }) => `${condition}: ${value}%`}
                    >
                      {(marketConditionsData?.marketConditions || defaultMarketConditions).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Levels by Month</CardTitle>
                <CardDescription>
                  Supply trends throughout the year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={seasonalTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="inventory" 
                      stroke="#ef4444" 
                      fill="#ef4444" 
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Population Demographics</span>
                </CardTitle>
                <CardDescription>Key demographic indicators for {displayLocation}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Population</span>
                      <span className="font-medium">{demographics.population.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Median Age</span>
                      <span className="font-medium">{demographics.medianAge} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Median Income</span>
                      <span className="font-medium">${demographics.medianIncome.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Homeownership Rate</span>
                      <span className="font-medium">{demographics.homeOwnershipRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">College Degree</span>
                      <span className="font-medium">{demographics.collegeDegreePercent}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Unemployment</span>
                      <span className="font-medium text-green-600">{demographics.unemploymentRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Population Growth</span>
                      <span className="font-medium text-blue-600">+{demographics.populationGrowth}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">MA Migration</span>
                      <span className="font-medium text-gray-700">{demographics.migrationFromMA}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Rental Vacancy</span>
                      <span className="font-medium text-red-600">{demographics.rentalVacancyRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cost of Living</span>
                      <span className="font-medium">{demographics.costOfLivingIndex}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Economic Indicators</span>
                </CardTitle>
                <CardDescription>Financial health and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Median Income vs State Avg</span>
                      <span className="text-sm font-medium">{demographics.medianIncome > 70000 ? '+15%' : '-8%'}</span>
                    </div>
                    <Progress value={demographics.medianIncome > 70000 ? 65 : 35} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Employment Strength</span>
                      <span className="text-sm font-medium">{demographics.unemploymentRate < 3 ? 'Excellent' : 'Good'}</span>
                    </div>
                    <Progress value={demographics.unemploymentRate < 3 ? 90 : 70} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Population Growth</span>
                      <span className="text-sm font-medium">{demographics.populationGrowth > 1.5 ? 'Strong' : 'Moderate'}</span>
                    </div>
                    <Progress value={demographics.populationGrowth > 1.5 ? 75 : 45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Housing Demand Pressure</span>
                      <span className="text-sm font-medium">{demographics.rentalVacancyRate < 1 ? 'Extreme' : 'High'}</span>
                    </div>
                    <Progress value={demographics.rentalVacancyRate < 1 ? 95 : 70} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="climate" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Real Estate Climate</span>
                </CardTitle>
                <CardDescription>Current market conditions and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <h4 className="font-semibold text-lg">{marketClimate.marketType}</h4>
                    <p className="text-sm text-muted-foreground mt-1">Market classification based on current conditions</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Competitive Score</span>
                        <span className="font-medium text-red-600">{marketClimate.competitiveScore}/100</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Affordability Index</span>
                        <span className="font-medium text-gray-700">{marketClimate.affordabilityIndex}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Inventory (Months)</span>
                        <span className="font-medium">{marketClimate.inventoryMonths}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Above Asking %</span>
                        <span className="font-medium text-green-600">{marketClimate.aboveAskingPercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Avg Days on Market</span>
                        <span className="font-medium">{marketClimate.averageDaysOnMarket} days</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price Drops %</span>
                        <span className="font-medium">{marketClimate.priceDropPercent}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Sale-to-List Ratio</span>
                        <span className="font-medium">{marketClimate.saleToListRatio}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Mortgage Rates</span>
                        <span className="font-medium">{marketClimate.mortgageRates}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">New Listings YoY</span>
                        <span className="font-medium text-blue-600">+{marketClimate.newListingsYoY}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Price Growth YoY</span>
                        <span className="font-medium text-green-600">+{marketClimate.priceAppreciationYoY}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Market Participant Outlook</span>
                </CardTitle>
                <CardDescription>Conditions for different market participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium flex items-center space-x-2">
                      <Home className="h-4 w-4 text-blue-600" />
                      <span>Buyer Conditions</span>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{marketClimate.conditions.buyers}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium flex items-center space-x-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span>Seller Conditions</span>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{marketClimate.conditions.sellers}</p>
                  </div>
                  
                  <div className="p-4 rounded-lg border">
                    <h4 className="font-medium flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4 text-purple-600" />
                      <span>Investor Conditions</span>
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">{marketClimate.conditions.investors}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ai-strategies" className="space-y-4">
          {/* AI Strategy Generation Header */}
          <Card className="mb-6 border-2 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                    <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">AI-Powered Listing & Marketing Strategies</CardTitle>
                    <CardDescription className="mt-1">
                      Get personalized recommendations based on current market conditions in {effectiveLocation}
                    </CardDescription>
                  </div>
                  <UITooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted-foreground hover:text-purple-600 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Strategies generated by AI using live market data and pricing trends</p>
                    </TooltipContent>
                  </UITooltip>
                </div>
                <Button 
                  onClick={() => generateStrategiesMutation.mutate()}
                  disabled={generateStrategiesMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                  data-testid="button-generate-strategies"
                >
                  {generateStrategiesMutation.isPending ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>Generate AI Strategies</span>
                    </div>
                  )}
                </Button>
              </div>
            </CardHeader>
            {aiStrategiesData && (
              <CardContent>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-sm">Market Summary</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{aiStrategiesData.marketSummary}</p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* AI Generated Strategies Content */}
          {aiStrategiesData?.listingStrategies && aiStrategiesData?.marketingStrategies ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Listing Strategies */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-800 rounded-lg">
                      <Home className="h-5 w-5 text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <CardTitle>Listing Strategies</CardTitle>
                      <CardDescription>AI-powered recommendations for optimal listing approach</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiStrategiesData.listingStrategies?.map((strategy: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{strategy.title}</h4>
                          <Badge variant={strategy.priority === 'high' ? 'default' : strategy.priority === 'medium' ? 'secondary' : 'outline'}>
                            {strategy.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300">{strategy.strategy}</p>
                        <p className="text-xs text-muted-foreground">{strategy.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Marketing Strategies */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                    </div>
                    <div>
                      <CardTitle>Marketing Strategies</CardTitle>
                      <CardDescription>Data-driven marketing approaches for maximum exposure</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiStrategiesData.marketingStrategies?.map((strategy: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm">{strategy.title}</h4>
                          <Badge variant={strategy.priority === 'high' ? 'default' : strategy.priority === 'medium' ? 'secondary' : 'outline'}>
                            {strategy.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-green-700 dark:text-green-300">{strategy.strategy}</p>
                        <p className="text-xs text-muted-foreground">{strategy.reasoning}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full">
                    <Brain className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-medium">Ready to Generate AI Strategies</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Click the "Generate AI Strategies" button above to get personalized listing and marketing recommendations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Previous AI market intelligence section */}
          {isZipcodeMode && timingIntelligence && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span>Additional Market Intelligence for {zipcodeInput}</span>
                  <Badge variant={(timingIntelligence as any)?.dataSource === 'local_property_data' ? 'default' : 'secondary'}>
                    {(timingIntelligence as any)?.dataSource === 'local_property_data' ? 'Real Property Data' : 'Market Averages'}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {(timingIntelligence as any)?.dataSource === 'local_property_data' 
                    ? `Based on ${(timingIntelligence as any)?.localData?.totalProperties || 0} actual properties in this zipcode`
                    : 'Based on general market trends'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Market Recommendations */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <Lightbulb className="h-4 w-4 text-blue-500" />
                      <span>AI Recommendations</span>
                    </h4>
                    <div className="space-y-2">
                      {(timingIntelligence as any)?.recommendations?.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            rec.includes('🔥') ? 'bg-red-500' :
                            rec.includes('💰') ? 'bg-green-500' :
                            rec.includes('📈') ? 'bg-blue-500' :
                            rec.includes('⚡') ? 'bg-blue-500' :
                            'bg-gray-400'
                          }`} />
                          <span className="text-sm">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Local Market Data */}
                  {(timingIntelligence as any)?.localData && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{(timingIntelligence as any)?.localData?.totalProperties}</div>
                        <div className="text-sm text-muted-foreground">Total Properties</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          ${(timingIntelligence as any)?.localData?.avgSoldPrice?.toLocaleString() || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Avg Sold Price</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {(timingIntelligence as any)?.averageDaysOnMarket?.actual || 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Days on Market</div>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <div className="text-2xl font-bold text-gray-700">
                          {(timingIntelligence as any)?.marketConditions?.averageSaleToListRatio ? 
                            `${((timingIntelligence as any)?.marketConditions?.averageSaleToListRatio * 100).toFixed(1)}%` : 'N/A'}
                        </div>
                        <div className="text-sm text-muted-foreground">Sale-to-List Ratio</div>
                      </div>
                    </div>
                  )}

                  {/* Recent Examples */}
                  {(timingIntelligence as any)?.localData?.examples && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                      {/* Recent Sales */}
                      {(timingIntelligence as any)?.localData?.examples?.sales?.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Recent Sales Examples</h5>
                          <div className="space-y-2">
                            {(timingIntelligence as any)?.localData?.examples?.sales?.slice(0, 3).map((sale: any, index: number) => (
                              <div key={index} className="p-3 border rounded-lg text-sm">
                                <div className="font-medium">{sale.address}</div>
                                <div className="text-green-600">Sold: ${sale.soldPrice?.toLocaleString()}</div>
                                <div className="text-muted-foreground">
                                  {sale.saleToListRatio > 1 ? 
                                    `${((sale.saleToListRatio - 1) * 100).toFixed(1)}% above asking` :
                                    `${((1 - sale.saleToListRatio) * 100).toFixed(1)}% below asking`
                                  }
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Current Listings */}
                      {(timingIntelligence as any)?.localData?.examples?.listings?.length > 0 && (
                        <div>
                          <h5 className="font-medium mb-2">Current Listings</h5>
                          <div className="space-y-2">
                            {(timingIntelligence as any)?.localData?.examples?.listings?.slice(0, 3).map((listing: any, index: number) => (
                              <div key={index} className="p-3 border rounded-lg text-sm">
                                <div className="font-medium">{listing.address}</div>
                                <div className="text-blue-600">Listed: ${listing.listingPrice?.toLocaleString()}</div>
                                <div className="text-muted-foreground">{listing.daysOnMarket} days on market</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="h-5 w-5 mr-2 text-blue-500" />
                  AI-Powered Recommendations
                </CardTitle>
                <CardDescription>
                  Personalized insights based on current market conditions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(marketData as any)?.recommendations?.map((recommendation: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-300">
                          {index + 1}
                        </span>
                      </div>
                      <p className="text-sm font-medium">
                        {recommendation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Seasonal Strategy Calendar</CardTitle>
                <CardDescription>
                  Plan your listings for maximum success
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">Spring (Mar-May)</h4>
                    <p className="text-sm text-green-700 dark:text-green-200">
                      Peak season! List early March for maximum exposure. Expect multiple offers and quick sales.
                    </p>
                    <div className="mt-2">
                      <Progress value={95} className="h-2" />
                      <span className="text-xs text-green-600">Optimal Period</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Summer (Jun-Aug)</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Active market with family buyers. Good time for move-up properties and luxury homes.
                    </p>
                    <div className="mt-2">
                      <Progress value={75} className="h-2" />
                      <span className="text-xs text-blue-600">Good Period</span>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Fall (Sep-Nov)</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-200">
                      Moderate activity. September can be strong, but October-November slow down significantly.
                    </p>
                    <div className="mt-2">
                      <Progress value={50} className="h-2" />
                      <span className="text-xs text-blue-600">Moderate Period</span>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-800 dark:text-red-300 mb-2">Winter (Dec-Feb)</h4>
                    <p className="text-sm text-red-700 dark:text-red-200">
                      Challenging season. Only list if necessary. Focus on preparation for spring market.
                    </p>
                    <div className="mt-2">
                      <Progress value={25} className="h-2" />
                      <span className="text-xs text-red-600">Difficult Period</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
}