import React, { useState } from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { TableCard } from './TableCard';
import { ZoneFilter } from './ZoneFilter';
import { OrderModal } from './OrderModal';
import { Table } from '../types';

export function TablesView() {
  const { state } = useRestaurant();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  const filteredTables = selectedZone
    ? state.tables.filter(table => table.zone === selectedZone)
    : state.tables;

  const handleTableClick = (table: Table) => {
    if (table.status === 'free' || table.status === 'occupied') {
      setSelectedTable(table);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Управление столами</h2>
        <ZoneFilter selectedZone={selectedZone} onZoneChange={setSelectedZone} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {filteredTables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onTableClick={handleTableClick}
          />
        ))}
      </div>

      {selectedTable && (
        <OrderModal
          table={selectedTable}
          onClose={() => setSelectedTable(null)}
        />
      )}
    </div>
  );
}