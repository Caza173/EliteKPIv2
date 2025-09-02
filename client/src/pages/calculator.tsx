import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Calculator, DollarSign, Percent, TrendingUp, Target, Database, Receipt } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function GCICalculator() {
  const [salePrice, setSalePrice] = useState("");
  const [commissionRate, setCommissionRate] = useState("");
  const [split, setSplit] = useState("");
  const [transactionCoordinatorFee, setTransactionCoordinatorFee] = useState("");
  const [brokerageFee, setBrokerageFee] = useState("");
  const [desiredAnnualIncome, setDesiredAnnualIncome] = useState("");
  const [avgDealSize, setAvgDealSize] = useState("");
  const [avgCommissionRate, setAvgCommissionRate] = useState("");
  const [taxRate, setTaxRate] = useState([25]);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: user, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
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

  // Load user defaults when available
  useEffect(() => {
    if (user) {
      if (!split) setSplit("70"); // Default split
      if (!avgCommissionRate) setAvgCommissionRate("2.5"); // Default rate
      if (!avgDealSize) setAvgDealSize("500000"); // Default deal size
    }
  }, [user, split, avgCommissionRate, avgDealSize]);

  const calculateCommission = () => {
    const price = parseFloat(salePrice) || 0;
    const rate = parseFloat(commissionRate) || 0;
    const splitPercent = parseFloat(split) || 0;
    const tcFee = parseFloat(transactionCoordinatorFee) || 0;
    const brokFee = parseFloat(brokerageFee) || 0;

    const totalCommission = price * (rate / 100);
    const beforeFees = totalCommission * (splitPercent / 100);
    const yourTakeHome = beforeFees - tcFee - brokFee;
    const brokeragePortion = totalCommission - beforeFees;

    return {
      totalCommission,
      beforeFees,
      yourTakeHome,
      brokeragePortion,
      transactionCoordinatorFee: tcFee,
      brokerageFee: brokFee,
    };
  };

  const calculateDealsNeeded = () => {
    const targetIncome = parseFloat(desiredAnnualIncome) || 0;
    const dealSize = parseFloat(avgDealSize) || 0;
    const rate = parseFloat(avgCommissionRate) || 0;
    const splitPercent = parseFloat(split) || 0;

    if (targetIncome === 0 || dealSize === 0 || rate === 0 || splitPercent === 0) {
      return { dealsNeeded: 0, dealsPerMonth: 0, totalVolume: 0 };
    }

    const commissionPerDeal = dealSize * (rate / 100) * (splitPercent / 100);
    const dealsNeeded = Math.ceil(targetIncome / commissionPerDeal);
    const dealsPerMonth = Math.ceil(dealsNeeded / 12);
    const totalVolume = dealsNeeded * dealSize;

    return { dealsNeeded, dealsPerMonth, totalVolume };
  };

  const { totalCommission, beforeFees, yourTakeHome, brokeragePortion, transactionCoordinatorFee: tcFeeAmount, brokerageFee: brokFeeAmount } = calculateCommission();
  const { dealsNeeded, dealsPerMonth, totalVolume } = calculateDealsNeeded();

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const handleQuickFill = (price: number, rate: number) => {
    setSalePrice(price.toString());
    setCommissionRate(rate.toString());
  };

  const seedSampleDataMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/seed-sample-data");
    },
    onSuccess: () => {
      toast({
        title: "Sample Data Created",
        description: "Sample properties, activities, and more have been added to your account.",
      });
      // Invalidate relevant caches
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
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
      toast({
        title: "Error",
        description: "Failed to create sample data. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GCI Calculator</h1>
          <p className="text-gray-600">Calculate your Gross Commission Income quickly and accurately</p>
        </div>

        {/* Sample Data Button */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Demo Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Get started quickly with sample properties, activities, commissions, and expenses
                </p>
                <p className="text-xs text-gray-500">
                  This will create realistic data that matches across all tabs for demonstration purposes
                </p>
              </div>
              <Button
                onClick={() => seedSampleDataMutation.mutate()}
                disabled={seedSampleDataMutation.isPending}
                className="ml-4"
              >
                {seedSampleDataMutation.isPending ? "Creating..." : "Create Sample Data"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Fill Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Fill Options
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                onClick={() => handleQuickFill(300000, 3)}
                className="text-left"
              >
                <div>
                  <div className="font-medium">$300K</div>
                  <div className="text-sm text-gray-500">3% Commission</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickFill(500000, 2.5)}
                className="text-left"
              >
                <div>
                  <div className="font-medium">$500K</div>
                  <div className="text-sm text-gray-500">2.5% Commission</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickFill(750000, 2.5)}
                className="text-left"
              >
                <div>
                  <div className="font-medium">$750K</div>
                  <div className="text-sm text-gray-500">2.5% Commission</div>
                </div>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleQuickFill(1000000, 2)}
                className="text-left"
              >
                <div>
                  <div className="font-medium">$1M</div>
                  <div className="text-sm text-gray-500">2% Commission</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Transaction Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="salePrice">Sale Price ($)</Label>
                <Input
                  id="salePrice"
                  type="number"
                  placeholder="500,000"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="split">Your Split (%)</Label>
                <Input
                  id="split"
                  type="number"
                  step="1"
                  placeholder="70"
                  value={split}
                  onChange={(e) => setSplit(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="transactionCoordinatorFee">Transaction Coordinator Fee ($)</Label>
                <Input
                  id="transactionCoordinatorFee"
                  type="number"
                  step="0.01"
                  placeholder="300"
                  value={transactionCoordinatorFee}
                  onChange={(e) => setTransactionCoordinatorFee(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="brokerageFee">Brokerage Fee ($)</Label>
                <Input
                  id="brokerageFee"
                  type="number"
                  step="0.01"
                  placeholder="150"
                  value={brokerageFee}
                  onChange={(e) => setBrokerageFee(e.target.value)}
                  className="text-lg"
                />
              </div>

              <Button
                onClick={() => {
                  setSalePrice("");
                  setCommissionRate("");
                  setSplit("");
                  setTransactionCoordinatorFee("");
                  setBrokerageFee("");
                }}
                variant="outline"
                className="w-full"
              >
                Clear All
              </Button>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Commission Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-6 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-1">Your Take-Home</div>
                <div className="text-3xl font-bold text-blue-900">
                  {formatCurrency(yourTakeHome)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Total Commission</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(totalCommission)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Brokerage Portion</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(brokeragePortion)}
                  </span>
                </div>

                {tcFeeAmount > 0 && (
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-600">Transaction Coordinator Fee</span>
                    <span className="font-medium text-red-900">
                      -{formatCurrency(tcFeeAmount)}
                    </span>
                  </div>
                )}

                {brokFeeAmount > 0 && (
                  <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <span className="text-red-600">Brokerage Fee</span>
                    <span className="font-medium text-red-900">
                      -{formatCurrency(brokFeeAmount)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Commission Rate</span>
                  <span className="font-medium text-gray-900">
                    {commissionRate}%
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Your Split</span>
                  <span className="font-medium text-gray-900">
                    {split}%
                  </span>
                </div>
              </div>

              {yourTakeHome > 0 && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="text-center text-sm text-gray-600">
                    Based on a {formatCurrency(parseFloat(salePrice))} sale
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Annual Income Goal Calculator */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Annual Income Goal Calculator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <Label htmlFor="desiredIncome">Desired Annual Income ($)</Label>
                <Input
                  id="desiredIncome"
                  type="number"
                  placeholder="150,000"
                  value={desiredAnnualIncome}
                  onChange={(e) => setDesiredAnnualIncome(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="avgDealSize">Average Deal Size ($)</Label>
                <Input
                  id="avgDealSize"
                  type="number"
                  placeholder="500,000"
                  value={avgDealSize}
                  onChange={(e) => setAvgDealSize(e.target.value)}
                  className="text-lg"
                />
              </div>

              <div>
                <Label htmlFor="avgCommissionRate">Average Commission Rate (%)</Label>
                <Input
                  id="avgCommissionRate"
                  type="number"
                  step="0.1"
                  placeholder="2.5"
                  value={avgCommissionRate}
                  onChange={(e) => setAvgCommissionRate(e.target.value)}
                  className="text-lg"
                />
              </div>
            </div>

            {/* Annual Goal Results */}
            {dealsNeeded > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium mb-1">Deals Needed</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {dealsNeeded}
                  </div>
                  <div className="text-sm text-purple-600">per year</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-sm text-orange-600 font-medium mb-1">Deals Per Month</div>
                  <div className="text-2xl font-bold text-orange-900">
                    {dealsPerMonth}
                  </div>
                  <div className="text-sm text-orange-600">average</div>
                </div>
                
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-sm text-indigo-600 font-medium mb-1">Total Volume</div>
                  <div className="text-2xl font-bold text-indigo-900">
                    {formatCurrency(totalVolume)}
                  </div>
                  <div className="text-sm text-indigo-600">required</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Enter your annual income goal and deal parameters above to see your target breakdown.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Quick Tax Estimate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Quick Tax Estimate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-3">Tax Rate (%)</Label>
                  <Slider
                    value={taxRate}
                    onValueChange={setTaxRate}
                    max={50}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0%</span>
                    <span className="font-medium">{taxRate[0]}%</span>
                    <span>50%</span>
                  </div>
                </div>
                
                <div className="text-center p-6 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600 font-medium mb-1">Estimated Tax</div>
                  <div className="text-3xl font-bold text-red-900">
                    {formatCurrency((yourTakeHome * taxRate[0]) / 100)}
                  </div>
                  <div className="text-sm text-red-600 mt-2">
                    On {formatCurrency(yourTakeHome)} take-home
                  </div>
                </div>

                {yourTakeHome > 0 && (
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-green-600 font-medium mb-1">After Taxes</div>
                    <div className="text-2xl font-bold text-green-900">
                      {formatCurrency(yourTakeHome - (yourTakeHome * taxRate[0]) / 100)}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(() => {
                  const dealSize = parseFloat(avgDealSize) || 0;
                  const rate = parseFloat(avgCommissionRate) || 0;
                  const splitPercent = parseFloat(split) || 0;
                  const commissionPerDeal = dealSize > 0 && rate > 0 && splitPercent > 0 
                    ? dealSize * (rate / 100) * (splitPercent / 100) 
                    : yourTakeHome;
                  
                  return (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">If you close 1 deal/month:</span>
                        <span className="font-medium">{formatCurrency(commissionPerDeal * 12)}/year</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">If you close 2 deals/month:</span>
                        <span className="font-medium">{formatCurrency(commissionPerDeal * 24)}/year</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">If you close 3 deals/month:</span>
                        <span className="font-medium">{formatCurrency(commissionPerDeal * 36)}/year</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">If you close 4 deals/month:</span>
                        <span className="font-medium">{formatCurrency(commissionPerDeal * 48)}/year</span>
                      </div>
                      {commissionPerDeal > 0 && (
                        <div className="mt-4 pt-3 border-t text-xs text-gray-500 text-center">
                          Based on {formatCurrency(commissionPerDeal)} average commission per deal
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}