import React, { useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { TableCard } from './TableCard';
import { ZoneFilter } from './ZoneFilter';
import { OrderModal } from './OrderModal';
import { HallView } from './HallView';
import { Table } from '../types';
import { Layout, Grid } from 'lucide-react';

export function TablesView() {
  const { state } = useRestaurant();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'hall'>('hall');

  const filteredTables = selectedZone
    ? state.tables.filter(table => table.zone === selectedZone)
    : state.tables;

  const handleTableClick = (table: Table) => {
    if (table.status === 'free' || table.status === 'occupied') {
      setSelectedTable(table);
    }
  };

  // Check if any zone has custom layout
  const hasCustomLayouts = state.tables.some(table => table.position) || 
                          (state.hallLayout?.walls?.length || 0) > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Управление столами</h2>
          
          {hasCustomLayouts && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('hall')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  viewMode === 'hall'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Layout className="h-4 w-4 mr-1" />
                План зала
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  viewMode === 'grid'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Grid className="h-4 w-4 mr-1" />
                Сетка
              </button>
            </div>
          )}
        </div>
        
        <ZoneFilter selectedZone={selectedZone} onZoneChange={setSelectedZone} />
      </div>

      {viewMode === 'hall' && hasCustomLayouts && selectedZone ? (
        <HallView 
          zone={selectedZone as 'bowling' | 'billiards' | 'free'} 
          onTableClick={handleTableClick} 
        />
      ) : viewMode === 'hall' && hasCustomLayouts && !selectedZone ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border">
          <Layout className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Выберите зону для просмотра плана зала</h3>
          <p className="text-gray-600">Используйте фильтры выше для выбора конкретной зоны</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {filteredTables.map((table) => (
            <TableCard
              key={table.id}
              table={table}
              onTableClick={handleTableClick}
            />
          ))}
        </div>
      )}

      {selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  );
}