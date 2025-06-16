import React from 'react';
import { Settings, Users, LogOut, BarChart3, User } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { state, dispatch } = useRestaurant();
  const { state: authState, logout } = useAuth();

  const handleLogout = () => {
    if (confirm('Вы уверены, что хотите выйти?')) {
      logout();
    }
  };

  const canAccessAdmin = authState.currentUser?.role === 'admin' || authState.currentUser?.role === 'manager';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Система официанта
              </h1>
              {authState.currentUser && (
                <p className="text-sm text-gray-600">
                  {authState.currentUser.firstName} {authState.currentUser.lastName}
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {authState.currentUser.role === 'admin' ? 'Администратор' :
                     authState.currentUser.role === 'manager' ? 'Менеджер' : 'Официант'}
                  </span>
                </p>
              )}
            </div>
          </div>
          
          <nav className="flex items-center space-x-4">
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

            {authState.currentUser?.role === 'waiter' && (
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', view: 'admin' })}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                  state.currentView === 'admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                Моя статистика
              </button>
            )}

            {canAccessAdmin && (
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
            )}

            <div className="h-6 w-px bg-gray-300"></div>

            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Выйти
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}