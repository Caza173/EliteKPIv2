export function calculateCommission(
  price: number,
  commissionRate: number,
  split: number = 100
): number {
  return (price * (commissionRate / 100) * (split / 100));
}

export function calculateROI(
  revenue: number,
  investment: number
): number {
  if (investment === 0) return 0;
  return ((revenue - investment) / investment) * 100;
}

export function calculateDaysOnMarket(
  listingDate: string | null,
  soldDate: string | null
): number {
  if (!listingDate || !soldDate) return 0;
  
  const listing = new Date(listingDate);
  const sold = new Date(soldDate);
  const diffTime = Math.abs(sold.getTime() - listing.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function calculateOfferRatio(
  soldPrice: number | null,
  listingPrice: number | null
): number {
  if (!soldPrice || !listingPrice || listingPrice === 0) return 0;
  return (soldPrice / listingPrice) * 100;
}

export function calculateRevenuePerHour(
  totalRevenue: number,
  totalHours: number
): number {
  if (totalHours === 0) return 0;
  return totalRevenue / totalHours;
}

export function calculateConversionRate(
  conversions: number,
  opportunities: number
): number {
  if (opportunities === 0) return 0;
  return (conversions / opportunities) * 100;
}

export function formatCurrency(amount: number | null | undefined): string {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatPercentage(value: number | null | undefined): string {
  if (!value) return '0%';
  return `${value.toFixed(1)}%`;
}

export function calculateGasCost(
  miles: number,
  mpg: number,
  gasPrice: number
): number {
  if (mpg === 0) return 0;
  return (miles / mpg) * gasPrice;
}
