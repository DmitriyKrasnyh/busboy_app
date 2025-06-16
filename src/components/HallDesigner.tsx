import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Plus, Save, Edit, Trash2, Grid, RotateCcw, Pen, Move, AlertTriangle } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { ZONES, TABLE_SIZES } from '../types';
import { DraggableTable } from './DraggableTable';
import { DroppableZone } from './DroppableZone';
import { WallDrawing } from './WallDrawing';

export function HallDesigner() {
  const { state, dispatch } = useRestaurant();
  const [activeZone, setActiveZone] = useState<'bowling' | 'billiards' | 'free'>('bowling');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [showGrid, setShowGrid] = useState(true);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const zoneTables = state.tables.filter(table => table.zone === activeZone);
  const zoneWalls = state.hallLayout?.walls?.filter(wall => wall.zone === activeZone) || [];

  const showNotification = useCallback((message: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setError(message);
      setSuccess(null);
    } else {
      setSuccess(message);
      setError(null);
    }
    
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 5000);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    if (isDrawingMode) return;
    try {
      setActiveId(event.active.id as string);
    } catch (error) {
      console.error('Error starting drag:', error);
      showNotification('Ошибка начала перетаскивания', 'error');
    }
  }, [isDrawingMode, showNotification]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    try {
      const { active, delta } = event;
      
      if (delta.x !== 0 || delta.y !== 0) {
        const tableId = parseInt(active.id as string);
        const table = state.tables.find(t => t.id === tableId);
        
        if (!table) {
          throw new Error('Стол не найден');
        }
        
        if (table && table.position) {
          const newPosition = {
            x: Math.max(0, Math.min(580, table.position.x + delta.x)), // Ограничиваем область
            y: Math.max(0, Math.min(520, table.position.y + delta.y))
          };
          
          dispatch({
            type: 'UPDATE_TABLE',
            tableId,
            updates: { position: newPosition }
          });
          
          showNotification('Позиция стола обновлена', 'success');
        }
      }
    } catch (error) {
      console.error('Error ending drag:', error);
      showNotification('Ошибка перемещения стола', 'error');
    } finally {
      setActiveId(null);
    }
  }, [dispatch, state.tables, showNotification]);

  const handleAddTable = useCallback(() => {
    try {
      const maxId = Math.max(...state.tables.map(t => t.id), 0);
      const newId = maxId + 1;
      
      // Проверяем, не превышаем ли лимит столов
      if (state.tables.length >= 50) {
        throw new Error('Достигнут максимальный лимит столов (50)');
      }
      
      dispatch({
        type: 'ADD_TABLE',
        table: {
          zone: activeZone,
          status: 'free',
          guests: 0,
          orders: [],
          position: { x: 50 + (zoneTables.length % 10) * 60, y: 50 + Math.floor(zoneTables.length / 10) * 60 },
          size: 'medium'
        }
      });
      
      showNotification(`Стол ${newId} добавлен`, 'success');
    } catch (error) {
      console.error('Error adding table:', error);
      showNotification(error instanceof Error ? error.message : 'Ошибка добавления стола', 'error');
    }
  }, [activeZone, dispatch, state.tables.length, zoneTables.length, showNotification]);

  const handleUpdateTableNumber = useCallback((tableId: number, newNumber: string) => {
    try {
      if (!newNumber || isNaN(parseInt(newNumber))) {
        throw new Error('Номер стола должен быть числом');
      }
      
      const newId = parseInt(newNumber);
      
      if (newId <= 0) {
        throw new Error('Номер стола должен быть положительным числом');
      }
      
      const existingTable = state.tables.find(t => t.id === newId && t.id !== tableId);
      if (existingTable) {
        throw new Error(`Стол с номером ${newId} уже существует`);
      }
      
      dispatch({
        type: 'UPDATE_TABLE',
        tableId,
        updates: { id: newId }
      });
      
      showNotification(`Номер стола изменен на ${newId}`, 'success');
    } catch (error) {
      console.error('Error updating table number:', error);
      showNotification(error instanceof Error ? error.message : 'Ошибка изменения номера стола', 'error');
    } finally {
      setEditingTable(null);
      setNewTableNumber('');
    }
  }, [dispatch, state.tables, showNotification]);

  const handleDeleteTable = useCallback((tableId: number) => {
    try {
      const table = state.tables.find(t => t.id === tableId);
      if (!table) {
        throw new Error('Стол не найден');
      }
      
      if (table.status === 'occupied') {
        throw new Error('Нельзя удалить занятый стол');
      }
      
      if (confirm(`Удалить стол ${tableId}?`)) {
        dispatch({ type: 'DELETE_TABLE', tableId });
        showNotification(`Стол ${tableId} удален`, 'success');
      }
    } catch (error) {
      console.error('Error deleting table:', error);
      showNotification(error instanceof Error ? error.message : 'Ошибка удаления стола', 'error');
    }
  }, [dispatch, state.tables, showNotification]);

  const handleUpdateTableSize = useCallback((tableId: number, size: 'small' | 'medium' | 'large') => {
    try {
      dispatch({
        type: 'UPDATE_TABLE',
        tableId,
        updates: { size }
      });
      showNotification('Размер стола изменен', 'success');
    } catch (error) {
      console.error('Error updating table size:', error);
      showNotification('Ошибка изменения размера стола', 'error');
    }
  }, [dispatch, showNotification]);

  const handleWallsChange = useCallback((walls: any[]) => {
    try {
      dispatch({
        type: 'UPDATE_HALL_LAYOUT',
        layout: {
          walls: [
            ...(state.hallLayout?.walls?.filter(w => w.zone !== activeZone) || []),
            ...walls
          ]
        }
      });
    } catch (error) {
      console.error('Error updating walls:', error);
      showNotification('Ошибка обновления стен', 'error');
    }
  }, [dispatch, state.hallLayout?.walls, activeZone, showNotification]);

  const handleSaveLayout = useCallback(() => {
    try {
      // Проверяем, что есть хотя бы один стол
      if (zoneTables.length === 0) {
        throw new Error('В зоне должен быть хотя бы один стол');
      }
      
      // Сохраняем в localStorage дополнительно
      localStorage.setItem('restaurant-hall-layout', JSON.stringify(state.hallLayout));
      
      showNotification('План зала сохранен!', 'success');
    } catch (error) {
      console.error('Error saving layout:', error);
      showNotification(error instanceof Error ? error.message : 'Ошибка сохранения плана зала', 'error');
    }
  }, [state.hallLayout, zoneTables.length, showNotification]);

  const handleResetLayout = useCallback(() => {
    try {
      if (confirm('Сбросить расположение столов и стен в текущей зоне?')) {
        // Reset table positions
        const updatedTables = zoneTables.map((table, index) => ({
          ...table,
          position: {
            x: 100 + (index % 6) * 120,
            y: 100 + Math.floor(index / 6) * 120
          }
        }));
        
        updatedTables.forEach(table => {
          dispatch({
            type: 'UPDATE_TABLE',
            tableId: table.id,
            updates: { position: table.position }
          });
        });

        // Reset walls
        handleWallsChange([]);
        
        showNotification('Планировка зоны сброшена', 'success');
      }
    } catch (error) {
      console.error('Error resetting layout:', error);
      showNotification('Ошибка сброса планировки', 'error');
    }
  }, [zoneTables, dispatch, handleWallsChange, showNotification]);

  const activeTable = state.tables.find(table => table.id === parseInt(activeId || ''));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="text-sm">{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center">
            <span className="text-sm">{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-4 text-green-500 hover:text-green-700 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Конструктор зала</h2>
        
        {/* Zone Tabs */}
        <div className="flex space-x-4 mb-6">
          {ZONES.map(zone => (
            <button
              key={zone.id}
              onClick={() => setActiveZone(zone.id as 'bowling' | 'billiards' | 'free')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                activeZone === zone.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <div className={`w-3 h-3 rounded-full mr-2 ${zone.color}`}></div>
              {zone.name}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border">
          <button
            onClick={handleAddTable}
            disabled={isDrawingMode}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              isDrawingMode 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить стол
          </button>
          
          <button
            onClick={() => setIsDrawingMode(!isDrawingMode)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              isDrawingMode 
                ? 'bg-orange-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {isDrawingMode ? <Move className="h-4 w-4 mr-2" /> : <Pen className="h-4 w-4 mr-2" />}
            {isDrawingMode ? 'Режим перемещения' : 'Рисовать стены'}
          </button>
          
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-4 py-2 rounded-md transition-colors flex items-center ${
              showGrid 
                ? 'bg-gray-200 text-gray-800' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="h-4 w-4 mr-2" />
            Сетка
          </button>
          
          <button
            onClick={handleResetLayout}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Сбросить
          </button>
          
          <div className="flex-1"></div>
          
          <button
            onClick={handleSaveLayout}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <Save className="h-4 w-4 mr-2" />
            Сохранить план зала
          </button>
        </div>

        {/* Drawing Mode Instructions */}
        {isDrawingMode && (
          <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <strong>Режим рисования стен:</strong> Нажмите и перетащите от точки к точке для создания стены. 
              Стены привязываются к сетке. Кликните на существующую стену для удаления.
            </p>
          </div>
        )}
      </div>

      {/* Designer Area */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900">
            Зона: {ZONES.find(z => z.id === activeZone)?.name}
          </h3>
          <p className="text-sm text-gray-600">
            Столов в зоне: {zoneTables.length} | Стен: {zoneWalls.length}
          </p>
        </div>
        
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="relative">
            <DroppableZone showGrid={showGrid}>
              {/* Wall Drawing Layer */}
              <WallDrawing
                walls={state.hallLayout?.walls || []}
                zone={activeZone}
                onWallsChange={handleWallsChange}
                isDrawingMode={isDrawingMode}
              />
              
              {/* Tables Layer */}
              {zoneTables.map((table) => (
                <DraggableTable
                  key={table.id}
                  table={table}
                  isEditing={editingTable === table.id}
                  newTableNumber={newTableNumber}
                  onEdit={() => {
                    if (!isDrawingMode) {
                      setEditingTable(table.id);
                      setNewTableNumber(table.id.toString());
                    }
                  }}
                  onSave={() => handleUpdateTableNumber(table.id, newTableNumber)}
                  onCancel={() => {
                    setEditingTable(null);
                    setNewTableNumber('');
                  }}
                  onDelete={() => handleDeleteTable(table.id)}
                  onSizeChange={(size) => handleUpdateTableSize(table.id, size)}
                  onNumberChange={setNewTableNumber}
                  disabled={isDrawingMode}
                />
              ))}
            </DroppableZone>
          </div>
          
          <DragOverlay>
            {activeId && activeTable ? (
              <div 
                className="bg-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-center font-medium text-blue-800 shadow-lg cursor-grabbing"
                style={{
                  width: TABLE_SIZES[activeTable.size || 'medium'].width,
                  height: TABLE_SIZES[activeTable.size || 'medium'].height,
                }}
              >
                {activeTable.id}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border p-4">
        <h4 className="font-medium text-gray-900 mb-3">Размеры столов</h4>
        <div className="flex space-x-6">
          {Object.entries(TABLE_SIZES).map(([size, config]) => (
            <div key={size} className="flex items-center space-x-2">
              <div 
                className="bg-gray-200 border border-gray-300 rounded"
                style={{ width: config.width / 2, height: config.height / 2 }}
              ></div>
              <span className="text-sm text-gray-600">{config.label}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <h4 className="font-medium text-gray-900 mb-2">Элементы зала</h4>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-1 bg-gray-700 rounded"></div>
              <span className="text-sm text-gray-600">Стены (привязка к сетке 20px)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}