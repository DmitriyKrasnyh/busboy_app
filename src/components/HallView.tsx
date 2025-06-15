import React from 'react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { Table } from '../types';
import { StaticTable } from './StaticTable';
import { StaticWall } from './StaticWall';

interface Props {
  onTableClick: (table: Table) => void;
}

export const HallView: React.FC<Props> = ({ onTableClick }) => {
  const { state } = useRestaurant();

  return (
    <div className="relative w-full h-[600px] border border-gray-300 bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[length:10px_10px]">
      {state.walls.map((w) => (
        <StaticWall key={w.id} wall={w} />
      ))}
      {state.tables.map((t) => (
        <StaticTable key={t.id} table={t} onClick={onTableClick} />
      ))}
    </div>
  );
};
