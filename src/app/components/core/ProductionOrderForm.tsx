"use client";

import { useState, useMemo, useEffect } from "react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ProductionOrder, Resource } from "@/lib/types";
import {
  productionOrderSchema,
  ProductionOrderFormData,
  ORDER_STATUSES,
} from "@/lib/validators";
import { toast } from "sonner";

interface ProductionOrderFormProps {
  order?: ProductionOrder | null;
  onOpenChange: (open: boolean) => void;
  onFormSubmitSuccess: () => void;
  resources: Resource[];
  existingOrders: ProductionOrder[];
}

export function ProductionOrderForm({
  order,
  onOpenChange,
  onFormSubmitSuccess,
  resources,
  existingOrders,
}: ProductionOrderFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);

  const form = useForm<ProductionOrderFormData>({
    resolver: zodResolver(productionOrderSchema),
    defaultValues: order
      ? {
          orderName: order.orderName,
          notes: order.notes || "",
          status: order.status,
          resourceId: order.resourceId,
          startTime: order.startTime || undefined, // Keep as string
          endTime: order.endTime || undefined,
        }
      : {
          orderName: "",
          notes: "",
          status: "Pending",
          resourceId: undefined,
          startTime: undefined,
          endTime: undefined,
        },
  });

  // Show all resources, not just "Available"
  const availableResources = useMemo(() => resources, [resources]);

  // Watch form fields for conflict checking
  const watchedResourceId = form.watch("resourceId");
  const watchedStartTime = form.watch("startTime");
  const watchedEndTime = form.watch("endTime");

  // Check for scheduling conflicts
useEffect(() => {
  if (watchedResourceId && watchedStartTime && watchedEndTime) {
    const newStart = new Date(watchedStartTime); // Convert string to Date
    const newEnd = new Date(watchedEndTime);     // Convert string to Date
    const conflicts = existingOrders.filter((existingOrder) => {
      if (
        existingOrder.status !== "Scheduled" ||
        existingOrder.resourceId !== watchedResourceId ||
        !existingOrder.startTime ||
        !existingOrder.endTime ||
        (order && existingOrder.id === order.id)
      ) {
        return false;
      }

      const existingStart = new Date(existingOrder.startTime);
      const existingEnd = new Date(existingOrder.endTime);

      return newStart < existingEnd && newEnd > existingStart;
    });

    if (conflicts.length > 0) {
      setConflictMessage(
        `This time slot conflicts with ${conflicts.length} existing order(s) for this resource.`
      );
    } else {
      setConflictMessage(null);
    }
  } else {
    setConflictMessage(null);
  }
}, [watchedResourceId, watchedStartTime, watchedEndTime, existingOrders, order]);

async function onSubmit(data: ProductionOrderFormData) {
  setIsSubmitting(true);
  try {
    if (data.status === "Scheduled") {
      if (!data.resourceId || !data.startTime || !data.endTime) {
        toast.error("Resource, Start Time, and End Time are required for Scheduled orders.");
        setIsSubmitting(false);
        return;
      }
      const selectedResource = resources.find((r) => r.id === data.resourceId);
      if (selectedResource && selectedResource.status !== "Available") {
        toast.warning(
          `Resource "${selectedResource.name}" is "${selectedResource.status}". Ensure this is intentional.`
        );
      }
      if (data.endTime <= data.startTime) { // String comparison works for ISO strings
        toast.error("End Time must be after Start Time.");
        setIsSubmitting(false);
        return;
      }
      if (conflictMessage) {
        toast.error("Cannot submit: Resolve scheduling conflicts first.");
        setIsSubmitting(false);
        return;
      }
    }

    const payload = {
      orderName: data.orderName,
      status: data.status,
      resourceId: data.resourceId,
      startTime: data.startTime, // Already a string
      endTime: data.endTime,     // Already a string
      notes: data.notes,
    };

    const response = await fetch("/api/orders", {
      method: order ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order ? { id: order.id, ...payload } : payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to ${order ? "update" : "create"} order`);
    }

    toast.success(`Order ${order ? "updated" : "created"} successfully!`);
    onFormSubmitSuccess();
    onOpenChange(false);
  } catch (error) {
    console.error("Form submission error:", error);
    toast.error(error.message || `An error occurred while ${order ? "updating" : "creating"} the order.`);
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
                <Input
                  placeholder="e.g., Batch #123 Widgets"
                  {...field}
                  data-testid="orderName"
                  className="text-white bg-gray-800 border-gray-700"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">
                Status <span className="text-destructive">*</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                data-testid="status-select"
              >
                <FormControl>
                  <SelectTrigger className="text-white bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select order status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
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
                <FormItem>
                  <FormLabel className="text-white">
                    Resource <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    data-testid="resource-select"
                  >
                    <FormControl>
                      <SelectTrigger
                        className={cn(
                          "text-white bg-gray-800 border-gray-700",
                          conflictMessage && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Select a resource" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 text-white border-gray-700">
                      {availableResources.length > 0 ? (
                        availableResources.map((resource: Resource) => (
                          <SelectItem key={resource.id} value={resource.id}>
                            {resource.name} ({resource.status})
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-resources" disabled>
                          No resources available
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {conflictMessage && (
                    <FormDescription className="text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {conflictMessage}
                    </FormDescription>
                  )}
                  {availableResources.length === 0 && !conflictMessage && (
                    <FormDescription className="text-destructive">
                      No resources are available. Please add resources in the
                      Resources page.
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
                render={({ field }) => {
                  const dateValue = field.value
                    ? new Date(field.value)
                    : undefined; // Convert string to Date for UI
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white">
                        Start Time <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal text-white bg-gray-800 border-gray-700",
                                !field.value && "text-muted-foreground",
                                conflictMessage && "border-destructive"
                              )}
                              data-testid="startTime"
                            >
                              {field.value ? (
                                format(dateValue!, "PPP HH:mm")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-gray-800 text-white border-gray-700"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={dateValue}
                            onSelect={(date) => {
                              if (date) {
                                const newDate = new Date(date);
                                if (field.value) {
                                  // Preserve existing time if set
                                  const currentDate = new Date(field.value);
                                  newDate.setHours(
                                    currentDate.getHours(),
                                    currentDate.getMinutes()
                                  );
                                } else {
                                  newDate.setHours(9, 0); // Default time if none set
                                }
                                field.onChange(newDate.toISOString()); // Convert back to string
                              } else {
                                field.onChange(undefined);
                              }
                            }}
                            disabled={(date) =>
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            }
                            initialFocus
                          />
                          <div className="p-2 border-t border-gray-700">
                            <Input
                              type="time"
                              value={
                                dateValue ? format(dateValue, "HH:mm") : ""
                              }
                              onChange={(e) => {
                                if (e.target.value) {
                                  const [hours, minutes] = e.target.value
                                    .split(":")
                                    .map(Number);
                                  const newDate = dateValue
                                    ? new Date(dateValue)
                                    : new Date();
                                  newDate.setHours(hours, minutes);
                                  field.onChange(newDate.toISOString()); // Update as string
                                }
                              }}
                              className="text-white bg-gray-800 border-gray-700"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => {
                  const dateValue = field.value
                    ? new Date(field.value)
                    : undefined;
                  return (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-white">
                        End Time <span className="text-destructive">*</span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "pl-3 text-left font-normal text-white bg-gray-800 border-gray-700",
                                !field.value && "text-muted-foreground",
                                conflictMessage && "border-destructive"
                              )}
                              data-testid="endTime"
                            >
                              {field.value ? (
                                format(dateValue!, "PPP HH:mm")
                              ) : (
                                <span>Pick a date and time</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 bg-gray-800 text-white border-gray-700"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={dateValue}
                            onSelect={(date) => {
                              if (date) {
                                const newDate = new Date(date);
                                if (field.value) {
                                  const currentDate = new Date(field.value);
                                  newDate.setHours(
                                    currentDate.getHours(),
                                    currentDate.getMinutes()
                                  );
                                } else {
                                  newDate.setHours(17, 0); // Default time
                                }
                                field.onChange(newDate.toISOString());
                              } else {
                                field.onChange(undefined);
                              }
                            }}
                            disabled={(date) => {
                              const startTime = form.getValues("startTime");
                              return (
                                (startTime && date < new Date(startTime)) ||
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              );
                            }}
                            initialFocus
                          />
                          <div className="p-2 border-t border-gray-700">
                            <Input
                              type="time"
                              value={
                                dateValue ? format(dateValue, "HH:mm") : ""
                              }
                              onChange={(e) => {
                                if (e.target.value) {
                                  const [hours, minutes] = e.target.value
                                    .split(":")
                                    .map(Number);
                                  const newDate = dateValue
                                    ? new Date(dateValue)
                                    : new Date();
                                  newDate.setHours(hours, minutes);
                                  field.onChange(newDate.toISOString());
                                }
                              }}
                              className="text-white bg-gray-800 border-gray-700"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
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
                  className="resize-none text-white bg-gray-800 border-gray-700"
                  {...field}
                  data-testid="notes"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="text-white border-gray-700 hover:bg-gray-700 bg-black"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting || !!conflictMessage}
            data-testid="submit-order"
            className="text-white border-gray-700 hover:bg-gray-700 bg-black"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {order ? "Update Order" : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
