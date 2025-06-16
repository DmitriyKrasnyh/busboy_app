import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Edit, Trash2, Check, X } from 'lucide-react';
import { Table, TABLE_SIZES } from '../types';

interface DraggableTableProps {
  table: Table;
  isEditing: boolean;
  newTableNumber: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  onSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onNumberChange: (value: string) => void;
  disabled?: boolean;
}

export function DraggableTable({
  table,
  isEditing,
  newTableNumber,
  onEdit,
  onSave,
  onCancel,
  onDelete,
  onSizeChange,
  onNumberChange,
  disabled = false
}: DraggableTableProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: table.id.toString(),
    disabled,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const position = table.position || { x: 100, y: 100 };
  const size = table.size || 'medium';
  const sizeConfig = TABLE_SIZES[size];

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: sizeConfig.width,
        height: sizeConfig.height,
        zIndex: isDragging ? 1000 : disabled ? 1 : 10,
      }}
      className="group"
    >
      <div
        {...listeners}
        {...attributes}
        className={`w-full h-full bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center font-medium text-gray-800 transition-all duration-200 hover:border-blue-400 hover:shadow-md ${
          disabled 
            ? 'cursor-not-allowed opacity-60' 
            : 'cursor-grab active:cursor-grabbing'
        } ${
          isDragging ? 'opacity-50 shadow-lg' : ''
        }`}
      >
        {isEditing ? (
          <input
            type="text"
            value={newTableNumber}
            onChange={(e) => onNumberChange(e.target.value)}
            className="w-12 h-8 text-center border border-gray-300 rounded text-sm"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSave();
              if (e.key === 'Escape') onCancel();
            }}
            autoFocus
          />
        ) : (
          <span className="select-none">{table.id}</span>
        )}
      </div>

      {/* Controls */}
      {!disabled && (
        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
              >
                <Check className="h-3 w-3" />
              </button>
              <button
                onClick={onCancel}
                className="w-6 h-6 bg-gray-500 text-white rounded-full flex items-center justify-center hover:bg-gray-600 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onEdit}
                className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors"
              >
                <Edit className="h-3 w-3" />
              </button>
              <button
                onClick={onDelete}
                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      )}

      {/* Size selector */}
      {!disabled && (
        <div className="absolute -bottom-8 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex space-x-1 bg-white border border-gray-300 rounded-md p-1 shadow-sm">
            {Object.entries(TABLE_SIZES).map(([sizeKey, config]) => (
              <button
                key={sizeKey}
                onClick={() => onSizeChange(sizeKey as 'small' | 'medium' | 'large')}
                className={`w-6 h-6 rounded border transition-colors ${
                  size === sizeKey
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }`}
                title={config.label}
              >
                <div 
                  className={`w-full h-full rounded ${
                    size === sizeKey ? 'bg-white' : 'bg-gray-400'
                  }`}
                  style={{
                    transform: `scale(${sizeKey === 'small' ? 0.4 : sizeKey === 'medium' ? 0.6 : 0.8})`
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}