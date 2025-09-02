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
import { insertCmaSchema } from "@shared/schema";
import { CMA_STATUSES } from "@/lib/constants";
import AddressAutocomplete from "@/components/ui/address-autocomplete";

interface AddCmaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddCmaModal({ isOpen, onClose }: AddCmaModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const form = useForm({
    resolver: zodResolver(insertCmaSchema),
    defaultValues: {
      address: "",
      suggestedListPrice: "",
      lowEstimate: "",
      highEstimate: "",
      status: "active" as const,
      notes: "",
      comparables: "",
      propertyId: "none",
    },
  });

  const createCmaMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/cmas", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cmas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "CMA created successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create CMA",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const processedData = {
      ...data,
      suggestedListPrice: data.suggestedListPrice ? parseFloat(data.suggestedListPrice) : null,
      lowEstimate: data.lowEstimate ? parseFloat(data.lowEstimate) : null,
      highEstimate: data.highEstimate ? parseFloat(data.highEstimate) : null,
      propertyId: (data.propertyId && data.propertyId !== "none") ? data.propertyId : null,
    };
    createCmaMutation.mutate(processedData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create CMA</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Address*</FormLabel>
                  <FormControl>
                    <AddressAutocomplete
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="123 Main Street, City, State"
                      className="w-full"
                    />
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
                  <Select onValueChange={field.onChange} value={field.value || "none"}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No property link</SelectItem>
                      {properties.map((property: any) => (
                        <SelectItem key={property.id} value={property.id}>
                          {property.address}
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
              name="suggestedListPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Suggested List Price ($)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="425000" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="lowEstimate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Low Estimate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="400000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="highEstimate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>High Estimate ($)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="450000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CMA_STATUSES.map((status) => (
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
              name="comparables"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comparable Properties</FormLabel>
                  <FormControl>
                    <Textarea placeholder="List comparable properties and their details..." {...field} />
                  </FormControl>
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
                    <Textarea placeholder="Additional notes about this CMA..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createCmaMutation.isPending}
              >
                {createCmaMutation.isPending ? "Creating..." : "Create CMA"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
