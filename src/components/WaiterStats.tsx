import React, { useMemo } from 'react';
import { TrendingUp, Clock, DollarSign, Users, Award, Calendar, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useRestaurant } from '../contexts/RestaurantContext';
import { WaiterStats as WaiterStatsType } from '../types';

interface WaiterStatsProps {
  waiterId?: number;
  showAllWaiters?: boolean;
}

export function WaiterStats({ waiterId, showAllWaiters = false }: WaiterStatsProps) {
  const { state: authState } = useAuth();
  const { state: restaurantState } = useRestaurant();

  const calculateWaiterStats = (wId: number): WaiterStatsType => {
    const waiter = authState.users.find(u => u.id === wId);
    if (!waiter) {
      return {
        waiterId: wId,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        tablesServed: 0,
        workingHours: 0,
        ordersToday: 0,
        revenueToday: 0,
        ordersThisWeek: 0,
        revenueThisWeek: 0,
        ordersThisMonth: 0,
        revenueThisMonth: 0,
        topCategories: [],
        performanceRating: 0
      };
    }

    const waiterOrders = restaurantState.orders.filter(order => order.waiterId === wId);
    const waiterTables = restaurantState.tables.filter(table => table.waiterId === wId);
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000));
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const ordersToday = waiterOrders.filter(order => 
      new Date(order.timestamp) >= today
    );
    const ordersThisWeek = waiterOrders.filter(order => 
      new Date(order.timestamp) >= weekStart
    );
    const ordersThisMonth = waiterOrders.filter(order => 
      new Date(order.timestamp) >= monthStart
    );

    const totalRevenue = waiterOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueToday = ordersToday.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueThisWeek = ordersThisWeek.reduce((sum, order) => sum + order.totalAmount, 0);
    const revenueThisMonth = ordersThisMonth.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate working hours from work sessions
    const waiterSessions = authState.workSessions.filter(session => session.waiterId === wId);
    const workingHours = waiterSessions.reduce((total, session) => {
      const endTime = session.endTime || now;
      const duration = (endTime.getTime() - session.startTime.getTime()) / (1000 * 60 * 60);
      return total + duration;
    }, 0);

    // Calculate top categories
    const categoryStats: { [key: string]: { count: number; revenue: number } } = {};
    waiterOrders.forEach(order => {
      order.items.forEach(item => {
        const category = item.menuItem.category;
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, revenue: 0 };
        }
        categoryStats[category].count += item.quantity;
        categoryStats[category].revenue += item.menuItem.price * item.quantity;
      });
    });

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate performance rating (1-5 stars)
    let rating = 1;
    if (waiterOrders.length > 10) rating++;
    if (totalRevenue > 50000) rating++;
    if (waiterOrders.length > 0 && totalRevenue / waiterOrders.length > 1500) rating++;
    if (waiterOrders.length > 50) rating++;

    return {
      waiterId: wId,
      totalOrders: waiterOrders.length,
      totalRevenue,
      averageOrderValue: waiterOrders.length > 0 ? totalRevenue / waiterOrders.length : 0,
      tablesServed: waiterTables.length,
      workingHours,
      ordersToday: ordersToday.length,
      revenueToday,
      ordersThisWeek: ordersThisWeek.length,
      revenueThisWeek,
      ordersThisMonth: ordersThisMonth.length,
      revenueThisMonth,
      lastOrderTime: waiterOrders.length > 0 
        ? new Date(Math.max(...waiterOrders.map(o => o.timestamp.getTime())))
        : undefined,
      topCategories,
      performanceRating: rating
    };
  };

  const stats = useMemo(() => {
    if (showAllWaiters) {
      const waiters = authState.users.filter(u => u.role === 'waiter');
      return waiters.map(waiter => ({
        waiter,
        stats: calculateWaiterStats(waiter.id)
      }));
    } else {
      const targetWaiterId = waiterId || authState.currentUser?.id;
      if (!targetWaiterId) return null;
      
      const waiter = authState.users.find(u => u.id === targetWaiterId);
      if (!waiter) return null;

      return {
        waiter,
        stats: calculateWaiterStats(targetWaiterId)
      };
    }
  }, [waiterId, authState.users, authState.workSessions, restaurantState.orders, restaurantState.tables, showAllWaiters]);

  if (showAllWaiters && Array.isArray(stats)) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium mb-4">Статистика официантов</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {stats.map(({ waiter, stats: waiterStats }) => (
            <div key={waiter.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {waiter.firstName} {waiter.lastName}
                  </h4>
                  <p className="text-sm text-gray-500">@{waiter.username}</p>
                </div>
                <div className="flex items-center">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Award
                      key={i}
                      className={`h-4 w-4 ${
                        i < waiterStats.performanceRating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {waiterStats.totalOrders}
                  </div>
                  <div className="text-xs text-gray-500">Заказов всего</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {waiterStats.totalRevenue.toLocaleString()}₽
                  </div>
                  <div className="text-xs text-gray-500">Выручка</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {waiterStats.ordersToday}
                  </div>
                  <div className="text-xs text-gray-500">Сегодня</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {Math.round(waiterStats.workingHours)}ч
                  </div>
                  <div className="text-xs text-gray-500">Отработано</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!stats || typeof stats === 'object' && 'waiter' in stats) {
    const { waiter, stats: waiterStats } = stats as { waiter: any; stats: WaiterStatsType };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">
            Статистика {waiter.firstName} {waiter.lastName}
          </h3>
          <div className="flex items-center space-x-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Award
                key={i}
                className={`h-5 w-5 ${
                  i < waiterStats.performanceRating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-600">
              {waiterStats.performanceRating}/5
            </span>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {waiterStats.totalOrders}
                </div>
                <div className="text-sm text-gray-500">Заказов всего</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {waiterStats.totalRevenue.toLocaleString()}₽
                </div>
                <div className="text-sm text-gray-500">Общая выручка</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(waiterStats.averageOrderValue)}₽
                </div>
                <div className="text-sm text-gray-500">Средний чек</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round(waiterStats.workingHours)}ч
                </div>
                <div className="text-sm text-gray-500">Отработано</div>
              </div>
            </div>
          </div>
        </div>

        {/* Period Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Сегодня</h4>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Заказов:</span>
                <span className="font-medium">{waiterStats.ordersToday}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Выручка:</span>
                <span className="font-medium">{waiterStats.revenueToday.toLocaleString()}₽</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Эта неделя</h4>
              <Calendar className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Заказов:</span>
                <span className="font-medium">{waiterStats.ordersThisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Выручка:</span>
                <span className="font-medium">{waiterStats.revenueThisWeek.toLocaleString()}₽</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium text-gray-900">Этот месяц</h4>
              <Calendar className="h-5 w-5 text-purple-500" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Заказов:</span>
                <span className="font-medium">{waiterStats.ordersThisMonth}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Выручка:</span>
                <span className="font-medium">{waiterStats.revenueThisMonth.toLocaleString()}₽</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Categories */}
        {waiterStats.topCategories.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h4 className="font-medium text-gray-900 mb-4">Топ категории</h4>
            <div className="space-y-3">
              {waiterStats.topCategories.map((category, index) => (
                <div key={category.category} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-medium flex items-center justify-center mr-3">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{category.revenue.toLocaleString()}₽</div>
                    <div className="text-xs text-gray-500">{category.count} позиций</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <p className="text-gray-500">Статистика недоступна</p>
    </div>
  );
}