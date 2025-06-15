import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import {
  Table,
  MenuItem,
  Order,
  OrderItem,
  Wall,
  TableStatus,
} from '../types';
import {
  initialTables,
  initialMenuItems,
  initialWalls,
} from '../data/initialData';

/* ---------------------------------------------------------------------------
 * Типы и утилиты
 * ------------------------------------------------------------------------*/
interface RestaurantState {
  tables: Table[];
  walls: Wall[];
  menuItems: MenuItem[];
  /** Сводка завершённых заказов – пригодится для отчётов */
  orders: Order[];
  currentView: 'tables' | 'admin';
}

/* ---------------------------------------------------------------------------
 * Действия
 * ------------------------------------------------------------------------*/
export type RestaurantAction =
  | { type: 'SET_TABLE_STATUS'; tableId: number; status: TableStatus; guests?: number }
  | { type: 'ADD_ORDER_ITEM'; tableId: number; item: OrderItem }
  | { type: 'REMOVE_ORDER_ITEM'; tableId: number; orderId: number; itemIndex: number }
  | { type: 'COMPLETE_ORDER'; tableId: number; orderId: number }
  | { type: 'ADD_TABLE'; table: Omit<Table, 'id'> }
  | { type: 'UPDATE_TABLE'; tableId: number; updates: Partial<Table> }
  | { type: 'DELETE_TABLE'; tableId: number }
  | { type: 'ADD_WALL'; wall: Omit<Wall, 'id'> }
  | { type: 'UPDATE_WALL'; wallId: number; updates: Partial<Wall> }
  | { type: 'DELETE_WALL'; wallId: number }
  | { type: 'ADD_MENU_ITEM'; item: Omit<MenuItem, 'id'> }
  | { type: 'UPDATE_MENU_ITEM'; itemId: number; updates: Partial<MenuItem> }
  | { type: 'DELETE_MENU_ITEM'; itemId: number }
  | { type: 'SET_VIEW'; view: 'tables' | 'admin' }
  | { type: 'LOAD_DATA'; data: RestaurantState };

/* ---------------------------------------------------------------------------
 * Стартовое состояние
 * ------------------------------------------------------------------------*/
const initialState: RestaurantState = {
  tables: initialTables,
  walls: initialWalls,
  menuItems: initialMenuItems,
  orders: [],
  currentView: 'tables',
};

/* ---------------------------------------------------------------------------
 * Редьюсер
 * ------------------------------------------------------------------------*/
function restaurantReducer(state: RestaurantState, action: RestaurantAction): RestaurantState {
  switch (action.type) {
    /* ---------- СТАТУС СТОЛА ---------- */
    case 'SET_TABLE_STATUS': {
      return {
        ...state,
        tables: state.tables.map((t) =>
          t.id === action.tableId
            ? {
                ...t,
                status: action.status,
                guests: action.guests ?? t.guests,
                startTime: action.status === 'occupied' ? new Date() : undefined,
                orders: action.status === 'free' || action.status === 'closed' ? [] : t.orders,
              }
            : t,
        ),
      };
    }

    /* ---------- ДОБАВИТЬ ПОЗИЦИЮ ---------- */
    case 'ADD_ORDER_ITEM': {
      return {
        ...state,
        tables: state.tables.map((table) => {
          if (table.id !== action.tableId) return table;

          // берём или создаём активный заказ
          let order = table.orders.find((o) => !o.isCompleted);
          if (!order) {
            order = {
              id: Date.now(),
              tableId: table.id,
              items: [],
              totalAmount: 0,
              timestamp: new Date(),
              isCompleted: false,
            } as Order;
          }

          order = {
            ...order,
            items: [...order.items, action.item],
            totalAmount: order.totalAmount + action.item.menuItem.price * action.item.quantity,
          };

          const others = table.orders.filter((o) => o.id !== order!.id);
          return { ...table, status: 'occupied', orders: [...others, order] };
        }),
      };
    }

    /* ---------- УДАЛИТЬ ПОЗИЦИЮ ---------- */
    case 'REMOVE_ORDER_ITEM': {
      return {
        ...state,
        tables: state.tables.map((table) => {
          if (table.id !== action.tableId) return table;
          const order = table.orders.find((o) => o.id === action.orderId);
          if (!order) return table;

          const items = order.items.filter((_, i) => i !== action.itemIndex);
          const total = items.reduce((s, it) => s + it.menuItem.price * it.quantity, 0);
          const updated = { ...order, items, totalAmount: total };
          const others = table.orders.filter((o) => o.id !== order.id);
          return { ...table, orders: [...others, updated] };
        }),
      };
    }

    /* ---------- ЗАКРЫТЬ ЗАКАЗ ---------- */
    case 'COMPLETE_ORDER': {
      return {
        ...state,
        tables: state.tables.map((t) => {
          if (t.id !== action.tableId) return t;

          const doneOrders = t.orders.map((o) => (o.id === action.orderId ? { ...o, isCompleted: true } : o));
          const completed = doneOrders.find((o) => o.id === action.orderId);

          return {
            ...t,
            status: 'closed',
            guests: 0,
            orders: [],
          };
        }),
        orders: [
          ...state.orders,
          ...state.tables
            .find((tb) => tb.id === action.tableId)?.orders.filter((o) => o.id === action.orderId) ?? [],
        ],
      };
    }

    /* ---------- ТАБЛИЦЫ ---------- */
    case 'ADD_TABLE': {
      const id = Math.max(0, ...state.tables.map((t) => t.id)) + 1;
      return { ...state, tables: [...state.tables, { ...action.table, id }] };
    }
    case 'UPDATE_TABLE': {
      return { ...state, tables: state.tables.map((t) => (t.id === action.tableId ? { ...t, ...action.updates } : t)) };
    }
    case 'DELETE_TABLE': {
      return { ...state, tables: state.tables.filter((t) => t.id !== action.tableId) };
    }

    /* ---------- СТЕНЫ ---------- */
    case 'ADD_WALL': {
      const id = Math.max(0, ...state.walls.map((w) => w.id)) + 1;
      return { ...state, walls: [...state.walls, { ...action.wall, id }] };
    }
    case 'UPDATE_WALL': {
      return { ...state, walls: state.walls.map((w) => (w.id === action.wallId ? { ...w, ...action.updates } : w)) };
    }
    case 'DELETE_WALL': {
      return { ...state, walls: state.walls.filter((w) => w.id !== action.wallId) };
    }

    /* ---------- МЕНЮ ---------- */
    case 'ADD_MENU_ITEM': {
      const id = Math.max(0, ...state.menuItems.map((i) => i.id)) + 1;
      return { ...state, menuItems: [...state.menuItems, { ...action.item, id }] };
    }
    case 'UPDATE_MENU_ITEM': {
      return { ...state, menuItems: state.menuItems.map((i) => (i.id === action.itemId ? { ...i, ...action.updates } : i)) };
    }
    case 'DELETE_MENU_ITEM': {
      return { ...state, menuItems: state.menuItems.filter((i) => i.id !== action.itemId) };
    }

    /* ---------- ПРОЧЕЕ ---------- */
    case 'SET_VIEW': {
      return { ...state, currentView: action.view };
    }
    case 'LOAD_DATA': {
      return action.data;
    }
    default:
      return state;
  }
}

/* ---------------------------------------------------------------------------
 * Контекст / Провайдер
 * ------------------------------------------------------------------------*/
const RestaurantContext = createContext<{ state: RestaurantState; dispatch: React.Dispatch<RestaurantAction> } | null>(
  null,
);

export const RestaurantProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(restaurantReducer, initialState);

  /* ---------- load from storage ---------- */
  useEffect(() => {
    const raw = localStorage.getItem('restaurant-data');
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as RestaurantState;
      // revive Date
      const revived: RestaurantState = {
        ...parsed,
        tables: parsed.tables.map((t) => ({
          ...t,
          startTime: t.startTime ? new Date(t.startTime) : undefined,
          orders: t.orders.map((o) => ({ ...o, timestamp: new Date(o.timestamp) })),
        })),
        orders: parsed.orders.map((o) => ({ ...o, timestamp: new Date(o.timestamp) })),
      };
      dispatch({ type: 'LOAD_DATA', data: revived });
    } catch (e) {
      console.error('Invalid restaurant-data', e);
    }
  }, []);

  /* ---------- save to storage ---------- */
  useEffect(() => {
    localStorage.setItem('restaurant-data', JSON.stringify(state));
  }, [state]);

  return <RestaurantContext.Provider value={{ state, dispatch }}>{children}</RestaurantContext.Provider>;
};

export const useRestaurant = () => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) throw new Error('useRestaurant must be used within RestaurantProvider');
  return ctx;
};
