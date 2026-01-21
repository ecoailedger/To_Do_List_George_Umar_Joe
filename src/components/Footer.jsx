import React from 'react';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';

export default function Footer() {
  const { data } = useApp();

  const lastSaved = data.lastSaved
    ? formatDistanceToNow(new Date(data.lastSaved), { addSuffix: true })
    : 'Never';

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2 flex-shrink-0">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>
          Last saved: {lastSaved}
        </div>
        <div className="flex items-center space-x-4">
          <span>Press ? for keyboard shortcuts</span>
        </div>
      </div>
    </footer>
  );
}
