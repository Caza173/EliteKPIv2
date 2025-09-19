import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, Clock, MapPin, DollarSign, User, Activity as ActivityIcon, TrendingUp, Receipt, Car, Plus, Edit3, Save, X, ExternalLink, Home } from "lucide-react";
import type { Property, Activity, TimeEntry, Expense, Commission, MileageLog } from "@shared/schema";
import { insertPropertySchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AddMileageModal from "@/components/modals/add-mileage-modal";
import TimeEntryModal from "@/components/modals/time-entry-modal";
import AddCommissionModal from "@/components/modals/add-commission-modal";
import AddressAutocomplete from "@/components/ui/address-autocomplete";
import PropertyROIAnalysis from "./property-roi-analysis";

interface PropertyDetailsSheetProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyDetailsSheet({
  property,
  isOpen,
  onClose,
}: PropertyDetailsSheetProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form for editing property
  const form = useForm({
    resolver: zodResolver(insertPropertySchema.partial()),
    defaultValues: {
      address: property?.address || "",
      city: property?.city || "",
      state: property?.state || "",
      zipCode: property?.zipCode || "",
      clientName: property?.clientName || "",
      representationType: property?.representationType || "buyer_rep",
      propertyType: property?.propertyType || "single_family",
      bedrooms: property?.bedrooms || "",
      bathrooms: property?.bathrooms || "",
      squareFeet: property?.squareFeet || "",
      listingPrice: property?.listingPrice || "",
      offerPrice: property?.offerPrice || "",
      acceptedPrice: property?.acceptedPrice || "",
      soldPrice: property?.soldPrice || "",
      commissionRate: property?.commissionRate || "",
      leadSource: property?.leadSource || "",
      notes: property?.notes || "",
      listingDate: property?.listingDate || "",
      soldDate: property?.soldDate || "",
    },
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      if (!property?.id) throw new Error('Property ID is required');
      await apiRequest("PATCH", `/api/properties/${property.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    updatePropertyMutation.mutate(data);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    form.reset();
  };

  const { data: activities = [], isLoading: activitiesLoading } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
    retry: false,
    enabled: isOpen,
  });

  const { data: timeEntries = [], isLoading: timeLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
    retry: false,
    enabled: isOpen,
  });

  const { data: expenses = [], isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    retry: false,
    enabled: isOpen,
  });

  const { data: commissions = [], isLoading: commissionsLoading } = useQuery<Commission[]>({
    queryKey: ["/api/commissions"],
    retry: false,
    enabled: isOpen,
  });

  const { data: mileageLogs = [], isLoading: mileageLoading } = useQuery<MileageLog[]>({
    queryKey: ["/api/mileage-logs"],
    retry: false,
    enabled: isOpen,
  });

  // Early return if no property
  if (!property) {
    return null;
  }

  // Filter data for this property
  const propertyActivities = activities.filter(
    (activity) => activity.propertyId === property.id
  );

  const propertyTimeEntries = timeEntries.filter(
    (entry) => entry.propertyId === property.id
  );

  const propertyExpenses = expenses.filter(
    (expense) => expense.propertyId === property.id
  );

  const propertyCommissions = commissions.filter(
    (commission) => commission.propertyId === property.id
  );

  const propertyMileage = mileageLogs.filter(
    (mileage) => mileage.propertyId === property.id
  );



  const formatCurrency = (amount: string | null) => {
    if (!amount) return "Not set";
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString();
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const getActivityTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      call: "Phone Call",
      email: "Email",
      text: "Text Message",
      buyer_appointment: "Buyer Appointment", 
      listing_appointment: "Listing Appointment",
      buyer_signed: "Buyer Agreement Signed",
      listing_taken: "Listing Agreement Signed",
      offer_written: "Offer Written",
      offer_accepted: "Offer Accepted",
      inspection: "Property Inspection",
      appraisal: "Appraisal",
      closing: "Closing",
      other: "Other Activity"
    };
    return types[type] || type;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      in_progress: { label: "In Progress", variant: "secondary" },
      listed: { label: "Listed", variant: "default" },
      offer_written: { label: "Offer Written", variant: "outline" },
      active_under_contract: { label: "Under Contract", variant: "default" },
      pending: { label: "Pending", variant: "default" },
      closed: { label: "Closed", variant: "default" },
      lost_deal: { label: "Lost Deal", variant: "destructive" },
      withdrawn: { label: "Withdrawn", variant: "secondary" },
      expired: { label: "Expired", variant: "destructive" },
      terminated: { label: "Terminated", variant: "destructive" },
      fired_client: { label: "Fired Client", variant: "destructive" },
      got_fired: { label: "Got Fired", variant: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.in_progress;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const totalHours = propertyTimeEntries.reduce(
    (sum, entry) => sum + parseFloat(entry.hours || "0"),
    0
  );

  const totalExpenses = propertyExpenses.reduce((sum, expense) => {
    return sum + parseFloat(expense.amount || "0");
  }, 0);

  const totalCommissions = propertyCommissions.reduce((sum, commission) => {
    return sum + parseFloat(commission.amount || "0");
  }, 0);

  const totalMiles = propertyMileage.reduce((sum, mileage) => {
    return sum + parseFloat(mileage.miles || "0");
  }, 0);

  const hourlyRate = 235; // $235/hour rate for time calculation
  const timeInvestment = totalHours * hourlyRate;
  const netProfit = totalCommissions - totalExpenses;
  const roi = totalExpenses > 0 ? ((netProfit / (totalExpenses + timeInvestment)) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[85vw] h-[75vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {property.address}
          </DialogTitle>
          <DialogDescription>
            Property details, activities, and time tracking
          </DialogDescription>
        </DialogHeader>

        {/* Zillow Link and Visual Listing */}
        <div className="mt-6 space-y-4">
          {/* Zillow Link */}
          <div className="flex items-center justify-center">
            <a 
              href={`https://www.zillow.com/homes/${encodeURIComponent(property.address)}_rb/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 hover:bg-gray-50 text-black px-4 py-2 rounded-lg transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              View on Zillow
            </a>
          </div>

          {/* Visual Listing Display */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-dashed border-blue-200 dark:border-blue-800 rounded-lg p-8">
            <div className="text-center space-y-4">
              {/* Property Visual */}
              <div className="mx-auto w-48 h-32 rounded-lg overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
                {property.imageUrl ? (
                  <img 
                    src={property.imageUrl} 
                    alt={property.address}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="flex items-center justify-center w-full h-full"><svg class="h-12 w-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m3 12 2-2m0 0 7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg></div>';
                    }}
                  />
                ) : (
                  <Home className="h-12 w-12 text-white" />
                )}
              </div>
              
              {/* Property Details */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {property.address}
                </h3>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                  {property.bedrooms && (
                    <span className="flex items-center gap-1">
                      🛏️ {property.bedrooms} bed
                    </span>
                  )}
                  {property.bathrooms && (
                    <span className="flex items-center gap-1">
                      🛿 {property.bathrooms} bath
                    </span>
                  )}
                  {property.squareFeet && (
                    <span className="flex items-center gap-1">
                      📐 {property.squareFeet} sq ft
                    </span>
                  )}
                </div>
                
                {/* Price and Status */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  {property.listingPrice && (
                    <div className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                      ${parseInt(property.listingPrice).toLocaleString()}
                    </div>
                  )}
                  <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {property.representationType === 'buyer_rep' ? 'Buyer Rep' : 'Seller Rep'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Property Overview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Property Overview</h3>
              <div className="flex items-center gap-2">
                {getStatusBadge(property.status || 'in_progress')}
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    Edit Details
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditCancel}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50"
                      onClick={form.handleSubmit(onSubmit)}
                      disabled={updatePropertyMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      {updatePropertyMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
            
            {!isEditing ? (
              // View Mode
              <>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <div className="font-medium text-black">{property.clientName || 'Not specified'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <div className="font-medium text-black">
                      {property.representationType === 'buyer_rep' ? 'Buyer Rep' : 'Seller Rep'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bedrooms:</span>
                    <div className="font-medium text-black">{property.bedrooms || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Bathrooms:</span>
                    <div className="font-medium text-black">{property.bathrooms || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Square Feet:</span>
                    <div className="font-medium text-black">
                      {property.squareFeet ? `${property.squareFeet} sq ft` : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Listing Price:</span>
                    <div className="font-medium text-black">{formatCurrency(property.listingPrice)}</div>
                  </div>
                </div>

                {property.listingDate && (
                  <div className="text-sm">
                    <span className="text-gray-600">Listed:</span>
                    <span className="ml-2 font-medium text-black">{formatDate(property.listingDate)}</span>
                  </div>
                )}

                {property.soldDate && (
                  <div className="text-sm">
                    <span className="text-gray-600">Sold:</span>
                    <span className="ml-2 font-medium text-black">{formatDate(property.soldDate)}</span>
                    {property.soldPrice && (
                      <span className="ml-4 font-medium text-green-600">
                        {formatCurrency(property.soldPrice)}
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Edit Mode
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <AddressAutocomplete
                              value={field.value}
                              onChange={field.onChange}
                              onAddressSelect={(addressComponents) => {
                                // Auto-populate city, state, and zip code fields for backend
                                if (addressComponents.city) {
                                  form.setValue("city", addressComponents.city);
                                }
                                if (addressComponents.state) {
                                  form.setValue("state", addressComponents.state);
                                }
                                if (addressComponents.zipCode) {
                                  form.setValue("zipCode", addressComponents.zipCode);
                                }
                              }}
                              placeholder="Enter full address..."
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Client Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Hidden fields for backend compatibility */}
                  <div className="hidden">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} maxLength={2} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="representationType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Representation Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="buyer_rep">Buyer Rep</SelectItem>
                              <SelectItem value="seller_rep">Seller Rep</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="propertyType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Property Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="single_family">Single Family</SelectItem>
                              <SelectItem value="condo">Condo</SelectItem>
                              <SelectItem value="townhouse">Townhouse</SelectItem>
                              <SelectItem value="multi_family">Multi-Family</SelectItem>
                              <SelectItem value="land">Land</SelectItem>
                              <SelectItem value="commercial">Commercial</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="bedrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bedrooms</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bathrooms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bathrooms</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.5" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="squareFeet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Square Feet</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="listingPrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Price</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="commissionRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Commission Rate (%)</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" step="0.01" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea {...field} rows={3} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          </div>

          <Separator />

          {/* Enhanced 3-Tab System */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50 data-[state=active]:bg-blue-50">
                <User className="h-4 w-4" />
                Overview & Financial
              </TabsTrigger>
              <TabsTrigger value="commissions" className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50 data-[state=active]:bg-blue-50">
                <DollarSign className="h-4 w-4" />
                Commissions
              </TabsTrigger>
              <TabsTrigger value="expenses" className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50 data-[state=active]:bg-blue-50">
                <Receipt className="h-4 w-4" />
                Expenses & Time
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="text-green-600 dark:text-green-400 text-2xl font-bold">
                    ${property.listingPrice ? parseInt(property.listingPrice).toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Listed Price</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <div className="text-blue-600 dark:text-blue-400 text-2xl font-bold">
                    ${property.soldPrice ? parseInt(property.soldPrice).toLocaleString() : '0'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Sold Price</div>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
                <div className="text-purple-600 dark:text-purple-400 text-lg font-semibold mb-2">
                  {property.listingDate && formatDate(property.listingDate)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Listed Date</div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Client Name</span>
                  <span className="font-medium">{property.clientName || 'Not specified'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Representation</span>
                  <Badge>{property.representationType === 'buyer_rep' ? 'Buyer' : 'Seller'}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Property Type</span>
                  <span className="font-medium">{property.propertyType?.replace('_', ' ') || 'Not specified'}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Sale Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Sold Date</span>
                    <span className="text-sm">{property.soldDate ? formatDate(property.soldDate) : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Transaction Period</span>
                    <span className="text-sm">N/A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Commission Rate</span>
                    <span className="text-sm">{property.commissionRate || '3'}%</span>
                  </div>
                </div>
              </div>

              {/* Property ROI Analysis */}
              <div className="border-t pt-4">
                <PropertyROIAnalysis 
                  property={property}
                  commissions={propertyCommissions}
                  expenses={propertyExpenses}
                  timeEntries={propertyTimeEntries}
                />
              </div>
            </TabsContent>

            {/* Commissions Tab */}
            <TabsContent value="commissions" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-orange-600">
                  Commissions for {property.address}
                </h3>
                <Button 
                  size="sm" 
                  className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50"
                  onClick={() => setActiveModal("commission")}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Commission
                </Button>
              </div>

              <div className="bg-green-50 dark:bg-green-950 p-6 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  ${totalCommissions.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Commissions</div>
              </div>

              {commissionsLoading ? (
                <div className="space-y-3">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : propertyCommissions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No commissions recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {propertyCommissions.map((commission) => (
                    <div key={commission.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">${parseFloat(commission.amount).toLocaleString()}</div>
                          <div className="text-sm text-gray-600">{formatDate(commission.dateEarned)}</div>
                          {commission.notes && (
                            <div className="text-sm text-gray-500 mt-1">{commission.notes}</div>
                          )}
                        </div>
                        <Badge variant="outline">{commission.type.replace('_', ' ')}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Expenses Tab */}
            <TabsContent value="expenses" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Expenses, Mileage & Time</h3>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50"
                    onClick={() => setActiveModal("mileage")}
                  >
                    <Car className="h-4 w-4 mr-1" />
                    Log Mileage
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50"
                    onClick={() => setActiveModal("time")}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Log Hours
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg text-center">
                  <Receipt className="h-6 w-6 text-red-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Expenses</div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg text-center">
                  <Car className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{totalMiles.toFixed(0)}</div>
                  <div className="text-sm text-gray-600">Total Miles</div>
                </div>
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg text-center">
                  <Clock className="h-6 w-6 text-green-600 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{totalHours.toFixed(1)}</div>
                  <div className="text-sm text-gray-600">Hours Worked</div>
                </div>
              </div>

              {/* Expenses List */}
              <div className="space-y-3">
                <h4 className="font-medium text-orange-600">📄 Expenses ({propertyExpenses.length})</h4>
                {propertyExpenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Receipt className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No expenses recorded for this property.</p>
                  </div>
                ) : (
                  propertyExpenses.map((expense) => (
                    <div key={expense.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">${parseFloat(expense.amount).toFixed(2)}</div>
                          <div className="text-sm text-gray-600">{expense.category.replace('_', ' ')}</div>
                          <div className="text-sm text-gray-500">{formatDate(expense.date)}</div>
                        </div>
                        <Badge variant="outline">{expense.description}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Mileage List */}
              <div className="space-y-3">
                <h4 className="font-medium text-orange-600">🚗 Mileage Log ({propertyMileage.length})</h4>
                {propertyMileage.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Car className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No mileage logged for this property.</p>
                  </div>
                ) : (
                  propertyMileage.map((mileage) => (
                    <div key={mileage.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{parseFloat(mileage.miles).toFixed(1)} miles</div>
                          <div className="text-sm text-gray-600">{formatDate(mileage.date)}</div>
                          <div className="text-sm text-gray-500">{mileage.purpose}</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Time Entries */}
              <div className="space-y-3">
                <h4 className="font-medium text-green-600">⏰ Time Entries ({propertyTimeEntries.length})</h4>
                {timeLoading ? (
                  <div className="space-y-3">
                    {Array(3).fill(0).map((_, i) => (
                      <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : propertyTimeEntries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    <p>No time entries recorded for this property.</p>
                  </div>
                ) : (
                  propertyTimeEntries.map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{entry.activity}</div>
                          <div className="text-sm text-gray-600">{formatDate(entry.date)}</div>
                          {entry.description && (
                            <div className="text-sm text-gray-500 mt-1">{entry.description}</div>
                          )}
                        </div>
                        <Badge variant="outline">{parseFloat(entry.hours).toFixed(1)}h</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>

      <AddMileageModal 
        isOpen={activeModal === "mileage"} 
        onClose={() => setActiveModal(null)}
        propertyId={property.id}
      />
      <TimeEntryModal 
        isOpen={activeModal === "time"} 
        onClose={() => setActiveModal(null)}
        propertyId={property.id}
      />
      <AddCommissionModal 
        isOpen={activeModal === "commission"} 
        onClose={() => setActiveModal(null)}
        propertyId={property.id}
      />
    </Dialog>
  );
}