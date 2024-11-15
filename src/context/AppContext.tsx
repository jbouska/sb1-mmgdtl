import React, { createContext, useContext, useState } from 'react';

interface Supplier {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  category: string;
  manufacturer: string;
  referenceNumber: string;
  unit: string;
  suppliers: Array<{
    id: number;
    price: number;
  }>;
}

interface User {
  id: number;
  name: string;
  email: string;
  department: string;
}

interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  orderDate: string;
  deliveryDate: string;
  status: 'pending' | 'delivered' | 'cancelled';
  supplierId: number;
  supplierPrice: number;
  totalCost: number;
}

interface AppContextType {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  return (
    <AppContext.Provider value={{
      products,
      setProducts,
      users,
      setUsers,
      orders,
      setOrders,
      suppliers,
      setSuppliers
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}