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
  FormDescription,
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
import { insertGoalSchema } from "@shared/schema";
import { GOAL_PERIODS } from "@/lib/constants";

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddGoalModal({ isOpen, onClose }: AddGoalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(insertGoalSchema),
    defaultValues: {
      period: "monthly" as const,
      calls: "",
      appointments: "",
      cmas: "",
      hours: "",
      offersToWrite: "",
      monthlyClosings: "",
      isLocked: false,
      effectiveDate: new Date().toISOString().split('T')[0],
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest("POST", "/api/goals", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Success",
        description: "Goal created successfully",
      });
      form.reset();
      onClose();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create goal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    const processedData = {
      ...data,
      calls: data.calls ? parseInt(data.calls) : null,
      appointments: data.appointments ? parseInt(data.appointments) : null,
      cmas: data.cmas ? parseInt(data.cmas) : null,
      hours: data.hours ? parseFloat(data.hours) : null,
      offersToWrite: data.offersToWrite ? parseInt(data.offersToWrite) : null,
      monthlyClosings: data.monthlyClosings ? parseInt(data.monthlyClosings) : null,
    };
    createGoalMutation.mutate(processedData);
  };

  const selectedPeriod = form.watch("period");

  const getPlaceholder = (field: string) => {
    const placeholders = {
      daily: {
        calls: "25",
        appointments: "3",
        cmas: "1",
        hours: "8",
        offersToWrite: "1",
      },
      weekly: {
        calls: "125",
        appointments: "15",
        cmas: "5",
        hours: "40",
        offersToWrite: "5",
      },
      monthly: {
        calls: "500",
        appointments: "60",
        cmas: "20",
        hours: "160",
        offersToWrite: "20",
      },
    };
    
    return placeholders[selectedPeriod as keyof typeof placeholders]?.[field as keyof typeof placeholders.daily] || "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Set New Goal</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="period"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Goal Period*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {GOAL_PERIODS.map((period) => (
                          <SelectItem key={period.value} value={period.value}>
                            {period.label}
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
                name="effectiveDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Effective Date*</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="calls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calls Target</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={getPlaceholder("calls")}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Number of client calls to make per {selectedPeriod.replace('ly', '')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Appointments Target</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={getPlaceholder("appointments")}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Number of appointments to schedule per {selectedPeriod.replace('ly', '')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cmas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CMAs Target</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={getPlaceholder("cmas")}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Number of CMAs to complete per {selectedPeriod.replace('ly', '')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours Target</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.5"
                        placeholder={getPlaceholder("hours")}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Number of working hours per {selectedPeriod.replace('ly', '')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="offersToWrite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offers to Write Target</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder={getPlaceholder("offersToWrite")}
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Number of offers to write per {selectedPeriod.replace('ly', '')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedPeriod === "monthly" && (
                <FormField
                  control={form.control}
                  name="monthlyClosings"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Closings Target</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="3"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Number of properties to close per month
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createGoalMutation.isPending}
              >
                {createGoalMutation.isPending ? "Creating..." : "Create Goal"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
