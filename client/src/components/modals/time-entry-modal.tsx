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
import { insertTimeEntrySchema, type Property, type User } from "@shared/schema";

interface TimeEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId?: string;
}

export default function TimeEntryModal({ isOpen, onClose, propertyId }: TimeEntryModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: properties = [] } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
    retry: false,
  });

  const { data: userSettings } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false,
  });

  const form = useForm({
    resolver: zodResolver(insertTimeEntrySchema),
    defaultValues: {
      activity: "",
      hours: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      propertyId: propertyId || "general",
    },
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/time-entries", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Success",
        description: "Time entry logged successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log time entry",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const hours = parseFloat(data.hours);
    const hourlyRate = userSettings?.hourlyRate ? parseFloat(userSettings.hourlyRate) : 0;
    const amount = hours * hourlyRate;
    
    const processedData = {
      ...data,
      hours,
      amount,
      propertyId: data.propertyId === "general" ? null : data.propertyId,
    };
    createTimeEntryMutation.mutate(processedData);
  };

  const commonActivities = [
    "Client consultation",
    "Property showing",
    "Market research",
    "Listing preparation",
    "Administrative work",
    "Appraisal",
    "Home Inspection",
    "Septic Inspection",
    "Contract review",
    "Follow-up calls",
    "Marketing activities",
    "Travel",
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Log Time Entry</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="activity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Activity*</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="border-2 border-gray-300 focus:border-blue-500 text-black">
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {commonActivities.map((activity) => (
                        <SelectItem key={activity} value={activity}>
                          {activity}
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
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Hours*</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.25" 
                        placeholder="1.5" 
                        className="border-2 border-gray-300 focus:border-blue-500 text-black"
                        {...field} 
                      />
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
                    <FormLabel className="text-black">Date*</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        className="border-2 border-gray-300 focus:border-blue-500 text-black"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ROI Calculation Display */}
            {form.watch("hours") && userSettings?.hourlyRate && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-sm text-black">
                  <strong>Calculated Value:</strong> ${(parseFloat(form.watch("hours") || "0") * parseFloat(userSettings.hourlyRate)).toFixed(2)}
                  <span className="text-gray-600 ml-2">
                    ({form.watch("hours")} hrs × ${userSettings.hourlyRate}/hr)
                  </span>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="propertyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Property (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || "general"}>
                    <FormControl>
                      <SelectTrigger className="border-2 border-gray-300 focus:border-blue-500 text-black">
                        <SelectValue placeholder="Select a property" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="general">General activity</SelectItem>
                      {properties.map((property) => (
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional details about the activity..." 
                      className="border-2 border-gray-300 focus:border-blue-500 text-black resize-none"
                      {...field} 
                    />
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
                disabled={createTimeEntryMutation.isPending}
              >
                {createTimeEntryMutation.isPending ? "Logging..." : "Log Time"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
