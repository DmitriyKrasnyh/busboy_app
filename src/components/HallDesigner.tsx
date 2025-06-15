import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { Plus, Save, Edit, Trash2, Grid, RotateCcw } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { ZONES, TABLE_SIZES } from '../types';
import { DraggableTable } from './DraggableTable';
import { DroppableZone } from './DroppableZone';

export function HallDesigner() {
  const { state, dispatch } = useRestaurant();
  const [activeZone, setActiveZone] = useState<'bowling' | 'billiards' | 'free'>('bowling');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [showGrid, setShowGrid] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const zoneTables = state.tables.filter(table => table.zone === activeZone);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const tableId = parseInt(active.id as string);
      const newPosition = over.data.current?.position;
      
      if (newPosition) {
        dispatch({
          type: 'UPDATE_TABLE',
          tableId,
          updates: { position: newPosition }
        });
      }
    }
    
    setActiveId(null);
  }, [dispatch]);

  const handleAddTable = () => {
    const maxId = Math.max(...state.tables.map(t => t.id), 0);
    const newId = maxId + 1;
    
    dispatch({
      type: 'ADD_TABLE',
      table: {
        zone: activeZone,
        status: 'free',
        guests: 0,
        orders: [],
        position: { x: 50, y: 50 },
        size: 'medium'
      }
    });
  };

  const handleUpdateTableNumber = (tableId: number, newNumber: string) => {
    if (newNumber && !isNaN(parseInt(newNumber))) {
      const newId = parseInt(newNumber);
      // Check if number already exists
      const existingTable = state.tables.find(t => t.id === newId && t.id !== tableId);
      if (!existingTable) {
        dispatch({
          type: 'UPDATE_TABLE',
          tableId,
          updates: { id: newId }
        });
      }
    }
    setEditingTable(null);
    setNewTableNumber('');
  };

  const handleDeleteTable = (tableId: number) => {
    if (confirm(`Удалить стол ${tableId}?`)) {
      dispatch({ type: 'DELETE_TABLE', tableId });
    }
  };

  const handleUpdateTableSize = (tableId: number, size: 'small' | 'medium' | 'large') => {
    dispatch({
      type: 'UPDATE_TABLE',
      tableId,
      updates: { size }
    });
  };

  const handleSaveLayout = () => {
    // Layout is automatically saved via localStorage in context
    alert('План зала сохранен!');
  };

  const handleResetLayout = () => {
    if (confirm('Сбросить расположение столов в текущей зоне?')) {
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
    }
  };

  const activeTable = state.tables.find(table => table.id === parseInt(activeId || ''));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Добавить стол
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
      </div>

      {/* Designer Area */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <h3 className="font-medium text-gray-900">
            Зона: {ZONES.find(z => z.id === activeZone)?.name}
          </h3>
          <p className="text-sm text-gray-600">
            Столов в зоне: {zoneTables.length}
          </p>
        </div>
        
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <DroppableZone showGrid={showGrid}>
            {zoneTables.map((table) => (
              <DraggableTable
                key={table.id}
                table={table}
                isEditing={editingTable === table.id}
                newTableNumber={newTableNumber}
                onEdit={() => {
                  setEditingTable(table.id);
                  setNewTableNumber(table.id.toString());
                }}
                onSave={() => handleUpdateTableNumber(table.id, newTableNumber)}
                onCancel={() => {
                  setEditingTable(null);
                  setNewTableNumber('');
                }}
                onDelete={() => handleDeleteTable(table.id)}
                onSizeChange={(size) => handleUpdateTableSize(table.id, size)}
                onNumberChange={setNewTableNumber}
              />
            ))}
          </DroppableZone>
          
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
      </div>
    </div>
  );
}