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
  ChevronDown
} from "lucide-react";
import { KpiCard } from "@/components/ui/kpi-card";
import { RingGauge } from "@/components/ui/ring-gauge";
import { GoalCard } from "@/components/ui/goal-card";
import { BadgeCard } from "@/components/ui/badge-card";
import { FactorRow } from "@/components/ui/factor-row";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { formatCurrency } from "@/lib/calculations";

// Helper components
function TeaserCard({ title, description, icon }: { title: string; description: string; icon: any }) {
  const IconComponent = icon;
  return (
    <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
      <CardContent className="p-6 text-center">
        <IconComponent className="h-8 w-8 mx-auto mb-3 text-blue-500" />
        <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-4">{description}</p>
        <div className="flex items-center justify-center space-x-2">
          <span className="text-xs text-slate-600">Notify me</span>
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

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["/api/commissions"],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
  });

  const { data: metrics } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  // Calculate metrics
  const totalRevenue = metrics?.totalRevenue ?? 0;
  const totalVolume = (properties as any[]).length;
  const activeListings = (properties as any[]).filter((p: any) => p.status === 'Active').length;
  const closedProperties = (properties as any[]).filter((p: any) => p.status === 'Closed').length;
  const withdrawnProperties = (properties as any[]).filter((p: any) => p.status === 'Withdrawn').length;
  const expiredProperties = (properties as any[]).filter((p: any) => p.status === 'Expired').length;
  
  // Calculate averages
  const closedPropertiesWithPrice = (properties as any[]).filter((p: any) => p.status === 'Closed' && p.salePrice);
  const avgSalePrice = closedPropertiesWithPrice.length > 0 
    ? closedPropertiesWithPrice.reduce((sum: number, p: any) => sum + (p.salePrice || 0), 0) / closedPropertiesWithPrice.length 
    : 0;
  
  const avgCommission = (commissions as any[]).length > 0 
    ? (commissions as any[]).reduce((sum: number, c: any) => sum + c.amount, 0) / (commissions as any[]).length 
    : 0;

  // Performance data
  const efficiencyScore = 73;
  const avgTransactionPeriod = 45;
  const buyerConversionRate = 68;
  const sellerConversionRate = 74;
  const offerAcceptanceRate = 85;
  const revenuePerHour = 250;
  const roiPerformance = 145;

  // Generate sparkline data
  const generateSparkline = () => 
    Array.from({ length: 7 }, (_, i) => ({
      x: `Day ${i + 1}`,
      y: Math.floor(Math.random() * 100) + 50
    }));

  // KPI Data with sparklines
  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(totalRevenue),
      delta: { value: 12.5, direction: "up" as const },
      sparkline: generateSparkline(),
      intent: "success" as const
    },
    {
      title: "Total Volume", 
      value: totalVolume.toString(),
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

  // Efficiency factors
  const efficiencyFactors = [
    { label: "Conversion Rate", weightPct: 85, trend: 1 as const },
    { label: "Call Efficiency", weightPct: 72, trend: 0 as const },
    { label: "ROI Performance", weightPct: 88, trend: 1 as const },
    { label: "Days on Market", weightPct: 65, trend: -1 as const },
    { label: "CMA Accuracy", weightPct: 91, trend: 1 as const },
    { label: "Price Ratio", weightPct: 78, trend: 0 as const },
    { label: "Time Management", weightPct: 69, trend: -1 as const },
    { label: "Deal Retention", weightPct: 82, trend: 1 as const },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-8 py-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-sm text-slate-600 mt-1">
              <Home className="h-4 w-4 inline mr-1" />
              Real Estate KPI Center
            </p>
          </div>

          <div className="flex items-center space-x-4">
            <select className="text-sm bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700">
              <option>Last 30 days</option>
              <option>Last 60 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
            
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600">
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
          <h2 className="text-xl font-bold text-slate-900 mb-6">Key Performance Indicators</h2>
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
          <h2 className="text-xl font-bold text-slate-900 mb-6">Overall Efficiency</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6 flex justify-center">
                <RingGauge value={efficiencyScore} />
              </CardContent>
            </Card>
            
            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-900">Performance Breakdown</CardTitle>
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
          <h2 className="text-xl font-bold text-slate-100 mb-6">Operational Snapshot</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                    This Month Revenue
                  </span>
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {formatCurrency(totalRevenue)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                    Avg Transaction Period
                  </span>
                  <Clock className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {avgTransactionPeriod} days
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                    Conversion Rates
                  </span>
                  <Target className="h-4 w-4 text-green-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Buyers</span>
                    <span className="font-medium text-slate-900">{buyerConversionRate}%</span>
                  </div>
                  <Progress value={buyerConversionRate} className="h-1.5" />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Sellers</span>
                    <span className="font-medium text-slate-900">{sellerConversionRate}%</span>
                  </div>
                  <Progress value={sellerConversionRate} className="h-1.5" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                    Offer Acceptance Rate
                  </span>
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
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
                  <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                    Revenue Per Hour
                  </span>
                  <DollarSign className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {formatCurrency(revenuePerHour)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 hover:shadow-lg hover:border-blue-300 transition-all duration-200 rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-medium text-slate-600 tracking-wide uppercase">
                    ROI Performance
                  </span>
                  <Star className="h-4 w-4 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-slate-900 tabular-nums">
                  {roiPerformance}%
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Achievements</h2>
          <div className="grid grid-cols-5 gap-4">
            <BadgeCard tier="Bronze" count={12} progress={75} />
            <BadgeCard tier="Silver" count={8} progress={45} />
            <BadgeCard tier="Gold" count={5} progress={20} />
            <BadgeCard tier="Platinum" count={2} progress={60} />
            <BadgeCard tier="Diamond" count={1} progress={10} />
          </div>
        </section>

        {/* Progress Tracking */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Progress Tracking</h2>
          
          {/* Goal Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <GoalCard
              title="Monthly Revenue Goal"
              current={totalRevenue}
              target={200000}
            />
            <GoalCard
              title="Sales Target"
              current={closedProperties}
              target={15}
            />
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Buyer Conversion</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{buyerConversionRate}%</span>
                </div>
                <Progress value={buyerConversionRate} className="h-2" />
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">ROI Target</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">{roiPerformance}%</span>
                </div>
                <Progress value={Math.min(roiPerformance, 100)} className="h-2" />
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-slate-700">Activity Streak</span>
                  <span className="text-sm font-bold text-slate-900 tabular-nums">14 days</span>
                </div>
                <Progress value={93} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Coming Soon */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6">Coming Soon</h2>
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
    </div>
  );
}