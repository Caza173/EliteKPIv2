// Mock data for dashboard components

export interface Delta {
  value: number;
  direction: "up" | "down";
}

export interface Spark {
  x: string;
  y: number;
}

export interface Kpi {
  title: string;
  value: string;
  delta?: Delta;
  spark?: Spark[];
  variant?: "neutral" | "success" | "warning" | "danger";
}

export interface Factor {
  label: string;
  weightPct: number;
  weightLevel: "Low" | "Med" | "High";
  trend: -1 | 0 | 1;
  definition?: string;
}

export interface Goal {
  title: string;
  current: number;
  target: number;
  format?: "currency" | "number";
}

export interface BadgeItem {
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond";
  count: number;
  progress: number;
}

// Generate sparkline data for the last 30 days
const generateSparkline = (baseValue: number, volatility: number = 0.1): Spark[] => {
  const data: Spark[] = [];
  let value = baseValue;
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Add some realistic volatility
    const change = (Math.random() - 0.5) * volatility * baseValue;
    value = Math.max(0, value + change);
    
    data.push({
      x: date.toISOString().split('T')[0],
      y: value
    });
  }
  
  return data;
};

export const mockKpis: Kpi[] = [
  {
    title: "Total Revenue",
    value: "$184,750",
    delta: { value: 12.5, direction: "up" },
    spark: generateSparkline(180000, 0.05),
    variant: "success"
  },
  {
    title: "Total Volume",
    value: "$2.1M",
    delta: { value: 8.3, direction: "up" },
    spark: generateSparkline(2100000, 0.03),
    variant: "success"
  },
  {
    title: "Properties Closed",
    value: "23",
    delta: { value: 4.5, direction: "up" },
    spark: generateSparkline(23, 0.2),
    variant: "neutral"
  },
  {
    title: "Active Listings",
    value: "12",
    delta: { value: 2.1, direction: "down" },
    spark: generateSparkline(12, 0.15),
    variant: "neutral"
  },
  {
    title: "Withdrawn",
    value: "3",
    delta: { value: 1.2, direction: "up" },
    spark: generateSparkline(3, 0.3),
    variant: "warning"
  },
  {
    title: "Expired",
    value: "1",
    delta: { value: 0.5, direction: "down" },
    spark: generateSparkline(1, 0.4),
    variant: "danger"
  },
  {
    title: "Avg Sale Price",
    value: "$385K",
    delta: { value: 5.2, direction: "up" },
    spark: generateSparkline(385000, 0.04),
    variant: "neutral"
  },
  {
    title: "Avg Commission",
    value: "$8,025",
    delta: { value: 3.8, direction: "up" },
    spark: generateSparkline(8025, 0.06),
    variant: "neutral"
  }
];

export const mockFactors: Factor[] = [
  {
    label: "Conversion Rate",
    weightPct: 25,
    weightLevel: "High",
    trend: 1,
    definition: "Percentage of leads that convert to closed transactions"
  },
  {
    label: "Call Efficiency",
    weightPct: 15,
    weightLevel: "Med",
    trend: 0,
    definition: "Success rate of phone calls leading to appointments or contracts"
  },
  {
    label: "ROI Performance",
    weightPct: 15,
    weightLevel: "Med",
    trend: 1,
    definition: "Return on investment across marketing and business expenses"
  },
  {
    label: "Days on Market",
    weightPct: 10,
    weightLevel: "Low",
    trend: -1,
    definition: "Average time properties stay on market before closing"
  },
  {
    label: "CMA Accuracy",
    weightPct: 10,
    weightLevel: "Low",
    trend: 1,
    definition: "How closely your market analyses match final sale prices"
  },
  {
    label: "Price Ratio",
    weightPct: 10,
    weightLevel: "Low",
    trend: 0,
    definition: "Ratio of sale price to original listing price"
  },
  {
    label: "Time Management",
    weightPct: 10,
    weightLevel: "Low",
    trend: 1,
    definition: "Efficiency in time allocation across different activities"
  },
  {
    label: "Deal Retention",
    weightPct: 5,
    weightLevel: "Low",
    trend: 0,
    definition: "Percentage of deals that successfully reach closing"
  }
];

export const mockGoals: Goal[] = [
  {
    title: "Monthly Revenue Goal",
    current: 184750,
    target: 200000,
    format: "currency"
  },
  {
    title: "Sales Target",
    current: 23,
    target: 25,
    format: "number"
  }
];

export const mockBadges: BadgeItem[] = [
  { tier: "Bronze", count: 15, progress: 100 },
  { tier: "Silver", count: 8, progress: 100 },
  { tier: "Gold", count: 5, progress: 100 },
  { tier: "Platinum", count: 2, progress: 60 },
  { tier: "Diamond", count: 1, progress: 25 }
];

export const mockOperationalData = {
  thisMonthRevenue: "$184,750",
  avgTransactionPeriod: "32 days",
  buyerConversion: 68,
  sellerConversion: 72,
  offerAcceptanceRate: 85,
  revenuePerHour: "$425",
  roiPerformance: 240
};