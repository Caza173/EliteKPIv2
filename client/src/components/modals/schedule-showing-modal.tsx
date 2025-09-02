import { useState } from "react";
import React from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertActivitySchema, insertPropertySchema, type User } from "@shared/schema";
import { z } from "zod";
import { calculateGasCost } from "@/lib/calculations";
import { Plus } from "lucide-react";

interface ScheduleShowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPropertyAddress?: string;
}

const showingSchema = z.object({
  propertyAddress: z.string().min(1, "Property address is required"),
  clientName: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  interestLevel: z.enum(["low", "medium", "high"]).optional(),
  duration: z.string().optional(),
  milesDriven: z.string().optional(),
  gasCost: z.string().optional(),
  hoursSpent: z.string().optional(),
  clientFeedback: z.string().optional(),
  notes: z.string().optional(),
  followUpRequired: z.boolean().optional(),
});



export default function ScheduleShowingModal({ isOpen, onClose, selectedPropertyAddress }: ScheduleShowingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();


  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const form = useForm({
    resolver: zodResolver(showingSchema),
    defaultValues: {
      propertyAddress: selectedPropertyAddress || "",
      clientName: "",
      date: new Date().toISOString().split('T')[0],
      interestLevel: "medium" as const,
      duration: "",
      milesDriven: "",
      gasCost: "",
      hoursSpent: "",
      clientFeedback: "",
      notes: "",
      followUpRequired: false,
    },
  });

  // Auto-calculate gas cost when miles change
  const handleMilesChange = (miles: string) => {
    if (miles && user?.vehicleMpg && user?.avgGasPrice) {
      const cost = calculateGasCost(
        parseFloat(miles),
        parseFloat(user.vehicleMpg),
        parseFloat(user.avgGasPrice)
      );
      form.setValue("gasCost", cost.toFixed(2));
    } else {
      form.setValue("gasCost", "");
    }
  };







  const createShowingMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("=== SHOWING SUBMISSION START ===");
      console.log("Form data:", data);
      
      // Create property first if it doesn't exist
      const addressParts = data.propertyAddress.split(',').map((part: string) => part.trim());
      const propertyData = {
        address: data.propertyAddress,
        city: addressParts.length > 1 ? addressParts[1] : "",
        state: addressParts.length > 2 ? addressParts[2].split(' ')[0] : "",
        zipCode: addressParts.length > 2 ? addressParts[2].split(' ')[1] || "" : "",
        clientName: data.clientName || "",
        representationType: "buyer_rep" as const,
        propertyType: "single_family" as const,
        leadSource: "referral" as const,
      };
      
      console.log("Creating property:", propertyData);
      
      // Use fetch directly instead of apiRequest to avoid promise issues
      const propertyResponse = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(propertyData),
      });

      if (!propertyResponse.ok) {
        const errorData = await propertyResponse.json();
        throw new Error(`Property creation failed: ${errorData.message || 'Unknown error'}`);
      }

      const newProperty = await propertyResponse.json();
      console.log("Property created:", newProperty);
      
      // Create the showing activity
      const activityData = {
        type: "showing" as const,
        propertyId: newProperty.id,
        date: data.date,
        notes: `Showing scheduled${data.clientName ? ` with ${data.clientName}` : ''}${data.interestLevel ? ` - Interest Level: ${data.interestLevel}` : ''}${data.duration ? ` - Duration: ${data.duration} minutes` : ''}${data.milesDriven ? ` - Miles: ${data.milesDriven}` : ''}${data.gasCost ? ` - Gas Cost: $${data.gasCost}` : ''}${data.hoursSpent ? ` - Hours: ${data.hoursSpent}` : ''}${data.clientFeedback ? `\nFeedback: ${data.clientFeedback}` : ''}${data.notes ? `\nNotes: ${data.notes}` : ''}`.trim(),
      };
      
      console.log("Creating activity:", activityData);
      
      const activityResponse = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(activityData),
      });

      if (!activityResponse.ok) {
        const errorData = await activityResponse.json();
        throw new Error(`Activity creation failed: ${errorData.message || 'Unknown error'}`);
      }

      const activity = await activityResponse.json();
      console.log("Activity created successfully:", activity);
      
      return { property: newProperty, activity };
    },
    onSuccess: () => {
      console.log("=== MUTATION SUCCESS ===");
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: "Success",
        description: "Showing scheduled successfully",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      console.log("=== MUTATION ERROR ===");
      console.error("Mutation error:", error);
      toast({
        title: "Error",
        description: "Failed to schedule showing. Check console for details.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log("=== FORM SUBMISSION DEBUG ===");
    console.log("Submitted data:", data);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    console.log("Form is submitting:", form.formState.isSubmitting);
    
    // Basic validation check
    if (!data.propertyAddress?.trim()) {
      toast({
        title: "Error",
        description: "Property address is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!data.date) {
      toast({
        title: "Error",
        description: "Date is required",
        variant: "destructive",
      });
      return;
    }
    
    
    console.log("All validation passed, proceeding with mutation...");
    createShowingMutation.mutate(data);
  };



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Showing</DialogTitle>
          <DialogDescription>
            Create a new property showing. Enter the property address and showing details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Property Address Section */}
              <FormField
                control={form.control}
                name="propertyAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter property address (e.g., 123 Main Street, City, State ZIP)"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Property Notice */}
              {form.watch("propertyAddress") && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-900 mb-2">New Property</h3>
                  <p className="text-sm text-blue-800">
                    Creating showing for: <strong>{form.watch("propertyAddress")}</strong>
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Property will be created automatically when you schedule the showing.
                  </p>
                </div>
              )}

              {/* Client Name */}
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

              {/* Showing Date */}
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Showing Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Interest Level and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="interestLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interest Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Miles, Gas Cost, Hours */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="milesDriven"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miles Driven</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleMilesChange(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gasCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gas Cost ($)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hoursSpent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Spent</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.25" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {user?.vehicleMpg && user?.avgGasPrice ? (
                <div className="text-xs text-gray-500">
                  Gas cost calculated using {user.vehicleMpg} MPG at ${user.avgGasPrice}/gallon from your settings
                </div>
              ) : (
                <div className="text-xs text-orange-500">
                  Set up your vehicle settings to enable automatic gas cost calculation
                </div>
              )}

              {/* Client Feedback */}
              <FormField
                control={form.control}
                name="clientFeedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What did the client think of the property?"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Internal Notes */}
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Private notes about the showing..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Follow-up Required */}
              <FormField
                control={form.control}
                name="followUpRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Follow-up Required</FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createShowingMutation.isPending}
                >
                  {createShowingMutation.isPending ? "Adding..." : "Add Showing"}
                </Button>
              </div>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}