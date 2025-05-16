
import { z } from 'zod';
export const ORDER_STATUSES = ['Pending', 'Scheduled', 'InProgress', 'Completed', 'Cancelled'] as const;
export const RESOURCE_STATUSES = ['Available', 'Busy', 'Maintenance'] as const;

export const OrderStatusEnum = z.enum(ORDER_STATUSES);
export const ResourceStatusEnum = z.enum(RESOURCE_STATUSES);


export const productionOrderSchema = z.object({
  orderName: z.string().min(3, { message: "Order name must be at least 3 characters long." }),
  notes: z.string().optional(),
  status: OrderStatusEnum.default('Pending'),
  resourceId: z.string().optional(),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
})
.refine(data => { // Validation for scheduling
    if (data.status === 'Scheduled') {
        return !!data.resourceId && !!data.startTime && !!data.endTime;
    }
    return true;
}, { message: "Resource, Start Time, and End Time are required for 'Scheduled' orders.", path: ['status']})
.refine(data => {
    if (data.startTime && data.endTime) {
        return data.endTime > data.startTime;
    }
    return true;
}, { message: "End time must be after start time.", path: ['endTime'] });

export type ProductionOrderFormData = z.infer<typeof productionOrderSchema>;