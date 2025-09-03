import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPropertySchema } from "@shared/schema";
import { PROPERTY_STATUSES } from "@/lib/constants";
import AddressAutocomplete from "@/components/ui/address-autocomplete";
import { useResourceUsage, ResourceGate } from "@/hooks/usePlanInfo";

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddPropertyModal({ isOpen, onClose }: AddPropertyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const propertyUsage = useResourceUsage('properties');

  const form = useForm({
    resolver: zodResolver(insertPropertySchema),
    defaultValues: {
      address: "",
      city: "",
      state: "",
      zipCode: "",
      representationType: "seller_rep" as const,
      status: "in_progress" as const,
      propertyType: "single_family" as const,
      bedrooms: undefined,
      bathrooms: undefined,
      squareFeet: undefined,
      listingPrice: "",
      listingDate: new Date().toISOString().split('T')[0],
      commissionRate: undefined,
      clientName: "",
      leadSource: "referral",
      notes: "",
    },
  });

  const createPropertyMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/properties", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Property added successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    // Check if user can add more properties
    if (!propertyUsage.canAdd) {
      toast({
        title: "Property Limit Reached",
        description: `You've reached your property limit (${propertyUsage.current}/${propertyUsage.limit}). Upgrade to Professional to add more properties.`,
        variant: "destructive",
      });
      return;
    }

    // Convert string numbers to actual numbers where needed
    const processedData = {
      ...data,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      squareFeet: data.squareFeet ? parseInt(data.squareFeet) : null,
      bathrooms: data.bathrooms ? parseFloat(data.bathrooms) : null,
      listingPrice: data.listingPrice ? parseFloat(data.listingPrice) : null,
      commissionRate: data.commissionRate ? parseFloat(data.commissionRate) : null,
    };
    createPropertyMutation.mutate(processedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Property</DialogTitle>
          {/* Property usage indicator */}
          <div className="text-sm text-gray-600 mt-2">
            Properties: {propertyUsage.current}/{propertyUsage.limit === Infinity ? '∞' : propertyUsage.limit}
            {propertyUsage.limit !== Infinity && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className={`h-2 rounded-full transition-all ${
                    propertyUsage.percentage > 80 ? 'bg-red-500' : 
                    propertyUsage.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(propertyUsage.percentage, 100)}%` }}
                />
              </div>
            )}
          </div>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Single Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address *</FormLabel>
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
                      placeholder="Enter full address (e.g., 123 Main St, City, State 12345)"
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      <Input {...field} />
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

            {/* Client Name & Representation */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter client name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="representationType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Representation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="seller_rep">Seller</SelectItem>
                        <SelectItem value="buyer_rep">Buyer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Lead Source */}
            <FormField
              control={form.control}
              name="leadSource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Source</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="soi">SOI</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="sign_call">Sign Call</SelectItem>
                      <SelectItem value="open_house">Open House</SelectItem>
                      <SelectItem value="cold_call">Cold Call</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="advertising">Advertising</SelectItem>
                      <SelectItem value="agent_referral">Agent Referral</SelectItem>
                      <SelectItem value="homelight">HomeLight</SelectItem>
                      <SelectItem value="zillow">Zillow</SelectItem>
                      <SelectItem value="opcity">OpCity</SelectItem>
                      <SelectItem value="upnest">UpNest</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="direct_mail">Direct Mail</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Property Type & Listing Price */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single_family">House</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="multi_family">Multi-family</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="400,000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bedrooms, Bathrooms, Square Feet */}
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="3"
                        {...field}
                      />
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
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="2.0"
                        {...field}
                      />
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
                      <Input
                        type="number"
                        min="0"
                        placeholder="2047"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Status & Listing Date */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROPERTY_STATUSES.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="listingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createPropertyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createPropertyMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {createPropertyMutation.isPending ? "Saving..." : "Save Property"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}