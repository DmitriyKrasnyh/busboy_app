import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Table, MenuItem, Order, OrderItem } from '../types';
import { initialTables, initialMenuItems } from '../data/initialData';

interface RestaurantState {
  tables: Table[];
  menuItems: MenuItem[];
  orders: Order[];
  currentView: 'tables' | 'admin';
}

type RestaurantAction =
  | { type: 'SET_TABLE_STATUS'; tableId: number; status: Table['status']; guests?: number }
  | { type: 'ADD_ORDER_ITEM'; tableId: number; item: OrderItem }
  | { type: 'REMOVE_ORDER_ITEM'; tableId: number; itemIndex: number }
  | { type: 'COMPLETE_ORDER'; tableId: number }
  | { type: 'ADD_TABLE'; table: Omit<Table, 'id'> }
  | { type: 'UPDATE_TABLE'; tableId: number; updates: Partial<Table> }
  | { type: 'DELETE_TABLE'; tableId: number }
  | { type: 'ADD_MENU_ITEM'; item: Omit<MenuItem, 'id'> }
  | { type: 'UPDATE_MENU_ITEM'; itemId: number; updates: Partial<MenuItem> }
  | { type: 'DELETE_MENU_ITEM'; itemId: number }
  | { type: 'SET_VIEW'; view: 'tables' | 'admin' }
  | { type: 'LOAD_DATA'; data: RestaurantState };

const initialState: RestaurantState = {
  tables: initialTables,
  menuItems: initialMenuItems,
  orders: [],
  currentView: 'tables',
};

function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  switch (action.type) {
    case 'SET_TABLE_STATUS':
      return {
        ...state,
        tables: state.tables.map(table =>
          table.id === action.tableId
            ? {
                ...table,
                status: action.status,
                guests: action.guests || table.guests,
                startTime: action.status === 'occupied' ? new Date() : undefined,
                orders: action.status === 'free' ? [] : table.orders
              }
            : table
        ),
      };

    case 'ADD_ORDER_ITEM':
      return {
        ...state,
        tables: state.tables.map(table =>
          table.id === action.tableId
            ? {
                ...table,
                orders: [...table.orders, {
                  id: Date.now(),
                  tableId: action.tableId,
                  items: [action.item],
                  totalAmount: action.item.menuItem.price * action.item.quantity,
                  timestamp: new Date(),
                  isCompleted: false
                }]
              }
            : table
        ),
      };

    case 'COMPLETE_ORDER':
      return {
        ...state,
        tables: state.tables.map(table =>
          table.id === action.tableId
            ? { ...table, status: 'closed' }
            : table
        ),
      };

    case 'ADD_TABLE':
      const newTableId = Math.max(...state.tables.map(t => t.id), 0) + 1;
      return {
        ...state,
        tables: [...state.tables, { ...action.table, id: newTableId }],
      };

    case 'UPDATE_TABLE':
      return {
        ...state,
        tables: state.tables.map(table =>
          table.id === action.tableId
            ? { ...table, ...action.updates }
            : table
        ),
      };

    case 'DELETE_TABLE':
      return {
        ...state,
        tables: state.tables.filter(table => table.id !== action.tableId),
      };

    case 'ADD_MENU_ITEM':
      const newItemId = Math.max(...state.menuItems.map(i => i.id), 0) + 1;
      return {
        ...state,
        menuItems: [...state.menuItems, { ...action.item, id: newItemId }],
      };

    case 'UPDATE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.map(item =>
          item.id === action.itemId
            ? { ...item, ...action.updates }
            : item
        ),
      };

    case 'DELETE_MENU_ITEM':
      return {
        ...state,
        menuItems: state.menuItems.filter(item => item.id !== action.itemId),
      };

    case 'SET_VIEW':
      return {
        ...state,
        currentView: action.view,
      };

    case 'LOAD_DATA':
      return action.data;

    default:
      return state;
  }
}

const RestaurantContext = createContext<{
  state: RestaurantState;
  dispatch: React.Dispatch<RestaurantAction>;
} | null>(null);

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);

  useEffect(() => {
    const savedData = localStorage.getItem('restaurant-data');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure dates are properly restored
        const restoredData = {
          ...parsedData,
          tables: parsedData.tables.map((table: any) => ({
            ...table,
            startTime: table.startTime ? new Date(table.startTime) : undefined,
            orders: table.orders.map((order: any) => ({
              ...order,
              timestamp: new Date(order.timestamp)
            }))
          }))
        };
        dispatch({ type: 'LOAD_DATA', data: restoredData });
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('restaurant-data', JSON.stringify(state));
  }, [state]);

  return (
    <RestaurantContext.Provider value={{ state, dispatch }}>
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}