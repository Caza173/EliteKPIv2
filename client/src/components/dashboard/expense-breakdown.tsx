import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/calculations";
import { apiRequest } from "@/lib/queryClient";

interface ExpenseCategory {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

interface ExpenseByProperty {
  propertyId: string;
  propertyAddress: string;
  total: number;
  count: number;
  percentage: number;
}

const CATEGORY_COLORS = {
  marketing: "#3B82F6",
  gas: "#EF4444", 
  mileage: "#F59E0B",
  meals: "#10B981",
  supplies: "#8B5CF6",
  professional_services: "#06B6D4",
  education: "#F97316",
  other: "#6B7280",
  gas_mileage: "#DC2626"
};

const CATEGORY_LABELS = {
  marketing: "Marketing",
  gas: "Gas",
  mileage: "Mileage", 
  meals: "Meals",
  supplies: "Office Supplies",
  professional_services: "Professional Services",
  education: "Education",
  other: "Other",
  gas_mileage: "Gas & Mileage"
};

export default function ExpenseBreakdown() {
  const [viewMode, setViewMode] = useState<'category' | 'property'>('category');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);
  const [selectedPropertyAddress, setSelectedPropertyAddress] = useState<string>('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  const { data: expenses = [], isLoading } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expenses/breakdown"],
  });
  
  const { data: expensesByProperty = [], isLoading: isLoadingByProperty } = useQuery<ExpenseByProperty[]>({
    queryKey: ["/api/expenses/by-property"],
    enabled: viewMode === 'property',
  });

  // Query for detailed expenses of selected property
  const { data: propertyExpenses = [], isLoading: isLoadingPropertyExpenses } = useQuery({
    queryKey: ["/api/expenses/property", selectedPropertyId],
    queryFn: () => selectedPropertyId ? apiRequest("GET", `/api/expenses/property/${selectedPropertyId}`).then(res => res.json()) : [],
    enabled: !!selectedPropertyId,
  });

  const handlePropertyClick = (propertyId: string, propertyAddress: string) => {
    setSelectedPropertyId(propertyId);
    setSelectedPropertyAddress(propertyAddress);
    setShowExpenseModal(true);
  };

  const totalExpenses = expenses.reduce((sum: number, exp: ExpenseCategory) => sum + exp.total, 0);

  const chartData = expenses.map((expense: ExpenseCategory) => ({
    name: CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] || expense.category,
    value: expense.total,
    color: CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] || "#6B7280",
    count: expense.count
  }));

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg animate-pulse">
        <div className="p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const totalExpensesByProperty = expensesByProperty.reduce((sum: number, exp: ExpenseByProperty) => sum + exp.total, 0);
  
  const propertyChartData = expensesByProperty.map((expense: ExpenseByProperty) => ({
    name: expense.propertyAddress,
    value: expense.total,
    color: `hsl(${Math.abs(expense.propertyId.charCodeAt(0) * 137) % 360}, 70%, 50%)`,
    count: expense.count
  }));

  const renderCategoryView = () => {
    if (isLoading) {
      return (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      );
    }

    return (
      <div>
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">📊</div>
            <h4 className="text-lg font-medium text-gray-600 mb-1">No Expenses Yet</h4>
            <p className="text-sm text-gray-500">Add some expenses to see the breakdown by category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    labelLine={false}
                  >
                    {chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Amount"]}
                    labelFormatter={(label) => `Category: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Category Breakdown</h4>
              <div className="space-y-3">
                {expenses.map((expense: ExpenseCategory) => {
                  const categoryLabel = CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] || expense.category;
                  const color = CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] || "#6B7280";
                  
                  return (
                    <div key={expense.category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{categoryLabel}</div>
                          <div className="text-xs text-gray-500">{expense.count} expense{expense.count !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(expense.total)}</div>
                        <div className="text-xs text-gray-500">
                          {totalExpenses > 0 ? Math.round((expense.total / totalExpenses) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPropertyView = () => {
    if (isLoadingByProperty) {
      return (
        <div className="animate-pulse">
          <div className="h-64 bg-gray-100 rounded"></div>
        </div>
      );
    }

    return (
      <div>
        {expensesByProperty.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">🏠</div>
            <h4 className="text-lg font-medium text-gray-600 mb-1">No Property Expenses Yet</h4>
            <p className="text-sm text-gray-500">Add expenses linked to properties to see the breakdown by property.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart for Properties */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Property Distribution</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={propertyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    formatter={(value) => [formatCurrency(value as number), "Total Expenses"]}
                    labelFormatter={(label) => `Property: ${label}`}
                  />
                  <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Property Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-3">Property Breakdown</h4>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {expensesByProperty.map((expense: ExpenseByProperty) => {
                  return (
                    <div 
                      key={expense.propertyId} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handlePropertyClick(expense.propertyId, expense.propertyAddress)}
                      data-testid={`property-expense-item-${expense.propertyId}`}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: `hsl(${Math.abs(expense.propertyId.charCodeAt(0) * 137) % 360}, 70%, 50%)` }}
                        ></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.propertyAddress}</div>
                          <div className="text-xs text-gray-500">{expense.count} expense{expense.count !== 1 ? 's' : ''}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">{formatCurrency(expense.total)}</div>
                        <div className="text-xs text-gray-500">
                          {totalExpensesByProperty > 0 ? Math.round((expense.total / totalExpensesByProperty) * 100) : 0}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Expense Analysis</h3>
          <div className="text-sm text-gray-500">
            Total: <span className="font-bold text-gray-900">
              {formatCurrency(viewMode === 'category' ? totalExpenses : totalExpensesByProperty)}
            </span>
          </div>
        </div>
        
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'category' | 'property')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="category" data-testid="tab-expenses-category">By Category</TabsTrigger>
            <TabsTrigger value="property" data-testid="tab-expenses-property">By Property</TabsTrigger>
          </TabsList>
          
          <TabsContent value="category" className="mt-4">
            {renderCategoryView()}
          </TabsContent>
          
          <TabsContent value="property" className="mt-4">
            {renderPropertyView()}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Property Expense Details Modal */}
      <Dialog open={showExpenseModal} onOpenChange={setShowExpenseModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Expense Details</DialogTitle>
            <DialogDescription>
              Detailed expenses for {selectedPropertyAddress}
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4">
            {isLoadingPropertyExpenses ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-100 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : propertyExpenses.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-2">💸</div>
                <p className="text-gray-500">No expenses found for this property.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {propertyExpenses.map((expense: any) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] || expense.category}
                        </h4>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(expense.amount)}
                        </span>
                      </div>
                      {expense.description && (
                        <p className="text-sm text-gray-600 mb-1">{expense.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {new Date(expense.date).toLocaleDateString()}
                        </span>
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] + '20',
                            color: CATEGORY_COLORS[expense.category as keyof typeof CATEGORY_COLORS] || '#6B7280'
                          }}
                        >
                          {CATEGORY_LABELS[expense.category as keyof typeof CATEGORY_LABELS] || expense.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="flex justify-end mt-6">
              <Button 
                className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50"
                onClick={() => setShowExpenseModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}