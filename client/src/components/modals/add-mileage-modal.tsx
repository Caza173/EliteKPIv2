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
import { insertMileageLogSchema, type User } from "@shared/schema";
import { calculateGasCost } from "@/lib/calculations";
import { Checkbox } from "@/components/ui/checkbox";
import AddressAutocomplete from "@/components/ui/address-autocomplete";

interface AddMileageModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
}

export default function AddMileageModal({ isOpen, onClose, propertyId }: AddMileageModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/user"],
  });

  const form = useForm({
    resolver: zodResolver(insertMileageLogSchema.extend({
      gasCost: insertMileageLogSchema.shape.gasCost.optional(),
    })),
    defaultValues: {
      propertyId: propertyId || "none",
      date: new Date().toISOString().split('T')[0],
      startLocation: "",
      endLocation: "",
      miles: "",
      driveTime: "",
      purpose: "",
      gasCost: "",
      isRoundTrip: false,
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

  // Calculate distance using Google Directions API
  const calculateDistance = async (startLocation: string, endLocation: string, isRoundTrip: boolean = false) => {
    if (!startLocation || !endLocation) return;

    try {
      const response = await fetch(`/api/calculate-distance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          origin: startLocation, 
          destination: endLocation,
          roundTrip: isRoundTrip 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const totalMiles = isRoundTrip ? data.distance * 2 : data.distance;
        
        // Update form with calculated distance and corrected addresses
        form.setValue("miles", totalMiles.toString());
        form.setValue("startLocation", data.origin);
        form.setValue("endLocation", data.destination);
        
        // Auto-calculate gas cost based on distance and user settings
        if (user?.vehicleMpg && user?.avgGasPrice) {
          const gasCost = calculateGasCost(
            totalMiles,
            parseFloat(user.vehicleMpg),
            parseFloat(user.avgGasPrice)
          );
          form.setValue("gasCost", gasCost.toFixed(2));
        }
        
        // Set drive time from API response
        const driveTime = isRoundTrip ? `${data.duration} (round trip)` : data.duration;
        form.setValue("driveTime", driveTime);
        
        toast({
          title: "Distance, Time & Cost Calculated",
          description: `${totalMiles.toFixed(1)} miles • ${driveTime} • $${form.getValues("gasCost") || '0.00'} gas cost`,
        });
      } else {
        toast({
          title: "Error",
          description: "Could not calculate distance. Please enter manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Distance calculation error:', error);
      toast({
        title: "Error",
        description: "Failed to calculate distance. Please enter manually.",
        variant: "destructive",
      });
    }
  };

  const handleCalculateDistance = () => {
    const startLocation = form.getValues("startLocation");
    const endLocation = form.getValues("endLocation");
    const isRoundTrip = form.getValues("isRoundTrip");
    
    if (startLocation && endLocation) {
      calculateDistance(startLocation, endLocation, isRoundTrip);
    } else {
      toast({
        title: "Missing Information",
        description: "Please enter both start and end locations first.",
        variant: "destructive",
      });
    }
  };

  const createMileageMutation = useMutation({
    mutationFn: async (data: any) => {
      const processedData = {
        ...data,
        propertyId: (data.propertyId && data.propertyId !== "none") ? data.propertyId : null,
        // Remove isRoundTrip from data sent to server as it's just a UI helper
        isRoundTrip: undefined,
      };
      await apiRequest("POST", "/api/mileage-logs", processedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mileage-logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      // Force refresh of all related data
      queryClient.refetchQueries({ queryKey: ["/api/mileage-logs"] });
      toast({
        title: "Success",
        description: "Mileage logged successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log mileage",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    createMileageMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Mileage</DialogTitle>
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
                        <SelectValue placeholder="Select a property (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">General Business Mileage</SelectItem>
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

            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Start location"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <AddressAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="End location"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2 mb-4">
              <FormField
                control={form.control}
                name="isRoundTrip"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Round trip (double the distance)
                    </FormLabel>
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCalculateDistance}
                className="ml-auto"
              >
                Calculate Distance
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="miles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Miles *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        step="0.1"
                        placeholder="15.5"
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
                name="driveTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Drive Time</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="45 mins"
                        {...field}
                        readOnly
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="gasCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gas Cost ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Auto-calculated"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {user?.vehicleMpg && user?.avgGasPrice && (
              <div className="text-xs text-gray-500">
                Gas cost calculated using {user.vehicleMpg} MPG at ${user.avgGasPrice}/gallon from your settings
              </div>
            )}

            <FormField
              control={form.control}
              name="purpose"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Purpose</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Property showing, client meeting..."
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
                disabled={createMileageMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMileageMutation.isPending}
              >
                {createMileageMutation.isPending ? "Logging..." : "Log Mileage"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}