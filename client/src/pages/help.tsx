import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoEmbed } from "@/components/ui/video-embed";
import { videoContent } from "@/data/video-content";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  HelpCircle, 
  BarChart3, 
  Home, 
  Trophy, 
  FileText, 
  TrendingUp, 
  Target, 
  PieChart,
  Calculator,
  Settings,
  DollarSign,
  Clock,
  Users,
  Activity,
  Award,
  PlayCircle,
  BookOpen,
  MessageSquare,
  Send,
  CheckCircle,
  Circle,
  X,
  Edit
} from "lucide-react";

export default function Help() {
  const { toast } = useToast();
  const [feedbackForm, setFeedbackForm] = useState({
    type: 'feature',
    title: '',
    description: '',
    email: ''
  });
  const [complaintForm, setComplaintForm] = useState({
    category: 'general',
    subject: '',
    description: '',
    email: '',
    priority: 'medium'
  });
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [guideContent, setGuideContent] = useState<string>('');
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [updatedVideos, setUpdatedVideos] = useState(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('eliteKPI-videoUrls');
    return saved ? JSON.parse(saved) : {};
  });
  

  const featureRequestMutation = useMutation({
    mutationFn: async (data: typeof feedbackForm) => {
      const response = await apiRequest("POST", "/api/feature-requests", data);
      return await response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Request Submitted Successfully!",
        description: response.message || "Check your email for confirmation."
      });
      setFeedbackForm({ type: 'feature', title: '', description: '', email: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const complaintSubmissionMutation = useMutation({
    mutationFn: async (data: typeof complaintForm) => {
      const response = await apiRequest("POST", "/api/complaints", data);
      return await response.json();
    },
    onSuccess: (response) => {
      toast({
        title: "Complaint Submitted Successfully!",
        description: response.message || "We'll review your complaint and respond within 24 hours."
      });
      setComplaintForm({ category: 'general', subject: '', description: '', email: '', priority: 'medium' });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    }
  });

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    featureRequestMutation.mutate(feedbackForm);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    complaintSubmissionMutation.mutate(complaintForm);
  };

  const handleVideoUpdate = (videoId: string, embedId: string) => {
    const updated = { ...updatedVideos, [videoId]: embedId };
    setUpdatedVideos(updated);
    localStorage.setItem('eliteKPI-videoUrls', JSON.stringify(updated));
    toast({
      title: "Video Updated",
      description: "YouTube video has been successfully linked!"
    });
  };

  const getUpdatedVideo = (video: any) => {
    if (updatedVideos[video.id]) {
      return { ...video, embedId: updatedVideos[video.id] };
    }
    return video;
  };

  const guides = {
    'quick-start': {
      title: 'Quick Start Guide',
      subtitle: '5 min read • Essential first steps',
      filename: 'quick-start-guide.md'
    },
    'cma-best-practices': {
      title: 'CMA Creation Best Practices',
      subtitle: '8 min read • Win more listings',
      filename: 'cma-best-practices.md'
    },
    'tax-optimization': {
      title: 'Tax Optimization Strategies',
      subtitle: '12 min read • Maximize deductions',
      filename: 'tax-optimization-strategies.md'
    },
    'billing-subscriptions': {
      title: 'Billing & Subscriptions Guide',
      subtitle: '10 min read • Manage your subscription',
      filename: 'billing-subscriptions-guide.md'
    }
  };

  const handleOpenGuide = async (guideKey: string) => {
    setIsLoadingGuide(true);
    setSelectedGuide(guideKey);
    
    try {
      const guide = guides[guideKey as keyof typeof guides];
      const response = await fetch(`/guides/${guide.filename}`);
      
      if (response.ok) {
        const content = await response.text();
        setGuideContent(content);
      } else {
        // Fallback to demo content if file not found
        setGuideContent(getDemoGuideContent(guideKey));
      }
    } catch (error) {
      // Fallback to demo content on error
      setGuideContent(getDemoGuideContent(guideKey));
    } finally {
      setIsLoadingGuide(false);
    }
  };

  const getDemoGuideContent = (guideKey: string) => {
    const demoContent = {
      'quick-start': `# Quick Start Guide

Welcome to EliteKPI! This guide will help you get started quickly.

## Getting Started

1. **Set up your profile** - Add your basic information and preferences
2. **Add your first property** - Start tracking your pipeline
3. **Log activities** - Track your daily work and time
4. **Review analytics** - Check your performance metrics

## Daily Workflow

- Check your dashboard each morning
- Update property statuses after client interactions
- Log time and expenses as they occur
- Review daily goals and achievements

*This is sample content. The full guide covers detailed setup instructions and best practices.*`,
      'cma-best-practices': `# CMA Creation Best Practices

Learn how to create compelling CMAs that win more listings.

## Research Methodology

1. **Comparable Selection** - Choose 3-5 truly comparable properties
2. **Market Analysis** - Consider current market trends
3. **Pricing Strategy** - Balance competitiveness with reality

## Presentation Tips

- Use professional formatting
- Include high-quality photos
- Explain your reasoning clearly
- Address potential objections

*This is sample content. The full guide includes templates, scripts, and advanced techniques.*`,
      'tax-optimization': `# Tax Optimization Strategies

Maximize your deductions and minimize your tax burden.

## Business Deductions

1. **Home Office** - Dedicated workspace deductions
2. **Vehicle Expenses** - Mileage and maintenance
3. **Marketing Costs** - Advertising and promotion
4. **Professional Development** - Training and education

## Record Keeping

- Track all business expenses
- Maintain detailed mileage logs
- Save receipts and documentation
- Use EliteKPI's expense tracking features

*This is sample content. The full guide covers advanced strategies and quarterly planning.*`,
      'billing-subscriptions': `# Billing & Subscriptions Guide

Manage your EliteKPI subscription and billing preferences.

## Available Plans

1. **Starter** ($29/month) - Essential features for new agents
2. **Professional** ($29.99/month) - Full feature access
3. **Elite** ($79/month) - Advanced analytics and tools
4. **Enterprise** ($199/month) - Team features and priority support

## Managing Your Subscription

- View current plan and usage in the Billing section
- Upgrade or downgrade plans anytime
- View billing history and payment methods
- Cancel subscription if needed
- Access support for billing questions

*This is sample content. The full guide covers payment setup and subscription management.*`
    };
    
    return demoContent[guideKey as keyof typeof demoContent] || 'Guide content not available.';
  };

  const handleCloseGuide = () => {
    setSelectedGuide(null);
    setGuideContent('');
  };

  const helpSections = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: BarChart3,
      description: "Overview of your business performance",
      content: {
        whatItIs: "The Dashboard provides a comprehensive overview of your real estate business performance with key metrics, charts, and insights.",
        howToUse: [
          "View key metrics cards showing Total Revenue, Volume, Properties Closed, and Active Listings",
          "Check secondary metrics for This Month Revenue, Average Transaction Period, and Conversion Rate",
          "Review the Revenue & Expenses chart to track financial trends",
          "Read Performance Insights for AI-powered recommendations",
          "Use Quick Actions to rapidly add properties, log expenses, or schedule showings",
          "Monitor Recent Activity to see your latest business actions",
          "Adjust the Tax Estimator slider to calculate estimated taxes",
          "Review the Property Pipeline Overview for deal status summary"
        ]
      }
    },
    {
      id: "properties",
      title: "Properties",
      icon: Home,
      description: "Manage your property pipeline",
      content: {
        whatItIs: "Properties is your central hub for managing all real estate transactions from initial contact to closing.",
        howToUse: [
          "View properties organized by status: In Progress, Listed, Offer Written, Under Contract, Pending, Closed, Lost",
          "Add new properties using the 'Add Property' button",
          "Update property status using the dropdown menu on each property card",
          "Track property details including bedrooms, bathrooms, square footage",
          "Monitor listing prices, offer prices, and accepted prices",
          "View commission earned and investment (expenses + time value)",
          "Calculate ROI for each property automatically",
          "Use 'Accept Offer' button to move properties to Under Contract",
          "Access detailed financials and logs via the 'Details' button"
        ]
      }
    },
    {
      id: "cmas",
      title: "CMAs",
      icon: FileText,
      description: "Create and track Comparative Market Analyses",
      content: {
        whatItIs: "CMAs (Comparative Market Analyses) help you track market analysis requests and convert them to listings.",
        howToUse: [
          "Create new CMAs with property address and price estimates",
          "Enter suggested list price, low estimate, and high estimate",
          "Add notes and comparable properties for reference",
          "Track status from Active to Completed, Presented, or Converted",
          "Mark CMAs as 'Completed' when analysis is finished",
          "Mark as 'Presented' when shown to client",
          "Convert successful CMAs to listings with pre-filled data",
          "Mark unsuccessful CMAs as 'Did Not Convert'",
          "Reactivate CMAs that may have new potential",
          "View conversion statistics and success rates"
        ]
      }
    },
    {
      id: "billing",
      title: "Billing & Subscriptions",
      icon: DollarSign,
      description: "Manage your subscription and billing",
      content: {
        whatItIs: "The Billing section allows you to manage your EliteKPI subscription, view usage, and access billing history.",
        howToUse: [
          "Choose from 4 subscription plans: Starter ($29), Professional ($29.99), Elite ($79), or Enterprise ($199)",
          "Click 'Choose Plan' to subscribe to any available tier",
          "Complete secure payment through Stripe checkout",
          "View your current subscription status and plan details",
          "Monitor usage limits and feature access",
          "Access billing history and payment receipts",
          "Update payment methods or billing information",
          "Cancel or change your subscription at any time",
          "Contact support for billing questions or issues"
        ]
      }
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help & Documentation</h1>
          <p className="text-gray-600">Learn how to use every feature of EliteKPI effectively</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="overview">Feature Overview</TabsTrigger>
            <TabsTrigger value="videos">Video Training</TabsTrigger>
            <TabsTrigger value="training">Written Guides</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Tips</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & Requests</TabsTrigger>
            <TabsTrigger value="complaints">Submit Complaint</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {helpSections.map((section) => (
              <Card key={section.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <section.icon className="h-6 w-6 text-primary" />
                    {section.title}
                    <Badge variant="outline">{section.description}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <HelpCircle className="h-5 w-5" />
                      What it is
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {section.content.whatItIs}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      How to use it
                    </h3>
                    <ul className="space-y-2">
                      {section.content.howToUse.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-6 h-6 bg-primary text-white text-sm rounded-full flex items-center justify-center font-medium">
                            {index + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="getting-started" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Start Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">First Steps</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Set up your profile and preferences
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Add your first property to the pipeline
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Log your initial business expenses
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Schedule your first showing
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Daily Workflow</h4>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li>• Check dashboard for today's priorities</li>
                      <li>• Update property statuses after client calls</li>
                      <li>• Log time spent on each activity</li>
                      <li>• Add expenses as they occur</li>
                      <li>• Review daily performance metrics</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="videos" className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Video Training Library</h2>
                <p className="text-gray-600">Comprehensive video tutorials covering every aspect of EliteKPI</p>
              </div>
              <Button 
                variant={editMode ? "default" : "outline"}
                onClick={() => setEditMode(!editMode)}
              >
                <Edit className="h-4 w-4 mr-2" />
                {editMode ? 'Done Editing' : 'Edit Videos'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <h3 className="col-span-full text-lg font-semibold text-gray-900 mb-4">Getting Started</h3>
              {videoContent.filter(video => video.category === 'getting-started').map(video => (
                <VideoEmbed 
                  key={video.id} 
                  video={getUpdatedVideo(video)} 
                  allowEdit={editMode}
                  onVideoUpdate={handleVideoUpdate}
                />
              ))}
              
              <h3 className="col-span-full text-lg font-semibold text-gray-900 mb-4 mt-8">Property Management</h3>
              {videoContent.filter(video => video.category === 'properties').map(video => (
                <VideoEmbed 
                  key={video.id} 
                  video={getUpdatedVideo(video)} 
                  allowEdit={editMode}
                  onVideoUpdate={handleVideoUpdate}
                />
              ))}
              
              <h3 className="col-span-full text-lg font-semibold text-gray-900 mb-4 mt-8">Financial Tracking</h3>
              {videoContent.filter(video => video.category === 'financial').map(video => (
                <VideoEmbed 
                  key={video.id} 
                  video={getUpdatedVideo(video)} 
                  allowEdit={editMode}
                  onVideoUpdate={handleVideoUpdate}
                />
              ))}
              
              <h3 className="col-span-full text-lg font-semibold text-gray-900 mb-4 mt-8">Advanced Features</h3>
              {videoContent.filter(video => video.category === 'advanced').map(video => (
                <VideoEmbed 
                  key={video.id} 
                  video={getUpdatedVideo(video)} 
                  allowEdit={editMode}
                  onVideoUpdate={handleVideoUpdate}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Written Guides & Documentation</h2>
              <p className="text-gray-600">Comprehensive written materials for reference and deep learning</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Video Training Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5 text-red-600" />
                    Video Training Series
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">Getting Started with EliteKPI</p>
                          <p className="text-sm text-gray-600">15 min • Introduction & Setup</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">Property Management Walkthrough</p>
                          <p className="text-sm text-gray-600">22 min • Adding & Tracking Properties</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">Financial Tracking & Reporting</p>
                          <p className="text-sm text-gray-600">18 min • Expenses, Commissions & ROI</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="h-4 w-4 text-red-600" />
                        <div>
                          <p className="font-medium">Advanced Analytics & Goals</p>
                          <p className="text-sm text-gray-600">25 min • Performance Optimization</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Written Guides Section */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    Written Guides & Tutorials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div 
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleOpenGuide('quick-start')}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">Quick Start Guide</p>
                          <p className="text-sm text-gray-600">5 min read • Essential first steps</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleOpenGuide('cma-best-practices')}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">CMA Creation Best Practices</p>
                          <p className="text-sm text-gray-600">8 min read • Win more listings</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleOpenGuide('tax-optimization')}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">Tax Optimization Strategies</p>
                          <p className="text-sm text-gray-600">12 min read • Maximize deductions</p>
                        </div>
                      </div>
                    </div>
                    <div 
                      className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleOpenGuide('billing-subscriptions')}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="font-medium">Billing & Subscriptions Guide</p>
                          <p className="text-sm text-gray-600">10 min read • Manage your subscription</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Onboarding Checklist */}
            <Card>
              <CardHeader>
                <CardTitle>30-Day Onboarding Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Week 1: Foundation</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Complete profile setup
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Add first 5 properties
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Log initial expenses
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        Set monthly goals
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Week 2-3: Growth</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        Create first CMA
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        Track showing activities
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        Review performance reports
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        Optimize workflow
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">Week 4: Mastery</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        Advanced analytics review
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        Set quarterly goals
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        Customize dashboard
                      </li>
                      <li className="flex items-center gap-2">
                        <Circle className="h-4 w-4 text-gray-400" />
                        Invite team members
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Tips & Best Practices</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Maximizing Conversion Rates</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                    <li>Follow up with clients within 24 hours of showings</li>
                    <li>Track detailed feedback to understand client preferences</li>
                    <li>Use CMA data to justify pricing recommendations</li>
                    <li>Monitor time spent per property to optimize efficiency</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Financial Optimization</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                    <li>Track all business expenses for tax deductions</li>
                    <li>Use mileage tracking for accurate vehicle expense claims</li>
                    <li>Set aside percentage of commissions for taxes</li>
                    <li>Monitor ROI per property to focus on profitable activities</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Workflow Efficiency</h4>
                  <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                    <li>Use Quick Actions on dashboard for rapid data entry</li>
                    <li>Set goals monthly and track progress weekly</li>
                    <li>Review performance insights regularly for optimization</li>
                    <li>Leverage automated calculations to save time</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Feature Request Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                    Submit Feature Request
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Request Type</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={feedbackForm.type}
                        onChange={(e) => setFeedbackForm({...feedbackForm, type: e.target.value})}
                      >
                        <option value="feature">New Feature Request</option>
                        <option value="improvement">Feature Improvement</option>
                        <option value="bug">Bug Report</option>
                        <option value="integration">Integration Request</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Title</label>
                      <Input 
                        placeholder="Brief description of your request"
                        value={feedbackForm.title}
                        onChange={(e) => setFeedbackForm({...feedbackForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Detailed Description</label>
                      <Textarea 
                        placeholder="Please provide as much detail as possible about your request..."
                        rows={4}
                        value={feedbackForm.description}
                        onChange={(e) => setFeedbackForm({...feedbackForm, description: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email (for follow-up)</label>
                      <Input 
                        type="email"
                        placeholder="your@email.com"
                        value={feedbackForm.email}
                        onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={featureRequestMutation.isPending}>
                      <Send className="h-4 w-4 mr-2" />
                      {featureRequestMutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Feedback Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Guidelines</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-green-600">Feature Requests</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Describe the business problem you're trying to solve</li>
                      <li>• Explain how the feature would improve your workflow</li>
                      <li>• Include any specific requirements or constraints</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-600">Bug Reports</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Describe what you expected to happen</li>
                      <li>• Explain what actually happened</li>
                      <li>• Include steps to reproduce the issue</li>
                      <li>• Mention your browser and operating system</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-purple-600">Response Times</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Bug reports: 1-2 business days</li>
                      <li>• Feature requests: 3-5 business days</li>
                      <li>• Integration requests: 1-2 weeks</li>
                    </ul>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Tip:</strong> Check our roadmap and existing feature requests before submitting to avoid duplicates.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="complaints" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit a Complaint</h2>
              <p className="text-gray-600">Help us improve by reporting issues or concerns with our service</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Complaint Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-red-600" />
                    File a Complaint
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleComplaintSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Complaint Category</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={complaintForm.category}
                        onChange={(e) => setComplaintForm({...complaintForm, category: e.target.value})}
                      >
                        <option value="general">General Service Issue</option>
                        <option value="billing">Billing Problem</option>
                        <option value="data">Data Loss or Corruption</option>
                        <option value="performance">Performance Issues</option>
                        <option value="feature">Feature Not Working</option>
                        <option value="support">Customer Support</option>
                        <option value="privacy">Privacy Concern</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority Level</label>
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={complaintForm.priority}
                        onChange={(e) => setComplaintForm({...complaintForm, priority: e.target.value})}
                      >
                        <option value="low">Low - Minor inconvenience</option>
                        <option value="medium">Medium - Affects productivity</option>
                        <option value="high">High - Blocks critical work</option>
                        <option value="urgent">Urgent - Business impacting</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Subject</label>
                      <Input 
                        placeholder="Brief summary of your complaint"
                        value={complaintForm.subject}
                        onChange={(e) => setComplaintForm({...complaintForm, subject: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Detailed Description</label>
                      <Textarea 
                        placeholder="Please provide specific details about the issue, when it occurred, and how it affected you..."
                        rows={5}
                        value={complaintForm.description}
                        onChange={(e) => setComplaintForm({...complaintForm, description: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Email</label>
                      <Input 
                        type="email"
                        placeholder="your@email.com"
                        value={complaintForm.email}
                        onChange={(e) => setComplaintForm({...complaintForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={complaintSubmissionMutation.isPending}>
                      <Send className="h-4 w-4 mr-2" />
                      {complaintSubmissionMutation.isPending ? "Submitting..." : "Submit Complaint"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Complaint Process Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Complaint Process</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-red-600">What Happens Next?</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Your complaint is immediately logged in our system</li>
                      <li>• You'll receive an acknowledgment email within 1 hour</li>
                      <li>• Our support team will investigate the issue</li>
                      <li>• We'll provide updates on resolution progress</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-orange-600">Response Times</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Urgent: Within 2 hours</li>
                      <li>• High Priority: Within 4 hours</li>
                      <li>• Medium Priority: Within 24 hours</li>
                      <li>• Low Priority: Within 72 hours</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-blue-600">Resolution Process</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Investigation and root cause analysis</li>
                      <li>• Implementation of fix or workaround</li>
                      <li>• Communication of resolution steps</li>
                      <li>• Follow-up to ensure satisfaction</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Escalation:</strong> If you're not satisfied with the resolution, you can escalate your complaint to our management team.
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Privacy:</strong> All complaints are handled confidentially and used only to improve our service quality.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Key Calculations Reference */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Key Calculations Reference
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Revenue Calculations
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><strong>Total Revenue:</strong> Sum of commission amounts for closed properties</li>
                  <li><strong>Commission:</strong> Sale price × commission rate × your split</li>
                  <li><strong>ROI:</strong> (Revenue - Investment) / Investment × 100</li>
                  <li><strong>Revenue per Hour:</strong> Total revenue / total hours worked</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Metrics
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li><strong>Conversion Rate:</strong> Agreements / Appointments × 100</li>
                  <li><strong>Offer Acceptance Rate:</strong> Accepted offers / Total offers × 100</li>
                  <li><strong>Call Answer Rate:</strong> Answered calls / Total calls × 100</li>
                  <li><strong>Days on Market:</strong> Sold date - Listing date</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Support Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Need Additional Support?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Feature Requests</p>
                  <p className="text-sm text-gray-600">Have an idea for improving EliteKPI? We'd love to hear it!</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Data Export</p>
                  <p className="text-sm text-gray-600">All reports can be printed or saved as PDF for your records.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Calculation Accuracy</p>
                  <p className="text-sm text-gray-600">All calculations use your actual data and settings for maximum accuracy.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Guide Content Dialog */}
        <Dialog open={selectedGuide !== null} onOpenChange={(open) => !open && handleCloseGuide()}>
          <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0">
            <DialogHeader className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    {selectedGuide && guides[selectedGuide as keyof typeof guides]?.title}
                  </DialogTitle>
                  <DialogDescription className="text-gray-600 mt-1">
                    {selectedGuide && guides[selectedGuide as keyof typeof guides]?.subtitle}
                  </DialogDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleCloseGuide}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 p-6">
              {isLoadingGuide ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading guide...</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-none">
                  <div className="prose prose-gray max-w-none">
                    {guideContent.split('\n').map((line, index) => {
                      if (line.startsWith('# ')) {
                        return <h1 key={index} className="text-2xl font-bold text-gray-900 mt-6 mb-4">{line.replace('# ', '')}</h1>;
                      } else if (line.startsWith('## ')) {
                        return <h2 key={index} className="text-xl font-semibold text-gray-800 mt-5 mb-3">{line.replace('## ', '')}</h2>;
                      } else if (line.startsWith('### ')) {
                        return <h3 key={index} className="text-lg font-medium text-gray-700 mt-4 mb-2">{line.replace('### ', '')}</h3>;
                      } else if (line.startsWith('- ')) {
                        return <li key={index} className="ml-4 text-gray-700 list-disc">{line.replace('- ', '')}</li>;
                      } else if (line.match(/^\d+\. /)) {
                        return <li key={index} className="ml-4 text-gray-700 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
                      } else if (line.startsWith('*') && line.endsWith('*') && line.length > 2) {
                        return <p key={index} className="text-gray-600 italic text-sm mt-4 p-3 bg-blue-50 border-l-4 border-blue-200 rounded">{line.replace(/^\*|\*$/g, '')}</p>;
                      } else if (line.trim() === '') {
                        return <div key={index} className="h-3"></div>;
                      } else {
                        return <p key={index} className="text-gray-700 leading-relaxed mb-2">{line}</p>;
                      }
                    })}
                  </div>
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
      
    </div>
  );
}