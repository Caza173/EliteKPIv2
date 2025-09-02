import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertActivitySchema, type InsertActivity, type Property } from "@shared/schema";

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Property Select Component
function PropertySelect({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) {
  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  return (
    <Select onValueChange={onValueChange} value={value}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Select a property (optional)" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        <SelectItem value="none">No specific property</SelectItem>
        {properties.map((property) => (
          <SelectItem key={property.id} value={property.id}>
            {property.address} - {property.city}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const ACTIVITY_TYPES = [
  { value: 'showing', label: 'Showing' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'appraisal', label: 'Appraisal' },
  { value: 'buyer_meeting', label: 'Buyer Meeting' },
  { value: 'seller_meeting', label: 'Seller Meeting' },
  { value: 'closing', label: 'Closing' },
  { value: 'client_call', label: 'Client Call' },
  { value: 'call_answered', label: 'Call Answered' },
  { value: 'buyer_appointment', label: 'Buyer Appointment' },
  { value: 'listing_appointment', label: 'Listing Appointment' },
  { value: 'buyer_signed', label: 'Buyer Signed' },
  { value: 'listing_taken', label: 'Listing Taken' },
  { value: 'offer_written', label: 'Offer Written' },
  { value: 'offer_accepted', label: 'Offer Accepted' },
  { value: 'cma_completed', label: 'CMA Completed' },
];

export default function AddActivityModal({ isOpen, onClose }: AddActivityModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertActivity>({
    resolver: zodResolver(insertActivitySchema),
    defaultValues: {
      type: "showing",
      date: new Date().toISOString().split('T')[0],
      notes: "",
      propertyId: "none",
    },
  });

  const createActivityMutation = useMutation({
    mutationFn: async (data: InsertActivity) => {
      const response = await apiRequest("POST", "/api/activities", data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Activity added successfully",
      });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      console.error("Activity creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to add activity",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertActivity) => {
    // Clean up propertyId - convert empty string or "none" to null
    const cleanData = {
      ...data,
      propertyId: data.propertyId === "" || data.propertyId === "none" ? null : data.propertyId,
    };
    createActivityMutation.mutate(cleanData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Activity Type*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity type..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ACTIVITY_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date*</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link to Property (Optional)</FormLabel>
                  <PropertySelect 
                    value={field.value || ""} 
                    onValueChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any notes about this activity..."
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending ? "Adding..." : "Add Activity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}