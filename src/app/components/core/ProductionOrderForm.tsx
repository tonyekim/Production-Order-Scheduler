


"use client";

import { useState, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ProductionOrder, Resource } from "@/lib/types";
import { productionOrderSchema, ProductionOrderFormData, ORDER_STATUSES } from "@/lib/validators";
import { useAppStore } from "@/lib/store";
import { toast } from "sonner";

interface ProductionOrderFormProps {
  order?: ProductionOrder | null; // For editing
  onOpenChange: (open: boolean) => void;
  onFormSubmitSuccess: () => void;
  resources: Resource[]; // Add resources prop
}

export function ProductionOrderForm({
  order,
  onOpenChange,
  onFormSubmitSuccess,
  resources,
}: ProductionOrderFormProps) {
  const { addOrder, updateOrder } = useAppStore((state) => ({
    addOrder: state.addOrder,
    updateOrder: state.updateOrder,
  }));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductionOrderFormData>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: {
      orderName: order?.orderName || "",
      notes: order?.notes || "",
      status: order?.status || "Pending",
      resourceId: order?.resourceId || undefined,
      startTime: order?.startTime ? new Date(order.startTime) : undefined,
      endTime: order?.endTime ? new Date(order.endTime) : undefined,
    },
  });

  const availableResources = useMemo(
    () => resources.filter((r) => r.status === "Available" || r.id === order?.resourceId),
    [resources, order]
  );

  function onSubmit(data: ProductionOrderFormData) {
    setIsSubmitting(true);
    try {
      if (data.status === "Scheduled") {
        if (!data.resourceId || !data.startTime || !data.endTime) {
          toast.error("For 'Scheduled' orders, Resource, Start Time, and End Time are mandatory.");
          setIsSubmitting(false);
          return;
        }
        const selectedResource = resources.find((r) => r.id === data.resourceId);
        if (
          selectedResource &&
          selectedResource.status !== "Available" &&
          order?.resourceId !== selectedResource.id
        ) {
          toast.error(
            `Resource "${selectedResource.name}" is not Available. Please select an Available resource.`
          );
          setIsSubmitting(false);
          return;
        }
      }

      if (order) {
        // Editing existing order
        updateOrder(order.id, data);
        toast.success("Order updated successfully!");
      } else {
        // Creating new order
        addOrder(data);
        toast.success("Order created successfully!");
      }
      onFormSubmitSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const watchedStatus = form.watch("status");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="orderName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                Order Name <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="e.g., Batch #123 Widgets" {...field} data-testid="orderName" className="text-white" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="text-white">
              <FormLabel className="text-white">
                Status <span className="text-destructive ">*</span>
              </FormLabel>
              <Select  onValueChange={field.onChange} defaultValue={field.value} data-testid="status-select" >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select order status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="text-white">
                  {ORDER_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {watchedStatus === "Scheduled" && (
          <>
            <FormField
              control={form.control}
              name="resourceId"
              render={({ field }) => (
                <FormItem className="text-white">
                  <FormLabel className="text-white">
                    Resource <span className="text-destructive text-white">*</span>
                  </FormLabel>
                  <Select  onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="resource-select">
                        <SelectValue className="text-white" placeholder="Select a resource" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="text-white">
                      {availableResources.length > 0 ? (
                        availableResources.map((resource: Resource) => (
                          <SelectItem className="text-white" key={resource.id} value={resource.id}>
                            {resource.name} ({resource.status})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-resources" disabled>
                          No available resources
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {availableResources.length === 0 && (
                    <FormDescription className="text-destructive">
                      No resources are currently 'Available'.
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col text-white">
                    <FormLabel className="text-white">
                      Start Time <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl className="text-white">
                          <Button
                          
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal text-white",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="startTime"
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-white" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="text-white"
                        />
                        <div className="p-2 border-t border-black">
                          <Input
                          className="text-white"
                            type="time"
                            defaultValue={field.value ? format(field.value, "HH:mm") : "09:00"}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(":").map(Number);
                              const newDate = field.value ? new Date(field.value) : new Date();
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col text-white">
                    <FormLabel  className="text-white">
                      End Time <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal text-white",
                              !field.value && "text-muted-foreground"
                            )}
                            data-testid="endTime"
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span >Pick a date and time</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50 text-white" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            (form.getValues("startTime") && date < form.getValues("startTime")!) ||
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                          className="text-white"
                        />
                        <div className="p-2 border-t">
                          <Input
                          className="text-white"
                            type="time"
                            defaultValue={field.value ? format(field.value, "HH:mm") : "17:00"}
                            onChange={(e) => {
                              const [hours, minutes] = e.target.value.split(":").map(Number);
                              const newDate = field.value ? new Date(field.value) : new Date();
                              newDate.setHours(hours, minutes);
                              field.onChange(newDate);
                            }}
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any relevant notes for this production order..."
                  className="resize-none text-white"
                  {...field}
                  data-testid="notes"
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          <Button className="text-white" type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button className="text-white" type="submit" variant="outline" disabled={isSubmitting} data-testid="submit-order">
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {order ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}