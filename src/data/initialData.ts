import { Table, MenuItem } from '../types';

export const initialTables: Table[] = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  zone: i < 12 ? 'bowling' : i < 24 ? 'billiards' : 'free',
  status: 'free',
  guests: 0,
  orders: [],
}));

export const initialMenuItems: MenuItem[] = [
  // Закуски
  { id: 1, name: 'Брускетта с томатами', category: 'Закуски', price: 450 },
  { id: 2, name: 'Сырная тарелка', category: 'Закуски', price: 750 },
  { id: 3, name: 'Креветки в кляре', category: 'Закуски', price: 890 },
  { id: 4, name: 'Куриные крылышки', category: 'Закуски', price: 520 },
  
  // Горячее
  { id: 5, name: 'Стейк рибай', category: 'Горячее', price: 1850 },
  { id: 6, name: 'Лосось на гриле', category: 'Горячее', price: 1250 },
  { id: 7, name: 'Паста карбонара', category: 'Горячее', price: 680 },
  { id: 8, name: 'Курица терияки', category: 'Горячее', price: 790 },
  
  // Напитки
  { id: 9, name: 'Кока-кола', category: 'Напитки', price: 180 },
  { id: 10, name: 'Свежевыжатый сок', category: 'Напитки', price: 250 },
  { id: 11, name: 'Кофе эспрессо', category: 'Напитки', price: 120 },
  { id: 12, name: 'Чай зеленый', category: 'Напитки', price: 150 },
  
  // Барная карта
  { id: 13, name: 'Мохито', category: 'Барная карта', price: 420 },
  { id: 14, name: 'Виски кола', category: 'Барная карта', price: 380 },
  { id: 15, name: 'Пиво светлое', category: 'Барная карта', price: 220 },
  { id: 16, name: 'Вино красное', category: 'Барная карта', price: 350 },
  
  // Десерты
  { id: 17, name: 'Тирамису', category: 'Десерты', price: 320 },
  { id: 18, name: 'Чизкейк', category: 'Десерты', price: 280 },
  { id: 19, name: 'Мороженое', category: 'Десерты', price: 180 },
  { id: 20, name: 'Шоколадный фондан', category: 'Десерты', price: 390 },
];