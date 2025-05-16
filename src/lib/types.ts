export type Resource = {
  id: string;
  name: string;
  status: 'Available' | 'Busy' | 'Maintenance';
  createdAt: string;
  updatedAt: string;
};

export type ProductionOrder = {
  id: string;
  orderName: string;
  status: 'Pending' | 'Scheduled' | 'InProgress' | 'Completed' | 'Cancelled';
  resourceId?: string;
  resource?: Resource;
  startTime?: string;
  endTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};