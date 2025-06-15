import React from 'react';
import { Settings, Users } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';

export function Header() {
  const { state, dispatch } = useRestaurant();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">
              Система официанта
            </h1>
          </div>
          
          <nav className="flex space-x-4">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'tables' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                state.currentView === 'tables'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Столы
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', view: 'admin' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                state.currentView === 'admin'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Settings className="h-4 w-4 mr-1" />
              Администрирование
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}