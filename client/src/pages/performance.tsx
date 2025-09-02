import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Phone, 
  Calendar, 
  FileText, 
  DollarSign,
  Clock,
  Target,
  Award,
  AlertTriangle,
  CheckCircle,
  Activity
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatCurrency, formatPercentage, calculateConversionRate } from "@/lib/calculations";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function Performance() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeRecommendationTab, setActiveRecommendationTab] = useState<'high' | 'medium' | 'low'>('high');
  const [selectedPropertyIndex, setSelectedPropertyIndex] = useState<string>('0');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: metrics, error } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
    retry: false,
  });

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ["/api/activities"],
    retry: false,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
    retry: false,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["/api/commissions"],
    retry: false,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  // Calculate performance metrics
  const callActivities = (activities as any[]).filter((a: any) => a.type === 'client_call');
  const answeredCalls = (activities as any[]).filter((a: any) => a.type === 'call_answered');
  const callAnswerRate = callActivities.length > 0 ? (answeredCalls.length / callActivities.length) * 100 : 0;

  const appointments = (activities as any[]).filter((a: any) => a.type.includes('appointment'));
  const agreements = (activities as any[]).filter((a: any) => a.type.includes('signed') || a.type.includes('taken'));
  const appointmentConversionRate = appointments.length > 0 ? (agreements.length / appointments.length) * 100 : 0;

  const buyerProperties = (properties as any[]).filter((p: any) => p.representationType === 'buyer_rep');
  const sellerProperties = (properties as any[]).filter((p: any) => p.representationType === 'seller_rep');

  // Calculate total revenue from actual commissions (matching dashboard calculation)
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const actualTotalRevenue = (commissions as any[])
    .filter((c: any) => new Date(c.dateEarned) >= yearStart)
    .reduce((sum: number, c: any) => sum + parseFloat(c.amount || '0'), 0);

  // Property ROI calculation using actual commission data  
  const propertyROI = (properties as any[]).map((property: any) => {
    const propertyExpenses = (expenses as any[]).filter((e: any) => e.propertyId === property.id);
    const totalExpenses = propertyExpenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0);
    
    // Get actual commission from commissions table
    const propertyCommission = (commissions as any[]).find((c: any) => c.propertyId === property.id);
    const commission = propertyCommission ? parseFloat(propertyCommission.amount || '0') : 0;
    
    const roi = totalExpenses > 0 ? ((commission - totalExpenses) / totalExpenses) * 100 : 0;
    
    return {
      address: property.address.split(',')[0],
      roi,
      revenue: commission,
      expenses: totalExpenses,
      profit: commission - totalExpenses
    };
  }).filter((p: any) => p.revenue > 0);

  // Sample recommendations data
  const recommendationsData = {
    high: [
      {
        id: 1,
        title: "Improve Price Ratio Performance",
        description: "Your current price ratio is 67%. Focus on more accurate initial pricing to improve client satisfaction.",
        action: "Review recent CMAs and adjust pricing strategy",
        impact: "Could increase efficiency score by 8-12 points"
      },
      {
        id: 2,
        title: "Enhance Time Management",
        description: "Time management score at 62%. Consider implementing time-blocking techniques.",
        action: "Use calendar blocking for prospecting and admin tasks",
        impact: "Could save 5-8 hours per week"
      },
      {
        id: 3,
        title: "Focus on Deal Retention",
        description: "Deal retention at 58%. Implement stronger follow-up systems to prevent deals from falling through.",
        action: "Create automated follow-up sequences for pending contracts",
        impact: "Could increase closed deal rate by 15-20%"
      }
    ],
    medium: [
      {
        id: 4,
        title: "Optimize CMA Accuracy",
        description: "CMA accuracy at 73%. Fine-tune your market analysis approach.",
        action: "Include more recent comparables and market trends",
        impact: "Could improve client trust and listing success"
      },
      {
        id: 5,
        title: "Enhance Call Efficiency",
        description: "Call efficiency at 86%. Good performance, but room for improvement.",
        action: "Implement call scripts and better qualification questions",
        impact: "Could increase conversion rate by 5-8%"
      }
    ],
    low: []
  };

  // Price analysis data
  const priceAnalysis = (properties as any[])
    .filter((p: any) => p.listingPrice && p.soldPrice)
    .map((p: any) => ({
      address: p.address.split(',')[0],
      listingPrice: parseFloat(p.listingPrice),
      soldPrice: parseFloat(p.soldPrice),
      variance: ((parseFloat(p.soldPrice) - parseFloat(p.listingPrice)) / parseFloat(p.listingPrice)) * 100
    }));

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex-1 overflow-y-auto p-3 md:p-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
              <p className="text-gray-600">Start adding properties and activities to see your performance metrics.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Performance Overview</h1>
          <p className="text-sm text-gray-600">Track your business performance and identify opportunities for growth</p>
        </div>
      </div>

      {/* Top Performance Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-blue-600">28</div>
            <div className="text-sm text-gray-600">Achievements Unlocked</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl mb-2">⭐</div>
            <div className="text-2xl font-bold text-blue-600">20800</div>
            <div className="text-sm text-gray-600">Total Points</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl mb-2">🔥</div>
            <div className="text-2xl font-bold text-orange-600">2</div>
            <div className="text-sm text-gray-600">Active Streaks</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-6">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-2xl font-bold text-green-600">21</div>
            <div className="text-sm text-gray-600">Agent Level</div>
          </CardContent>
        </Card>
      </div>


      {/* Overall Efficiency Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Performance Analysis
          </CardTitle>
          <p className="text-sm text-gray-600">In-depth analysis of your sales and conversion metrics</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Overall Efficiency Score */}
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Overall Efficiency Score</h3>
              <div className="relative inline-flex items-center justify-center w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="2"
                  />
                  <path
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    strokeDasharray={`${metrics?.efficiencyScore || 0}, 100`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{metrics?.efficiencyScore || 0}</div>
                    <div className="text-sm text-gray-600">Score</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Metrics */}
            <div className="space-y-3">
              {[
                { label: 'Conversion', value: '91%', color: 'text-green-600' },
                { label: 'Call Efficiency', value: '86%', color: 'text-green-600' },
                { label: 'ROI', value: '83%', color: 'text-green-600' },
                { label: 'Days on Market', value: '79%', color: 'text-green-600' },
                { label: 'CMA Accuracy', value: '73%', color: 'text-green-600' },
                { label: 'Price Ratio', value: '67%', color: 'text-red-600' },
                { label: 'Time Management', value: '62%', color: 'text-red-600' },
                { label: 'Deal Retention', value: '58%', color: 'text-red-600' }
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{metric.label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium ${metric.color}`}>
                      {metric.value}
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          metric.color.includes('green') ? 'bg-green-500' : 'bg-red-500'
                        }`}
                        style={{ width: metric.value }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-3">
                Comprehensive efficiency score now includes CMA accuracy tracking to measure pricing expertise and market knowledge.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Performance Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveRecommendationTab('high')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeRecommendationTab === 'high' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              High Priority ({recommendationsData.high.length})
            </button>
            <button
              onClick={() => setActiveRecommendationTab('medium')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeRecommendationTab === 'medium' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Medium Priority ({recommendationsData.medium.length})
            </button>
            <button
              onClick={() => setActiveRecommendationTab('low')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                activeRecommendationTab === 'low' 
                  ? 'bg-gray-500 text-white' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              Low Priority ({recommendationsData.low.length})
            </button>
          </div>
          
          <div className="space-y-4">
            {recommendationsData[activeRecommendationTab].length > 0 ? (
              recommendationsData[activeRecommendationTab].map((rec) => (
                <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      activeRecommendationTab === 'high' ? 'bg-red-500' :
                      activeRecommendationTab === 'medium' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <div className="bg-blue-50 rounded-md p-3 mb-2">
                        <p className="text-sm text-blue-800"><strong>Action:</strong> {rec.action}</p>
                      </div>
                      <p className="text-xs text-green-600 font-medium">{rec.impact}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-gray-600">
                  {activeRecommendationTab === 'high' && "No high priority recommendations at this time."}
                  {activeRecommendationTab === 'medium' && "No medium priority recommendations at this time."}
                  {activeRecommendationTab === 'low' && "No low priority recommendations at this time."}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Buyer and Seller Conversion Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Buyer Conversion Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Buyer Conversion Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-600">Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-gray-600">Signed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm text-gray-600">Sold</div>
              </div>
            </div>
            
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Appointments', value: 3, fill: '#3b82f6' },
                      { name: 'Signed', value: 2, fill: '#10b981' },
                      { name: 'Sold', value: 2, fill: '#8b5cf6' }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                  >
                    {[
                      { fill: '#3b82f6' },
                      { fill: '#10b981' },
                      { fill: '#8b5cf6' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Appt → Signed</span>
                <span className="font-medium text-green-600">66.7%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Signed → Sold</span>
                <span className="font-medium text-green-600">100.0%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seller Conversion Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Seller Conversion Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">2</div>
                <div className="text-sm text-gray-600">Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">2</div>
                <div className="text-sm text-gray-600">Taken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">3</div>
                <div className="text-sm text-gray-600">Sold</div>
              </div>
            </div>
            
            <div className="mb-4">
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={[
                  { name: 'Appointments', value: 2 },
                  { name: 'Taken', value: 2 },
                  { name: 'Sold', value: 3 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Appt → Taken</span>
                <span className="font-medium text-green-600">100.0%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Taken → Sold</span>
                <span className="font-medium text-green-600">150.0%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Call Answer Rate</CardTitle>
            <Phone className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {callAnswerRate.toFixed(1)}%
            </div>
            <Progress value={callAnswerRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-2">
              {answeredCalls.length} answered of {callActivities.length} calls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointment Conversion</CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {appointmentConversionRate.toFixed(1)}%
            </div>
            <Progress value={appointmentConversionRate} className="mt-2" />
            <p className="text-xs text-gray-600 mt-2">
              {agreements.length} agreements from {appointments.length} appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Buyer vs Seller</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {buyerProperties.length} / {sellerProperties.length}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                {buyerProperties.length} Buyer
              </Badge>
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                {sellerProperties.length} Seller
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Per Hour</CardTitle>
            <Clock className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((metrics as any)?.revenuePerHour || 0)}
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Based on YTD revenue and hours
            </p>
          </CardContent>
        </Card>
      </div>


      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Leads</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
                <span className="text-sm font-medium">100%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Appointments</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '75%'}}></div>
                  </div>
                  <span className="text-sm font-medium">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Agreements</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '45%'}}></div>
                  </div>
                  <span className="text-sm font-medium">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Closings</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '35%'}}></div>
                  </div>
                  <span className="text-sm font-medium">35%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Property ROI Analysis with Expandable Details */}
      {propertyROI.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Property ROI Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={propertyROI}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="address" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: any, name: string) => {
                      if (name === 'roi') return [formatPercentage(value), 'ROI'];
                      return [formatCurrency(value), name];
                    }}
                  />
                  <Bar dataKey="roi" fill="#3b82f6" name="roi" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-900">
                  {formatPercentage(propertyROI.reduce((sum: any, p: any) => sum + p.roi, 0) / propertyROI.length)}
                </div>
                <div className="text-sm text-green-600">Average ROI</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-900">
                  {formatCurrency(actualTotalRevenue)}
                </div>
                <div className="text-sm text-blue-600">Total Revenue</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-900">
                  {formatCurrency(propertyROI.reduce((sum: any, p: any) => sum + p.expenses, 0))}
                </div>
                <div className="text-sm text-red-600">Total Expenses</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-900">
                  {formatCurrency(propertyROI.reduce((sum: any, p: any) => sum + p.profit, 0))}
                </div>
                <div className="text-sm text-purple-600">Net Profit</div>
              </div>
            </div>

            {/* Individual Property Details */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Individual Property Performance</h4>
                <Select 
                  value={selectedPropertyIndex} 
                  onValueChange={setSelectedPropertyIndex}
                >
                  <SelectTrigger className="w-64" data-testid="select-property-performance">
                    <SelectValue placeholder="Select a property" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyROI.map((property: any, index: number) => (
                      <SelectItem key={index} value={index.toString()}>
                        {property.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Selected Property Details */}
              {propertyROI.length > 0 && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-lg font-medium text-gray-900">
                        {propertyROI[parseInt(selectedPropertyIndex)]?.address}
                      </div>
                      <Badge variant="outline" className={
                        propertyROI[parseInt(selectedPropertyIndex)]?.roi > 200 ? "text-green-700 border-green-200" :
                        propertyROI[parseInt(selectedPropertyIndex)]?.roi > 100 ? "text-blue-700 border-blue-200" :
                        propertyROI[parseInt(selectedPropertyIndex)]?.roi > 0 ? "text-blue-700 border-blue-200" :
                        "text-red-700 border-red-200"
                      }>
                        {formatPercentage(propertyROI[parseInt(selectedPropertyIndex)]?.roi)} ROI
                      </Badge>
                    </div>
                    <div className="text-lg font-medium text-gray-600">
                      {formatCurrency(propertyROI[parseInt(selectedPropertyIndex)]?.profit)} profit
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-900">
                        {formatCurrency(propertyROI[parseInt(selectedPropertyIndex)]?.revenue)}
                      </div>
                      <div className="text-xs text-blue-600">Total Revenue</div>
                    </div>
                    <div className="text-center p-3 bg-red-50 rounded-lg">
                      <div className="text-lg font-bold text-red-900">
                        {formatCurrency(propertyROI[parseInt(selectedPropertyIndex)]?.expenses)}
                      </div>
                      <div className="text-xs text-red-600">Total Expenses</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-lg font-bold text-purple-900">
                        {formatCurrency(propertyROI[parseInt(selectedPropertyIndex)]?.profit)}
                      </div>
                      <div className="text-xs text-purple-600">Net Profit</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Price Analysis */}
      {priceAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Price Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="address" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'variance') return [formatPercentage(value), 'Price Variance'];
                    return [formatCurrency(value), name];
                  }}
                />
                <Bar dataKey="listingPrice" fill="#3b82f6" name="Listing Price" />
                <Bar dataKey="soldPrice" fill="#10b981" name="Sold Price" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}