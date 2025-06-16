import React from 'react';
import { ZONES } from '../types';

interface ZoneFilterProps {
  selectedZone: string | null;
  onZoneChange: (zone: string | null) => void;
}

export function ZoneFilter({ selectedZone, onZoneChange }: ZoneFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onZoneChange(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selectedZone === null
            ? 'bg-gray-800 text-white'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Все зоны
      </button>
      
      {ZONES.map((zone) => (
        <button
          key={zone.id}
          onClick={() => onZoneChange(zone.id)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
            selectedZone === zone.id
              ? 'bg-gray-800 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <div className={`w-3 h-3 rounded-full mr-2 ${zone.color}`}></div>
          {zone.name}
        </button>
      ))}
    </div>
  );
}