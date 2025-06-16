import React from 'react';
import { Users } from 'lucide-react';
import { Table } from '../types';
import { Timer } from './Timer';

interface TableCardProps {
  table: Table;
  onTableClick: (table: Table) => void;
}

export function TableCard({ table, onTableClick }: TableCardProps) {
  const getStatusColor = () => {
    switch (table.status) {
      case 'free':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'occupied':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (table.status) {
      case 'free':
        return 'Свободен';
      case 'occupied':
        return 'В работе';
      case 'closed':
        return 'Закрыт';
      default:
        return 'Неизвестно';
    }
  };

  const getZoneColor = () => {
    switch (table.zone) {
      case 'bowling':
        return 'bg-blue-500';
      case 'billiards':
        return 'bg-green-500';
      case 'free':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div
      onClick={() => onTableClick(table)}
      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor()}`}
    >
      <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getZoneColor()}`}></div>
      
      <div className="flex flex-col items-center space-y-2">
        <h3 className="text-lg font-semibold">Стол {table.id}</h3>
        
        <div className="flex items-center space-x-1">
          <Users className="h-4 w-4" />
          <span className="text-sm">{table.guests}</span>
        </div>
        
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        
        {table.startTime && table.status === 'occupied' && (
          <Timer startTime={table.startTime} />
        )}
        
        {table.orders.length > 0 && (
          <div className="text-xs text-gray-600">
            Заказов: {table.orders.length}
          </div>
        )}
      </div>
    </div>
  );
}