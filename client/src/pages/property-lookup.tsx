import React, { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Search,
  Home,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  Users,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Lightbulb
} from "lucide-react";

interface PropertyData {
  address: string;
  city: string;
  state: string;
  zipcode: string;
  listPrice?: number;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  squareFeet?: number;
  yearBuilt?: number;
  daysOnMarket?: number;
  listingAgent?: string;
  listingOffice?: string;
  marketData: {
    medianPrice: number;
    averageDaysOnMarket: number;
    priceChange: number;
    competitionLevel: string;
    marketCondition: string;
    inventoryLevel: number;
    pricePerSqft: number;
  };
  comparables: Array<{
    address: string;
    soldPrice: number;
    soldDate: string;
    daysOnMarket: number;
    squareFeet: number;
    pricePerSqft: number;
  }>;
}

interface OfferRecommendation {
  recommendedOffer: number;
  offerPercentage: number;
  confidence: number;
  strategy: string;
  reasoning: string[];
  negotiationTips: string[];
  contingencies: {
    inspection: number;
    financing: number;
    appraisal: boolean;
  };
  closingTimeline: number;
  escalationClause?: {
    recommended: boolean;
    maxPrice?: number;
    increment?: number;
  };
  risks: string[];
  alternatives: Array<{
    offer: number;
    strategy: string;
    pros: string[];
    cons: string[];
  }>;
}

export default function PropertyLookupPage() {
  const { toast } = useToast();
  const [address, setAddress] = useState("");
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [offerRecommendation, setOfferRecommendation] = useState<OfferRecommendation | null>(null);
  const [buyerMotivation, setBuyerMotivation] = useState<string>("");
  const [timeline, setTimeline] = useState<string>("");
  const [buyerProfile, setBuyerProfile] = useState<string>("");

  // Get user's MLS settings
  const { data: mlsSettings } = useQuery<any>({
    queryKey: ["/api/mls-settings"],
  });

  // Property lookup mutation
  const lookupPropertyMutation = useMutation({
    mutationFn: async (address: string) => {
      const response = await apiRequest("POST", "/api/property-lookup", {
        address,
        mlsSystem: mlsSettings?.mlsSystem,
        apiKey: mlsSettings?.apiKey,
      });
      return await response.json() as PropertyData;
    },
    onSuccess: (data) => {
      setPropertyData(data);
      setOfferRecommendation(null);
      toast({
        title: "Property Found",
        description: "Property data loaded successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lookup Failed",
        description: error.message || "Failed to lookup property",
        variant: "destructive",
      });
    },
  });

  // Offer recommendation mutation
  const getOfferRecommendationMutation = useMutation({
    mutationFn: async () => {
      if (!propertyData || !buyerMotivation || !timeline || !buyerProfile) {
        throw new Error("Missing required information");
      }

      const response = await apiRequest("POST", "/api/offer-recommendation", {
        propertyData,
        buyerMotivation,
        timeline,
        buyerProfile,
      });
      return await response.json() as OfferRecommendation;
    },
    onSuccess: (data) => {
      setOfferRecommendation(data);
      toast({
        title: "Offer Strategy Generated",
        description: "AI recommendation ready",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Recommendation Failed",
        description: error.message || "Failed to generate offer recommendation",
        variant: "destructive",
      });
    },
  });

  const handleLookup = () => {
    if (!address.trim()) {
      toast({
        title: "Validation Error",
        description: "Please enter a property address",
        variant: "destructive",
      });
      return;
    }
    lookupPropertyMutation.mutate(address);
  };

  const handleGenerateRecommendation = () => {
    if (!buyerMotivation || !timeline || !buyerProfile) {
      toast({
        title: "Missing Information",
        description: "Please complete all buyer information fields",
        variant: "destructive",
      });
      return;
    }
    getOfferRecommendationMutation.mutate();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMarketConditionColor = (condition: string) => {
    switch (condition) {
      case 'extremely_hot_seller_market':
      case 'hot_seller_market':
        return 'bg-red-100 text-red-800';
      case 'seller_market':
        return 'bg-orange-100 text-orange-800';
      case 'balanced_market':
        return 'bg-blue-100 text-blue-800';
      case 'buyer_market':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompetitionColor = (level: string) => {
    switch (level) {
      case 'extreme':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Property Lookup & Offer Strategy</h1>
          <p className="text-gray-600">Enter an address to get property data and AI-powered offer recommendations</p>
        </div>
      </div>

      {/* Address Lookup Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Property Address Lookup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g., 123 Main St, Boston, MA 02101"
                className="mt-1"
                data-testid="input-property-address"
              />
              <p className="text-sm text-muted-foreground mt-1">
                Format: Street Address, City, State ZIP
              </p>
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleLookup}
                disabled={lookupPropertyMutation.isPending}
                data-testid="button-lookup-property"
              >
                {lookupPropertyMutation.isPending ? (
                  <>
                    <Search className="w-4 h-4 mr-2 animate-spin" />
                    Looking up...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Lookup
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {mlsSettings ? (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">MLS Connected</span>
              </div>
              <p className="text-sm text-green-700">
                Will search {mlsSettings.mlsSystemName} for accurate listing data
              </p>
            </div>
          ) : (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">No MLS Connection</span>
              </div>
              <p className="text-sm text-blue-700">
                Connect your MLS in Settings for accurate listing data. Will use market estimates.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Property Data Results */}
      {propertyData && (
        <Card data-testid="property-data-results">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Data Accuracy Notice */}
            {(!propertyData.bedrooms || !propertyData.bathrooms || !propertyData.squareFeet || !propertyData.yearBuilt) && (
              <div className="mb-6 p-4 bg-orange-50 border-l-4 border-orange-400 rounded-r">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-orange-800">Property Data May Be Incomplete</h4>
                    <p className="text-sm text-orange-700 mt-1">
                      Some property details are not available from our current data sources. For the most accurate and complete property information, please:
                    </p>
                    <ul className="list-disc ml-5 mt-2 text-sm text-orange-700 space-y-1">
                      <li>Connect your MLS system in Settings for listing data</li>
                      <li>Verify property details independently through public records</li>
                      <li>Contact the listing agent for current information</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{propertyData.address}</h3>
                  <p className="text-gray-600">{propertyData.city}, {propertyData.state} {propertyData.zipcode}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  {propertyData.listPrice && (
                    <div>
                      <Label className="text-sm text-gray-600">List Price</Label>
                      <p className="text-xl font-bold text-green-600">
                        {formatCurrency(propertyData.listPrice)}
                      </p>
                    </div>
                  )}
                  
                  {propertyData.daysOnMarket && (
                    <div>
                      <Label className="text-sm text-gray-600">Days on Market</Label>
                      <p className="text-xl font-bold">{propertyData.daysOnMarket}</p>
                    </div>
                  )}
                  
                  <div>
                    <Label className="text-sm text-gray-600">Bedrooms</Label>
                    <p className="text-lg font-semibold">
                      {propertyData.bedrooms ? propertyData.bedrooms : (
                        <span className="text-gray-400 italic">Not Available</span>
                      )}
                    </p>
                    {!propertyData.bedrooms && (
                      <p className="text-xs text-orange-600 mt-1">Connect MLS for accurate data</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-600">Bathrooms</Label>
                    <p className="text-lg font-semibold">
                      {propertyData.bathrooms ? propertyData.bathrooms : (
                        <span className="text-gray-400 italic">Not Available</span>
                      )}
                    </p>
                    {!propertyData.bathrooms && (
                      <p className="text-xs text-orange-600 mt-1">Connect MLS for accurate data</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-600">Square Feet</Label>
                    <p className="text-lg font-semibold">
                      {propertyData.squareFeet ? propertyData.squareFeet.toLocaleString() : (
                        <span className="text-gray-400 italic">Not Available</span>
                      )}
                    </p>
                    {!propertyData.squareFeet && (
                      <p className="text-xs text-orange-600 mt-1">Connect MLS for accurate data</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-sm text-gray-600">Year Built</Label>
                    <p className="text-lg font-semibold">
                      {propertyData.yearBuilt ? propertyData.yearBuilt : (
                        <span className="text-gray-400 italic">Not Available</span>
                      )}
                    </p>
                    {!propertyData.yearBuilt && (
                      <p className="text-xs text-orange-600 mt-1">Connect MLS for accurate data</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Market Data */}
              {propertyData.marketData && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Market Data
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {propertyData.marketData.medianPrice && (
                      <div>
                        <Label className="text-sm text-gray-600">Median Price</Label>
                        <p className="text-lg font-semibold">
                          {formatCurrency(propertyData.marketData.medianPrice)}
                        </p>
                      </div>
                    )}
                    
                    {propertyData.marketData.averageDaysOnMarket && (
                      <div>
                        <Label className="text-sm text-gray-600">Avg Days on Market</Label>
                        <p className="text-lg font-semibold">{propertyData.marketData.averageDaysOnMarket}</p>
                      </div>
                    )}
                    
                    {propertyData.marketData.priceChange !== undefined && (
                      <div>
                        <Label className="text-sm text-gray-600">Price Change</Label>
                        <p className={`text-lg font-semibold ${
                          propertyData.marketData.priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {propertyData.marketData.priceChange >= 0 ? '+' : ''}
                          {propertyData.marketData.priceChange.toFixed(1)}%
                        </p>
                      </div>
                    )}
                    
                    {propertyData.marketData.pricePerSqft && (
                      <div>
                        <Label className="text-sm text-gray-600">Price per Sq Ft</Label>
                        <p className="text-lg font-semibold">
                          ${propertyData.marketData.pricePerSqft}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {propertyData.marketData.marketCondition && (
                      <div>
                        <Label className="text-sm text-gray-600">Market Condition</Label>
                        <div className="mt-1">
                          <Badge className={getMarketConditionColor(propertyData.marketData.marketCondition)}>
                            {propertyData.marketData.marketCondition.replace(/_/g, ' ').toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {propertyData.marketData.competitionLevel && (
                      <div>
                        <Label className="text-sm text-gray-600">Competition Level</Label>
                        <div className="mt-1">
                          <Badge className={getCompetitionColor(propertyData.marketData.competitionLevel)}>
                            {propertyData.marketData.competitionLevel.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Comparables */}
            {propertyData.comparables && propertyData.comparables.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-lg mb-3">Recent Comparable Sales</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Address</th>
                        <th className="text-right p-2">Sold Price</th>
                        <th className="text-right p-2">Date</th>
                        <th className="text-right p-2">Days on Market</th>
                        <th className="text-right p-2">$/Sq Ft</th>
                      </tr>
                    </thead>
                    <tbody>
                      {propertyData.comparables.slice(0, 5).map((comp, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{comp.address}</td>
                          <td className="text-right p-2 font-semibold">
                            {formatCurrency(comp.soldPrice)}
                          </td>
                          <td className="text-right p-2">
                            {new Date(comp.soldDate).toLocaleDateString()}
                          </td>
                          <td className="text-right p-2">{comp.daysOnMarket}</td>
                          <td className="text-right p-2">${comp.pricePerSqft}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Buyer Information */}
      {propertyData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Buyer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="motivation">Buyer Motivation</Label>
                <Select value={buyerMotivation} onValueChange={setBuyerMotivation}>
                  <SelectTrigger data-testid="select-buyer-motivation">
                    <SelectValue placeholder="Select motivation level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="extremely_motivated">Extremely Motivated</SelectItem>
                    <SelectItem value="motivated">Motivated</SelectItem>
                    <SelectItem value="testing_market">Testing Market</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Select value={timeline} onValueChange={setTimeline}>
                  <SelectTrigger data-testid="select-timeline">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asap">ASAP</SelectItem>
                    <SelectItem value="30_days">30 Days</SelectItem>
                    <SelectItem value="60_days">60 Days</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="profile">Buyer Profile</Label>
                <Select value={buyerProfile} onValueChange={setBuyerProfile}>
                  <SelectTrigger data-testid="select-buyer-profile">
                    <SelectValue placeholder="Select buyer type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="first_time">First-Time Buyer</SelectItem>
                    <SelectItem value="move_up">Move-Up Buyer</SelectItem>
                    <SelectItem value="downsize">Downsizing</SelectItem>
                    <SelectItem value="investor">Investor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleGenerateRecommendation}
              disabled={getOfferRecommendationMutation.isPending || !buyerMotivation || !timeline || !buyerProfile}
              className="mt-4"
              data-testid="button-generate-recommendation"
            >
              {getOfferRecommendationMutation.isPending ? (
                <>
                  <Target className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Generate Offer Strategy
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Offer Recommendation */}
      {offerRecommendation && (
        <Card data-testid="offer-recommendation-results">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              AI Offer Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Recommendation */}
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-lg">Recommended Offer</h3>
                    <Badge className="bg-blue-100 text-blue-800">
                      {offerRecommendation.confidence}% Confidence
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(offerRecommendation.recommendedOffer)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {offerRecommendation.offerPercentage}% of list price
                  </p>
                  <p className="text-sm font-medium mt-2">{offerRecommendation.strategy}</p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Reasoning
                  </h4>
                  <ul className="space-y-1">
                    {offerRecommendation.reasoning.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <span className="w-1 h-1 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Negotiation Tips</h4>
                  <ul className="space-y-1">
                    {offerRecommendation.negotiationTips.map((tip, index) => (
                      <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {offerRecommendation.risks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-orange-500" />
                      Risks to Consider
                    </h4>
                    <ul className="space-y-1">
                      {offerRecommendation.risks.map((risk, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 flex-shrink-0" />
                          {risk}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Contract Terms */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recommended Contract Terms
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-gray-600">Inspection Period</Label>
                        <p className="font-semibold">{offerRecommendation.contingencies.inspection} days</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Financing Contingency</Label>
                        <p className="font-semibold">{offerRecommendation.contingencies.financing} days</p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Appraisal Contingency</Label>
                        <p className="font-semibold">
                          {offerRecommendation.contingencies.appraisal ? 'Include' : 'Waive'}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">Closing Timeline</Label>
                        <p className="font-semibold">{offerRecommendation.closingTimeline} days</p>
                      </div>
                    </div>
                  </div>
                </div>

                {offerRecommendation.escalationClause && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="font-semibold mb-2">Escalation Clause Recommended</h4>
                    <div className="text-sm space-y-1">
                      <p>Max Price: {formatCurrency(offerRecommendation.escalationClause.maxPrice!)}</p>
                      <p>Increment: {formatCurrency(offerRecommendation.escalationClause.increment!)}</p>
                    </div>
                  </div>
                )}

                {/* Alternative Strategies */}
                <div>
                  <h4 className="font-semibold mb-3">Alternative Strategies</h4>
                  <div className="space-y-3">
                    {offerRecommendation.alternatives.map((alt, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">{alt.strategy}</h5>
                          <span className="font-semibold text-blue-600">
                            {formatCurrency(alt.offer)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="font-medium text-green-600 mb-1">Pros:</p>
                            <ul className="space-y-0.5">
                              {alt.pros.map((pro, i) => (
                                <li key={i}>• {pro}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="font-medium text-red-600 mb-1">Cons:</p>
                            <ul className="space-y-0.5">
                              {alt.cons.map((con, i) => (
                                <li key={i}>• {con}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}