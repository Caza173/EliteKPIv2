import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  Edit,
  Phone,
  Copy,
  Brain,
  Wand2
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

  // AI Script Generation State
  const [aiScriptForm, setAiScriptForm] = useState({
    scriptType: 'cold-calling',
    targetAudience: '',
    specificScenario: '',
    tone: 'professional',
    length: 'medium'
  });
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Script Copied",
      description: `${title} script copied to clipboard`,
    });
  };

  const scriptData = {
    coldCalling: {
      title: "Cold Calling Scripts",
      icon: Phone,
      scripts: [
        {
          title: "Initial Contact Script",
          category: "Opening",
          script: `Hi, this is [Your Name] with [Your Company]. I hope I'm not catching you at a bad time? 

I'm calling because I specialize in your neighborhood and I've been helping homeowners in [Area] sell their homes quickly and for top dollar. 

I noticed you've been in your home for [X years], and I'm wondering - have you ever thought about what your home might be worth in today's market?

The reason I'm calling is that I have several buyers actively looking in your area right now, and homes like yours are in high demand. Would you be interested in knowing what your home might sell for?`,
        },
        {
          title: "Value Proposition Script",
          category: "Follow-up",
          script: `I understand you're not thinking of selling right now, and that's perfectly fine. 

Here's what I'd like to offer you at no cost and with no obligation:
• A complimentary market analysis showing what homes like yours have sold for recently
• Information about current market trends in your neighborhood
• A strategic plan for maximizing your home's value when you are ready

Even if selling is 2-3 years away, wouldn't it make sense to know what you're sitting on and how to maximize its value?`,
        },
        {
          title: "Objection Handler - Not Interested",
          category: "Objection",
          script: `I completely understand, and I appreciate your honesty. Let me ask you this though...

If you knew that your home was worth significantly more than you thought, would that change your timeline at all?

What I'm finding is that many homeowners in [Area] are surprised by their home's current value. The market has shifted, and some homes are worth 15-20% more than owners realize.

Would it hurt to know? I can send you a quick market snapshot via email - no phone calls, no visits, just information. What's your email address?`,
        }
      ]
    },
    expired: {
      title: "Expired Listing Scripts",
      icon: Clock,
      scripts: [
        {
          title: "Initial Expired Contact",
          category: "Opening",
          script: `Hi [Name], this is [Your Name] with [Company]. I noticed your home on [Address] was recently on the market.

I know this must be frustrating, and I'm not calling to pile on. I'm calling because I believe I know why your home didn't sell, and more importantly, I know how to fix it.

Can I share with you the three main reasons homes don't sell, and what we can do differently to get your home SOLD?`,
        },
        {
          title: "Expired Value Script",
          category: "Value Proposition",
          script: `[Name], here are the three reasons homes don't sell:

1. PRICING - The home wasn't priced according to current market conditions
2. MARKETING - The home didn't get proper exposure to qualified buyers  
3. AGENT ACTIVITY - The agent wasn't proactive in generating buyer interest

I have a proven system that addresses all three. In the past 12 months, I've sold [X%] of my expired listings within [X] days at [X%] of asking price.

The question is: Are you still motivated to sell, or have you decided to take the home off the market entirely?`,
        },
        {
          title: "Expired Follow-up Script",
          category: "Follow-up",
          script: `Hi [Name], [Your Name] again. I called earlier about your home on [Address].

I wanted to follow up because I just sold a similar home in your neighborhood for [Price] in only [X] days. 

The difference was our marketing strategy and pricing approach. I'd like to show you exactly what we did differently and how we can apply the same strategy to get your home sold.

Do you have 15 minutes this evening or would tomorrow morning work better for a quick consultation?`,
        }
      ]
    },
    terminated: {
      title: "Terminated Listing Scripts",
      icon: FileText,
      scripts: [
        {
          title: "Terminated Listing Opener",
          category: "Opening",
          script: `Hi [Name], this is [Your Name] with [Your Company]. I see that you recently terminated your listing agreement on [Address].

I'm not calling to criticize your previous agent - I'm calling because I believe your home can be sold, and I'd like to show you how.

Can I ask - what was the main reason you decided to terminate? Was it lack of activity, poor communication, or pricing concerns?`,
        },
        {
          title: "Fresh Approach Script",
          category: "Value Proposition", 
          script: `[Name], I understand your frustration. After working with an agent for [time period] and not getting results, it's natural to feel discouraged.

Here's what I bring to the table that's different:
• A fresh marketing approach that targets today's buyers
• Aggressive digital marketing across 200+ websites
• Weekly communication and market updates
• A pricing strategy based on current market conditions, not outdated data

The market is still strong for properly priced and marketed homes. Your home can sell - it just needs the right strategy. 

Would you be open to hearing about our approach? I have time [day] at [time].`,
        },
        {
          title: "Second Chance Script",
          category: "Motivation",
          script: `[Name], I know you've been through this process once already, and that took courage. 

The fact that you tried shows me you're serious about selling. The only thing that didn't work was the execution, not your decision to sell.

I'd like to offer you a second chance to get this right. I have a 90-day marketing plan that's specifically designed for homes that have been on the market before.

If I can't get you more activity in the first 30 days than you saw in [previous time period], you can cancel the agreement. Does that sound fair?`,
        }
      ]
    },
    fsbo: {
      title: "FSBO Scripts", 
      icon: Home,
      scripts: [
        {
          title: "FSBO Opening Script",
          category: "Opening",
          script: `Hi, I'm calling about your home for sale on [Address]. First, I want to congratulate you on taking the initiative to sell your home yourself.

I'm [Your Name] with [Company], and I'm not calling to try to convince you to list with me today. I'm calling because I work with a lot of buyers in your area, and I might have someone interested in your home.

Can you tell me a bit about the property? How many bedrooms and bathrooms, and what's your asking price?`,
        },
        {
          title: "FSBO Value Script",
          category: "Assistance Offer",
          script: `[Name], I know you're handling the sale yourself, and I respect that. But I also know it can be overwhelming - the marketing, the showings, the negotiations, the paperwork.

I'd like to make you an offer: What if I could bring you qualified, pre-approved buyers without you having to pay me anything unless we close?

I work with several buyers looking in your price range. If I bring you a buyer and we close, you pay me from the proceeds. If no sale happens, you pay nothing. Would that be of interest to you?`,
        },
        {
          title: "FSBO Statistics Script",
          category: "Education",
          script: `[Name], can I share something with you that might help? The National Association of Realtors shows that FSBO homes typically sell for 18% less than agent-listed homes.

That's not because FSBO sellers aren't smart - it's because buyers know you don't have representation, and they negotiate accordingly.

Here's what I'd like to propose: Let me show you how to net more money even after paying a commission. Most of my sellers net 15-20% more than they would selling on their own.

Would you be interested in seeing those numbers? No obligation - just information that could save you thousands.`,
        }
      ]
    }
  };
  

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

  const generateScriptMutation = useMutation({
    mutationFn: async (data: typeof aiScriptForm) => {
      const response = await apiRequest("POST", "/api/generate-script", data);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to generate script');
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (response) => {
      setGeneratedScript(response.script);
      toast({
        title: "Script Generated Successfully!",
        description: "Your custom AI script is ready to use."
      });
    },
    onError: (error: any) => {
      console.error("Script generation error:", error);
      toast({
        title: "Generation Failed",
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

  const handleGenerateScript = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingScript(true);
    generateScriptMutation.mutate(aiScriptForm, {
      onSettled: () => setIsGeneratingScript(false)
    });
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
          <TabsList className="grid w-full grid-cols-7 mb-6">
            <TabsTrigger value="overview">Feature Overview</TabsTrigger>
            <TabsTrigger value="videos">Video Training</TabsTrigger>
            <TabsTrigger value="training">Written Guides</TabsTrigger>
            <TabsTrigger value="scripts">Sales Scripts</TabsTrigger>
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

          <TabsContent value="scripts" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Sales Scripts</h2>
              <p className="text-gray-600">Professional scripts for cold calling, expired listings, terminated contracts, and FSBO properties</p>
            </div>

            <Tabs defaultValue="coldCalling" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="coldCalling" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Cold Calling
                </TabsTrigger>
                <TabsTrigger value="expired" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Expired
                </TabsTrigger>
                <TabsTrigger value="terminated" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Terminated
                </TabsTrigger>
                <TabsTrigger value="fsbo" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  FSBO
                </TabsTrigger>
                <TabsTrigger value="ai-scripts" className="flex items-center gap-2">
                  <Wand2 className="h-4 w-4" />
                  AI Scripts
                </TabsTrigger>
              </TabsList>

              {Object.entries(scriptData).map(([key, category]) => (
                <TabsContent key={key} value={key}>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <category.icon className="h-6 w-6 text-blue-600" />
                      <h3 className="text-2xl font-semibold text-gray-900">{category.title}</h3>
                    </div>

                    <div className="grid gap-6">
                      {category.scripts.map((script, index) => (
                        <Card key={index} className="hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg font-semibold text-gray-900">
                                  {script.title}
                                </CardTitle>
                                <div className="mt-1">
                                  <Badge variant="secondary">
                                    {script.category}
                                  </Badge>
                                </div>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(script.script, script.title)}
                                className="flex items-center gap-2"
                              >
                                <Copy className="h-4 w-4" />
                                Copy
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="bg-gray-50 border rounded-lg p-4">
                              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                                {script.script}
                              </pre>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              ))}

              <TabsContent value="ai-scripts">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <Wand2 className="h-6 w-6 text-purple-600" />
                    <h3 className="text-2xl font-semibold text-gray-900">AI-Generated Scripts</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Script Generation Form */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="h-5 w-5 text-purple-600" />
                          Generate Custom Script
                        </CardTitle>
                        <CardDescription>
                          Create personalized sales scripts using AI based on your specific needs and scenarios
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleGenerateScript} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Script Type
                            </label>
                            <Select 
                              value={aiScriptForm.scriptType} 
                              onValueChange={(value) => setAiScriptForm({...aiScriptForm, scriptType: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select script type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cold-calling">Cold Calling</SelectItem>
                                <SelectItem value="expired-listing">Expired Listing</SelectItem>
                                <SelectItem value="terminated-listing">Terminated Listing</SelectItem>
                                <SelectItem value="fsbo">FSBO</SelectItem>
                                <SelectItem value="buyer-consultation">Buyer Consultation</SelectItem>
                                <SelectItem value="seller-consultation">Seller Consultation</SelectItem>
                                <SelectItem value="follow-up">Follow-up Call</SelectItem>
                                <SelectItem value="objection-handling">Objection Handling</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Target Audience
                            </label>
                            <Input
                              value={aiScriptForm.targetAudience}
                              onChange={(e) => setAiScriptForm({...aiScriptForm, targetAudience: e.target.value})}
                              placeholder="e.g., First-time homebuyers, Empty nesters, Investors"
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Specific Scenario
                            </label>
                            <Textarea
                              value={aiScriptForm.specificScenario}
                              onChange={(e) => setAiScriptForm({...aiScriptForm, specificScenario: e.target.value})}
                              placeholder="Describe the specific situation, market conditions, property type, or unique circumstances..."
                              rows={3}
                              className="w-full"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tone
                            </label>
                            <Select 
                              value={aiScriptForm.tone} 
                              onValueChange={(value) => setAiScriptForm({...aiScriptForm, tone: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="professional">Professional</SelectItem>
                                <SelectItem value="friendly">Friendly & Casual</SelectItem>
                                <SelectItem value="authoritative">Authoritative</SelectItem>
                                <SelectItem value="empathetic">Empathetic</SelectItem>
                                <SelectItem value="consultative">Consultative</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Script Length
                            </label>
                            <Select 
                              value={aiScriptForm.length} 
                              onValueChange={(value) => setAiScriptForm({...aiScriptForm, length: value})}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="short">Short (30-60 seconds)</SelectItem>
                                <SelectItem value="medium">Medium (1-2 minutes)</SelectItem>
                                <SelectItem value="long">Long (2-3 minutes)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={isGeneratingScript || !aiScriptForm.targetAudience || !aiScriptForm.specificScenario}
                          >
                            {isGeneratingScript ? (
                              <>
                                <Brain className="h-4 w-4 mr-2 animate-spin" />
                                Generating Script...
                              </>
                            ) : (
                              <>
                                <Wand2 className="h-4 w-4 mr-2" />
                                Generate Script
                              </>
                            )}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    {/* Generated Script Display */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          Generated Script
                        </CardTitle>
                        {generatedScript && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(generatedScript, "AI Generated Script")}
                              className="flex items-center gap-2"
                            >
                              <Copy className="h-4 w-4" />
                              Copy Script
                            </Button>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent>
                        {generatedScript ? (
                          <div className="bg-gray-50 border rounded-lg p-4">
                            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                              {generatedScript}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>Fill out the form and click "Generate Script" to create your custom script</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
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