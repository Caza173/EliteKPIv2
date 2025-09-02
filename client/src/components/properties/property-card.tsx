import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MoreHorizontal, MapPin, Bed, Bath, Square, Eye, FileText, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import PropertyDetailsSheet from "./property-details-sheet";
import ClosePropertyModal from "./close-property-modal";
import type { Property } from "@shared/schema";
import { PROPERTY_STATUSES } from "@/lib/constants";

interface PropertyCardProps {
  property: Property;
}

export default function PropertyCard({ property }: PropertyCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: Partial<Property>) => {
      await apiRequest("PATCH", `/api/properties/${property.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Property updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update property",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'closed') {
      setIsCloseModalOpen(true);
      return;
    }
    setIsUpdating(true);
    updatePropertyMutation.mutate({ status: newStatus as any });
    setIsUpdating(false);
  };

  const handleOfferWritten = () => {
    updatePropertyMutation.mutate({ status: 'offer_written' });
  };

  const handleOfferAccepted = () => {
    updatePropertyMutation.mutate({ status: 'active_under_contract' });
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
    };

    const config = statusConfig[status] || statusConfig.in_progress;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return "Not set";
    return `$${parseFloat(amount).toLocaleString()}`;
  };

  const getDisplayPrice = () => {
    if (property.representationType === 'buyer_rep') {
      return property.acceptedPrice || property.offerPrice || 'No offer yet';
    } else {
      return property.listingPrice || 'Not listed';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between min-w-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 min-w-0">
              <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
              <h3 className="font-semibold text-gray-900 truncate">{property.address}</h3>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 text-sm text-gray-600 flex-wrap">
              <span className="flex items-center gap-1 flex-shrink-0">
                <Bed className="h-4 w-4" />
                {property.bedrooms || 'N/A'}
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Bath className="h-4 w-4" />
                {property.bathrooms || 'N/A'}
              </span>
              <span className="flex items-center gap-1 flex-shrink-0">
                <Square className="h-4 w-4" />
                <span className="hidden sm:inline">{property.squareFeet ? `${property.squareFeet} sq ft` : 'N/A'}</span>
                <span className="sm:hidden">{property.squareFeet ? `${property.squareFeet}sf` : 'N/A'}</span>
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {getStatusBadge(property.status || 'in_progress')}
            <Badge variant="outline">
              {property.representationType === 'buyer_rep' ? 'Buyer Rep' : 'Seller Rep'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <FinancialSummary property={property} />
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Price</p>
            <p className="font-medium">
              {formatCurrency(getDisplayPrice() as string)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Client</p>
            <p className="font-medium">{property.clientName || 'Not specified'}</p>
          </div>
        </div>

        {/* Action Buttons - Only show Write Offer for buyer representation */}
        <div className="flex items-center gap-2 mb-3">
          {property.representationType === 'buyer_rep' && (property.status === 'in_progress' || property.status === 'listed') && (
            <Button 
              size="sm" 
              variant="default"
              onClick={handleOfferWritten}
              disabled={updatePropertyMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <FileText className="h-4 w-4 mr-1" />
              Write Offer
            </Button>
          )}
          
          {property.status === 'offer_written' && (
            <Button 
              size="sm" 
              variant="default"
              onClick={handleOfferAccepted}
              disabled={updatePropertyMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-1" />
              Offer Accepted
            </Button>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Select
            value={property.status || 'in_progress'}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Update status" />
            </SelectTrigger>
            <SelectContent>
              {PROPERTY_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsDetailsOpen(true)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <PropertyDetailsSheet 
        property={property}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
      />
      
      <ClosePropertyModal
        property={{...property, listingPrice: property.listingPrice || undefined}}
        isOpen={isCloseModalOpen}
        onClose={() => setIsCloseModalOpen(false)}
      />
    </Card>
  );
}

// Financial Summary Component
function FinancialSummary({ property }: { property: any }) {
  const { data: commissions = [] } = useQuery({
    queryKey: ["/api/commissions"],
  });

  const { data: expenses = [] } = useQuery({
    queryKey: ["/api/expenses"],
  });

  const propertyCommissions = (commissions as any[]).filter((c: any) => c.propertyId === property.id);
  const propertyExpenses = (expenses as any[]).filter((e: any) => e.propertyId === property.id);

  const totalCommission = propertyCommissions.reduce((sum: number, c: any) => sum + parseFloat(c.amount || '0'), 0);
  const totalExpenses = propertyExpenses.reduce((sum: number, e: any) => sum + parseFloat(e.amount || '0'), 0);
  const roi = totalCommission > 0 ? ((totalCommission - totalExpenses) / totalExpenses * 100) : 0;

  if (totalCommission === 0 && totalExpenses === 0) return null;

  return (
    <div className="bg-gray-50 rounded-lg p-3 mb-4">
      <div className="grid grid-cols-3 gap-3 text-center">
        <div>
          <p className="text-xs text-gray-500">Commission</p>
          <p className="font-semibold text-green-600">${totalCommission.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Expenses</p>
          <p className="font-semibold text-red-600">${totalExpenses.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">ROI</p>
          <p className={`font-semibold ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {isFinite(roi) ? `${roi.toFixed(1)}%` : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
