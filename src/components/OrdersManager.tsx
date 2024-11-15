import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { format, isWithinInterval, parseISO, isValid } from 'date-fns';
import { useAppContext } from '../context/AppContext';
import SearchBar from './SearchBar';
import { exportToExcel } from '../utils/exportToExcel';

export default function OrdersManager() {
  const { orders, setOrders, products, users, suppliers } = useAppContext();
  const [isAddingOrder, setIsAddingOrder] = useState(false);
  const [editingOrder, setEditingOrder] = useState<typeof orders[0] | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    productId: '',
    quantity: '',
    orderDate: format(new Date(), 'yyyy-MM-dd'),
    deliveryDate: '',
    status: 'pending' as 'pending' | 'delivered' | 'cancelled',
    supplierId: '',
    supplierPrice: ''
  });

  const searchFields = [
    { name: 'userId', label: 'User', type: 'select' as const, options: users.map(u => u.name) },
    { name: 'productId', label: 'Product', type: 'select' as const, options: products.map(p => p.name) },
    { name: 'status', label: 'Status', type: 'select' as const, options: ['pending', 'delivered', 'cancelled'] },
    { name: 'orderDate', label: 'Order Date', type: 'date' as const },
    { name: 'deliveryDate', label: 'Delivery Date', type: 'date' as const },
    { name: 'supplierId', label: 'Supplier', type: 'select' as const, options: suppliers.map(s => s.name) }
  ];

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product && product.suppliers.length > 0) {
      const cheapestSupplier = product.suppliers.reduce((prev, curr) => 
        prev.price < curr.price ? prev : curr
      );
      setFormData(prev => ({
        ...prev,
        productId,
        supplierId: cheapestSupplier.id.toString(),
        supplierPrice: cheapestSupplier.price.toString()
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        productId,
        supplierId: '',
        supplierPrice: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newOrder = {
      id: editingOrder ? editingOrder.id : Date.now(),
      userId: parseInt(formData.userId),
      productId: parseInt(formData.productId),
      quantity: parseInt(formData.quantity),
      orderDate: formData.orderDate,
      deliveryDate: formData.deliveryDate || null,
      status: formData.status,
      supplierId: parseInt(formData.supplierId),
      supplierPrice: parseFloat(formData.supplierPrice),
      totalCost: parseInt(formData.quantity) * parseFloat(formData.supplierPrice)
    };

    if (editingOrder) {
      setOrders(orders.map(o => o.id === editingOrder.id ? newOrder : o));
    } else {
      setOrders([...orders, newOrder]);
    }

    setFormData({
      userId: '',
      productId: '',
      quantity: '',
      orderDate: format(new Date(), 'yyyy-MM-dd'),
      deliveryDate: '',
      status: 'pending',
      supplierId: '',
      supplierPrice: ''
    });
    setIsAddingOrder(false);
    setEditingOrder(null);
  };

  const getUserName = (userId: number) => {
    return users.find(u => u.id === userId)?.name || 'Unknown User';
  };

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Unknown Product';
  };

  const getSupplierName = (supplierId: number) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy') : '-';
    } catch {
      return '-';
    }
  };

  const isDateInRange = (dateStr: string | null, start: string, end: string) => {
    if (!dateStr) return false;
    try {
      const date = parseISO(dateStr);
      const startDate = parseISO(start);
      const endDate = parseISO(end);
      
      if (!isValid(date) || !isValid(startDate) || !isValid(endDate)) return false;
      
      return isWithinInterval(date, { start: startDate, end: endDate });
    } catch {
      return false;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;

        if (key.endsWith('Start') || key.endsWith('End')) {
          const baseKey = key.replace(/Start|End/, '');
          const start = filters[`${baseKey}Start`];
          const end = filters[`${baseKey}End`];
          
          if (start && end) {
            return isDateInRange(order[baseKey], start, end);
          }
          return true;
        }

        if (key === 'userId') {
          return getUserName(order.userId).toLowerCase().includes(value.toLowerCase());
        }

        if (key === 'productId') {
          return getProductName(order.productId).toLowerCase().includes(value.toLowerCase());
        }

        if (key === 'supplierId') {
          return getSupplierName(order.supplierId).toLowerCase().includes(value.toLowerCase());
        }

        return String(order[key] || '').toLowerCase().includes(value.toLowerCase());
      });
    }).sort((a, b) => {
      if (!sortConfig) return 0;

      const aValue = sortConfig.key === 'userId' ? getUserName(a.userId) :
                    sortConfig.key === 'productId' ? getProductName(a.productId) :
                    sortConfig.key === 'supplierId' ? getSupplierName(a.supplierId) :
                    a[sortConfig.key];
      const bValue = sortConfig.key === 'userId' ? getUserName(b.userId) :
                    sortConfig.key === 'productId' ? getProductName(b.productId) :
                    sortConfig.key === 'supplierId' ? getSupplierName(b.supplierId) :
                    b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [orders, filters, sortConfig]);

  const handleExport = () => {
    const exportData = filteredOrders.map(order => ({
      'Order ID': order.id,
      'User': getUserName(order.userId),
      'Product': getProductName(order.productId),
      'Quantity': order.quantity,
      'Supplier': getSupplierName(order.supplierId),
      'Unit Price (CZK)': order.supplierPrice,
      'Total Cost (CZK)': order.totalCost,
      'Status': order.status,
      'Order Date': formatDate(order.orderDate),
      'Delivery Date': formatDate(order.deliveryDate)
    }));
    exportToExcel(exportData, `orders-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Orders Management</h2>
        <div className="flex space-x-2">
          <button onClick={handleExport} className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export to Excel
          </button>
          <button onClick={() => setIsAddingOrder(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2" />
            New Order
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg">
        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className="w-full px-4 py-3 flex items-center justify-between text-gray-700 hover:bg-gray-50"
        >
          <span className="font-medium">Search & Filter</span>
          {isFilterVisible ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {isFilterVisible && (
          <div className="p-4 border-t">
            <SearchBar
              fields={searchFields}
              filters={filters}
              setFilters={setFilters}
              sortConfig={sortConfig}
              setSortConfig={setSortConfig}
            />
          </div>
        )}
      </div>

      {(isAddingOrder || editingOrder) && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">User</label>
              <select
                value={formData.userId}
                onChange={e => setFormData({ ...formData, userId: e.target.value })}
                className="input-field"
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Product</label>
              <select
                value={formData.productId}
                onChange={e => handleProductChange(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                className="input-field"
                required
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as typeof formData.status })}
                className="input-field"
                required
              >
                <option value="pending">Pending</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Order Date</label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={e => setFormData({ ...formData, orderDate: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Delivery Date (Optional)</label>
              <input
                type="date"
                value={formData.deliveryDate}
                onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Supplier</label>
              <select
                value={formData.supplierId}
                onChange={e => {
                  const supplier = suppliers.find(s => s.id === parseInt(e.target.value));
                  const product = products.find(p => p.id === parseInt(formData.productId));
                  const supplierPrice = product?.suppliers.find(s => s.id === parseInt(e.target.value))?.price || '';
                  setFormData({
                    ...formData,
                    supplierId: e.target.value,
                    supplierPrice: supplierPrice.toString()
                  });
                }}
                className="input-field"
                required
              >
                <option value="">Select Supplier</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Price (CZK)</label>
              <input
                type="number"
                value={formData.supplierPrice}
                onChange={e => setFormData({ ...formData, supplierPrice: e.target.value })}
                className="input-field"
                required
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsAddingOrder(false);
                setEditingOrder(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingOrder ? 'Update' : 'Save'} Order
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Order ID</th>
              <th className="table-header">User</th>
              <th className="table-header">Product</th>
              <th className="table-header">Quantity</th>
              <th className="table-header">Supplier</th>
              <th className="table-header">Unit Price (CZK)</th>
              <th className="table-header">Total Cost (CZK)</th>
              <th className="table-header">Order Date</th>
              <th className="table-header">Delivery Date</th>
              <th className="table-header">Status</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td className="table-cell">#{order.id}</td>
                <td className="table-cell">{getUserName(order.userId)}</td>
                <td className="table-cell">{getProductName(order.productId)}</td>
                <td className="table-cell">{order.quantity}</td>
                <td className="table-cell">{getSupplierName(order.supplierId)}</td>
                <td className="table-cell">{order.supplierPrice.toLocaleString('cs-CZ')} Kč</td>
                <td className="table-cell">{order.totalCost.toLocaleString('cs-CZ')} Kč</td>
                <td className="table-cell">{formatDate(order.orderDate)}</td>
                <td className="table-cell">{formatDate(order.deliveryDate)}</td>
                <td className="table-cell">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingOrder(order);
                        setFormData({
                          userId: order.userId.toString(),
                          productId: order.productId.toString(),
                          quantity: order.quantity.toString(),
                          orderDate: order.orderDate,
                          deliveryDate: order.deliveryDate || '',
                          status: order.status,
                          supplierId: order.supplierId.toString(),
                          supplierPrice: order.supplierPrice.toString()
                        });
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setOrders(orders.filter(o => o.id !== order.id))}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}