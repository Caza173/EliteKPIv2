import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
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
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const closePropertySchema = z.object({
  soldPrice: z.string().min(1, "Sold price is required"),
  soldDate: z.string().min(1, "Sold date is required"),
});

type ClosePropertyForm = z.infer<typeof closePropertySchema>;

interface ClosePropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: {
    id: string;
    address: string;
    listingPrice?: string;
  };
}

export default function ClosePropertyModal({ isOpen, onClose, property }: ClosePropertyModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClosePropertyForm>({
    resolver: zodResolver(closePropertySchema),
    defaultValues: {
      soldPrice: property.listingPrice || "",
      soldDate: new Date().toISOString().split('T')[0],
    },
  });

  const closePropertyMutation = useMutation({
    mutationFn: async (data: ClosePropertyForm) => {
      return apiRequest("PATCH", `/api/properties/${property.id}`, {
        status: "closed",
        soldPrice: data.soldPrice,
        soldDate: data.soldDate,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/metrics"] });
      toast({
        title: "Property Closed",
        description: `${property.address} has been marked as closed with sold price $${form.getValues("soldPrice")}`,
      });
      onClose();
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to close property",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ClosePropertyForm) => {
    closePropertyMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Close Property</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Closing: <span className="font-medium">{property.address}</span>
            </div>

            <FormField
              control={form.control}
              name="soldPrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sold Price *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="450000"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="soldDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sold Date *</FormLabel>
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={closePropertyMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={closePropertyMutation.isPending}
              >
                {closePropertyMutation.isPending ? "Closing..." : "Close Property"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}