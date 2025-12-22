'use client';

import { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';

type FilterType = 'all' | 'unread' | 'critical' | 'warning' | 'info';

interface FiltersBarProps {
  onFilterChange: (filter: FilterType) => void;
  onSearchChange: (term: string) => void;
  selectedCount: number;
  onMarkSelectedAsRead: () => void;
}

export default function FiltersBar({
  onFilterChange,
  onSearchChange,
  selectedCount,
  onMarkSelectedAsRead,
}: FiltersBarProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleFilterChange = (value: FilterType) => {
    setFilter(value);
    onFilterChange(value);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearchChange(value);
  };

  return (
    <div className="bg-gry rounded-lg shadow mb-6 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-600 w-4 h-4" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full text-black pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="relative">
          <select
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as FilterType)}
            aria-label="Filter notifications"
            className="appearance-none text-black bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread Only</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
        </div>

        {selectedCount > 0 && (
          <button
            onClick={onMarkSelectedAsRead}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Mark Selected as Read ({selectedCount})
          </button>
        )}
      </div>
    </div>
  );
}