import React, { useState, useRef, useCallback } from 'react';
import { Wall } from '../types';

interface WallDrawingProps {
  walls: Wall[];
  zone: 'bowling' | 'billiards' | 'free';
  onWallsChange: (walls: Wall[]) => void;
  isDrawingMode: boolean;
}

const GRID_SIZE = 20;

export function WallDrawing({ walls, zone, onWallsChange, isDrawingMode }: WallDrawingProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentWall, setCurrentWall] = useState<Partial<Wall> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const snapToGrid = useCallback((value: number) => {
    return Math.round(value / GRID_SIZE) * GRID_SIZE;
  }, []);

  const getMousePosition = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    try {
      if (!svgRef.current) {
        throw new Error('SVG reference not available');
      }
      
      const rect = svgRef.current.getBoundingClientRect();
      const x = snapToGrid(event.clientX - rect.left);
      const y = snapToGrid(event.clientY - rect.top);
      
      return { x, y };
    } catch (error) {
      console.error('Error getting mouse position:', error);
      setError('Ошибка определения позиции мыши');
      return { x: 0, y: 0 };
    }
  }, [snapToGrid]);

  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode) return;
    
    try {
      setError(null);
      const pos = getMousePosition(event);
      setIsDrawing(true);
      setCurrentWall({
        id: `wall-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        startX: pos.x,
        startY: pos.y,
        endX: pos.x,
        endY: pos.y,
        zone
      });
    } catch (error) {
      console.error('Error starting wall drawing:', error);
      setError('Ошибка начала рисования стены');
    }
  }, [isDrawingMode, getMousePosition, zone]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !currentWall) return;
    
    try {
      const pos = getMousePosition(event);
      setCurrentWall(prev => prev ? {
        ...prev,
        endX: pos.x,
        endY: pos.y
      } : null);
    } catch (error) {
      console.error('Error updating wall position:', error);
      setError('Ошибка обновления позиции стены');
    }
  }, [isDrawing, currentWall, getMousePosition]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing || !currentWall) return;
    
    try {
      // Проверяем минимальную длину стены (должна быть хотя бы одна клетка)
      const length = Math.sqrt(
        Math.pow(currentWall.endX! - currentWall.startX!, 2) + 
        Math.pow(currentWall.endY! - currentWall.startY!, 2)
      );
      
      if (length >= GRID_SIZE) {
        const newWall = currentWall as Wall;
        
        // Проверяем, не пересекается ли стена с существующими
        const existingWall = walls.find(wall => 
          wall.zone === zone &&
          wall.startX === newWall.startX &&
          wall.startY === newWall.startY &&
          wall.endX === newWall.endX &&
          wall.endY === newWall.endY
        );
        
        if (existingWall) {
          setError('Стена в этом месте уже существует');
        } else {
          onWallsChange([...walls, newWall]);
          setError(null);
        }
      } else {
        setError('Стена слишком короткая. Минимальная длина - одна клетка сетки');
      }
    } catch (error) {
      console.error('Error completing wall drawing:', error);
      setError('Ошибка завершения рисования стены');
    } finally {
      setIsDrawing(false);
      setCurrentWall(null);
    }
  }, [isDrawing, currentWall, walls, onWallsChange, zone]);

  const handleWallClick = useCallback((wallId: string, event: React.MouseEvent) => {
    if (isDrawingMode) return;
    
    event.stopPropagation();
    
    try {
      const wallToDelete = walls.find(wall => wall.id === wallId);
      if (!wallToDelete) {
        setError('Стена не найдена');
        return;
      }
      
      if (confirm('Удалить стену?')) {
        const updatedWalls = walls.filter(wall => wall.id !== wallId);
        onWallsChange(updatedWalls);
        setError(null);
      }
    } catch (error) {
      console.error('Error deleting wall:', error);
      setError('Ошибка удаления стены');
    }
  }, [isDrawingMode, walls, onWallsChange]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setCurrentWall(null);
    }
  }, [isDrawing]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const zoneWalls = walls.filter(wall => wall.zone === zone);

  return (
    <>
      {/* Error notification */}
      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between">
            <span className="text-sm">{error}</span>
            <button
              onClick={clearError}
              className="ml-4 text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <svg
        ref={svgRef}
        className={`absolute inset-0 w-full h-full ${
          isDrawingMode ? 'cursor-crosshair' : 'pointer-events-none'
        }`}
        style={{ zIndex: isDrawingMode ? 10 : 1 }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {/* Grid dots for visual reference */}
        {isDrawingMode && (
          <defs>
            <pattern id="grid-dots" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
              <circle cx={GRID_SIZE/2} cy={GRID_SIZE/2} r="1" fill="#9CA3AF" opacity="0.5" />
            </pattern>
          </defs>
        )}
        
        {isDrawingMode && (
          <rect width="100%" height="100%" fill="url(#grid-dots)" />
        )}

        {/* Existing walls */}
        {zoneWalls.map((wall) => (
          <g key={wall.id}>
            <line
              x1={wall.startX}
              y1={wall.startY}
              x2={wall.endX}
              y2={wall.endY}
              stroke="#374151"
              strokeWidth="6"
              strokeLinecap="round"
              className={`${
                isDrawingMode 
                  ? 'cursor-pointer hover:stroke-red-500 transition-colors' 
                  : ''
              } pointer-events-auto`}
              onClick={(e) => handleWallClick(wall.id, e)}
            />
            {/* Invisible wider line for easier clicking */}
            <line
              x1={wall.startX}
              y1={wall.startY}
              x2={wall.endX}
              y2={wall.endY}
              stroke="transparent"
              strokeWidth="16"
              strokeLinecap="round"
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => handleWallClick(wall.id, e)}
            />
          </g>
        ))}
        
        {/* Current wall being drawn */}
        {currentWall && (
          <line
            x1={currentWall.startX}
            y1={currentWall.startY}
            x2={currentWall.endX}
            y2={currentWall.endY}
            stroke="#3B82F6"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="8,4"
            className="pointer-events-none"
          />
        )}

        {/* Grid intersection points for snapping visualization */}
        {isDrawingMode && currentWall && (
          <>
            <circle
              cx={currentWall.startX}
              cy={currentWall.startY}
              r="4"
              fill="#10B981"
              className="pointer-events-none"
            />
            <circle
              cx={currentWall.endX}
              cy={currentWall.endY}
              r="4"
              fill="#3B82F6"
              className="pointer-events-none"
            />
          </>
        )}
      </svg>
    </>
  );
}