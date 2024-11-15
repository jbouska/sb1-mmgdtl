import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function SuppliersManager() {
  const { suppliers, setSuppliers } = useAppContext();
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<typeof suppliers[0] | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSupplier) {
      setSuppliers(suppliers.map(s => 
        s.id === editingSupplier.id ? { ...formData, id: s.id } : s
      ));
      setEditingSupplier(null);
    } else {
      setSuppliers([...suppliers, { ...formData, id: Date.now() }]);
    }
    setFormData({ name: '' });
    setIsAddingSupplier(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Suppliers Management</h2>
        <button
          onClick={() => setIsAddingSupplier(true)}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Supplier
        </button>
      </div>

      {(isAddingSupplier || editingSupplier) && (
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Supplier Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ name: e.target.value })}
              className="input-field"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsAddingSupplier(false);
                setEditingSupplier(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingSupplier ? 'Update' : 'Save'} Supplier
            </button>
          </div>
        </form>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="table-header">Name</th>
              <th className="table-header">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {suppliers.map(supplier => (
              <tr key={supplier.id}>
                <td className="table-cell">{supplier.name}</td>
                <td className="table-cell">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingSupplier(supplier);
                        setFormData(supplier);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSuppliers(suppliers.filter(s => s.id !== supplier.id))}
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