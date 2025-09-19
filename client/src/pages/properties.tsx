import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, Calendar, Users, TrendingUp, Building, Clock, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import PropertyCard from "@/components/properties/property-card";
import AddPropertyModal from "@/components/properties/add-property-modal";
import TestModal from "@/components/properties/test-modal";
import ScheduleShowingModal from "@/components/modals/schedule-showing-modal";
import PropertyDetailsSheet from "@/components/properties/property-details-sheet";
import type { Property, Activity } from "@shared/schema";

export default function Properties() {
  console.log("Properties component is mounting...");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isShowingModalOpen, setIsShowingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("showings");
  const [selectedPropertyAddress, setSelectedPropertyAddress] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Property status update mutations
  const updatePropertyMutation = useMutation({
    mutationFn: async ({ propertyId, updates }: { propertyId: string, updates: any }) => {
      await apiRequest("PATCH", `/api/properties/${propertyId}`, updates);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      
      // Special success message when moving property to buyers tab
      if (variables.updates.representationType === "buyer_rep") {
        toast({
          title: "Offer Accepted!",
          description: "Property moved to buyers tab and marked as under contract",
        });
      } else {
        toast({
          title: "Success",
          description: "Property updated successfully",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const handleSubmitOffer = (property: Property) => {
    updatePropertyMutation.mutate({
      propertyId: property.id,
      updates: { status: "offer_written" }
    });
  };

  const handleOfferAccepted = (property: Property) => {
    // When an offer is accepted, automatically move the property to buyers tab
    updatePropertyMutation.mutate({
      propertyId: property.id,
      updates: { 
        status: "active_under_contract",
        representationType: "buyer_rep" // Move from showings to buyers tab
      }
    });
  };

  const handleScheduleShowing = (propertyAddress: string) => {
    setSelectedPropertyAddress(propertyAddress);
    setIsShowingModalOpen(true);
  };


  const { data: properties = [], isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ["/api/activities"],
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

  // Filter properties by representation type
  const sellerProperties = (properties as Property[]).filter(p => p.representationType === 'seller_rep');
  const buyerProperties = (properties as Property[]).filter(p => p.representationType === 'buyer_rep');
  
  // Filter showing activities - only show activities for properties that are still seller_rep
  const showingActivities = (activities as Activity[]).filter(a => {
    if (a.type !== 'showing') return false;
    const property = (properties as Property[]).find(p => p.id === a.propertyId);
    return property && property.representationType === 'seller_rep';
  });

  // Group properties by status for each tab
  const groupPropertiesByStatus = (propertiesList: Property[]) => {
    return propertiesList.reduce((groups, property) => {
      const status = property.status || 'in_progress';
      if (!groups[status]) {
        groups[status] = [];
      }
      groups[status].push(property);
      return groups;
    }, {} as Record<string, Property[]>);
  };

  const groupedSellerProperties = groupPropertiesByStatus(sellerProperties);
  const groupedBuyerProperties = groupPropertiesByStatus(buyerProperties);

  const statusConfig = {
    in_progress: { title: "In Progress", color: "gray" },
    listed: { title: "Listed", color: "blue" },
    offer_written: { title: "Offer Written", color: "blue" },
    active_under_contract: { title: "Under Contract", color: "orange" },
    pending: { title: "Pending", color: "purple" },
    closed: { title: "Closed", color: "green" },
    lost_deal: { title: "Lost Deals", color: "red" },
    withdrawn: { title: "Withdrawn", color: "gray" },
    expired: { title: "Expired", color: "red" },
    terminated: { title: "Terminated", color: "red" },
    fired_client: { title: "Fired Client", color: "red" },
    got_fired: { title: "Got Fired", color: "red" },
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const renderPropertyPipeline = (groupedProperties: Record<string, Property[]>, emptyMessage: string) => (
    <div className="space-y-6">
      {Object.entries(statusConfig).map(([status, config]) => {
        const statusProperties = groupedProperties[status] || [];
        
        if (statusProperties.length === 0) return null;

        return (
          <div key={status} className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {config.title}
                </h2>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
                  {statusProperties.length}
                </span>
              </div>
            </div>
            <div className="p-4 space-y-4">
              {statusProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </div>
        );
      })}
      
      {Object.keys(groupedProperties).length === 0 && (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Home className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No {emptyMessage.toLowerCase()} yet</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first {emptyMessage.toLowerCase()} property.</p>
        </div>
      )}
    </div>
  );

  const renderShowings = () => (
    <div className="space-y-6">
      {showingActivities.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Recent Showings
                  </h2>
                  <p className="text-sm text-black">Your latest property showings</p>
                </div>
              </div>
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                {showingActivities.length} total
              </span>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {showingActivities.map((activity, index) => {
              const property = (properties as Property[]).find(p => p.id === activity.propertyId);
              return (
                <div key={activity.id} className="group hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl border border-gray-200 dark:border-gray-700 p-5 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 p-2 rounded-lg shrink-0">
                        <Home className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {property?.address || 'Property Address Not Found'}
                        </h3>
                        {property && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>{property.city}, {property.state}</span>
                            <span>•</span>
                            <span className="capitalize">{property.propertyType?.replace('_', ' ')}</span>
                          </div>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{activity.notes}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {new Date(activity.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Showing #{index + 1}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {property?.status === 'in_progress' && (
                        <Button 
                          size="sm" 
                          variant="default"
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleSubmitOffer(property)}
                        >
                          <FileText className="h-3 w-3 mr-1" />
                          Submit Offer
                        </Button>
                      )}
                      {property?.status === 'offer_written' && (
                        <Button 
                          size="sm" 
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleOfferAccepted(property)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Offer Accepted
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="bg-red-600 text-white hover:bg-red-700"
                        onClick={() => {
                          // Create a proper Zillow search URL with address and city
                          const address = property?.address || '';
                          const city = property?.city || '';
                          const state = property?.state || '';
                          
                          // Format the search query for Zillow
                          const searchQuery = `${address}, ${city}, ${state}`.replace(/,\s*$/, '');
                          const zillowUrl = `https://www.zillow.com/homes/${encodeURIComponent(searchQuery)}_rb/`;
                          window.open(zillowUrl, '_blank');
                        }}
                      >
                        🏠 View on Zillow
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className=""
                        onClick={() => {
                          if (property) {
                            setSelectedProperty(property);
                            setIsDetailsOpen(true);
                          }
                        }}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No showings yet</h3>
          <p className="text-gray-600 mb-4">Schedule your first property showing to get started.</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 min-h-screen" style={{ background: 'linear-gradient(135deg, #0a1a2a 0%, #1e3a8a 30%, #2563eb 60%, #ffffff 100%)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-black mb-2">Properties</h1>
              <p className="text-black">
                Manage your property pipeline from listing to closing
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setIsShowingModalOpen(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Add Showing
              </Button>
              <Button
                onClick={() => {
                  console.log('Add Property button clicked, isAddModalOpen:', isAddModalOpen);
                  setIsAddModalOpen(true);
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Property
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-sm">Total Properties</p>
                  <p className="text-2xl font-bold text-black">{(properties as Property[]).length}</p>
                </div>
                <Building className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-sm">Closed Properties</p>
                  <p className="text-2xl font-bold text-black">{(properties as Property[]).filter(p => p.status === 'closed').length}</p>
                </div>
                <Home className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-sm">Active Listings</p>
                  <p className="text-2xl font-bold text-black">{(properties as Property[]).filter(p => p.status === 'listed').length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-black text-sm">Recent Showings</p>
                  <p className="text-2xl font-bold text-black">{showingActivities.length}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="showings">Showings ({showingActivities.length})</TabsTrigger>
          <TabsTrigger value="sellers">Sellers ({sellerProperties.length})</TabsTrigger>
          <TabsTrigger value="buyers">Buyers ({buyerProperties.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="showings" className="space-y-6">
          {renderShowings()}
        </TabsContent>

        <TabsContent value="sellers" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Seller Property
            </Button>
          </div>
          {renderPropertyPipeline(groupedSellerProperties, "Seller properties")}
        </TabsContent>

        <TabsContent value="buyers" className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Buyer Property
            </Button>
          </div>
          {renderPropertyPipeline(groupedBuyerProperties, "Buyer properties")}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AddPropertyModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
      
      <ScheduleShowingModal 
        isOpen={isShowingModalOpen} 
        onClose={() => setIsShowingModalOpen(false)}
        selectedPropertyAddress={selectedPropertyAddress} 
      />
      
      <PropertyDetailsSheet
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      </div>
    </div>
  );
}
