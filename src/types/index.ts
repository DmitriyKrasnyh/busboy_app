export interface Table {
  id: number;
  zone: 'bowling' | 'billiards' | 'free';
  status: 'free' | 'occupied' | 'closed';
  guests: number;
  startTime?: Date;
  orders: Order[];
  position?: { x: number; y: number };
  size?: 'small' | 'medium' | 'large';
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
}

export interface Zone {
  id: string;
  name: string;
  color: string;
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