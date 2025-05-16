"use client"; // Provider will be a client component

import React, { createContext, useReducer, useContext, ReactNode, Dispatch } from 'react';
import { ProductionOrder, Resource, OrderStatus } from '@/lib/types'; // Ensure path is correct
import { initialResources, initialOrders } from '@/lib/initialData'; // Ensure path is correct

// 1. Define State and Action Types
interface AppState {
  resources: Resource[];
  productionOrders: ProductionOrder[];
}

type Action =
  | { type: 'ADD_ORDER'; payload: Omit<ProductionOrder, 'id' | 'createdAt' | 'status'> }
  | { type: 'UPDATE_ORDER'; payload: { orderId: string; updates: Partial<Omit<ProductionOrder, 'id' | 'createdAt'>> } }
  // Add other actions as needed, e.g., SET_ORDER_STATUS, DELETE_ORDER

const initialState: AppState = {
  resources: initialResources,
  productionOrders: initialOrders,
};

// 2. Create Reducer
function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_ORDER':
      const newOrder: ProductionOrder = {
        ...action.payload,
        id: `PO-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        status: 'Pending',
        createdAt: new Date(),
      };
      return {
        ...state,
        productionOrders: [...state.productionOrders, newOrder],
      };
    case 'UPDATE_ORDER':
      return {
        ...state,
        productionOrders: state.productionOrders.map((order) =>
          order.id === action.payload.orderId
            ? { ...order, ...action.payload.updates }
            : order
        ),
      };
    // Handle other actions
    default:
      return state;
  }
}

// 3. Create Contexts
// One for the state, one for the dispatch function
const AppStateContext = createContext<AppState | undefined>(undefined);
const AppDispatchContext = createContext<Dispatch<Action> | undefined>(undefined);

// 4. Create Provider Component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>
        {children}
      </AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}

// 5. Create Custom Hooks to consume contexts
export function useAppState() {
  const context = useContext(AppStateContext);
  if (context === undefined) {
    throw new Error('useAppState must be used within an AppProvider');
  }
  // Add helper functions/selectors here if needed
  const getResourceById = (resourceId: string): Resource | undefined => {
    return context.resources.find((res) => res.id === resourceId);
  };
  const getOrderById = (orderId: string): ProductionOrder | undefined => {
    return context.productionOrders.find((order) => order.id === orderId);
  };
   const getFilteredOrders = (status?: OrderStatus): ProductionOrder[] => {
    if (!status) return context.productionOrders;
    return context.productionOrders.filter(order => order.status === status);
  };

  return { ...context, getResourceById, getOrderById, getFilteredOrders };
}

export function useAppDispatch() {
  const context = useContext(AppDispatchContext);
  if (context === undefined) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context;
}