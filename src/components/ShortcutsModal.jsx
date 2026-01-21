import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function ShortcutsModal({ onClose }) {
  const shortcuts = [
    { keys: ['?'], description: 'Show this help dialog' },
    { keys: ['N'], description: 'New task in focused cell' },
    { keys: ['P'], description: 'New project' },
    { keys: ['⌘/Ctrl', 'K'], description: 'Focus search' },
    { keys: ['D'], description: 'Toggle dark mode' },
    { keys: ['E'], description: 'Export menu' },
    { keys: ['F'], description: 'Toggle filters' },
    { keys: ['Esc'], description: 'Close modal/panel' },
    { keys: ['⌘/Ctrl', 'Z'], description: 'Undo last action' },
    { keys: ['⌘/Ctrl', 'Shift', 'Z'], description: 'Redo action' },
    { keys: ['Arrow Keys'], description: 'Navigate cells' },
    { keys: ['Enter'], description: 'Open cell detail' },
    { keys: ['Double Click'], description: 'Enter focus mode' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Keyboard size={24} className="text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <div className="flex items-center space-x-1">
                  {shortcut.keys.map((key, i) => (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="text-gray-400">+</span>}
                      <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">
                        {key}
                      </kbd>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Press <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">?</kbd> anytime to show this dialog
          </p>
        </div>
      </div>
    </div>
  );
}
