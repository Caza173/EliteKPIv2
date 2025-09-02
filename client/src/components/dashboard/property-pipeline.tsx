import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

interface PropertyPipelineProps {
  metrics: any;
}

export default function PropertyPipeline({ metrics }: PropertyPipelineProps) {
  const pipelineData = [
    {
      title: "Under Contract",
      count: metrics?.underContractCount || 0,
      value: `$${(metrics?.underContractValue / 1000)?.toFixed(0) || '0'}K`,
      color: "bg-blue-100 text-blue-800",
      details: [`${metrics?.underContractCount || 0} properties`]
    },
    {
      title: "Pending",
      count: metrics?.pendingCount || 0,
      value: `$${(metrics?.pendingValue / 1000)?.toFixed(0) || '0'}K`,
      color: "bg-blue-100 text-blue-800",
      details: [`${metrics?.pendingCount || 0} properties`]
    },
    {
      title: "Active Listings",
      count: metrics?.activeListings || 0,
      value: "Active",
      color: "bg-green-100 text-green-800",
      details: [`${metrics?.activeListings || 0} listings`]
    },
    {
      title: "In Progress",
      count: 0,
      value: "Working",
      color: "bg-gray-100 text-gray-800",
      details: ["New prospects"]
    }
  ];

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Property Pipeline Overview</h3>
          <Link href="/properties">
            <Button variant="default">
              View All Properties
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineData.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.color}`}>
                  {item.count}
                </span>
              </div>
              <div className="text-lg font-semibold text-gray-900 mb-2">{item.value}</div>
              <div className="space-y-2">
                {item.details.map((detail, detailIndex) => (
                  <div key={detailIndex} className="text-xs text-gray-600">• {detail}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
