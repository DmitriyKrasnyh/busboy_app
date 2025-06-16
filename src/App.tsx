import React from 'react';
import { RestaurantProvider, useRestaurant } from './contexts/RestaurantContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Header';
import { TablesView } from './components/TablesView';
import { AdminPanel } from './components/AdminPanel';
import { LoginForm } from './components/LoginForm';

function AppContent() {
  const { state } = useRestaurant();
  const { state: authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <LoginForm />;
  }

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
    <AuthProvider>
      <RestaurantProvider>
        <AppContent />
      </RestaurantProvider>
    </AuthProvider>
  );
}

export default App;