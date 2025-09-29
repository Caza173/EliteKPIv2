import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, MapPin, Star, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { formatDistanceToNow } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import AddShowingModal from "@/components/modals/add-showing-modal";
import type { Showing } from "@shared/schema";

export default function Showings() {
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

  const { data: showings = [], isLoading: showingsLoading, error } = useQuery({
    queryKey: ["/api/showings"],
    retry: false,
  });

  const updatePropertyMutation = useMutation({
    mutationFn: async (data: { propertyId: string; status: string }) => {
      await apiRequest("PUT", `/api/properties/${data.propertyId}`, { status: data.status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success", 
        description: "Offer status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update property status",
        variant: "destructive",
      });
    },
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

  const getInterestBadge = (level: number | null) => {
    if (!level) return <Badge variant="outline">Not rated</Badge>;
    
    const config = {
      1: { label: "Very Low", variant: "destructive" as const },
      2: { label: "Low", variant: "secondary" as const },
      3: { label: "Medium", variant: "outline" as const },
      4: { label: "High", variant: "default" as const },
      5: { label: "Very High", variant: "default" as const },
    };

    const { label, variant } = config[level as keyof typeof config] || config[3];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (showingsLoading) {
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

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Showings</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Showing
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{showings.length}</div>
            <p className="text-sm text-gray-600">Total Showings</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {showings.filter((s: Showing) => (s.interestLevel || 0) >= 4).length}
            </div>
            <p className="text-sm text-gray-600">High Interest</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">
              {showings.filter((s: Showing) => s.followUpRequired).length}
            </div>
            <p className="text-sm text-gray-600">Follow-ups Needed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">
              {showings.reduce((total: number, s: Showing) => total + (parseFloat(s.hoursSpent || '0')), 0).toFixed(1)}
            </div>
            <p className="text-sm text-gray-600">Total Hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Showings List */}
      <div className="space-y-4">
        {showings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No showings scheduled</h3>
            <p className="text-gray-600 mb-4">Start tracking your property showings and client interactions.</p>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Schedule First Showing
            </Button>
          </div>
        ) : (
          showings.map((showing: Showing) => (
            <Card key={showing.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      {showing.propertyAddress}
                    </CardTitle>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(showing.date).toLocaleDateString()}
                      </span>
                      {showing.clientName && (
                        <span>Client: {showing.clientName}</span>
                      )}
                      {showing.durationMinutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {showing.durationMinutes} min
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getInterestBadge(showing.interestLevel)}
                    {showing.followUpRequired && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        Follow-up Required
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  {showing.hoursSpent && (
                    <div>
                      <p className="text-sm text-gray-500">Hours Spent</p>
                      <p className="font-medium">{showing.hoursSpent}</p>
                    </div>
                  )}
                  {showing.milesDriven && (
                    <div>
                      <p className="text-sm text-gray-500">Miles Driven</p>
                      <p className="font-medium">{showing.milesDriven}</p>
                    </div>
                  )}
                  {showing.gasCost && (
                    <div>
                      <p className="text-sm text-gray-500">Gas Cost</p>
                      <p className="font-medium">${parseFloat(showing.gasCost).toFixed(2)}</p>
                    </div>
                  )}
                </div>

                {showing.feedback && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-1">Client Feedback</p>
                    <p className="text-gray-900">{showing.feedback}</p>
                  </div>
                )}

                {showing.internalNotes && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Internal Notes</p>
                    <p className="text-gray-700 text-sm">{showing.internalNotes}</p>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">
                      Added {formatDistanceToNow(new Date(showing.createdAt || new Date()))} ago
                    </span>
                    {showing.propertyId && (
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={updatePropertyMutation.isPending}
                        onClick={() => {
                          if (showing.propertyId) {
                            updatePropertyMutation.mutate({
                              propertyId: showing.propertyId,
                              status: 'offer_written'
                              // Keep representationType as 'seller_rep' - don't move to buyers tab until offer is accepted
                            });
                          }
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        {updatePropertyMutation.isPending ? "Writing..." : "Write Offer"}
                      </Button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < (showing.interestLevel || 0)
                            ? "text-blue-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AddShowingModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
