// src/components/DraggableTable.tsx
// ---------------------------------------------------------------------------
// Перетаскиваемый стол в «Конструкторе зала» c улучшенным UI/UX
// ---------------------------------------------------------------------------
import React, { useEffect, useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

import { Table } from '../types';

/* ─── Визуальные константы ──────────────────────────────────────────────── */
const SIZE_PX: Record<NonNullable<Table['size']>, number> = {
  small: 40,
  medium: 56,
  large:  72,
};

const STATUS_COLORS: Record<Table['status'], string> = {
  free: 'bg-emerald-500',
  occupied: 'bg-rose-500',
  closed: 'bg-gray-400',
};

interface Props {
  table: Table;
}

const DraggableTableInner: React.FC<Props> = ({ table }) => {
  /* ---------------- dnd-kit ---------------- */
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: table.id });

  /* ---------------- Размеры + цвет ---------------- */
  const size = SIZE_PX[table.size ?? 'medium'];
  const bgColor = STATUS_COLORS[table.status];

  /* ---------------- Таймер «занято» ---------------- */
  const [minutes, setMinutes] = useState<number | null>(null);

  useEffect(() => {
    if (table.status !== 'occupied' || !table.startTime) {
      setMinutes(null);
      return;
    }

    const calc = () => {
      const diffMs = Date.now() - new Date(table.startTime!).getTime();
      setMinutes(Math.floor(diffMs / 60000));
    };

    calc();
    const id = setInterval(calc, 60_000);
    return () => clearInterval(id);
  }, [table.status, table.startTime]);

  /* ---------------- Guests badge ---------------- */
  const guestsBadge = useMemo(() => {
    if (table.guests && table.guests > 0)
      return (
        <span className="absolute -bottom-2 -right-2 rounded bg-white px-1 py-0.5 text-[10px] font-medium text-gray-800 shadow">
          {table.guests}
        </span>
      );
    return null;
  }, [table.guests]);

  /* ---------------- Render ---------------- */
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`select-none rounded-full text-white transition-transform duration-150 ${bgColor} ${
        isDragging ? 'ring-2 ring-blue-400 scale-110' : ''
      }`}
      style={{
        position: 'absolute',
        left: table.position?.x ?? 0,
        top: table.position?.y ?? 0,
        width: size,
        height: size,
        transform: CSS.Translate.toString(transform),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'grab',
      }}
    >
      {/* номер стола */}
      <span className="font-semibold leading-none">{table.number}</span>

      {/* таймер */}
      {minutes !== null && (
        <span className="absolute top-0.5 right-0.5 text-[9px] opacity-80">
          {minutes} m
        </span>
      )}

      {/* гости */}
      {guestsBadge}
    </div>
  );
};

export const DraggableTable = React.memo(DraggableTableInner);
