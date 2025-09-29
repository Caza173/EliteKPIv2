import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Settings, DollarSign, Car, Clock, Percent, Save, Database, Globe, CheckCircle, AlertCircle, Shield } from "lucide-react";
import ChangePasswordForm from "@/components/auth/change-password-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import { z } from "zod";

const userSettingsSchema = z.object({
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  vehicleMpg: z.string().min(1, "Vehicle MPG is required"),
  avgGasPrice: z.string().min(1, "Average gas price is required"),
  defaultCommissionSplit: z.string().min(1, "Commission split is required"),
});

type UserSettings = z.infer<typeof userSettingsSchema>;

export default function UserSettings() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreatingDemo, setIsCreatingDemo] = useState(false);

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

  const { data: user, isLoading: userLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  // Fetch data sources status
  const { data: dataSourcesStatus } = useQuery({
    queryKey: ["/api/data-sources/status"],
    // Removed automatic polling to prevent authentication loops
    // refetchInterval: 30000, // Refresh every 30 seconds
    retry: false,
  });

  if (error && isUnauthorizedError(error as Error)) {
    toast({
      title: "Unauthorized",
      description: "You are logged out. Logging in again...",
      variant: "destructive",
    });
    setTimeout(() => {
      window.location.href = "/api/login";
    }, 500);
    return null;
  }

  const form = useForm<UserSettings>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      hourlyRate: "",
      vehicleMpg: "",
      avgGasPrice: "",
      defaultCommissionSplit: "",
    },
  });

  // Update form when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        hourlyRate: user?.hourlyRate || "75.00",
        vehicleMpg: user?.vehicleMpg || "25.00",
        avgGasPrice: user?.avgGasPrice || "3.50",
        defaultCommissionSplit: user?.defaultCommissionSplit || "70.00",
      });
    }
  }, [user, form]);

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: UserSettings) => {
      const processedData = {
        hourlyRate: parseFloat(data.hourlyRate),
        vehicleMpg: parseFloat(data.vehicleMpg),
        avgGasPrice: parseFloat(data.avgGasPrice),
        defaultCommissionSplit: parseFloat(data.defaultCommissionSplit),
      };
      
      await apiRequest("PATCH", "/api/auth/user", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: UserSettings) => {
    updateSettingsMutation.mutate(data);
  };

  if (userLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="bg-white h-64 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Configure your default values and preferences</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Financial Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="hourlyRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Hourly Rate ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="75.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Used to calculate time value in ROI calculations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="defaultCommissionSplit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Commission Split (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="70"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Your default split percentage with your brokerage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Vehicle Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="vehicleMpg"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle MPG</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          placeholder="25.0"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Miles per gallon for your primary vehicle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="avgGasPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Gas Price ($)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="3.50"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Average price per gallon in your area
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name</Label>
                    <Input value={user?.firstName || "Not provided"} disabled />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input value={user?.lastName || "Not provided"} disabled />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={user?.email || "Not provided"} disabled />
                </div>
                <p className="text-sm text-gray-500">
                  Account information is managed through your profile settings
                </p>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-md mx-auto">
                  <ChangePasswordForm />
                </div>
              </CardContent>
            </Card>

            {/* Demo Data */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Demo Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-4">
                      Get started quickly with sample properties, activities, commissions, and expenses. 
                      This will create realistic data that matches across all tabs for demonstration purposes.
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Note: Competitive rank is only available for agents who use EliteKPI platform.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      type="button"
                      onClick={async () => {
                        setIsCreatingDemo(true);
                        try {
                          const response = await apiRequest("POST", "/api/demo/create");
                          if (response.ok) {
                            toast({
                              title: "Demo Data Created",
                              description: "Sample data has been added to all tabs for demonstration purposes",
                            });
                            // Invalidate all queries to refresh data
                            queryClient.invalidateQueries();
                          } else {
                            throw new Error("Failed to create demo data");
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to create demo data. Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsCreatingDemo(false);
                        }
                      }}
                      disabled={isCreatingDemo}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      {isCreatingDemo ? "Creating..." : "Create Sample Data"}
                    </Button>
                    
                    <Button
                      type="button"
                      onClick={async () => {
                        setIsCreatingDemo(true);
                        try {
                          const response = await apiRequest("POST", "/api/demo/clear");
                          if (response.ok) {
                            toast({
                              title: "Data Cleared",
                              description: "All sample data has been removed from your account",
                            });
                            // Invalidate all queries to refresh data
                            queryClient.invalidateQueries();
                          } else {
                            throw new Error("Failed to clear demo data");
                          }
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Failed to clear data. Please try again.",
                            variant: "destructive",
                          });
                        } finally {
                          setIsCreatingDemo(false);
                        }
                      }}
                      disabled={isCreatingDemo}
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Database className="h-4 w-4 mr-2" />
                      {isCreatingDemo ? "Clearing..." : "Clear Sample Data"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Usage Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Account Created</div>
                    <div className="font-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600">Last Updated</div>
                    <div className="font-medium">
                      {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : "Unknown"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* How Settings Are Used */}
            <Card>
              <CardHeader>
                <CardTitle>How These Settings Are Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Hourly Rate</div>
                      <div className="text-gray-600">
                        Used to calculate the value of time spent on properties for ROI calculations
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Percent className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Commission Split</div>
                      <div className="text-gray-600">
                        Pre-fills the GCI calculator and used for commission projections
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Car className="h-4 w-4 text-purple-500 mt-0.5" />
                    <div>
                      <div className="font-medium">Vehicle Settings</div>
                      <div className="text-gray-600">
                        Auto-calculates gas costs for showings and mileage tracking
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={updateSettingsMutation.isPending}
              className="w-full"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </Form>

        {/* Data Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Real-Time Market Data Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              {dataSourcesStatus?.sources?.map((source: any, index: number) => {
                const isAttom = source.name === 'ATTOM Data Solutions';
                const statusColor = source.status === 'active' ? 'green' : source.status === 'error' ? 'red' : 'blue';
                const bgColor = `bg-${statusColor}-50`;
                const borderColor = `border-${statusColor}-200`;
                const textColor = `text-${statusColor}-800`;
                const statusIcon = source.status === 'active' ? CheckCircle : AlertCircle;
                
                return (
                  <div key={index} className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <statusIcon className={`h-5 w-5 text-${statusColor}-600 mt-0.5`} />
                        <div>
                          <div className={`font-semibold ${textColor} flex items-center gap-2`}>
                            {source.name}
                            <span className={`text-xs px-2 py-1 rounded-full bg-${statusColor}-100 text-${statusColor}-700 font-medium`}>
                              {source.status.toUpperCase()}
                            </span>
                          </div>
                          <div className={`text-${statusColor}-700 mb-2`}>{source.description}</div>
                          <div className={`text-${statusColor}-600 text-xs space-y-1`}>
                            {isAttom ? (
                              <>
                                <div>• 158+ million property records nationwide</div>
                                <div>• Real-time sales prices and market trends</div>
                                <div>• Days on market and inventory levels</div>
                                <div>• Price per square foot calculations</div>
                                <div>• Automated market condition analysis</div>
                              </>
                            ) : (
                              <>
                                <div>• Regional market patterns based on historical data</div>
                                <div>• Statistical modeling for realistic price ranges</div>
                                <div>• Geographic variations for metro areas</div>
                                <div>• Seasonal adjustment factors</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className={`text-xs text-${statusColor}-600`}>
                        Coverage: {source.coverage}
                      </div>
                    </div>
                  </div>
                );
              }) || (
                // Fallback static display when API is loading
                <>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-green-800">ATTOM Data Solutions</div>
                        <div className="text-green-700 mb-2">Primary residential sales market data provider</div>
                        <div className="text-green-600 text-xs space-y-1">
                          <div>• 158+ million property records nationwide</div>
                          <div>• Real-time sales prices and market trends</div>
                          <div>• Days on market and inventory levels</div>
                          <div>• Price per square foot calculations</div>
                          <div>• Automated market condition analysis</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-blue-800">Fallback System</div>
                        <div className="text-blue-700 mb-2">High-quality backup data when primary source unavailable</div>
                        <div className="text-blue-600 text-xs space-y-1">
                          <div>• Regional market patterns based on historical data</div>
                          <div>• Statistical modeling for realistic price ranges</div>
                          <div>• Geographic variations for metro areas</div>
                          <div>• Seasonal adjustment factors</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border rounded-lg p-3">
                  <div className="font-medium text-gray-800 mb-2">Coverage Areas</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• All 50 US states</div>
                    <div>• 3,000+ counties</div>
                    <div>• 40,000+ ZIP codes</div>
                    <div>• Major metropolitan areas</div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-3">
                  <div className="font-medium text-gray-800 mb-2">Update Frequency</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>• Market trends: Daily</div>
                    <div>• Sales data: Weekly</div>
                    <div>• Inventory levels: Real-time</div>
                    <div>• Price analysis: Monthly</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border rounded-lg p-3">
                <div className="font-medium text-gray-800 mb-2">Data Usage Policy</div>
                <div className="text-xs text-gray-600">
                  Market data is provided for business intelligence and competitive analysis purposes only. 
                  Data is refreshed automatically and cached for optimal performance. All data sources 
                  comply with fair use policies and are licensed for real estate professional use.
                </div>
              </div>

              {dataSourcesStatus?.lastChecked && (
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>Status last checked: {new Date(dataSourcesStatus.lastChecked).toLocaleString()}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/data-sources/status"] })}
                    className="text-xs h-6 px-2"
                  >
                    Refresh Status
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
