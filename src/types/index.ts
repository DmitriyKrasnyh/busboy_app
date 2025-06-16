export interface Table {
  id: number;
  zone: 'bowling' | 'billiards' | 'free';
  status: 'free' | 'occupied' | 'closed';
  guests: number;
  startTime?: Date;
  orders: Order[];
  position?: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
  waiterId?: number; // ID официанта, обслуживающего стол
}

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  guestNumber: number;
}

export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  totalAmount: number;
  timestamp: Date;
  isCompleted: boolean;
  waiterId: number; // ID официанта, принявшего заказ
}

export interface Zone {
  id: string;
  name: string;
  color: string;
}

export interface Wall {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  zone: 'bowling' | 'billiards' | 'free';
}

export interface HallLayout {
  walls: Wall[];
  tables: Table[];
}

export interface User {
  id: number;
  username: string;
  password: string;
  role: 'admin' | 'waiter' | 'manager';
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  isActive: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface WaiterStats {
  waiterId: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  tablesServed: number;
  workingHours: number;
  ordersToday: number;
  revenueToday: number;
  ordersThisWeek: number;
  revenueThisWeek: number;
  ordersThisMonth: number;
  revenueThisMonth: number;
  lastOrderTime?: Date;
  topCategories: { category: string; count: number; revenue: number }[];
  performanceRating: number; // 1-5 звезд
}

export interface WorkSession {
  id: number;
  waiterId: number;
  startTime: Date;
  endTime?: Date;
  totalOrders: number;
  totalRevenue: number;
  isActive: boolean;
}

export const ZONES: Zone[] = [
  { id: 'bowling', name: 'Боулинг', color: 'bg-blue-500' },
  { id: 'billiards', name: 'Бильярд', color: 'bg-green-500' },
  { id: 'free', name: 'Свободная зона', color: 'bg-purple-500' }
];

export const MENU_CATEGORIES = [
  'Закуски',
  'Горячее', 
  'Напитки',
  'Барная карта',
  'Десерты'
];

export const TABLE_SIZES = {
  small: { width: 60, height: 60, label: 'Малый' },
  medium: { width: 80, height: 80, label: 'Средний' },
  large: { width: 100, height: 100, label: 'Большой' }
} as const;

export const USER_ROLES = {
  admin: 'Администратор',
  waiter: 'Официант',
  manager: 'Менеджер'
} as const;