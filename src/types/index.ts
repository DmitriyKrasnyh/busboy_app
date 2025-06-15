// src/types/index.ts
// ---------------------------------------------------------------------------
// Общие типы приложения ресторана: точки, зоны, стены, столы, меню и заказы
// ---------------------------------------------------------------------------

/* ─── Геометрия ─────────────────────────────────────────────────────────── */
export type Point = { x: number; y: number };
export const ORIGIN: Point = { x: 0, y: 0 };

/* ── Зоны зала ──────────────────────────────────────────────────────────── */
export type ZoneId = 'bowling' | 'billiards' | 'free';

export interface Zone {
  id: ZoneId;
  name: string;   // отображаемое имя
  color: string;  // класс Tailwind (bg-*)
}

export const ZONES: readonly Zone[] = [
  { id: 'bowling',   name: 'Боулинг',        color: 'bg-blue-500' },
  { id: 'billiards', name: 'Бильярд',        color: 'bg-green-600' },
  { id: 'free',      name: 'Свободная зона', color: 'bg-purple-500' },
] as const;

/* ── Стены ──────────────────────────────────────────────────────────────── */
export interface Wall {
  id: number;
  start: Point;         // начало линии
  end:   Point;         // конец линии
  thickness: number;    // px
  color?: string;       // hex / Tailwind
}

/* ── Столы ──────────────────────────────────────────────────────────────── */
export type TableStatus = 'free' | 'occupied' | 'closed';
export type TableSize   = 'small' | 'medium' | 'large';

export const TABLE_SIZE_PX: Record<TableSize, number> = {
  small: 36,
  medium: 52,
  large: 72,
};

export interface Table {
  id: number;
  number: number;       // номер для официанта
  zone: ZoneId;
  status: TableStatus;
  guests: number;
  startTime?: Date;
  orders: Order[];
  position: Point;      // обязатель­но задаём позицию
  size: TableSize;
}

/* ── Меню ──────────────────────────────────────────────────────────────── */
export interface MenuItem {
  id: number;
  name: string;
  category: typeof MENU_CATEGORIES[number];
  price: number;           // в копейках → int, но пока number
}

export const MENU_CATEGORIES = [
  'Закуски',
  'Горячее',
  'Напитки',
  'Барная карта',
  'Десерты',
] as const;

/* ── Заказы ─────────────────────────────────────────────────────────────── */
export interface OrderItem {
  id: number;
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: number;
  tableId: number;
  items: OrderItem[];
  totalAmount: number;   // рассчитывается = Σ(item.price * qty)
  timestamp: Date;
  isCompleted: boolean;
}

/* ── Утилиты ────────────────────────────────────────────────────────────── */
export const calcTotal = (items: OrderItem[]): number =>
  items.reduce((sum, i) => sum + i.menuItem.price * i.quantity, 0);
