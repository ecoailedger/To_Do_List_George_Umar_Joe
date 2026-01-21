import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Header from './components/Header';
import MatrixView from './components/MatrixView';
import Dashboard from './components/Dashboard';
import MyFocusView from './components/MyFocusView';
import TodoDetailPanel from './components/TodoDetailPanel';
import FilterSidebar from './components/FilterSidebar';
import ExportModal from './components/ExportModal';
import ShortcutsModal from './components/ShortcutsModal';
import FocusMode from './components/FocusMode';
import Notification from './components/Notification';
import Footer from './components/Footer';

function AppContent() {
  const {
    viewMode,
    selectedCell,
    setSelectedCell,
    showShortcuts,
    setShowShortcuts,
    focusMode,
    setFocusMode,
    notification,
  } = useApp();

  const [showFilters, setShowFilters] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        if (e.key === 'Escape') {
          e.target.blur();
        }
        return;
      }

      // Global shortcuts
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowShortcuts(true);
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (focusMode) {
          setFocusMode(null);
        } else if (selectedCell) {
          setSelectedCell(null);
        } else if (showFilters) {
          setShowFilters(false);
        } else if (showExport) {
          setShowExport(false);
        }
      }

      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search')?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, showFilters, showExport, focusMode, setSelectedCell, setShowShortcuts, setFocusMode]);

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
      <Header
        onToggleFilters={() => setShowFilters(!showFilters)}
        onOpenExport={() => setShowExport(true)}
        showFilters={showFilters}
      />

      <div className="flex-1 flex overflow-hidden">
        {showFilters && (
          <FilterSidebar onClose={() => setShowFilters(false)} />
        )}

        <main className="flex-1 overflow-hidden">
          {viewMode === 'matrix' && <MatrixView />}
          {viewMode === 'focus' && <MyFocusView />}
          {viewMode === 'dashboard' && <Dashboard />}
        </main>
      </div>

      <Footer />

      {selectedCell && !focusMode && (
        <TodoDetailPanel
          projectId={selectedCell.projectId}
          company={selectedCell.company}
          onClose={() => setSelectedCell(null)}
        />
      )}

      {focusMode && <FocusMode />}

      {showExport && <ExportModal onClose={() => setShowExport(false)} />}

      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}

      {notification && <Notification {...notification} />}
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
