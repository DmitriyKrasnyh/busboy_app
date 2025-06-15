// src/components/Wall.tsx
// ---------------------------------------------------------------------------
// Динамическая «стена» — перетаскиваемая линия с плавным UX.
// ---------------------------------------------------------------------------
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Wall } from '../types';

/* ─── Визуальные настройки ─────────────────────────────────────────────── */
const DEFAULT_COLOR = '#475569'; // slate‑600

interface Props {
  wall: Wall;
  /** Стена‑черновик: рисуется пунктиром, не draggable */
  isDraft?: boolean;
}

export const WallComponent: React.FC<Props> = ({ wall, isDraft = false }) => {
  /* ---------------- dnd-kit ---------------- */
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `wall-${wall.id}`, disabled: isDraft });

  /* ---------------- Геометрия ---------------- */
  const length = Math.hypot(wall.end.x - wall.start.x, wall.end.y - wall.start.y);
  const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x);

  /* ---------------- Стили ---------------- */
  const translate = CSS.Translate.toString(transform); // "translate3d(x,y,0)" или "none"
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: wall.start.x,
    top: wall.start.y,
    width: length,
    height: wall.thickness,
    transform: `rotate(${angle}rad) ${translate}`,
    transformOrigin: '0 0',
    borderRadius: wall.thickness / 2,
    cursor: isDraft ? 'crosshair' : 'grab',
    transition: isDragging ? 'none' : 'background 120ms ease',
  };

  return (
    <div
      ref={setNodeRef}
      {...(!isDraft ? attributes : {})}
      {...(!isDraft ? listeners : {})}
      style={{
        ...baseStyle,
        background: isDraft ? 'transparent' : wall.color ?? DEFAULT_COLOR,
        outline: isDraft ? `2px dashed ${wall.color ?? DEFAULT_COLOR}` : undefined,
        boxShadow: isDragging ? '0 0 0 3px rgba(59,130,246,0.7)' : undefined, // ring‑blue‑500
      }}
    />
  );
};
