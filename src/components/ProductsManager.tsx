import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import SearchBar from './SearchBar';

interface SupplierPrice {
  id: number;
  price: number;
}

export default function ProductsManager() {
  const { products, setProducts, suppliers } = useAppContext();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<typeof products[0] | null>(null);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    manufacturer: '',
    referenceNumber: '',
    unit: '',
    suppliers: [] as SupplierPrice[]
  });

  const searchFields = [
    { name: 'name', label: 'Product Name', type: 'text' as const },
    { name: 'category', label: 'Category', type: 'text' as const },
    { name: 'manufacturer', label: 'Manufacturer', type: 'text' as const },
    { name: 'referenceNumber', label: 'Reference', type: 'text' as const },
  ];

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(product[key]).toLowerCase().includes(value.toLowerCase());
      });
    }).sort((a, b) => {
      if (!sortConfig) return 0;
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [products, filters, sortConfig]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => 
        p.id === editingProduct.id ? { ...formData, id: p.id } : p
      ));
      setEditingProduct(null);
    } else {
      setProducts([...products, { ...formData, id: Date.now() }]);
    }
    setFormData({
      name: '',
      category: '',
      manufacturer: '',
      referenceNumber: '',
      unit: '',
      suppliers: []
    });
    setIsAddingProduct(false);
  };

  const handleSupplierPriceChange = (supplierId: number, price: string) => {
    const numericPrice = price === '' ? 0 : parseFloat(price);
    const existingIndex = formData.suppliers.findIndex(s => s.id === supplierId);
    
    if (existingIndex >= 0) {
      const newSuppliers = [...formData.suppliers];
      newSuppliers[existingIndex] = { id: supplierId, price: numericPrice };
      setFormData({ ...formData, suppliers: newSuppliers });
    } else {
      setFormData({
        ...formData,
        suppliers: [...formData.suppliers, { id: supplierId, price: numericPrice }]
      });
    }
  };

  const getSupplierName = (supplierId: number) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Unknown Supplier';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Products Management</h2>
        <button
          onClick={() => setIsAddingProduct(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
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

      {(isAddingProduct || editingProduct) && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Manufacturer</label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reference Number</label>
              <input
                type="text"
                value={formData.referenceNumber}
                onChange={e => setFormData({ ...formData, referenceNumber: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: e.target.value })}
                className="input-field"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Supplier Prices</h3>
            <div className="grid gap-4">
              {suppliers.map(supplier => (
                <div key={supplier.id} className="grid grid-cols-2 gap-4">
                  <div className="text-sm font-medium text-gray-700 flex items-center">
                    {supplier.name}
                  </div>
                  <div>
                    <input
                      type="number"
                      value={formData.suppliers.find(s => s.id === supplier.id)?.price || ''}
                      onChange={e => handleSupplierPriceChange(supplier.id, e.target.value)}
                      className="input-field"
                      min="0"
                      step="0.01"
                      placeholder="Price in CZK"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsAddingProduct(false);
                setEditingProduct(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingProduct ? 'Update' : 'Save'} Product
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Product</th>
              <th className="table-header">Category</th>
              <th className="table-header">Manufacturer</th>
              <th className="table-header">Reference</th>
              <th className="table-header">Unit</th>
              <th className="table-header">Best Price (CZK)</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map(product => (
              <tr key={product.id}>
                <td className="table-cell">{product.name}</td>
                <td className="table-cell">{product.category}</td>
                <td className="table-cell">{product.manufacturer}</td>
                <td className="table-cell">{product.referenceNumber}</td>
                <td className="table-cell">{product.unit}</td>
                <td className="table-cell">
                  {product.suppliers.length > 0 ? (
                    <>
                      {Math.min(...product.suppliers.map(s => s.price)).toLocaleString('cs-CZ')} Kč
                      <div className="text-xs text-gray-500">
                        ({getSupplierName(product.suppliers.reduce((prev, curr) => 
                          prev.price < curr.price ? prev : curr
                        ).id)})
                      </div>
                    </>
                  ) : (
                    'No suppliers'
                  )}
                </td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingProduct(product);
                        setFormData(product);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setProducts(products.filter(p => p.id !== product.id))}
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