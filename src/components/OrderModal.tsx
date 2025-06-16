import React, { useState } from 'react';
import { X, Users, Plus, Minus, Check, AlertTriangle } from 'lucide-react';
import { Table, MenuItem, OrderItem, MENU_CATEGORIES } from '../types';
import { useRestaurant } from '../contexts/RestaurantContext';
import { useAuth } from '../contexts/AuthContext';

interface OrderModalProps {
  table: Table;
  onClose: () => void;
}

export function OrderModal({ table, onClose }: OrderModalProps) {
  const { state, dispatch } = useRestaurant();
  const { state: authState } = useAuth();
  const [guests, setGuests] = useState(table.guests || 2);
  const [selectedGuest, setSelectedGuest] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [step, setStep] = useState<'guests' | 'guest-selection' | 'category' | 'items' | 'summary'>('guests');
  const [error, setError] = useState<string | null>(null);

  // Определяем, это новый заказ или дозаказ
  const isNewOrder = table.status === 'free';
  const hasExistingOrders = table.orders.length > 0;

  React.useEffect(() => {
    try {
      if (!isNewOrder && hasExistingOrders) {
        setStep('guest-selection');
      }
    } catch (error) {
      console.error('Error initializing order modal:', error);
      setError('Ошибка инициализации заказа');
    }
  }, [isNewOrder, hasExistingOrders]);

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const handleStartOrder = () => {
    try {
      if (guests < 1 || guests > 20) {
        throw new Error('Количество гостей должно быть от 1 до 20');
      }

      if (!authState.currentUser) {
        throw new Error('Пользователь не авторизован');
      }

      dispatch({ 
        type: 'SET_TABLE_STATUS', 
        tableId: table.id, 
        status: 'occupied', 
        guests,
        waiterId: authState.currentUser.id
      });
      setStep('guest-selection');
    } catch (error) {
      console.error('Error starting order:', error);
      showError(error instanceof Error ? error.message : 'Ошибка начала заказа');
    }
  };

  const handleGuestSelect = (guestNumber: number) => {
    try {
      if (guestNumber < 1 || guestNumber > guests) {
        throw new Error('Неверный номер гостя');
      }
      setSelectedGuest(guestNumber);
      setStep('category');
    } catch (error) {
      console.error('Error selecting guest:', error);
      showError('Ошибка выбора гостя');
    }
  };

  const handleCategorySelect = (category: string) => {
    try {
      if (!MENU_CATEGORIES.includes(category)) {
        throw new Error('Неверная категория меню');
      }
      setSelectedCategory(category);
      setStep('items');
    } catch (error) {
      console.error('Error selecting category:', error);
      showError('Ошибка выбора категории');
    }
  };

  const handleAddItem = (menuItem: MenuItem) => {
    try {
      if (!selectedGuest) {
        throw new Error('Гость не выбран');
      }

      if (!menuItem || menuItem.price <= 0) {
        throw new Error('Неверные данные блюда');
      }

      const existingItem = orderItems.find(
        item => item.menuItem.id === menuItem.id && item.guestNumber === selectedGuest
      );

      if (existingItem) {
        if (existingItem.quantity >= 10) {
          throw new Error('Максимальное количество одного блюда - 10');
        }
        setOrderItems(orderItems.map(item =>
          item.menuItem.id === menuItem.id && item.guestNumber === selectedGuest
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setOrderItems([...orderItems, {
          menuItem,
          quantity: 1,
          guestNumber: selectedGuest
        }]);
      }
    } catch (error) {
      console.error('Error adding item:', error);
      showError(error instanceof Error ? error.message : 'Ошибка добавления блюда');
    }
  };

  const handleRemoveItem = (menuItemId: number, guestNumber: number) => {
    try {
      setOrderItems(orderItems.filter(
        item => !(item.menuItem.id === menuItemId && item.guestNumber === guestNumber)
      ));
    } catch (error) {
      console.error('Error removing item:', error);
      showError('Ошибка удаления блюда');
    }
  };

  const handleCompleteOrder = () => {
    try {
      if (orderItems.length === 0) {
        throw new Error('Заказ не может быть пустым');
      }

      if (!authState.currentUser) {
        throw new Error('Пользователь не авторизован');
      }

      // Add all order items to the table
      orderItems.forEach(item => {
        dispatch({ 
          type: 'ADD_ORDER_ITEM', 
          tableId: table.id, 
          item,
          waiterId: authState.currentUser!.id
        });
      });
      setStep('summary');
    } catch (error) {
      console.error('Error completing order:', error);
      showError(error instanceof Error ? error.message : 'Ошибка завершения заказа');
    }
  };

  const getTotalAmount = () => {
    try {
      return orderItems.reduce((total, item) => {
        if (!item.menuItem || typeof item.menuItem.price !== 'number' || typeof item.quantity !== 'number') {
          throw new Error('Неверные данные для расчета суммы');
        }
        return total + (item.menuItem.price * item.quantity);
      }, 0);
    } catch (error) {
      console.error('Error calculating total:', error);
      showError('Ошибка расчета суммы');
      return 0;
    }
  };

  const getExistingOrdersTotal = () => {
    try {
      return table.orders.reduce((total, order) => total + order.totalAmount, 0);
    } catch (error) {
      console.error('Error calculating existing orders total:', error);
      return 0;
    }
  };

  const filteredMenuItems = selectedCategory 
    ? state.menuItems.filter(item => item.category === selectedCategory)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold">Стол {table.id}</h2>
            {hasExistingOrders && (
              <p className="text-sm text-gray-600">
                {isNewOrder ? 'Новый заказ' : `Дозаказ (текущая сумма: ${getExistingOrdersTotal()}₽)`}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'guests' && isNewOrder && (
            <div className="text-center">
              <Users className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-4">Количество гостей</h3>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <button
                  onClick={() => setGuests(Math.max(1, guests - 1))}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-2xl font-bold w-12 text-center">{guests}</span>
                <button
                  onClick={() => setGuests(Math.min(20, guests + 1))}
                  className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleStartOrder}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Принять заказ
              </button>
            </div>
          )}

          {step === 'guest-selection' && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                {isNewOrder ? 'Выберите гостя' : 'Выберите гостя для дозаказа'}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: guests }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handleGuestSelect(i + 1)}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                    <span className="block text-sm font-medium">Гость {i + 1}</span>
                  </button>
                ))}
              </div>
              
              {orderItems.length > 0 && (
                <div className="mt-6">
                  <button
                    onClick={() => setStep('summary')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Просмотреть заказ
                  </button>
                </div>
              )}
            </div>
          )}

          {step === 'category' && (
            <div>
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setStep('guest-selection')}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Назад
                </button>
                <h3 className="text-lg font-medium">Гость {selectedGuest} - Выберите категорию</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {MENU_CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategorySelect(category)}
                    className="p-4 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                  >
                    <h4 className="font-medium">{category}</h4>
                    <p className="text-sm text-gray-600">
                      {state.menuItems.filter(item => item.category === category).length} позиций
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'items' && selectedCategory && (
            <div>
              <div className="flex items-center mb-4">
                <button
                  onClick={() => setStep('category')}
                  className="text-blue-600 hover:text-blue-800 mr-4"
                >
                  ← Назад
                </button>
                <h3 className="text-lg font-medium">Гость {selectedGuest} - {selectedCategory}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredMenuItems.map((item) => {
                  const currentQuantity = orderItems.find(
                    orderItem => orderItem.menuItem.id === item.id && orderItem.guestNumber === selectedGuest
                  )?.quantity || 0;

                  return (
                    <div key={item.id} className="p-4 border border-gray-300 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.name}</h4>
                        <span className="text-lg font-bold text-green-600">{item.price}₽</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {currentQuantity > 0 && (
                            <button
                              onClick={() => handleRemoveItem(item.id, selectedGuest!)}
                              className="p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                          )}
                          <span className="w-8 text-center font-medium">{currentQuantity}</span>
                        </div>
                        
                        <button
                          onClick={() => handleAddItem(item)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Добавить
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setStep('guest-selection')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Выбрать другого гостя
                </button>
                
                {orderItems.length > 0 && (
                  <button
                    onClick={() => setStep('summary')}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Просмотреть заказ
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 'summary' && (
            <div>
              <h3 className="text-lg font-medium mb-4">
                {isNewOrder ? 'Итоговый заказ' : 'Дозаказ'}
              </h3>
              
              {Array.from({ length: guests }, (_, i) => {
                const guestItems = orderItems.filter(item => item.guestNumber === i + 1);
                if (guestItems.length === 0) return null;

                return (
                  <div key={i + 1} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-3">Гость {i + 1}</h4>
                    <div className="space-y-2">
                      {guestItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span>{item.menuItem.name} x{item.quantity}</span>
                          <span className="font-medium">{item.menuItem.price * item.quantity}₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              <div className="border-t pt-4 mb-6">
                {hasExistingOrders && !isNewOrder && (
                  <div className="flex justify-between items-center mb-2">
                    <span>Предыдущие заказы:</span>
                    <span className="font-medium">{getExistingOrdersTotal()}₽</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <span>{isNewOrder ? 'Итого:' : 'Дозаказ:'}</span>
                  <span className="font-medium text-green-600">{getTotalAmount()}₽</span>
                </div>
                {hasExistingOrders && !isNewOrder && (
                  <div className="flex justify-between items-center text-xl font-bold border-t pt-2">
                    <span>Общая сумма:</span>
                    <span className="text-green-600">{getExistingOrdersTotal() + getTotalAmount()}₽</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('guest-selection')}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Добавить еще
                </button>
                
                <button
                  onClick={() => {
                    handleCompleteOrder();
                    if (isNewOrder) {
                      dispatch({ type: 'COMPLETE_ORDER', tableId: table.id, waiterId: authState.currentUser!.id });
                    }
                    onClose();
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Check className="h-5 w-5 mr-2" />
                  {isNewOrder ? 'Закрыть заказ' : 'Добавить к заказу'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}