// lib/types.ts
export type ResourceStatus = "Available" | "Busy" | "Maintenance";
export type OrderStatus =
  | "Pending"
  | "Scheduled"
  | "InProgress"
  | "Completed"
  | "Cancelled";

export interface Resource {
  id: string;
  name: string;
  status: ResourceStatus;
}

export interface ProductionOrder {
  id: string;
  orderName: string;
  status: OrderStatus;
  resourceId?: string;
  startTime?: Date;
  endTime?: Date;
  notes?: string;
  createdAt: Date;
}