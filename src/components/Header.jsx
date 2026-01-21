import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Sun, Moon, LayoutGrid, BarChart3, Filter, Download, Search, Plus, HelpCircle, User, FileText, Eye } from 'lucide-react';
import { generateStandupReport } from '../utils/helpers';
import SyncStatus from './SyncStatus';
import AuthModal from './AuthModal';

export default function Header({ onToggleFilters, onOpenExport, showFilters }) {
  const {
    viewMode,
    setViewMode,
    toggleDarkMode,
    data,
    searchQuery,
    setSearchQuery,
    setShowShortcuts,
    setCurrentUser,
    showNotification,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showStandupModal, setShowStandupModal] = useState(false);
  const [standupReport, setStandupReport] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isDark = data.settings.darkMode;
  const currentUser = data.teamMembers.find(m => m.id === data.currentUser);

  // Calculate task counts per user
  const userTaskCounts = useMemo(() => {
    const counts = {};
    data.teamMembers.forEach(member => {
      counts[member.id] = 0;
    });

    Object.values(data.todos).forEach(todos => {
      todos.forEach(todo => {
        if (todo.assignee && counts[todo.assignee] !== undefined) {
          counts[todo.assignee]++;
        }
      });
    });

    return counts;
  }, [data.todos, data.teamMembers]);

  const handleGenerateStandup = () => {
    const report = generateStandupReport(data, data.currentUser);
    setStandupReport(report);
    setShowStandupModal(true);
  };

  const copyStandupToClipboard = () => {
    navigator.clipboard.writeText(standupReport);
    showNotification('Standup report copied to clipboard!', 'success');
    setShowStandupModal(false);
  };

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
              onClick={() => setViewMode('focus')}
              className={`px-3 py-2 rounded-md flex items-center space-x-2 transition-colors ${
                viewMode === 'focus'
                  ? 'bg-white dark:bg-gray-600 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title="My Focus View"
            >
              <Eye size={18} />
              <span className="text-sm font-medium">My Focus</span>
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

          {/* Working As Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: currentUser?.color }}
              >
                {currentUser?.initials}
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {currentUser?.name}
              </span>
              <span className="badge bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-400">
                {userTaskCounts[data.currentUser] || 0}
              </span>
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 py-2">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Working as</p>
                  </div>
                  {data.teamMembers.map(member => (
                    <button
                      key={member.id}
                      onClick={() => {
                        setCurrentUser(member.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full px-4 py-2 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        member.id === data.currentUser ? 'bg-gray-50 dark:bg-gray-700/50' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.initials}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {member.name}
                        </span>
                      </div>
                      <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        {userTaskCounts[member.id] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
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
          <SyncStatus onOpenAuth={() => setShowAuthModal(true)} />

          <button
            onClick={handleGenerateStandup}
            className="px-3 py-2 rounded-lg flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white transition-colors"
            title="Generate Standup Report"
          >
            <FileText size={18} />
            <span className="text-sm font-medium">Standup</span>
          </button>

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

      {/* Standup Modal */}
      {showStandupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Standup Report - {currentUser?.name}
              </h2>
              <button
                onClick={() => setShowStandupModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                {standupReport}
              </pre>
            </div>
            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowStandupModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
              <button
                onClick={copyStandupToClipboard}
                className="btn-primary"
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={async () => {
            setShowAuthModal(false);
            showNotification('Signed in successfully! Syncing data...', 'success');
          }}
        />
      )}
    </header>
  );
}
