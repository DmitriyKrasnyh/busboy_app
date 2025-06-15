// src/components/HallDesigner.tsx
// ---------------------------------------------------------------------------
// Конструктор зала 2.0
// ---------------------------------------------------------------------------
// UX‑фишки:
// • Мини‑панель инструментов (T – стол, W – стена, G – сетка on/off)
// • Подсветка активного инструмента и курсора
// • Стена «призрак» — пунктир пока рисуешь
// • Снэп к сетке с on/off
// ---------------------------------------------------------------------------
import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  DragEndEvent,
} from '@dnd-kit/core';
import { useRestaurant } from '../contexts/RestaurantContext';
import { Table, Wall } from '../types';
import { DraggableTable } from './DraggableTable';
import { WallComponent } from './Wall';

/* ─── Config ────────────────────────────────────────────────────────────── */
const GRID = 10; // px
const WALL_THICKNESS = 8;

const snap = (v: number) => Math.round(v / GRID) * GRID;

/**
 * Инструменты редактора.
 * selection оставлен «на будущее», если понадобятся перемещения стен.
 */
export type Tool = 'table' | 'wall';

/* ─── Компонент ─────────────────────────────────────────────────────────── */
export const HallDesigner: React.FC = () => {
  const { state, dispatch } = useRestaurant();

  /* ---------------- Данные компонентов ---------------- */
  const [tool, setTool] = useState<Tool>('table');
  const [isSnap, setIsSnap] = useState<boolean>(true);
  const [draftWall, setDraftWall] = useState<Wall | null>(null);

  /* ---------------- Горячие клавиши ---------------- */
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 't') setTool('table');
      if (e.key.toLowerCase() === 'w') setTool('wall');
      if (e.key.toLowerCase() === 'g') setIsSnap((s) => !s);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  /* ---------------- DnD‑kit для столов ---------------- */
  const sensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 4 },
  });

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const id = Number(event.active.id);
      const table = state.tables.find((t) => t.id === id);
      if (!table) return;

      const newPos = {
        x: (table.position?.x || 0) + event.delta.x,
        y: (table.position?.y || 0) + event.delta.y,
      } as Table['position'];

      const posSnap = isSnap ? { x: snap(newPos.x), y: snap(newPos.y) } : newPos;

      dispatch({
        type: 'UPDATE_TABLE',
        tableId: id,
        updates: { position: posSnap },
      });
    },
    [state.tables, dispatch, isSnap]
  );

  /* ---------------- Помощники для стены ---------------- */
  const getOffset = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const raw = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    return isSnap ? { x: snap(raw.x), y: snap(raw.y) } : raw;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (tool !== 'wall') return;
    const start = getOffset(e);
    setDraftWall({ id: Date.now(), start, end: start, thickness: WALL_THICKNESS });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draftWall) return;
    setDraftWall({ ...draftWall, end: getOffset(e) });
  };

  const handlePointerUp = () => {
    if (!draftWall) return;
    // Игнорируем стены длиной < 5 px, чтобы не плодить «точки»
    const dx = draftWall.end.x - draftWall.start.x;
    const dy = draftWall.end.y - draftWall.start.y;
    if (Math.hypot(dx, dy) > 5) dispatch({ type: 'ADD_WALL', wall: draftWall });
    setDraftWall(null);
  };

  /* ---------------- UI helpers ---------------- */
  const toolClass = (t: Tool) =>
    `rounded px-3 py-1 text-sm shadow transition ${
          tool === t ? 'bg-gray-800 text-white' : 'bg-white border'
        }`;

  /* ---------------- Render ---------------- */
  return (
    <div className="flex h-full w-full flex-col">
      {/* Toolbar */}
      <div className="mb-3 flex gap-2 text-slate-700">
        <button className={toolClass('table')} onClick={() => setTool('table')}>
          🪑 Столы <kbd className="ml-1 text-xs text-slate-400">T</kbd>
        </button>
        <button className={toolClass('wall')} onClick={() => setTool('wall')}>
          🧱 Стены <kbd className="ml-1 text-xs text-slate-400">W</kbd>
        </button>
        <button
          className="ml-4 rounded border px-3 py-1 text-sm shadow hover:bg-gray-100"
          onClick={() => setIsSnap((s) => !s)}
        >
          Сетка: {isSnap ? '⨉' : '✓'} <kbd className="ml-1 text-xs text-slate-400">G</kbd>
        </button>
      </div>

      {/* Canvas */}
      <DndContext sensors={[sensor]} onDragEnd={handleDragEnd}>
        <div
          className={`relative flex-1 border border-gray-300 ${
            isSnap
              ? 'bg-[linear-gradient(#e5e7eb_1px,transparent_1px),linear-gradient(90deg,#e5e7eb_1px,transparent_1px)] bg-[length:10px_10px]'
              : ''
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ cursor: tool === 'wall' ? 'crosshair' : 'default' }}
        >
          {/* Стены */}
          {state.walls.map((w) => (
            <WallComponent key={w.id} wall={w} />
          ))}
          {/* Пунктир для draft‑стены */}
          {draftWall && <WallComponent wall={{ ...draftWall, color: '#aaa', thickness: 4 }} dashed />}

          {/* Столы */}
          {state.tables.map((t) => (
            <DraggableTable key={t.id} table={t} />
          ))}
        </div>
      </DndContext>
    </div>
  );
};