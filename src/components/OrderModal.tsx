import React, { useState } from 'react';
import { X, Users, Plus, Minus, Check } from 'lucide-react';
import { Table, MenuItem, OrderItem, MENU_CATEGORIES } from '../types';
import { useRestaurant } from '../contexts/RestaurantContext';

interface OrderModalProps {
  table: Table;
  onClose: () => void;
}

export function OrderModal({ table, onClose }: OrderModalProps) {
  const { state, dispatch } = useRestaurant();
  const [guests, setGuests] = useState(table.guests || 2);
  const [selectedGuest, setSelectedGuest] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [step, setStep] = useState<'guests' | 'guest-selection' | 'category' | 'items' | 'summary'>('guests');

  const handleStartOrder = () => {
    dispatch({ 
      type: 'SET_TABLE_STATUS', 
      tableId: table.id, 
      status: 'occupied', 
      guests 
    });
    setStep('guest-selection');
  };

  const handleGuestSelect = (guestNumber: number) => {
    setSelectedGuest(guestNumber);
    setStep('category');
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setStep('items');
  };

  const handleAddItem = (menuItem: MenuItem) => {
    if (selectedGuest) {
      const existingItem = orderItems.find(
        item => item.menuItem.id === menuItem.id && item.guestNumber === selectedGuest
      );

      if (existingItem) {
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
    }
  };

  const handleRemoveItem = (menuItemId: number, guestNumber: number) => {
    setOrderItems(orderItems.filter(
      item => !(item.menuItem.id === menuItemId && item.guestNumber === guestNumber)
    ));
  };

  const handleCompleteOrder = () => {
    // Add all order items to the table
    orderItems.forEach(item => {
      dispatch({ type: 'ADD_ORDER_ITEM', tableId: table.id, item });
    });
    setStep('summary');
  };

  const getTotalAmount = () => {
    return orderItems.reduce((total, item) => total + (item.menuItem.price * item.quantity), 0);
  };

  const filteredMenuItems = selectedCategory 
    ? state.menuItems.filter(item => item.category === selectedCategory)
    : [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">Стол {table.id}</h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {step === 'guests' && (
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
                  onClick={() => setGuests(guests + 1)}
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
              <h3 className="text-lg font-medium mb-4">Выберите гостя</h3>
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
              <h3 className="text-lg font-medium mb-4">Итоговый заказ</h3>
              
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
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Итого:</span>
                  <span className="text-green-600">{getTotalAmount()}₽</span>
                </div>
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
                    dispatch({ type: 'COMPLETE_ORDER', tableId: table.id });
                    onClose();
                  }}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Закрыть заказ
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}