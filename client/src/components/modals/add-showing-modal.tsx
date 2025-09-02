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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertShowingSchema } from "@shared/schema";
import { calculateGasCost } from "@/lib/calculations";

interface AddShowingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddShowingModal({ isOpen, onClose }: AddShowingModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });

  const form = useForm({
    resolver: zodResolver(insertShowingSchema),
    defaultValues: {
      propertyAddress: "",
      clientName: "",
      date: new Date().toISOString().split('T')[0],
      interestLevel: null,
      durationMinutes: null,
      milesDriven: "",
      gasCost: "",
      hoursSpent: "",
      feedback: "",
      internalNotes: "",
      followUpRequired: false,
      propertyId: null,
    },
  });

  const createShowingMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/showings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/showings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Showing scheduled successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to schedule showing",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const processedData = {
      ...data,
      interestLevel: data.interestLevel ? parseInt(data.interestLevel) : null,
      durationMinutes: data.durationMinutes ? parseInt(data.durationMinutes) : null,
      milesDriven: data.milesDriven ? parseFloat(data.milesDriven) : null,
      gasCost: data.gasCost ? parseFloat(data.gasCost) : null,
      hoursSpent: data.hoursSpent ? parseFloat(data.hoursSpent) : null,
      propertyId: data.propertyId || null,
    };
    createShowingMutation.mutate(processedData);
  };

  // Auto-calculate gas cost when miles change
  const milesDriven = form.watch("milesDriven");
  const handleMilesChange = (miles: string) => {
    if (miles && user?.vehicleMpg && user?.avgGasPrice) {
      const cost = calculateGasCost(
        parseFloat(miles),
        parseFloat(user.vehicleMpg),
        parseFloat(user.avgGasPrice)
      );
      form.setValue("gasCost", cost.toFixed(2));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Showing</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="propertyAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Property Address*</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main Street, City, State" {...field} />
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
                  <Select onValueChange={field.onChange} value={field.value || ""}>
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John & Jane Smith" {...field} />
                    </FormControl>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="interestLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interest Level (1-5)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString() || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Very Low</SelectItem>
                        <SelectItem value="2">2 - Low</SelectItem>
                        <SelectItem value="3">3 - Medium</SelectItem>
                        <SelectItem value="4">4 - High</SelectItem>
                        <SelectItem value="5">5 - Very High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="durationMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (minutes)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="60" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                name="gasCost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gas Cost ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Auto-calculated" {...field} />
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
                      <Input type="number" step="0.25" placeholder="1.5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="feedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Feedback</FormLabel>
                  <FormControl>
                    <Textarea placeholder="What did the client think of the property?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="internalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Internal Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Private notes for your reference..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="followUpRequired"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Follow-up Required</FormLabel>
                    <p className="text-sm text-gray-600">Check if this showing requires follow-up action</p>
                  </div>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createShowingMutation.isPending}
              >
                {createShowingMutation.isPending ? "Scheduling..." : "Schedule Showing"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
