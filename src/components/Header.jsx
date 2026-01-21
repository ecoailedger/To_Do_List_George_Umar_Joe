import React from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, LayoutGrid, BarChart3, Filter, Download, Search, Plus, HelpCircle } from 'lucide-react';

export default function Header({ onToggleFilters, onOpenExport, showFilters }) {
  const {
    viewMode,
    setViewMode,
    toggleDarkMode,
    data,
    searchQuery,
    setSearchQuery,
    setShowShortcuts,
  } = useApp();

  const isDark = data.settings.darkMode;

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex-shrink-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Midwich To-Do Matrix
          </h1>

          {/* View Toggle */}
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setViewMode('matrix')}
              className={`px-3 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                viewMode === 'matrix'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Matrix View"
            >
              <LayoutGrid size={18} />
              <span className="text-sm font-medium">Matrix</span>
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                viewMode === 'dashboard'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="Dashboard View"
            >
              <BarChart3 size={18} />
              <span className="text-sm font-medium">Dashboard</span>
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              id="global-search"
              type="text"
              placeholder="Search tasks... (⌘K)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Action buttons */}
          <button
            onClick={onToggleFilters}
            className={`p-2 rounded-lg transition-colors ${
              showFilters
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            title="Filters"
          >
            <Filter size={20} />
          </button>

          <button
            onClick={onOpenExport}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Export"
          >
            <Download size={20} />
          </button>

          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Keyboard Shortcuts (?)"
          >
            <HelpCircle size={20} />
          </button>

          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Toggle Dark Mode (D)"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
