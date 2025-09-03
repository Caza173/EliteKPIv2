import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Calculator, Clock, TrendingUp, AlertCircle, CheckCircle, Target, BarChart, MapPin, Activity } from 'lucide-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import AddressAutocomplete from '@/components/ui/address-autocomplete';

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

interface OfferFactors {
  listingPrice: number;
  proposedOffer: number;
  propertyCondition: string;
  sellerMotivation: string;
  daysOnMarket: number;
  priceReductions: number;
  reasonForSelling: string;
  sellerTimeframe: string;
  buyerTimeframe: string;
  desiredCloseDate?: string;
  competitionLevel: string;
  seasonalTiming: string;
  propertyType: string;
  location: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  uniqueFeatures?: string[];
  repairNeeds?: string[];
  concessions?: string[];
  marketData?: MarketData;
}

interface OfferStrategy {
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

interface OfferStrategies {
  primaryStrategy: OfferStrategy;
  alternativeStrategies: OfferStrategy[];
  marketSummary: string;
  competitiveAnalysis: string;
  recommendedApproach: string;
}

export default function OfferStrategies() {
  const { toast } = useToast();
  const [offerFactors, setOfferFactors] = useState<OfferFactors>({
    listingPrice: 0,
    proposedOffer: 0,
    propertyCondition: 'good',
    sellerMotivation: 'somewhat_motivated',
    daysOnMarket: 30,
    priceReductions: 0,
    reasonForSelling: 'upgrade',
    sellerTimeframe: '60_days',
    buyerTimeframe: '60_days',
    competitionLevel: 'medium',
    seasonalTiming: 'good',
    propertyType: 'single_family',
    location: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    uniqueFeatures: [],
    repairNeeds: [],
    concessions: []
  });
  const [isLoadingMarketData, setIsLoadingMarketData] = useState(false);


  // Market data fetching mutation
  const fetchMarketDataMutation = useMutation({
    mutationFn: async (address: { address: string; city: string; state: string; zipCode: string }) => {
      const response = await apiRequest('POST', '/api/market-data', address);
      return response as MarketData;
    },
    onSuccess: (marketData: MarketData) => {
      setOfferFactors(prev => ({ 
        ...prev, 
        marketData,
        daysOnMarket: marketData.daysOnMarket,
        competitionLevel: marketData.competitiveLevel
      }));
      setIsLoadingMarketData(false);
    },
    onError: (error) => {
      setIsLoadingMarketData(false);
      toast({
        title: "Market Data Error",
        description: "Unable to fetch market data for this location.",
        variant: "destructive",
      });
    },
  });

  const generateStrategiesMutation = useMutation({
    mutationFn: async (factors: OfferFactors) => {
      const response = await apiRequest('POST', '/api/offer-strategies', factors);
      return response;
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate offer strategies. Please try again.",
        variant: "destructive",
      });
    },
  });

  const strategies = generateStrategiesMutation.data as OfferStrategies | undefined;

  const handleInputChange = (field: keyof OfferFactors, value: any) => {
    setOfferFactors(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: 'uniqueFeatures' | 'repairNeeds' | 'concessions', value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item);
    setOfferFactors(prev => ({ ...prev, [field]: items }));
  };

  const handleAddressSelect = async (addressData: { address: string; city: string; state: string; zipCode: string }) => {
    setOfferFactors(prev => ({
      ...prev,
      address: addressData.address,
      city: addressData.city,
      state: addressData.state,
      zipCode: addressData.zipCode,
      location: `${addressData.city}, ${addressData.state}`
    }));
    
    // Fetch market data for the selected address
    setIsLoadingMarketData(true);
    fetchMarketDataMutation.mutate(addressData);
  };

  const generateStrategies = () => {
    if (!offerFactors.listingPrice || !offerFactors.proposedOffer || !offerFactors.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in listing price, proposed offer, and property address.",
        variant: "destructive",
      });
      return;
    }
    generateStrategiesMutation.mutate(offerFactors);
  };

  const getStrategyColor = (strategy: string) => {
    switch (strategy) {
      case 'aggressive': return 'text-red-600 bg-red-50';
      case 'competitive': return 'text-orange-600 bg-orange-50';
      case 'balanced': return 'text-blue-600 bg-blue-50';
      case 'conservative': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-600';
      case 'important': return 'text-orange-600';
      case 'flexible': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0a1a2a 0%, #1e3a8a 30%, #2563eb 60%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-black">AI-Powered Offer Strategies</h1>
          <p className="text-black">Intelligent recommendations based on market data, demographics, and property type</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Offer Calculator */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Calculator className="h-5 w-5" />
              <span>Offer Calculator</span>
            </CardTitle>
            <CardDescription className="text-black">Enter property and market details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="listing-price">Listing Price</Label>
              <Input
                id="listing-price"
                type="number"
                placeholder="e.g., 525000"
                value={offerFactors.listingPrice || ''}
                onChange={(e) => handleInputChange('listingPrice', parseInt(e.target.value) || 0)}
                data-testid="input-listing-price"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposed-offer">Your Proposed Offer</Label>
              <Input
                id="proposed-offer"
                type="number"
                placeholder="e.g., 550000"
                value={offerFactors.proposedOffer || ''}
                onChange={(e) => handleInputChange('proposedOffer', parseInt(e.target.value) || 0)}
                data-testid="input-proposed-offer"
              />
            </div>


            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Property Address *</span>
                {isLoadingMarketData && (
                  <Badge variant="outline" className="text-xs animate-pulse">
                    <Activity className="h-3 w-3 mr-1" />
                    Loading market data
                  </Badge>
                )}
                {offerFactors.marketData && (
                  <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                    Market data loaded
                  </Badge>
                )}
              </Label>
              <AddressAutocomplete
                value={offerFactors.address}
                onChange={(value) => {
                  // Only update the display value without interfering with selection
                  setOfferFactors(prev => ({
                    ...prev,
                    address: value
                  }));
                }}
                onAddressSelect={(components) => {
                  // Handle complete address selection
                  setOfferFactors(prev => ({
                    ...prev,
                    address: components.address,
                    city: components.city,
                    state: components.state,
                    zipCode: components.zipCode,
                    location: `${components.city}, ${components.state}`
                  }));
                  // Automatically fetch market data when address is selected
                  if (components.address && components.city && components.state && components.zipCode) {
                    setIsLoadingMarketData(true);
                    fetchMarketDataMutation.mutate({
                      address: components.address,
                      city: components.city,
                      state: components.state,
                      zipCode: components.zipCode
                    });
                  }
                }}
                placeholder="Start typing the property address..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="property-condition">Property Condition</Label>
              <Select
                value={offerFactors.propertyCondition}
                onValueChange={(value) => handleInputChange('propertyCondition', value)}
              >
                <SelectTrigger data-testid="select-property-condition">
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="needs_work">Needs Work</SelectItem>
                  <SelectItem value="fixer_upper">Fixer Upper</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seller-motivation">Seller Motivation</Label>
              <Select
                value={offerFactors.sellerMotivation}
                onValueChange={(value) => handleInputChange('sellerMotivation', value)}
              >
                <SelectTrigger data-testid="select-seller-motivation">
                  <SelectValue placeholder="Select motivation level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extremely_motivated">Extremely Motivated</SelectItem>
                  <SelectItem value="motivated">Motivated</SelectItem>
                  <SelectItem value="somewhat_motivated">Somewhat Motivated</SelectItem>
                  <SelectItem value="not_motivated">Not Motivated</SelectItem>
                  <SelectItem value="testing_market">Testing Market</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="days-on-market" className="flex items-center space-x-2">
                  <span>Days on Market</span>
                  {offerFactors.daysOnMarket > 0 && (
                    <Badge variant="outline" className="text-xs">
                      Auto-filled
                    </Badge>
                  )}
                </Label>
                <Input
                  id="days-on-market"
                  type="number"
                  placeholder="0"
                  value={offerFactors.daysOnMarket || ''}
                  onChange={(e) => handleInputChange('daysOnMarket', parseInt(e.target.value) || 0)}
                  data-testid="input-days-on-market"
                  className={offerFactors.daysOnMarket > 0 ? "bg-green-50 border-green-200" : ""}
                />
                <p className="text-xs text-gray-500">
                  Will be auto-populated when you lookup a property address
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-reductions">Price Reductions</Label>
                <Input
                  id="price-reductions"
                  type="number"
                  placeholder="0"
                  value={offerFactors.priceReductions || ''}
                  onChange={(e) => handleInputChange('priceReductions', parseInt(e.target.value) || 0)}
                  data-testid="input-price-reductions"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason-for-selling">Reason for Selling</Label>
              <Select
                value={offerFactors.reasonForSelling}
                onValueChange={(value) => handleInputChange('reasonForSelling', value)}
              >
                <SelectTrigger data-testid="select-reason-for-selling">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="relocation">Relocation</SelectItem>
                  <SelectItem value="upgrade">Upgrade</SelectItem>
                  <SelectItem value="downsize">Downsize</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                  <SelectItem value="divorce">Divorce</SelectItem>
                  <SelectItem value="estate">Estate</SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seller-timeframe">Seller Timeline</Label>
                <Select
                  value={offerFactors.sellerTimeframe}
                  onValueChange={(value) => handleInputChange('sellerTimeframe', value)}
                >
                  <SelectTrigger data-testid="select-seller-timeframe">
                    <SelectValue placeholder="Timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="30_days">30 Days</SelectItem>
                    <SelectItem value="60_days">60 Days</SelectItem>
                    <SelectItem value="90_days">90 Days</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                    <SelectItem value="no_rush">No Rush</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="buyer-timeframe">Buyer Timeline</Label>
                <Select
                  value={offerFactors.buyerTimeframe}
                  onValueChange={(value) => handleInputChange('buyerTimeframe', value)}
                >
                  <SelectTrigger data-testid="select-buyer-timeframe">
                    <SelectValue placeholder="Timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="30_days">30 Days</SelectItem>
                    <SelectItem value="60_days">60 Days</SelectItem>
                    <SelectItem value="90_days">90 Days</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="competition-level">Competition Level</Label>
                <Select
                  value={offerFactors.competitionLevel}
                  onValueChange={(value) => handleInputChange('competitionLevel', value)}
                >
                  <SelectTrigger data-testid="select-competition-level">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seasonal-timing">Seasonal Timing</Label>
                <Select
                  value={offerFactors.seasonalTiming}
                  onValueChange={(value) => handleInputChange('seasonalTiming', value)}
                >
                  <SelectTrigger data-testid="select-seasonal-timing">
                    <SelectValue placeholder="Select timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="peak">Peak</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="slow">Slow</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unique-features">Unique Features (comma-separated)</Label>
              <Textarea
                id="unique-features"
                placeholder="e.g., Pool, Updated kitchen, Mountain views"
                onChange={(e) => handleArrayInputChange('uniqueFeatures', e.target.value)}
                data-testid="textarea-unique-features"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="repair-needs">Repair Needs (comma-separated)</Label>
              <Textarea
                id="repair-needs"
                placeholder="e.g., Roof, HVAC, Flooring"
                onChange={(e) => handleArrayInputChange('repairNeeds', e.target.value)}
                data-testid="textarea-repair-needs"
              />
            </div>

            <Button 
              onClick={generateStrategies} 
              className="w-full"
              disabled={generateStrategiesMutation.isPending}
              data-testid="button-generate-strategies"
            >
              {generateStrategiesMutation.isPending ? 'Generating...' : 'Generate AI Strategies'}
            </Button>
          </CardContent>
        </Card>

        {/* Strategic Recommendations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-black">
              <Target className="h-5 w-5" />
              <span>Strategic Recommendations</span>
            </CardTitle>
            <CardDescription>AI-powered offer analysis and recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            {!strategies ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
                <Brain className="h-16 w-16 text-black" />
                <div>
                  <h3 className="text-lg font-semibold text-black">Ready to Analyze</h3>
                  <p className="text-black">Fill in the offer details and click "Generate AI Strategies" to get personalized recommendations</p>
                </div>
              </div>
            ) : (
              <Tabs defaultValue="primary" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="primary">Primary Strategy</TabsTrigger>
                  <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
                  <TabsTrigger value="market">Market Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="primary" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          Balanced Offer
                          <Badge className={getStrategyColor(strategies.primaryStrategy?.strategy || 'balanced')}>
                            {strategies.primaryStrategy?.confidence || 0}% confidence
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-black">Recommended Offer:</span>
                            <span className="font-semibold text-lg">
                              ${strategies.primaryStrategy?.recommendedOffer?.toLocaleString() || '0'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-black">Offer Percentage:</span>
                            <span className="font-medium">
                              {strategies.primaryStrategy?.offerPercentage?.toFixed(1) || '0'}% of asking
                            </span>
                          </div>
                          <Progress value={strategies.primaryStrategy?.confidence || 0} className="mt-2" />
                          <p className="text-sm text-blue-600 mt-2">
                            Moderate competition allows for strategic bidding
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                          <BarChart className="h-4 w-4" />
                          {offerFactors.marketData ? 'Market Intelligence' : 'Market Conditions'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {offerFactors.marketData ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-xs text-blue-600 font-medium">AVG PRICE</div>
                                <div className="text-lg font-bold text-blue-900">
                                  ${offerFactors.marketData.averagePrice.toLocaleString()}
                                </div>
                              </div>
                              <div className="bg-green-50 p-3 rounded-lg">
                                <div className="text-xs text-green-600 font-medium">PRICE/SQ FT</div>
                                <div className="text-lg font-bold text-green-900">
                                  ${offerFactors.marketData.pricePerSqFt}
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-black">Market Trend:</span>
                                <Badge variant={offerFactors.marketData.marketTrend === 'rising' ? 'default' : offerFactors.marketData.marketTrend === 'stable' ? 'outline' : 'destructive'} className="capitalize">
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                  {offerFactors.marketData.marketTrend}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-black">Avg DOM:</span>
                                <span className="font-medium">{offerFactors.marketData.daysOnMarket} days</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-black">Recent Sales:</span>
                                <span className="font-medium">{offerFactors.marketData.soldComps} comps</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-black">Competition:</span>
                                <Badge variant="outline" className="capitalize">{offerFactors.marketData.competitiveLevel}</Badge>
                              </div>
                              {offerFactors.marketData.schoolRating && (
                                <div className="flex justify-between">
                                  <span className="text-sm text-black">School Rating:</span>
                                  <span className="font-medium">{offerFactors.marketData.schoolRating}/10</span>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-blue-600 mt-2">
                              📍 {offerFactors.marketData.neighborhood} • Market data from recent sales
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-black">Seller Motivation:</span>
                              <Badge variant="outline" className="capitalize">
                                {offerFactors.sellerMotivation.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-black">Buyer Timeline:</span>
                              <Badge variant="outline" className="capitalize">
                                {offerFactors.buyerTimeframe.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-black">Competition:</span>
                              <Badge variant="outline">{offerFactors.competitionLevel}</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-black">Days on Market:</span>
                              <span className="font-medium">{offerFactors.daysOnMarket} days</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-black">Price Reductions:</span>
                              <span className="font-medium">{offerFactors.priceReductions}</span>
                            </div>
                            <p className="text-sm text-black mt-2">
                              Enter a property address above to get real-time market insights
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold mb-2">Strategy Reasoning</h3>
                      <p className="text-black" data-testid="text-strategy-reasoning">
                        {strategies.primaryStrategy?.reasoning || 'Strategy analysis not available'}
                      </p>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3 flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Negotiation Tips</span>
                        </h4>
                        <ul className="space-y-2">
                          {(strategies.primaryStrategy?.negotiationTips || []).map((tip, index) => (
                            <li key={index} className="text-sm flex items-start space-x-2">
                              <span className="text-green-600 mt-1">•</span>
                              <span>{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3 flex items-center space-x-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <span>Risk Factors</span>
                        </h4>
                        <ul className="space-y-2">
                          {(strategies.primaryStrategy?.riskFactors || []).map((risk, index) => (
                            <li key={index} className="text-sm flex items-start space-x-2">
                              <span className="text-orange-600 mt-1">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3 flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Timeline & Terms</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-black">Response Deadline:</span>
                            <span className="font-medium">{strategies.primaryStrategy?.timeline?.responseDeadline || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-black">Inspection Period:</span>
                            <span className="font-medium">{strategies.primaryStrategy?.terms?.inspectionPeriod || 0} days</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-black">Financing Contingency:</span>
                            <span className="font-medium">{strategies.primaryStrategy?.terms?.financingContingency || 0} days</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-sm">Key Milestones:</h5>
                          {(strategies.primaryStrategy?.timeline?.keyMilestones || []).map((milestone, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{milestone.milestone}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{milestone.date}</span>
                                <Badge 
                                  variant="outline" 
                                  className={getImportanceColor(milestone.importance)}
                                >
                                  {milestone.importance}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="alternatives" className="space-y-4">
                  {(strategies.alternativeStrategies || []).map((strategy, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          Alternative Strategy {index + 1}
                          <Badge className={getStrategyColor(strategy.strategy)}>
                            {strategy.confidence}% confidence
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-600">Recommended Offer:</span>
                            <p className="font-semibold text-lg">${strategy.recommendedOffer.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Strategy:</span>
                            <p className="font-medium capitalize">{strategy.strategy}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Percentage:</span>
                            <p className="font-medium">{strategy.offerPercentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <p className="text-gray-700">{strategy.reasoning}</p>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="market" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Market Summary</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700" data-testid="text-market-summary">
                          {strategies.marketSummary || 'Market analysis not available'}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <BarChart className="h-4 w-4" />
                          <span>Competitive Analysis</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700" data-testid="text-competitive-analysis">
                          {strategies.competitiveAnalysis || 'Competitive analysis not available'}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recommended Approach</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700" data-testid="text-recommended-approach">
                        {strategies.recommendedApproach || 'Recommendation not available'}
                      </p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}