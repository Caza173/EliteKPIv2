import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, DollarSign, Receipt, Clock, TrendingUp } from "lucide-react";
import type { Property, Commission, Expense, TimeEntry } from "@shared/schema";

interface PropertyROIAnalysisProps {
  property: Property;
  commissions: Commission[];
  expenses: Expense[];
  timeEntries: TimeEntry[];
}

export default function PropertyROIAnalysis({ 
  property, 
  commissions, 
  expenses, 
  timeEntries 
}: PropertyROIAnalysisProps) {
  // Calculate totals
  const totalCommissions = commissions.reduce((sum, commission) => 
    sum + parseFloat(commission.amount), 0
  );
  
  const totalExpenses = expenses.reduce((sum, expense) => 
    sum + parseFloat(expense.amount), 0
  );
  
  const totalHours = timeEntries.reduce((sum, entry) => 
    sum + (entry.hours || 0), 0
  );
  
  const hourlyRate = 150; // This could be configurable
  const timeValue = totalHours * hourlyRate;
  
  const netProfit = totalCommissions - totalExpenses;
  const totalInvestment = totalExpenses;
  const roi = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-600">Property ROI Analysis</CardTitle>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Select defaultValue={property.id}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={property.id}>
                {property.address} - {property.status === 'closed' ? 'closed' : 'active'}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Property Header Info */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{property.address}</h3>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>{property.propertyType?.replace('_', ' ') || 'House'}</span>
            <span>•</span>
            <span className="capitalize">{property.status || 'Active'}</span>
            <span>•</span>
            <span>{property.representationType === 'buyer_rep' ? 'Buyer Rep' : 'Seller Rep'}</span>
          </div>
        </div>

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Revenue Card */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-sm text-green-700 mb-1">Revenue</div>
            <div className="text-2xl font-bold text-green-700">
              ${totalCommissions.toLocaleString()}
            </div>
          </div>

          {/* Expenses Card */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Receipt className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-sm text-red-700 mb-1">Expenses</div>
            <div className="text-2xl font-bold text-red-700">
              ${totalExpenses.toLocaleString()}
            </div>
          </div>

          {/* Time Value Card */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-sm text-blue-700 mb-1">Time Value</div>
            <div className="text-2xl font-bold text-blue-700">
              ${timeValue.toLocaleString()}
            </div>
          </div>

          {/* Net Profit Card */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-sm text-purple-700 mb-1">Net Profit</div>
            <div className="text-2xl font-bold text-purple-700">
              ${netProfit.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ROI Summary Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <div className="text-sm text-blue-700 mb-2">Return on Investment (ROI)</div>
          <div className="text-4xl font-bold text-blue-700 mb-2">
            {roi.toFixed(1)}%
          </div>
          <div className="text-xs text-blue-600">
            Total Investment: ${totalInvestment.toLocaleString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}