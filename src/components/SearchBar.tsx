import React from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  fields: {
    name: string;
    label: string;
    type: 'text' | 'date' | 'select';
    options?: string[];
  }[];
  filters: Record<string, any>;
  setFilters: (filters: Record<string, any>) => void;
  sortConfig: {
    key: string;
    direction: 'asc' | 'desc';
  } | null;
  setSortConfig: (config: { key: string; direction: 'asc' | 'desc' } | null) => void;
}

export default function SearchBar({ fields, filters, setFilters, sortConfig, setSortConfig }: SearchBarProps) {
  const handleFilterChange = (field: string, value: any) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSort = (key: string) => {
    if (sortConfig?.key === key) {
      if (sortConfig.direction === 'asc') {
        setSortConfig({ key, direction: 'desc' });
      } else {
        setSortConfig(null);
      }
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 space-y-4">
      <div className="flex items-center space-x-2 text-gray-600 mb-2">
        <Search className="w-5 h-5" />
        <span className="font-medium">Search & Filter</span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fields.map(field => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
            </label>
            {field.type === 'date' ? (
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters[`${field.name}Start`] || ''}
                  onChange={(e) => handleFilterChange(`${field.name}Start`, e.target.value)}
                  className="input-field text-sm"
                  placeholder="From"
                />
                <input
                  type="date"
                  value={filters[`${field.name}End`] || ''}
                  onChange={(e) => handleFilterChange(`${field.name}End`, e.target.value)}
                  className="input-field text-sm"
                  placeholder="To"
                />
              </div>
            ) : field.type === 'select' ? (
              <select
                value={filters[field.name] || ''}
                onChange={(e) => handleFilterChange(field.name, e.target.value)}
                className="input-field text-sm"
              >
                <option value="">All</option>
                {field.options?.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={filters[field.name] || ''}
                onChange={(e) => handleFilterChange(field.name, e.target.value)}
                className="input-field text-sm"
                placeholder={`Search by ${field.label.toLowerCase()}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mt-2">
        {fields.map(field => (
          <button
            key={field.name}
            onClick={() => handleSort(field.name)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              sortConfig?.key === field.name
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {field.label} {sortConfig?.key === field.name && (sortConfig.direction === 'asc' ? '↑' : '↓')}
          </button>
        ))}
      </div>
    </div>
  );
}