import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
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
import { insertCommissionSchema } from "@shared/schema";

interface AddCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
}

export default function AddCommissionModal({ isOpen, onClose, propertyId }: AddCommissionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  // Find current property for automatic calculation
  const currentProperty = (properties as any[]).find(p => p.id === propertyId);
  const listingPrice = currentProperty?.listingPrice ? parseFloat(currentProperty.listingPrice) : 0;
  const soldPrice = currentProperty?.soldPrice ? parseFloat(currentProperty.soldPrice) : listingPrice;
  const defaultCommissionRate = currentProperty?.commissionRate ? parseFloat(currentProperty.commissionRate) : 3.0;

  const form = useForm({
    resolver: zodResolver(insertCommissionSchema),
    defaultValues: {
      propertyId: propertyId || "",
      amount: soldPrice > 0 ? ((soldPrice * defaultCommissionRate) / 100).toFixed(2) : "",
      commissionRate: defaultCommissionRate.toString(),
      type: "buyer_side" as const,
      dateEarned: new Date().toISOString().split('T')[0],
      notes: "",
    },
  });

  const createCommissionMutation = useMutation({
    mutationFn: async (data: any) => {
      const processedData = {
        ...data,
        amount: data.amount.toString(),
        commissionRate: data.commissionRate ? data.commissionRate.toString() : null,
        propertyId: data.propertyId || null,
      };
      await apiRequest("POST", "/api/commissions", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/commissions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Commission recorded successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record commission",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createCommissionMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Commission</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(properties as any[]).map((property: any) => (
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Amount *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.01"
                        placeholder="5000.00"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          // Auto-calculate rate if property has sold price
                          if (soldPrice > 0 && e.target.value) {
                            const newRate = ((parseFloat(e.target.value) / soldPrice) * 100).toFixed(2);
                            form.setValue('commissionRate', newRate);
                          }
                        }}
                      />
                    </FormControl>
                    {soldPrice > 0 && (
                      <p className="text-sm text-gray-600">
                        Property sold for ${soldPrice.toLocaleString()}
                      </p>
                    )}
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
                      <Input 
                        type="number"
                        step="0.1"
                        placeholder="3.0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          // Auto-calculate amount if property has sold price
                          if (soldPrice > 0 && e.target.value) {
                            const newAmount = ((soldPrice * parseFloat(e.target.value)) / 100).toFixed(2);
                            form.setValue('amount', newAmount);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="buyer_side">Buyer Side</SelectItem>
                        <SelectItem value="seller_side">Seller Side</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateEarned"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Earned *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
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
                    <Textarea
                      placeholder="Additional details about this commission..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={createCommissionMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCommissionMutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {createCommissionMutation.isPending ? "Recording..." : "Record Commission"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}