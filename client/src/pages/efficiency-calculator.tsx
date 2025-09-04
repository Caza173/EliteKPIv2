import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, Star, ArrowRight } from "lucide-react";

interface FormData {
  closedDeals: string;
  prospectingCalls: string;
  hoursWorked: string;
  revenue: string;
  activeDays: string;
}

interface EfficiencyScore {
  overall: number;
  dealClosingRate: number;
  callEfficiency: number;
  timeEfficiency: number;
  revenuePerHour: number;
}

export default function EfficiencyCalculator() {
  const [formData, setFormData] = useState<FormData>({
    closedDeals: "",
    prospectingCalls: "",
    hoursWorked: "",
    revenue: "",
    activeDays: "",
  });

  const [score, setScore] = useState<EfficiencyScore | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateEfficiency = () => {
    const deals = parseFloat(formData.closedDeals) || 0;
    const calls = parseFloat(formData.prospectingCalls) || 0;
    const hours = parseFloat(formData.hoursWorked) || 0;
    const revenue = parseFloat(formData.revenue) || 0;
    const days = parseFloat(formData.activeDays) || 0;

    if (deals === 0 && calls === 0 && hours === 0 && revenue === 0 && days === 0) {
      return;
    }

    // Calculate efficiency metrics
    const dealClosingRate = calls > 0 ? (deals / calls) * 100 : 0;
    const callEfficiency = days > 0 ? calls / days : 0;
    const timeEfficiency = hours > 0 ? deals / hours : 0;
    const revenuePerHour = hours > 0 ? revenue / hours : 0;

    // Calculate overall score (0-100)
    const dealScore = Math.min(dealClosingRate * 2, 100); // 50% closing rate = 100 points
    const callScore = Math.min(callEfficiency * 2, 100); // 50 calls/day = 100 points
    const timeScore = Math.min(timeEfficiency * 50, 100); // 2 deals/hour = 100 points
    const revenueScore = Math.min(revenuePerHour / 100, 100); // $10k/hour = 100 points

    const overall = (dealScore + callScore + timeScore + revenueScore) / 4;

    setScore({
      overall: Math.round(overall),
      dealClosingRate: Math.round(dealClosingRate * 10) / 10,
      callEfficiency: Math.round(callEfficiency * 10) / 10,
      timeEfficiency: Math.round(timeEfficiency * 100) / 100,
      revenuePerHour: Math.round(revenuePerHour),
    });

    setShowResults(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getRecommendations = () => {
    if (!score) return [];

    const recommendations = [];
    
    if (score.dealClosingRate < 10) {
      recommendations.push("Focus on lead qualification to improve your closing rate");
    }
    if (score.callEfficiency < 20) {
      recommendations.push("Increase daily prospecting activities for more opportunities");
    }
    if (score.timeEfficiency < 1) {
      recommendations.push("Streamline your sales process to close deals faster");
    }

    return recommendations;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Calculator className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Free Agent Efficiency Calculator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover your personal efficiency score and get 3 actionable tips to double your 
            GCI in the next 12 months.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-medium text-gray-900">
                <TrendingUp className="h-5 w-5 mr-2" />
                Enter Your Performance Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Closed Deals (Last 12 Months)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 24"
                  value={formData.closedDeals}
                  onChange={(e) => handleInputChange("closedDeals", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Prospecting Calls Made
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1200"
                  value={formData.prospectingCalls}
                  onChange={(e) => handleInputChange("prospectingCalls", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hours Worked on Real Estate
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 2000"
                  value={formData.hoursWorked}
                  onChange={(e) => handleInputChange("hoursWorked", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Revenue Generated
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 120000"
                  value={formData.revenue}
                  onChange={(e) => handleInputChange("revenue", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Active Working Days
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 250"
                  value={formData.activeDays}
                  onChange={(e) => handleInputChange("activeDays", e.target.value)}
                  className="w-full"
                />
              </div>

              <Button 
                onClick={calculateEfficiency}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3"
                size="lg"
              >
                Calculate My Efficiency Score
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg font-medium text-gray-900">
                <Star className="h-5 w-5 mr-2" />
                Your Efficiency Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showResults ? (
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Enter your data to see your personalized efficiency 
                    score and improvement recommendations.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {score && (
                    <>
                      {/* Overall Score */}
                      <div className="text-center p-6 bg-gray-50 rounded-lg">
                        <div className={`text-4xl font-bold ${getScoreColor(score.overall)} mb-2`}>
                          {score.overall}/100
                        </div>
                        <p className="text-gray-600">Overall Efficiency Score</p>
                      </div>

                      {/* Detailed Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {score.dealClosingRate}%
                          </div>
                          <p className="text-sm text-gray-600">Closing Rate</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {score.callEfficiency}
                          </div>
                          <p className="text-sm text-gray-600">Calls/Day</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            ${score.revenuePerHour}
                          </div>
                          <p className="text-sm text-gray-600">Revenue/Hour</p>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            {score.timeEfficiency}
                          </div>
                          <p className="text-sm text-gray-600">Deals/Hour</p>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {getRecommendations().length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-gray-900 mb-2">
                            💡 Improvement Recommendations:
                          </h4>
                          <ul className="space-y-1">
                            {getRecommendations().map((rec, index) => (
                              <li key={index} className="text-sm text-gray-700">
                                • {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* CTA */}
                      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6 rounded-lg text-center">
                        <h3 className="text-lg font-bold mb-2">
                          Ready to Double Your Efficiency?
                        </h3>
                        <p className="text-sm mb-4 opacity-90">
                          Get advanced analytics, market timing AI, and automated workflows 
                          to boost your performance to the next level.
                        </p>
                        <Button 
                          onClick={() => window.location.href = '/billing'}
                          className="bg-white text-purple-600 hover:bg-gray-100 font-semibold"
                        >
                          Start Your Free Trial
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Join 10,000+ Top-Performing Agents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">156%</div>
              <p className="text-gray-600">Average GCI increase in first year</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">23 days</div>
              <p className="text-gray-600">Reduction in average days on market</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.8/5</div>
              <p className="text-gray-600">Agent satisfaction rating</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
