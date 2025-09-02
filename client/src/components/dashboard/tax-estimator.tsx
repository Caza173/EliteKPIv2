import { useState } from "react";
import { Slider } from "@/components/ui/slider";

interface TaxEstimatorProps {
  totalRevenue: number;
}

export default function TaxEstimator({ totalRevenue }: TaxEstimatorProps) {
  const [taxRate, setTaxRate] = useState([25]);
  
  const estimatedTax = (totalRevenue * taxRate[0]) / 100;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Tax Estimate</h3>
        <div className="flex items-center space-x-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
            <Slider
              value={taxRate}
              onValueChange={setTaxRate}
              max={50}
              min={0}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>{taxRate[0]}%</span>
              <span>50%</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Estimated Tax</div>
            <div className="text-2xl font-bold text-red-600">
              ${estimatedTax.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
