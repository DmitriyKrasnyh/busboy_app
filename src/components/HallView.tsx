import React from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { TableCard } from './TableCard';
import { Table } from '../types';

interface HallViewProps {
  zone: 'bowling' | 'billiards' | 'free';
  onTableClick: (table: Table) => void;
}

export function HallView({ zone, onTableClick }: HallViewProps) {
  const { state } = useRestaurant();
  
  const zoneTables = state.tables.filter(table => table.zone === zone);
  const zoneWalls = state.hallLayout?.walls?.filter(wall => wall.zone === zone) || [];
  
  // Check if this zone has a custom layout
  const hasCustomLayout = zoneTables.some(table => table.position) || zoneWalls.length > 0;

  if (!hasCustomLayout) {
    // Fallback to grid layout if no custom layout exists
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {zoneTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onTableClick={onTableClick}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative bg-gray-50 rounded-lg border min-h-[600px] overflow-hidden">
      {/* Background grid */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      
      {/* Walls */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        {zoneWalls.map((wall) => (
          <line
            key={wall.id}
            x1={wall.startX}
            y1={wall.startY}
            x2={wall.endX}
            y2={wall.endY}
            stroke="#374151"
            strokeWidth="4"
            strokeLinecap="round"
          />
        ))}
      </svg>
      
      {/* Tables */}
      {zoneTables.map((table) => {
        const position = table.position || { x: 100, y: 100 };
        const size = table.size || 'medium';
        
        return (
          <div
            key={table.id}
            className="absolute cursor-pointer transform hover:scale-105 transition-transform duration-200"
            style={{
              left: position.x,
              top: position.y,
            }}
            onClick={() => onTableClick(table)}
          >
            <div className={`
              bg-white border-2 rounded-lg flex items-center justify-center font-medium shadow-sm hover:shadow-md transition-shadow
              ${table.status === 'free' ? 'border-green-300 text-green-800' :
                table.status === 'occupied' ? 'border-yellow-300 text-yellow-800' :
                'border-red-300 text-red-800'}
            `}
            style={{
              width: size === 'small' ? 60 : size === 'medium' ? 80 : 100,
              height: size === 'small' ? 60 : size === 'medium' ? 80 : 100,
            }}>
              <div className="text-center">
                <div className="font-bold text-lg">{table.id}</div>
                {table.guests > 0 && (
                  <div className="text-xs opacity-75">{table.guests} гост.</div>
                )}
              </div>
            </div>
            
            {/* Status indicator */}
            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
              table.status === 'free' ? 'bg-green-500' :
              table.status === 'occupied' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
          </div>
        );
      })}
    </div>
  );
}