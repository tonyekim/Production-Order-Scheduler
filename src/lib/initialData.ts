
import { Resource, ProductionOrder } from './types';

export const initialResources: Resource[] = [
  { id: 'res-001', name: 'CNC Machine 1', status: 'Available' },
  { id: 'res-002', name: 'Assembly Line A', status: 'Available' },
  { id: 'res-003', name: 'Painting Booth', status: 'Busy' },
  { id: 'res-004', name: 'CNC Machine 2', status: 'Maintenance' },
];

export const initialOrders: ProductionOrder[] = [
  {
    id: `PO-${Date.now()}`,
    orderName: 'Sample Pending Order',
    status: 'Pending',
    createdAt: new Date(),
    notes: 'This is a sample order to start with.',
  },
];


