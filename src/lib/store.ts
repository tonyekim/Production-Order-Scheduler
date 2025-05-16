
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Resource, ProductionOrder, OrderStatus } from './types';
import { initialResources, initialOrders } from './initialData';

interface AppState {
  resources: Resource[];
  productionOrders: ProductionOrder[];
  addOrder: (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'status'>) => ProductionOrder;
  updateOrder: (orderId: string, updates: Partial<Omit<ProductionOrder, 'id' | 'createdAt'>>) => void;
  getFilteredOrders: (status?: OrderStatus) => ProductionOrder[];
  getOrderById: (orderId: string) => ProductionOrder | undefined;
  getResourceById: (resourceId: string) => Resource | undefined;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      resources: initialResources,
      productionOrders: initialOrders,
      addOrder: (newOrderData) => {
        const newOrder: ProductionOrder = {
          ...newOrderData,
          id: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          status: 'Pending',
          createdAt: new Date(),
        };
        set((state) => ({
          productionOrders: [...state.productionOrders, newOrder],
        }));
        return newOrder;
      },
      updateOrder: (orderId, updates) => {
        set((state) => ({
          productionOrders: state.productionOrders.map((order) =>
            order.id === orderId ? { ...order, ...updates } : order
          ),
        }));
      },
      getFilteredOrders: (status) => {
        const orders = get().productionOrders;
        if (!status) return orders;
        return orders.filter((order) => order.status === status);
      },
      getOrderById: (orderId) => {
        return get().productionOrders.find((order) => order.id === orderId);
      },
      getResourceById: (resourceId) => {
        return get().resources.find((res) => res.id === resourceId);
      },
    }),
    { name: 'ProductionOrderStore' }
  )
);