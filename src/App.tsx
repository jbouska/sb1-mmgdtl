import React, { useState } from 'react';
import { Beaker, Users, ShoppingCart, Building2 } from 'lucide-react';
import ProductsManager from './components/ProductsManager';
import UsersManager from './components/UsersManager';
import OrdersManager from './components/OrdersManager';
import SuppliersManager from './components/SuppliersManager';
import { AppProvider } from './context/AppContext';

function App() {
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'orders' | 'suppliers'>('products');

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('products')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'products'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Beaker className="w-5 h-5 mr-2" />
                  Products
                </button>
                <button
                  onClick={() => setActiveTab('users')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'users'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Users
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'orders'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('suppliers')}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    activeTab === 'suppliers'
                      ? 'border-indigo-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Suppliers
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {activeTab === 'products' && <ProductsManager />}
          {activeTab === 'users' && <UsersManager />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'suppliers' && <SuppliersManager />}
        </main>
      </div>
    </AppProvider>
  );
}

export default App;