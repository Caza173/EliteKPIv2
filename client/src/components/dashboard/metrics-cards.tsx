import { DollarSign, TrendingUp, Key, List, ArrowUp, Minus, Home, Calculator, ArrowDown, Clock, X } from "lucide-react";

interface MetricsCardsProps {
  metrics: any;
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: "Total Revenue",
      value: `$${metrics?.totalRevenue?.toLocaleString() || '0'}`,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: "12.5% from last month",
      trendIcon: ArrowUp,
      trendColor: "text-green-600"
    },
    {
      title: "Total Volume",
      value: `$${(metrics?.totalVolume / 1000000)?.toFixed(1) || '0'}M`,
      icon: TrendingUp,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "8.2% from last month",
      trendIcon: ArrowUp,
      trendColor: "text-green-600"
    },
    {
      title: "Properties Closed",
      value: metrics?.propertiesClosed || '0',
      icon: Key,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "3 this month",
      trendIcon: ArrowUp,
      trendColor: "text-green-600"
    },
    {
      title: "Active Listings",
      value: metrics?.activeListings || '0',
      icon: List,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: `${metrics?.underContractCount || '0'} under contract`,
      trendIcon: Minus,
      trendColor: "text-gray-600"
    },
    {
      title: "Withdrawn Properties",
      value: metrics?.withdrawnProperties || '0',
      icon: ArrowDown,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      trend: "Client withdrew",
      trendIcon: ArrowDown,
      trendColor: "text-red-600"
    },
    {
      title: "Expired Properties",
      value: metrics?.expiredProperties || '0',
      icon: Clock,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "Listing expired",
      trendIcon: Clock,
      trendColor: "text-blue-600"
    },
    {
      title: "Terminated Properties",
      value: metrics?.terminatedProperties || '0',
      icon: X,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      trend: "Contract ended",
      trendIcon: X,
      trendColor: "text-gray-600"
    },
    {
      title: "Avg Home Sale Price",
      value: `$${(metrics?.avgHomeSalePrice / 1000)?.toFixed(0) || '0'}K`,
      icon: Home,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      trend: "Per closed property",
      trendIcon: ArrowUp,
      trendColor: "text-green-600"
    },
    {
      title: "Avg Commission",
      value: `$${metrics?.avgCommission?.toLocaleString() || '0'}`,
      icon: Calculator,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: "Per transaction",
      trendIcon: ArrowUp,
      trendColor: "text-green-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 min-w-0">
      {cards.map((card, index) => (
        <div key={index} className="bg-white overflow-hidden shadow rounded-lg min-w-0">
          <div className="p-3 min-w-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 ${card.iconBg} rounded-full flex items-center justify-center`}>
                  <card.icon className={`h-3 w-3 ${card.iconColor}`} />
                </div>
              </div>
              <div className="ml-3 w-0 flex-1 min-w-0">
                <dl>
                  <dt className="text-xs font-medium text-gray-500 break-words">{card.title}</dt>
                  <dd className="text-lg font-medium text-gray-900 break-words">{card.value}</dd>
                </dl>
              </div>
            </div>
            <div className={`mt-1 flex items-center text-xs ${card.trendColor}`}>
              <card.trendIcon className="h-3 w-3 mr-1" />
              <span>{card.trend}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
