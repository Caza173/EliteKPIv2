import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Phone, Home, Clock, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Scripts() {
  const { toast } = useToast();

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Scripts</h1>
        <p className="text-gray-600">
          Professional scripts for cold calling, expired listings, terminated contracts, and FSBO properties
        </p>
      </div>

      <Tabs defaultValue="coldCalling" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
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
        </TabsList>

        {Object.entries(scriptData).map(([key, category]) => (
          <TabsContent key={key} value={key}>
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <category.icon className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900">{category.title}</h2>
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
                          <CardDescription className="mt-1">
                            <Badge variant="secondary" className="mt-1">
                              {script.category}
                            </Badge>
                          </CardDescription>
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
      </Tabs>
    </div>
  );
}