interface PerformanceInsightsProps {
  metrics: any;
}

export default function PerformanceInsights({ metrics }: PerformanceInsightsProps) {
  const insights = [
    {
      type: "success",
      title: "Strong Revenue Performance",
      description: `$${metrics?.revenuePerHour || 0}/hour - above industry average`,
      color: "bg-green-400"
    },
    {
      type: "warning", 
      title: "Conversion Rate Opportunity",
      description: `${metrics?.conversionRate || 0}% - consider more follow-up strategies`,
      color: "bg-blue-400"
    },
    {
      type: "info",
      title: "ROI Performance", 
      description: `${metrics?.roiPerformance || 0}% return on investment this year`,
      color: "bg-blue-400"
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Performance Insights</h3>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-2 h-2 ${insight.color} rounded-full mt-2`}></div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-900 font-medium">{insight.title}</p>
                <p className="text-sm text-gray-600">{insight.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
