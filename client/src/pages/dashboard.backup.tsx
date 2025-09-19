import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Home, 
  Clock, 
  Target, 
  Activity, 
  DollarSign,
  Star,
  Bell,
  Users,
  Zap,
  Brain,
  Lightbulb,
  ChevronDown,
  TrendingUp
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { RingGauge } from "@/components/ui/ring-gauge";

import { BadgeCard } from "@/components/ui/badge-card";
import { FactorRow } from "@/components/ui/factor-row";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/calculations";
import { FeatureGate, usePlanInfo } from "@/hooks/usePlanInfo";
import LeadSourcePropertiesModal from "@/components/modals/lead-source-properties-modal";

// Helper components
function TeaserCard({ title, description, icon }: { title: string; description: string; icon: any }) {
  const IconComponent = icon;
  return (
    <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
      <CardContent className="p-6 text-center">
        <IconComponent className="h-8 w-8 mx-auto mb-3 text-blue-500" />
        <h3 className="font-semibold text-black mb-2">{title}</h3>
        <p className="text-sm text-black mb-4">{description}</p>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xs text-black">Notify me</span>
          <Switch />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  const { data: planInfo } = usePlanInfo();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["/api/commissions"],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
  });

  const { data: metrics = {} } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: leadSourceData = {} } = useQuery({
    queryKey: ["/api/lead-sources"],
  });

  // Modal state for lead source properties
  const [selectedLeadSource, setSelectedLeadSource] = useState<{
    name: string;
    rawSource: string;
  } | null>(null);
  const [isLeadSourceModalOpen, setIsLeadSourceModalOpen] = useState(false);

  const handleLeadSourceClick = (leadSource: any) => {
    setSelectedLeadSource({
      name: leadSource.source,
      rawSource: leadSource.rawSource
    });
    setIsLeadSourceModalOpen(true);
  };

  const closeLeadSourceModal = () => {
    setIsLeadSourceModalOpen(false);
    setSelectedLeadSource(null);
  };

    // Calculate metrics with proper type checking
  const totalRevenue = (metrics as any)?.totalRevenue ?? 0;
  const expectedRevenue = (metrics as any)?.expectedRevenue ?? 0;
  const totalVolume = (metrics as any)?.totalVolume ?? 0;
  const activeListings = (metrics as any)?.activeListings ?? 0;
  const closedProperties = (metrics as any)?.propertiesClosed ?? 0;
  const totalProperties = (metrics as any)?.totalProperties ?? 0; // Get actual property count
  const withdrawnProperties = (metrics as any)?.withdrawnProperties ?? 0;
  const expiredProperties = (metrics as any)?.expiredProperties ?? 0;
  
  // Use server-calculated values
  const avgTransactionPeriod = (metrics as any)?.avgTransactionPeriod ?? 45;
  const buyerConversionRate = (metrics as any)?.buyerConversionRate ?? 68;
  const sellerConversionRate = (metrics as any)?.sellerConversionRate ?? 74;
  const offerAcceptanceRate = (metrics as any)?.offerAcceptanceRate ?? 85;
  
  // Additional calculated values
  const avgSalePrice = (metrics as any)?.avgHomeSalePrice ?? 0;
  const avgCommission = (metrics as any)?.avgCommission ?? 0;

  // Performance data - use server-calculated efficiency score
  const efficiencyScore = (metrics as any)?.efficiencyScore ?? 50;
  const scoreBreakdown = (metrics as any)?.scoreBreakdown ?? {};
  const revenuePerHour = (metrics as any)?.revenuePerHour ?? 250;
  const roiPerformance = (metrics as any)?.roiPerformance ?? 145;

  // Generate sparkline data
  const generateSparkline = () => 
    Array.from({ length: 7 }, (_, i) => ({
      x: `Day ${i + 1}`,
      y: Math.floor(Math.random() * 100) + 50
    }));

  // KPI Data with sparklines
  const kpis = [
    {
      title: "Total Revenue (Closed)",
      value: formatCurrency(totalRevenue),
      delta: { value: 12.5, direction: "up" as const },
      sparkline: generateSparkline(),
      intent: "success" as const
    },
    {
      title: "Expected Revenue (Pipeline)", 
      value: formatCurrency(expectedRevenue),
      delta: { value: 18.7, direction: "up" as const },
      sparkline: generateSparkline(),
      intent: "warning" as const
    },
    {
      title: "Total Volume", 
      value: formatCurrency(totalVolume),
      delta: { value: 8.3, direction: "up" as const },
      sparkline: generateSparkline(),
      intent: "neutral" as const
    },
    {
      title: "Properties Closed",
      value: closedProperties.toString(),
      delta: { value: 15.2, direction: "up" as const },
      sparkline: generateSparkline(),
      intent: "success" as const
    },
    {
      title: "Active Listings",
      value: activeListings.toString(),
      delta: { value: 5.1, direction: "down" as const },
      sparkline: generateSparkline(),
      intent: "neutral" as const
    },
    {
      title: "Withdrawn",
      value: withdrawnProperties.toString(),
      delta: { value: 2.3, direction: "down" as const },
      sparkline: generateSparkline(),
      intent: "warning" as const
    },
    {
      title: "Expired",
      value: expiredProperties.toString(),
      delta: { value: 1.8, direction: "up" as const },
      sparkline: generateSparkline(),
      intent: "danger" as const
    },
    {
      title: "Avg Sale Price",
      value: formatCurrency(avgSalePrice),
      delta: { value: 7.2, direction: "up" as const },
      sparkline: generateSparkline(),
      intent: "success" as const
    },
    {
      title: "Avg Commission",
      value: formatCurrency(avgCommission),
      delta: { value: 9.1, direction: "up" as const },
      sparkline: generateSparkline(),
      intent: "success" as const
    }
  ];

  // Efficiency factors - use real data from server breakdown
  const efficiencyFactors = [
    { 
      label: "Conversion Rate", 
      weightPct: scoreBreakdown?.conversionEfficiency ?? 50, 
      trend: (scoreBreakdown?.conversionEfficiency ?? 50) >= 70 ? 1 : (scoreBreakdown?.conversionEfficiency ?? 50) >= 50 ? 0 : -1
    },
    { 
      label: "Call Efficiency", 
      weightPct: scoreBreakdown?.activityConsistency ?? 50, 
      trend: (scoreBreakdown?.activityConsistency ?? 50) >= 70 ? 1 : (scoreBreakdown?.activityConsistency ?? 50) >= 50 ? 0 : -1
    },
    { 
      label: "ROI Performance", 
      weightPct: scoreBreakdown?.roiPerformance ?? 50, 
      trend: (scoreBreakdown?.roiPerformance ?? 50) >= 70 ? 1 : (scoreBreakdown?.roiPerformance ?? 50) >= 50 ? 0 : -1
    },
    { 
      label: "Days on Market", 
      weightPct: scoreBreakdown?.dealVelocity ?? 50, 
      trend: (scoreBreakdown?.dealVelocity ?? 50) >= 70 ? 1 : (scoreBreakdown?.dealVelocity ?? 50) >= 50 ? 0 : -1
    },
    { 
      label: "Time Management", 
      weightPct: scoreBreakdown?.timeManagement ?? 50, 
      trend: (scoreBreakdown?.timeManagement ?? 50) >= 70 ? 1 : (scoreBreakdown?.timeManagement ?? 50) >= 50 ? 0 : -1
    },
  ] as Array<{ label: string; weightPct: number; trend: -1 | 0 | 1 }>;

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-900 via-blue-600 to-white"
         style={{ background: 'linear-gradient(135deg, #0a1a2a 0%, #1e3a8a 30%, #2563eb 60%, #ffffff 100%)' }}>
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-white mt-1">
              <Home className="h-4 w-4 inline mr-1" />
              Real Estate KPI Center
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Plan Info Display */}
            {planInfo && (
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 border border-white/20">
                <div className="text-xs text-white/80">Current Plan</div>
                <div className="text-sm font-semibold text-white capitalize">
                  {planInfo.planId}
                  {planInfo.planId === 'starter' && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {totalProperties}/{planInfo.limits.properties} Properties
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <input 
                type="date" 
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-black"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              <span className="text-white text-sm">to</span>
              <input 
                type="date" 
                className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-black"
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-white/60" />
              <span className="text-sm text-white">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </div>

        {/* KPI Grid */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Key Performance Indicators</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            {kpis.map((kpi, index) => (
              <KpiCard
                key={index}
                title={kpi.title}
                value={kpi.value}
                delta={kpi.delta}
                sparkline={kpi.sparkline}
                intent={kpi.intent}
              />
            ))}
          </div>
        </section>

        {/* Overall Efficiency */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Overall Efficiency</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6 flex justify-center">
                <RingGauge value={efficiencyScore} />
              </CardContent>
            </Card>
            
            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-black">Performance Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {efficiencyFactors.map((factor, index) => (
                    <FactorRow
                      key={index}
                      label={factor.label}
                      weightPct={factor.weightPct}
                      trend={factor.trend}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Operational Snapshot */}
        <section>
          <h2 className="text-xl font-bold text-white mb-6">Operational Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-black tracking-wide uppercase">
                    This Month Revenue
                  </span>
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-black tabular-nums">
                  {formatCurrency(totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-black tracking-wide uppercase">
                    Avg Transaction Period
                  </span>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-black tabular-nums">
                  {avgTransactionPeriod} days
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-black tracking-wide uppercase">
                    Conversion Rates
                  </span>
                  <Target className="h-4 w-4 text-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-black">Buyers</span>
                    <span className="font-medium text-black">{buyerConversionRate}%</span>
                  </div>
                  <Progress value={buyerConversionRate} className="h-1.5" />
                  <div className="flex justify-between text-sm">
                    <span className="text-black">Sellers</span>
                    <span className="font-medium text-black">{sellerConversionRate}%</span>
                  </div>
                  <Progress value={sellerConversionRate} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-black tracking-wide uppercase">
                    Offer Acceptance Rate
                  </span>
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-black tabular-nums">
                  {offerAcceptanceRate}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Second row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-black tracking-wide uppercase">
                    Revenue Per Hour
                  </span>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-black tabular-nums">
                  {formatCurrency(revenuePerHour)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-black tracking-wide uppercase">
                    ROI Performance
                  </span>
                  <Star className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-black tabular-nums">
                  {roiPerformance}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Source Tracking */}
          <div className="mt-8">
            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold text-black">
                    Lead Sources
                  </span>
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-4">
                  {(leadSourceData as any)?.leadSources?.slice(0, 6).map((item: any, index: number) => (
                    <div 
                      key={item.rawSource} 
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                      onClick={() => handleLeadSourceClick(item)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-black">{item.source}</div>
                          <div className="text-xs text-gray-500">{item.percentage}% of total</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-black">{item.count}</div>
                        <div className="text-xs text-gray-500">properties</div>
                      </div>
                    </div>
                  ))}
                  {(leadSourceData as any)?.leadSources?.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No lead source data available</p>
                      <p className="text-xs">Add properties with lead sources to see this data</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>





        {/* Coming Soon */}
        <section>
          <h2 className="text-xl font-bold text-black mb-6">Coming Soon</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TeaserCard
              title="Smart Goals"
              description="AI-powered goal recommendations based on performance patterns."
              icon={Brain}
            />
            <TeaserCard
              title="Predictive Analytics"
              description="Forecast market trends and identify optimal strategies."
              icon={Zap}
            />
            <TeaserCard
              title="Automated Insights"
              description="Get personalized recommendations delivered to your inbox."
              icon={Lightbulb}
            />
          </div>
        </section>
      </div>

      {/* Lead Source Properties Modal */}
      <LeadSourcePropertiesModal
        isOpen={isLeadSourceModalOpen}
        onClose={closeLeadSourceModal}
        leadSource={selectedLeadSource?.name || null}
        rawLeadSource={selectedLeadSource?.rawSource || null}
      />
    </div>
  );
}