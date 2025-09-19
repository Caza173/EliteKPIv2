import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/calculations";
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Home, 
  TrendingUp,
  X
} from "lucide-react";

interface LeadSourcePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadSource: string | null;
  rawLeadSource: string | null;
}

interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  status: string;
  listPrice: number;
  salePrice?: number;
  dateAdded: string;
  closingDate?: string;
  leadSource: string;
}

interface LeadSourcePropertiesData {
  leadSource: string;
  rawLeadSource: string;
  properties: Property[];
  count: number;
}

export default function LeadSourcePropertiesModal({ 
  isOpen, 
  onClose, 
  leadSource, 
  rawLeadSource 
}: LeadSourcePropertiesModalProps) {
  
  const { data: leadSourceData, isLoading } = useQuery<LeadSourcePropertiesData>({
    queryKey: ["/api/properties/by-lead-source", rawLeadSource],
    queryFn: async () => {
      if (!rawLeadSource) return null;
      const response = await fetch(`/api/properties/by-lead-source/${rawLeadSource}`);
      if (!response.ok) throw new Error('Failed to fetch properties');
      return response.json();
    },
    enabled: isOpen && !!rawLeadSource,
  });

  const properties = leadSourceData?.properties || [];

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'closed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_contract':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'withdrawn':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Unknown';
  };

  const totalValue = properties.reduce((sum, property) => {
    return sum + (property.salePrice || property.listPrice || 0);
  }, 0);

  const closedProperties = properties.filter(p => p.status?.toLowerCase() === 'closed');
  const activeProperties = properties.filter(p => 
    ['active', 'under_contract', 'pending'].includes(p.status?.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <DialogTitle className="text-xl font-bold text-black">
              Properties from {leadSource}
            </DialogTitle>
            <p className="text-sm text-gray-600 mt-1">
              {properties.length} {properties.length === 1 ? 'property' : 'properties'} found
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Loading properties...</p>
            </div>
          </div>
        ) : properties.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Home className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm text-gray-600">No properties found for this lead source</p>
            </div>
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-xs font-medium text-gray-600">Total Value</span>
                  </div>
                  <div className="text-lg font-bold text-black mt-1">
                    {formatCurrency(totalValue)}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Home className="h-4 w-4 text-blue-500" />
                    <span className="text-xs font-medium text-gray-600">Closed</span>
                  </div>
                  <div className="text-lg font-bold text-black mt-1">
                    {closedProperties.length}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-orange-500" />
                    <span className="text-xs font-medium text-gray-600">Active</span>
                  </div>
                  <div className="text-lg font-bold text-black mt-1">
                    {activeProperties.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator className="mb-4" />

            {/* Properties List */}
            <div className="space-y-3">
              {properties.map((property) => (
                <Card key={property.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-black">
                            {property.address}
                          </h3>
                          <Badge className={getStatusColor(property.status)}>
                            {formatStatus(property.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-3 w-3" />
                            <span>{property.city}, {property.state} {property.zipCode}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Home className="h-3 w-3" />
                            <span>{property.propertyType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-3 w-3 text-green-600" />
                            <span className="text-black font-medium">
                              List: {formatCurrency(property.listPrice || 0)}
                            </span>
                          </div>
                          {property.salePrice && (
                            <div className="flex items-center space-x-1">
                              <TrendingUp className="h-3 w-3 text-blue-600" />
                              <span className="text-black font-medium">
                                Sale: {formatCurrency(property.salePrice)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Added: {new Date(property.dateAdded).toLocaleDateString()}
                          </span>
                        </div>
                        {property.closingDate && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              Closed: {new Date(property.closingDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
        
        <div className="flex justify-end pt-4">
          <Button 
            onClick={onClose} 
            className="bg-white border-2 border-blue-600 text-black hover:bg-gray-50"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
