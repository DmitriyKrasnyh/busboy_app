import React, { useState } from 'react';
import { Plus, Edit, Trash2, Save, X, Layout, Users, BarChart3 } from 'lucide-react';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useAuth } from '../contexts/AuthContext';
import { ZONES, MENU_CATEGORIES } from '../types';
import { HallDesigner } from './HallDesigner';
import { UserManagement } from './UserManagement';
import { WaiterStats } from './WaiterStats';

export function AdminPanel() {
  const { state, dispatch } = useRestaurant();
  const { state: authState } = useAuth();
  const [activeTab, setActiveTab] = useState<'tables' | 'menu' | 'designer' | 'users' | 'stats'>('tables');
  const [editingTable, setEditingTable] = useState<number | null>(null);
  const [editingMenuItem, setEditingMenuItem] = useState<number | null>(null);
  const [newTableZone, setNewTableZone] = useState<'bowling' | 'billiards' | 'free'>('free');
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    category: MENU_CATEGORIES[0],
    price: 0
  });

  const currentUser = authState.currentUser;
  const isAdmin = currentUser?.role === 'admin';
  const isManager = currentUser?.role === 'manager';
  const isWaiter = currentUser?.role === 'waiter';

  // Определяем доступные вкладки в зависимости от роли
  const getAvailableTabs = () => {
    if (isWaiter) {
      return [{ id: 'stats', label: 'Моя статистика', icon: BarChart3 }];
    }
    
    const tabs = [
      { id: 'tables', label: 'Управление столами', icon: null },
      { id: 'menu', label: 'Управление меню', icon: null },
      { id: 'designer', label: 'Конструктор зала', icon: Layout },
    ];

    if (isManager || isAdmin) {
      tabs.push({ id: 'stats', label: 'Статистика официантов', icon: BarChart3 });
    }

    if (isAdmin) {
      tabs.push({ id: 'users', label: 'Пользователи', icon: Users });
    }

    return tabs;
  };

  const availableTabs = getAvailableTabs();

  // Устанавливаем первую доступную вкладку по умолчанию
  React.useEffect(() => {
    if (availableTabs.length > 0 && !availableTabs.find(tab => tab.id === activeTab)) {
      setActiveTab(availableTabs[0].id as any);
    }
  }, [availableTabs, activeTab]);

  const handleAddTable = () => {
    dispatch({
      type: 'ADD_TABLE',
      table: {
        zone: newTableZone,
        status: 'free',
        guests: 0,
        orders: []
      }
    });
  };

  const handleUpdateTable = (tableId: number, zone: 'bowling' | 'billiards' | 'free') => {
    dispatch({
      type: 'UPDATE_TABLE',
      tableId,
      updates: { zone }
    });
    setEditingTable(null);
  };

  const handleDeleteTable = (tableId: number) => {
    if (confirm(`Удалить стол ${tableId}?`)) {
      dispatch({ type: 'DELETE_TABLE', tableId });
    }
  };

  const handleAddMenuItem = () => {
    if (newMenuItem.name.trim() && newMenuItem.price > 0) {
      dispatch({
        type: 'ADD_MENU_ITEM',
        item: newMenuItem
      });
      setNewMenuItem({
        name: '',
        category: MENU_CATEGORIES[0],
        price: 0
      });
    }
  };

  const handleUpdateMenuItem = (itemId: number, updates: { name: string; category: string; price: number }) => {
    dispatch({
      type: 'UPDATE_MENU_ITEM',
      itemId,
      updates
    });
    setEditingMenuItem(null);
  };

  const handleDeleteMenuItem = (itemId: number) => {
    if (confirm('Удалить позицию меню?')) {
      dispatch({ type: 'DELETE_MENU_ITEM', itemId });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isWaiter ? 'Моя статистика' : 'Панель администратора'}
        </h2>
        
        <div className="flex space-x-4 mb-6">
          {availableTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.icon && <tab.icon className="h-4 w-4 mr-2" />}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'stats' && (
        <WaiterStats 
          waiterId={isWaiter ? currentUser?.id : undefined}
          showAllWaiters={!isWaiter}
        />
      )}

      {activeTab === 'users' && isAdmin && <UserManagement />}

      {activeTab === 'designer' && !isWaiter && <HallDesigner />}

      {activeTab === 'tables' && !isWaiter && (
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Добавить новый стол</h3>
            <div className="flex items-center space-x-4">
              <select
                value={newTableZone}
                onChange={(e) => setNewTableZone(e.target.value as 'bowling' | 'billiards' | 'free')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {ZONES.map(zone => (
                  <option key={zone.id} value={zone.id}>{zone.name}</option>
                ))}
              </select>
              <button
                onClick={handleAddTable}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить стол
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Стол
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Зона
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Гости
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Официант
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.tables.map((table) => {
                  const waiter = table.waiterId ? authState.users.find(u => u.id === table.waiterId) : null;
                  
                  return (
                    <tr key={table.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Стол {table.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingTable === table.id ? (
                          <select
                            defaultValue={table.zone}
                            onChange={(e) => handleUpdateTable(table.id, e.target.value as 'bowling' | 'billiards' | 'free')}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            {ZONES.map(zone => (
                              <option key={zone.id} value={zone.id}>{zone.name}</option>
                            ))}
                          </select>
                        ) : (
                          ZONES.find(z => z.id === table.zone)?.name
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          table.status === 'free' ? 'bg-green-100 text-green-800' :
                          table.status === 'occupied' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {table.status === 'free' ? 'Свободен' :
                           table.status === 'occupied' ? 'В работе' : 'Закрыт'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {table.guests}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {waiter ? `${waiter.firstName} ${waiter.lastName}` : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {editingTable === table.id ? (
                            <button
                              onClick={() => setEditingTable(null)}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingTable(table.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'menu' && !isWaiter && (
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-medium mb-4">Добавить новую позицию меню</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Название блюда"
                value={newMenuItem.name}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={newMenuItem.category}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, category: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {MENU_CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Цена"
                value={newMenuItem.price || ''}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, price: Number(e.target.value) })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddMenuItem}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Добавить
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Категория
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Цена
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.menuItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {editingMenuItem === item.id ? (
                        <input
                          type="text"
                          defaultValue={item.name}
                          onBlur={(e) => handleUpdateMenuItem(item.id, { ...item, name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                        />
                      ) : (
                        item.name
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingMenuItem === item.id ? (
                        <select
                          defaultValue={item.category}
                          onChange={(e) => handleUpdateMenuItem(item.id, { ...item, category: e.target.value })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          {MENU_CATEGORIES.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      ) : (
                        item.category
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingMenuItem === item.id ? (
                        <input
                          type="number"
                          defaultValue={item.price}
                          onBlur={(e) => handleUpdateMenuItem(item.id, { ...item, price: Number(e.target.value) })}
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-20"
                        />
                      ) : (
                        `${item.price}₽`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {editingMenuItem === item.id ? (
                          <button
                            onClick={() => setEditingMenuItem(null)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingMenuItem(item.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteMenuItem(item.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}