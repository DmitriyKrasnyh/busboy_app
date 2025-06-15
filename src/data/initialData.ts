// src/data/initialData.ts
import { Table, MenuItem, Wall } from '../types';

export const initialTables: Table[] = [
  {
    id: 1,
    number: 1,
    zone: 'free',
    status: 'free',
    guests: 0,
    orders: [],
    position: { x: 40, y: 40 },
    size: 'medium',
  },
  // добавляйте при необходимости…
];

export const initialMenuItems: MenuItem[] = [
  { id: 1, name: 'Кофе', category: 'Напитки', price: 200 },
  // …
];

export const initialWalls: Wall[] = []; // пока пусто
