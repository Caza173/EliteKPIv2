import { Tutorial } from "@/components/ui/tutorial-overlay";

export const tutorials: Tutorial[] = [
  {
    id: "getting-started",
    title: "Getting Started with EliteKPI",
    description: "Learn the basics of navigating EliteKPI and setting up your first property",
    estimatedTime: 5,
    category: "getting-started",
    steps: [
      {
        id: "welcome",
        title: "Welcome to EliteKPI",
        description: "Welcome! This interactive tutorial will guide you through the key features of EliteKPI. You'll learn how to navigate the interface and start tracking your real estate business effectively.",
        position: "center"
      },
      {
        id: "dashboard-overview",
        title: "Your Dashboard Command Center",
        description: "This is your dashboard - your business command center. Here you can see key metrics like total revenue, properties closed, and active listings at a glance.",
        targetSelector: ".dashboard-container",
        highlightElement: true,
        position: "center"
      },
      {
        id: "navigation",
        title: "Navigation Sidebar",
        description: "Use this sidebar to navigate between different sections: Dashboard, Properties, CMAs, Performance, Goals, and more. Each section serves a specific purpose in managing your real estate business.",
        targetSelector: "nav",
        highlightElement: true,
        position: "right"
      },
      {
        id: "properties-section",
        title: "Properties - Your Pipeline",
        description: "The Properties section is where you'll manage your entire deal pipeline. Let's navigate there now.",
        targetSelector: "a[href='/properties']",
        highlightElement: true,
        action: "Click on the Properties link in the sidebar",
        waitForAction: true,
        position: "right"
      },
      {
        id: "add-property",
        title: "Adding Your First Property",
        description: "This 'Add Property' button is how you'll add new properties to your pipeline. Click it to see the property form.",
        targetSelector: "button:contains('Add Property')",
        highlightElement: true,
        action: "Click the 'Add Property' button",
        position: "bottom"
      },
      {
        id: "property-form",
        title: "Property Information Form",
        description: "This form captures all the essential information about a property: address, bedrooms, bathrooms, square footage, your role (buyer/seller agent), and financial details.",
        position: "center"
      },
      {
        id: "quick-actions",
        title: "Quick Actions",
        description: "These quick action buttons let you rapidly log activities like scheduling showings, tracking mileage, or logging time without navigating away from your current page.",
        targetSelector: ".quick-actions",
        highlightElement: true,
        position: "top"
      },
      {
        id: "complete",
        title: "Tutorial Complete!",
        description: "Great job! You now know how to navigate EliteKPI and add properties. Try adding a real property from your current pipeline, or explore the other tutorials to learn more advanced features.",
        position: "center"
      }
    ]
  },
  {
    id: "property-management",
    title: "Property Management Mastery",
    description: "Master the art of managing your property pipeline from lead to closing",
    estimatedTime: 8,
    category: "properties",
    steps: [
      {
        id: "pipeline-overview",
        title: "Understanding Your Pipeline",
        description: "Your properties are organized by status: In Progress, Listed, Offer Written, Under Contract, Pending, Closed, and Lost. This visual organization helps you see where each deal stands.",
        targetSelector: ".properties-grid",
        highlightElement: true,
        position: "top"
      },
      {
        id: "property-details",
        title: "Property Detail Management",
        description: "Click on any property to see detailed information, track activities, manage expenses, and monitor ROI. This is your command center for each individual transaction.",
        targetSelector: ".property-card:first-child",
        highlightElement: true,
        action: "Click on a property card to open its details",
        position: "top"
      },
      {
        id: "status-updates",
        title: "Updating Property Status",
        description: "As deals progress, update the status using the dropdown menu. EliteKPI automatically tracks timing and calculates metrics like average days on market.",
        targetSelector: ".status-dropdown",
        highlightElement: true,
        position: "bottom"
      },
      {
        id: "activity-tracking",
        title: "Activity Tracking",
        description: "Use the 'Schedule Showing', 'Log Mileage', and 'Log Hours' buttons to track all activities related to this property. This data is crucial for accurate ROI calculations.",
        targetSelector: ".activity-buttons",
        highlightElement: true,
        position: "bottom"
      },
      {
        id: "financial-overview",
        title: "Financial Overview",
        description: "The Financial tab shows commission calculations, related expenses, and ROI analysis. Understanding these numbers helps you identify your most profitable activities.",
        targetSelector: ".financial-tab",
        highlightElement: true,
        position: "top"
      },
      {
        id: "commission-tracking",
        title: "Commission Management",
        description: "EliteKPI automatically calculates commissions based on sale price and your rate. You can track pending vs. received commissions and forecast your income.",
        targetSelector: ".commission-section",
        highlightElement: true,
        position: "top"
      }
    ]
  },
  {
    id: "financial-tracking",
    title: "Financial Tracking & ROI",
    description: "Learn to track expenses, manage commissions, and analyze your ROI effectively",
    estimatedTime: 6,
    category: "financial",
    steps: [
      {
        id: "expense-basics",
        title: "Expense Tracking Basics",
        description: "Tracking expenses is crucial for tax optimization and understanding your true profitability. Let's learn how to log and categorize your business expenses.",
        position: "center"
      },
      {
        id: "expense-categories",
        title: "Expense Categories",
        description: "EliteKPI organizes expenses into categories: Marketing, Transportation, Professional Development, Technology, Office Expenses, and Client Entertainment. Proper categorization maximizes your tax deductions.",
        targetSelector: ".expense-categories",
        highlightElement: true,
        position: "top"
      },
      {
        id: "mileage-tracking",
        title: "Mileage Tracking",
        description: "Use the 'Log Mileage' feature to track driving for tax deductions. EliteKPI calculates the deduction using current IRS rates and can export data for tax preparation.",
        targetSelector: "button:contains('Log Mileage')",
        highlightElement: true,
        position: "bottom"
      },
      {
        id: "roi-calculation",
        title: "ROI Analysis",
        description: "EliteKPI calculates comprehensive ROI considering commission earned, time invested (at your target hourly rate), and direct expenses. This helps you identify your most profitable activities.",
        targetSelector: ".roi-section",
        highlightElement: true,
        position: "top"
      },
      {
        id: "tax-optimization",
        title: "Tax Optimization",
        description: "The system provides quarterly tax estimates, deduction recommendations, and export-ready documentation for tax preparation. Maximize your deductions with proper tracking.",
        targetSelector: ".tax-optimization",
        highlightElement: true,
        position: "top"
      }
    ]
  },
  {
    id: "goals-performance",
    title: "Goals & Performance Analytics",
    description: "Set meaningful goals and track your performance with advanced analytics",
    estimatedTime: 7,
    category: "advanced",
    steps: [
      {
        id: "goals-introduction",
        title: "Setting Effective Goals",
        description: "Goals keep you focused and motivated. EliteKPI helps you set daily, weekly, and monthly targets for activities, revenue, and personal development.",
        position: "center"
      },
      {
        id: "daily-goals",
        title: "Daily Goal Setting",
        description: "Set daily targets for calls, hours worked, and key activities. These micro-goals build consistency and drive long-term success.",
        targetSelector: ".daily-goals-section",
        highlightElement: true,
        position: "top"
      },
      {
        id: "goal-locking",
        title: "Goal Locking Feature",
        description: "Once you're happy with your goals, use the 'Update & Lock Goals' feature to prevent accidental changes while maintaining focus on execution.",
        targetSelector: "button:contains('Update & Lock Goals')",
        highlightElement: true,
        position: "bottom"
      },
      {
        id: "performance-analytics",
        title: "Performance Analytics",
        description: "The Performance section provides detailed analytics on conversion rates, efficiency scores, and comparative benchmarks to help you improve continuously.",
        targetSelector: ".performance-metrics",
        highlightElement: true,
        position: "top"
      },
      {
        id: "achievements",
        title: "Achievement System",
        description: "EliteKPI gamifies your success with badges and achievements for sales milestones, activity consistency, and performance improvements. Celebrate your wins!",
        targetSelector: ".achievements-section",
        highlightElement: true,
        position: "top"
      }
    ]
  }
];

export function getTutorialById(id: string): Tutorial | undefined {
  return tutorials.find(tutorial => tutorial.id === id);
}

export function getTutorialsByCategory(category: Tutorial['category']): Tutorial[] {
  return tutorials.filter(tutorial => tutorial.category === category);
}