import React, { useState } from 'react';
import { X, Upload, FileJson } from 'lucide-react';
import { importData } from '../utils/storage';

export default function ImportModal({ onClose, onSuccess }) {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      setError('Please select a JSON file');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const success = importData(text);

      if (success) {
        onSuccess();
        window.location.reload(); // Reload to show imported data
      } else {
        setError('Invalid JSON file format');
      }
    } catch (err) {
      setError('Failed to import file: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 animate-scale-in">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Upload size={24} className="text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Import Data
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
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Import a previously exported JSON backup file to restore your data.
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          )}

          <label
            htmlFor="json-upload"
            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <FileJson size={48} className="mb-4 text-gray-400" />
              <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                {isLoading ? 'Importing...' : 'Click to upload JSON file'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select a JSON backup file exported from this app
              </p>
            </div>
            <input
              id="json-upload"
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="hidden"
            />
          </label>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-400">
              ⚠️ Warning: Importing will replace all current data. Make sure to export your current data first if you want to keep it.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
