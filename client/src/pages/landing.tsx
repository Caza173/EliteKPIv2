import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Target, Calculator, Shield, Mail } from "lucide-react";
import { Link } from "wouter";
import TraditionalLogin from "@/components/auth/traditional-login";

const handleSSO = () => {
  window.location.href = '/api/login';
};

export default function Landing() {
  const [showTraditionalLogin, setShowTraditionalLogin] = useState(false);

  if (showTraditionalLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <TraditionalLogin onBack={() => setShowTraditionalLogin(false)} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="ml-3 text-2xl font-bold text-gray-900">EliteKPI</h1>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                  data-testid="admin-login-button"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              </Link>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowTraditionalLogin(true)}
                  className="hidden sm:flex"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Login
                </Button>
                <Button onClick={handleSSO}>
                  SSO / Google
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Comprehensive KPI Database</span>
            <span className="block text-primary">for Real Estate Professionals</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Track sales performance, manage property pipelines, and analyze ROI with our comprehensive business intelligence platform designed specifically for realtors.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8 gap-3">
            <Button 
              size="lg" 
              onClick={handleSSO}
              className="w-full sm:w-auto"
            >
              Get Started with SSO
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowTraditionalLogin(true)}
              className="w-full sm:w-auto"
            >
              Email Login
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mb-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-lg">Performance Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Monitor revenue, volume, and key performance indicators in real-time.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <CardTitle className="text-lg">Pipeline Management</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Track properties through every stage from listing to closing.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                  <Target className="h-4 w-4 text-purple-600" />
                </div>
                <CardTitle className="text-lg">Goal Setting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Set and track daily, weekly, and monthly performance goals.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mb-2">
                  <Calculator className="h-4 w-4 text-orange-600" />
                </div>
                <CardTitle className="text-lg">ROI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Calculate return on investment for every property and transaction.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features List */}
        <div className="mt-20">
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Everything you need to succeed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">🏆 Competitive Leaderboards</h3>
                    <p className="text-gray-600">Compete with top agents nationwide and see your national ranking</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">🎯 Achievement Badges</h3>
                    <p className="text-gray-600">Unlock 25+ achievement badges as you hit sales milestones</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Commission Tracking</h3>
                    <p className="text-gray-600">Detailed commission calculations and earnings reports</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Time Logging</h3>
                    <p className="text-gray-600">Record time spent on activities and properties</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">CMA Management</h3>
                    <p className="text-gray-600">Create and track Comparative Market Analyses</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">📈 Market Trend Analysis</h3>
                    <p className="text-gray-600">AI-powered market insights with predictive forecasting</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">🔥 Performance Streaks</h3>
                    <p className="text-gray-600">Track daily activity streaks and consistency rewards</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Expense Management</h3>
                    <p className="text-gray-600">Track and categorize business expenses by property</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Comprehensive Reports</h3>
                    <p className="text-gray-600">Generate detailed reports for any time period</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">GCI Calculator</h3>
                    <p className="text-gray-600">Quick commission calculations for prospects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Competitive Features Highlight */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-8 border border-blue-200">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🏆 Compete With Top Agents Nationwide</h2>
              <p className="text-xl text-gray-600">Turn your real estate career into a game. See how you rank against elite agents across the country.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <div className="text-center">
                  <div className="text-4xl mb-3">🥇</div>
                  <h3 className="font-bold text-lg mb-2">National Rankings</h3>
                  <p className="text-gray-600 text-sm">See exactly where you rank against 1,200+ active agents</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <div className="text-center">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-bold text-lg mb-2">Achievement System</h3>
                  <p className="text-gray-600 text-sm">Unlock badges from "First Sale" to "Million Dollar Agent"</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-6 border border-blue-200">
                <div className="text-center">
                  <div className="text-4xl mb-3">⚡</div>
                  <h3 className="font-bold text-lg mb-2">Weekly Challenges</h3>
                  <p className="text-gray-600 text-sm">Compete in Revenue Sprints and Activity Contests</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to climb the leaderboard?</h2>
          <p className="text-xl text-gray-600 mb-8">Join the competition and see how you measure against top performers.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={handleSSO}
              className="px-8 py-4 text-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
            >
              Start Competing Today (SSO)
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setShowTraditionalLogin(true)}
              className="px-8 py-4 text-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              Sign In with Email
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
