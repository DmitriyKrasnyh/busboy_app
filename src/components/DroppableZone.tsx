import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableZoneProps {
  children: React.ReactNode;
  showGrid: boolean;
}

export function DroppableZone({ children, showGrid }: DroppableZoneProps) {
  const { setNodeRef } = useDroppable({
    id: 'hall-zone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`relative w-full h-[600px] bg-gray-50 overflow-hidden ${
        showGrid ? 'bg-grid-pattern' : ''
      }`}
      style={{
        backgroundImage: showGrid 
          ? 'radial-gradient(circle, #d1d5db 1px, transparent 1px)'
          : undefined,
        backgroundSize: showGrid ? '20px 20px' : undefined,
      }}
    >
      {children}
    </div>
  );
}