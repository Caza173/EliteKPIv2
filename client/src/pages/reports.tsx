import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Printer, 
  Download, 
  Calendar,
  DollarSign,
  Clock,
  TrendingUp,
  Mail,
  MessageSquare,
  Send
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatCurrency, formatPercentage } from "@/lib/calculations";
import { apiRequest } from "@/lib/queryClient";
import { 
  ResponsiveContainer, 
  BarChart as RechartsBar, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  LineChart as RechartsLine,
  Line,
  PieChart as RechartsPie,
  Cell,
  Pie
} from 'recharts';

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  // Email and text report states
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [textModalOpen, setTextModalOpen] = useState(false);
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [reportType, setReportType] = useState("Comprehensive");

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const { data: commissions = [] } = useQuery({
    queryKey: ["/api/commissions"],
    retry: false,
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
    retry: false,
  });

  const { data: timeEntries = [] } = useQuery({
    queryKey: ["/api/time-entries"],
    retry: false,
  });

  const { data: mileageLogs = [] } = useQuery({
    queryKey: ["/api/mileage-logs"],
    retry: false,
  });

  // Email report mutation
  const sendEmailReportMutation = useMutation({
    mutationFn: async (data: { email: string; reportType: string }) => {
      return apiRequest('POST', '/api/reports/email', data);
    },
    onSuccess: () => {
      toast({
        title: "Email Sent",
        description: "Your report has been sent successfully!"
      });
      setEmailModalOpen(false);
      setEmailAddress("");
    },
    onError: (error: any) => {
      console.error('Email report error:', error);
      toast({
        title: "Error",
        description: `Failed to send email report: ${error?.message || 'Please try again.'}`,
        variant: "destructive"
      });
    }
  });

  // Text report mutation
  const sendTextReportMutation = useMutation({
    mutationFn: async (data: { phone: string; reportType: string }) => {
      return apiRequest('POST', '/api/reports/text', data);
    },
    onSuccess: () => {
      toast({
        title: "Text Sent",
        description: "Your report summary has been sent via text!"
      });
      setTextModalOpen(false);
      setPhoneNumber("");
    },
    onError: (error: any) => {
      console.error('Text report error:', error);
      toast({
        title: "Error",
        description: `Failed to send text report: ${error?.message || 'Please try again.'}`,
        variant: "destructive"
      });
    }
  });

  const handlePrint = () => {
    window.print();
  };

  const handleEmailReport = () => {
    if (emailAddress && reportType) {
      sendEmailReportMutation.mutate({ email: emailAddress, reportType });
    }
  };

  const handleTextReport = () => {
    if (phoneNumber && reportType) {
      sendTextReportMutation.mutate({ phone: phoneNumber, reportType });
    }
  };

  // Sales Report Data
  const salesData = (properties as any[])
    .filter((p: any) => p.status === 'closed')
    .map((p: any) => ({
      address: p.address.split(',')[0],
      listingPrice: parseFloat(p.listingPrice || '0'),
      soldPrice: parseFloat(p.soldPrice || '0'),
      daysOnMarket: p.daysOnMarket || 0,
      variance: ((parseFloat(p.soldPrice || '0') - parseFloat(p.listingPrice || '0')) / parseFloat(p.listingPrice || '0')) * 100
    }));

  // Commission Report Data
  const commissionData = (commissions as any[]).map((c: any) => ({
    date: new Date(c.dateEarned).toLocaleDateString(),
    amount: parseFloat(c.amount || '0'),
    type: c.type,
    rate: parseFloat(c.commissionRate || '0')
  }));

  // Expense Report Data (including mileage gas costs)
  const expenseCategories = (expenses as any[]).reduce((acc: any, expense: any) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = { category, total: 0, count: 0 };
    }
    acc[category].total += parseFloat(expense.amount || '0');
    acc[category].count += 1;
    return acc;
  }, {});

  // Add mileage gas costs to transportation category
  const mileageGasCosts = (mileageLogs as any[]).reduce((total: number, log: any) => {
    return total + parseFloat(log.gasCost || '0');
  }, 0);

  if (mileageGasCosts > 0) {
    if (!expenseCategories['transportation']) {
      expenseCategories['transportation'] = { category: 'transportation', total: 0, count: 0 };
    }
    expenseCategories['transportation'].total += mileageGasCosts;
    expenseCategories['transportation'].count += (mileageLogs as any[]).filter((log: any) => log.gasCost > 0).length;
  }

  const expenseData = Object.values(expenseCategories);

  // Time Log Data
  const timeData = (timeEntries as any[]).reduce((acc: any, entry: any) => {
    const activity = entry.activity;
    if (!acc[activity]) {
      acc[activity] = { activity, hours: 0, count: 0 };
    }
    acc[activity].hours += parseFloat(entry.hours || '0');
    acc[activity].count += 1;
    return acc;
  }, {});

  const timeChartData = Object.values(timeData);

  // Monthly Revenue Chart
  const monthlyData = (commissions as any[]).reduce((acc: any, commission: any) => {
    const month = new Date(commission.dateEarned).toLocaleString('default', { month: 'short', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = { month, revenue: 0 };
    }
    acc[month].revenue += parseFloat(commission.amount || '0');
    return acc;
  }, {});

  const monthlyChartData = Object.values(monthlyData).slice(-12);

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#06b6d4', '#8b5cf6', '#0ea5e9'];

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          
          {/* Email Report Dialog */}
          <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-email-report">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Email Report</DialogTitle>
                <DialogDescription>
                  Send a detailed report to your email address
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    data-testid="input-email-address"
                  />
                </div>
                <div>
                  <Label htmlFor="report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger data-testid="select-report-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales">Sales Report</SelectItem>
                      <SelectItem value="Commissions">Commission Report</SelectItem>
                      <SelectItem value="Expenses">Expense Report</SelectItem>
                      <SelectItem value="Time">Time Log Report</SelectItem>
                      <SelectItem value="Comprehensive">Comprehensive Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleEmailReport} 
                  disabled={!emailAddress || sendEmailReportMutation.isPending}
                  className="w-full"
                  data-testid="button-send-email"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendEmailReportMutation.isPending ? 'Sending...' : 'Send Email Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Text Report Dialog */}
          <Dialog open={textModalOpen} onOpenChange={setTextModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-text-report">
                <MessageSquare className="h-4 w-4 mr-2" />
                Text
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Text Report</DialogTitle>
                <DialogDescription>
                  Send a summary report to your phone via text message
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    data-testid="input-phone-number"
                  />
                </div>
                <div>
                  <Label htmlFor="text-report-type">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger data-testid="select-text-report-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Summary">Summary</SelectItem>
                      <SelectItem value="Revenue">Revenue Summary</SelectItem>
                      <SelectItem value="Performance">Performance Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  onClick={handleTextReport} 
                  disabled={!phoneNumber || sendTextReportMutation.isPending}
                  className="w-full"
                  data-testid="button-send-text"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendTextReportMutation.isPending ? 'Sending...' : 'Send Text Report'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-5 print:hidden">
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="time">Time Log</TabsTrigger>
          <TabsTrigger value="comprehensive">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Sales Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBar data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="address" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), ""]} />
                    <Bar dataKey="listingPrice" fill="#3b82f6" name="Listing Price" />
                    <Bar dataKey="soldPrice" fill="#10b981" name="Sold Price" />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Property</th>
                      <th className="text-right p-2">Listing Price</th>
                      <th className="text-right p-2">Sold Price</th>
                      <th className="text-right p-2">Days on Market</th>
                      <th className="text-right p-2">Variance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((sale: any, index: number) => (
                      <tr key={`sale-${sale.address}-${index}`} className="border-b">
                        <td className="p-2">{sale.address}</td>
                        <td className="text-right p-2">{formatCurrency(sale.listingPrice)}</td>
                        <td className="text-right p-2">{formatCurrency(sale.soldPrice)}</td>
                        <td className="text-right p-2">{sale.daysOnMarket}</td>
                        <td className={`text-right p-2 ${sale.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatPercentage(sale.variance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Commission Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLine data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Revenue"]} />
                    <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
                  </RechartsLine>
                </ResponsiveContainer>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-right p-2">Amount</th>
                      <th className="text-left p-2">Type</th>
                      <th className="text-right p-2">Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commissionData.map((commission: any, index: number) => (
                      <tr key={`commission-${commission.date}-${index}`} className="border-b">
                        <td className="p-2">{commission.date}</td>
                        <td className="text-right p-2">{formatCurrency(commission.amount)}</td>
                        <td className="p-2 capitalize">{commission.type.replace('_', ' ')}</td>
                        <td className="text-right p-2">{formatPercentage(commission.rate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Expense Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="total"
                      label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [formatCurrency(Number(value)), "Total"]} />
                  </RechartsPie>
                </ResponsiveContainer>
                
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Expense Summary</h3>
                  <div className="space-y-2">
                    {expenseData.map((category: any, index) => (
                      <div key={`expense-${category.category}-${index}`} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="capitalize">{category.category.replace('_', ' ')}</span>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(category.total)}</div>
                          <div className="text-sm text-gray-500">{category.count} expenses</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Time Log Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsBar data={timeChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="activity" />
                    <YAxis />
                    <Tooltip formatter={(value) => [Number(value).toFixed(1), "Hours"]} />
                    <Bar dataKey="hours" fill="#8b5cf6" />
                  </RechartsBar>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {timeChartData.map((activity: any, index) => (
                  <div key={`time-${activity.activity}-${index}`} className="p-4 bg-gray-50 rounded-lg">
                    <div className="font-medium text-gray-900">{activity.activity}</div>
                    <div className="text-2xl font-bold text-purple-600">{activity.hours.toFixed(1)}h</div>
                    <div className="text-sm text-gray-500">{activity.count} entries</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comprehensive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Comprehensive Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total Revenue</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {formatCurrency((commissions as any[]).reduce((sum: number, c: any) => sum + parseFloat(c.amount || '0'), 0))}
                  </div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-red-600 font-medium">Total Expenses</div>
                  <div className="text-2xl font-bold text-red-900">
                    {formatCurrency((expenses as any[]).reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0) + mileageGasCosts)}
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Properties Closed</div>
                  <div className="text-2xl font-bold text-green-900">
                    {(properties as any[]).filter((p: any) => p.status === 'closed').length}
                  </div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-purple-600 font-medium">Total Hours</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {(timeEntries as any[]).reduce((sum: number, t: any) => sum + parseFloat(t.hours || '0'), 0).toFixed(1)}
                  </div>
                </div>
              </div>

              <div className="prose max-w-none">
                <h3>Performance Summary</h3>
                <p>
                  This comprehensive report provides an overview of your real estate business performance 
                  including revenue, expenses, closed properties, and time investment.
                </p>
                
                <h4>Key Metrics</h4>
                <ul>
                  <li>Average commission per deal: {formatCurrency((commissions as any[]).length > 0 ? (commissions as any[]).reduce((sum: number, c: any) => sum + parseFloat(c.amount || '0'), 0) / (commissions as any[]).length : 0)}</li>
                  <li>Average days on market: {salesData.length > 0 ? Math.round(salesData.reduce((sum: number, sale: any) => sum + sale.daysOnMarket, 0) / salesData.length) : 0} days</li>
                  <li>Expense ratio: {formatPercentage((commissions as any[]).length > 0 ? (((expenses as any[]).reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0) + mileageGasCosts) / (commissions as any[]).reduce((sum: number, c: any) => sum + parseFloat(c.amount || '0'), 0)) * 100 : 0)}</li>
                  <li>Total mileage gas costs: {formatCurrency(mileageGasCosts)}</li>
                  <li>Total miles tracked: {(mileageLogs as any[]).reduce((total: number, log: any) => total + parseFloat(log.miles || '0'), 0).toFixed(1)} miles</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
