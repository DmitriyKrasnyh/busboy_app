import React from 'react';
import { RestaurantProvider, useRestaurant } from './contexts/RestaurantContext';
import { Header } from './components/Header';
import { TablesView } from './components/TablesView';
import { AdminPanel } from './components/AdminPanel';

function AppContent() {
  const { state } = useRestaurant();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        {state.currentView === 'tables' ? <TablesView /> : <AdminPanel />}
      </main>
    </div>
  );
}

function App() {
  return (
    <RestaurantProvider>
      <AppContent />
    </RestaurantProvider>
  );
}

export default App;