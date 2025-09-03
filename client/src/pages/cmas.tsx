import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, TrendingUp, CheckCircle, XCircle, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/calculations";
import AddCmaModal from "@/components/modals/add-cma-modal";
import type { Cma } from "@shared/schema";

export default function Cmas() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

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

  const { data: cmas = [], isLoading: cmasLoading, error } = useQuery<Cma[]>({
    queryKey: ["/api/cmas"],
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

  const updateCmaMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      await fetch(`/api/cmas/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
        credentials: 'include',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cmas"] });
      toast({
        title: "Success",
        description: "CMA updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update CMA",
        variant: "destructive",
      });
    },
  });

  const convertToListingMutation = useMutation({
    mutationFn: async (cma: Cma) => {
      // Create property from CMA data
      const propertyData = {
        address: cma.address,
        city: cma.address.split(',')[1]?.trim() || '',
        state: cma.address.split(',')[2]?.trim().split(' ')[0] || '',
        zipCode: cma.address.split(',')[2]?.trim().split(' ')[1] || '',
        representationType: "seller_rep" as const,
        status: "in_progress" as const,
        propertyType: "single_family" as const,
        leadSource: "referral" as const,
        listingPrice: cma.suggestedListPrice ? parseFloat(cma.suggestedListPrice) : undefined,
        clientName: `CMA Client - ${cma.address.split(',')[0]}`,
        notes: `Converted from CMA. ${cma.notes || ''}`.trim(),
      };

      // Create the property
      const propertyResponse = await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(propertyData),
      });

      if (!propertyResponse.ok) {
        const errorData = await propertyResponse.json();
        throw new Error(`Failed to create property: ${errorData.message || 'Unknown error'}`);
      }

      const newProperty = await propertyResponse.json();

      // Update CMA status to converted_to_listing
      const cmaResponse = await fetch(`/api/cmas/${cma.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'converted_to_listing' }),
        credentials: 'include',
      });

      if (!cmaResponse.ok) {
        throw new Error('Failed to update CMA status');
      }

      return { property: newProperty, cma };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cmas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "CMA converted to listing successfully! Check the Properties page.",
      });
    },
    onError: (error) => {
      console.error('Convert to listing error:', error);
      toast({
        title: "Error",
        description: "Failed to convert CMA to listing",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: "Active", variant: "default" },
      completed: { label: "Completed", variant: "secondary" },
      presented: { label: "Presented", variant: "outline" },
      converted_to_listing: { label: "Converted", variant: "default" },
      rejected: { label: "Rejected", variant: "destructive" },
      did_not_convert: { label: "Did Not Convert", variant: "secondary" },
    };

    const config = statusConfig[status] || statusConfig.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const handleStatusChange = (id: string, status: string) => {
    updateCmaMutation.mutate({ id, status });
  };

  if (cmasLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex justify-between items-center">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="bg-white h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const totalCmas = cmas.length;
  const converted = cmas.filter((c) => c.status === 'converted_to_listing').length;
  const completed = cmas.filter((c) => c.status === 'completed').length;
  const didNotConvert = cmas.filter((c) => c.status === 'did_not_convert').length;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-white min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">CMAs</h1>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Create CMA
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{totalCmas}</div>
            <p className="text-sm text-gray-600">Total CMAs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{converted}</div>
            <p className="text-sm text-gray-600">Converted to Listings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{completed}</div>
            <p className="text-sm text-gray-600">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{didNotConvert}</div>
            <p className="text-sm text-gray-600">Did Not Convert</p>
          </CardContent>
        </Card>
      </div>

      {/* CMAs List */}
      <div className="space-y-4">
        {cmas.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No CMAs created yet</h3>
            <p className="text-gray-600 mb-4">Start creating Comparative Market Analyses to win more listings.</p>
            <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create First CMA
            </Button>
          </div>
        ) : (
          cmas.map((cma) => (
            <Card key={cma.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-gray-500" />
                      {cma.address}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {cma.dateCompleted && (
                        <span>Completed: {new Date(cma.dateCompleted).toLocaleDateString()}</span>
                      )}
                      {cma.datePresentedToClient && (
                        <span>Presented: {new Date(cma.datePresentedToClient).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(cma.status || 'active')}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  {cma.suggestedListPrice && (
                    <div>
                      <p className="text-sm text-gray-500">Suggested List Price</p>
                      <p className="font-medium text-green-600">
                        {formatCurrency(parseFloat(cma.suggestedListPrice))}
                      </p>
                    </div>
                  )}
                  {cma.lowEstimate && (
                    <div>
                      <p className="text-sm text-gray-500">Low Estimate</p>
                      <p className="font-medium text-black">{formatCurrency(parseFloat(cma.lowEstimate))}</p>
                    </div>
                  )}
                  {cma.highEstimate && (
                    <div>
                      <p className="text-sm text-gray-500">High Estimate</p>
                      <p className="font-medium text-black">{formatCurrency(parseFloat(cma.highEstimate))}</p>
                    </div>
                  )}
                  {cma.suggestedListPrice && (
                    <div>
                      <p className="text-sm text-gray-500">Potential ROI</p>
                      <p className="font-medium text-blue-600">
                        {(() => {
                          const listPrice = parseFloat(cma.suggestedListPrice);
                          const commissionRate = 0.06; // 6% total commission
                          const agentSplit = 0.5; // 50% split with buyer's agent
                          const potentialCommission = listPrice * commissionRate * agentSplit;
                          const cmaTimeCost = 500; // Estimated $500 cost for CMA creation (time + resources)
                          const roi = ((potentialCommission - cmaTimeCost) / cmaTimeCost * 100);
                          return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`;
                        })()} 
                        <span className="text-xs text-gray-400 block">
                          ~{formatCurrency(parseFloat(cma.suggestedListPrice) * 0.03)} commission
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {cma.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Notes</p>
                    <p className="text-gray-900">{cma.notes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    {cma.status !== 'converted_to_listing' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => convertToListingMutation.mutate(cma)}
                        disabled={convertToListingMutation.isPending}
                      >
                        <Home className="h-4 w-4 mr-1" />
                        {convertToListingMutation.isPending ? "Converting..." : "Convert to Listing"}
                      </Button>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    Created {cma.createdAt ? formatDistanceToNow(new Date(cma.createdAt)) : 'recently'} ago
                  </span>
                  <div className="flex items-center gap-2">
                    {cma.status === 'active' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(cma.id, 'completed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(cma.id, 'presented')}
                        >
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Mark Presented
                        </Button>
                      </>
                    )}
                    {cma.status === 'presented' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(cma.id, 'converted_to_listing')}
                        >
                          Convert to Listing
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(cma.id, 'did_not_convert')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Did Not Convert
                        </Button>
                      </>
                    )}
                    {cma.status === 'did_not_convert' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(cma.id, 'active')}
                      >
                        Reactivate
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddCmaModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
