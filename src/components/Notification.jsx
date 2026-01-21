import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Notification({ message, type = 'info' }) {
  const icons = {
    success: <CheckCircle size={20} className="text-green-500" />,
    error: <AlertCircle size={20} className="text-red-500" />,
    info: <Info size={20} className="text-blue-500" />,
  };

  const colors = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] animate-slide-in">
      <div className={`flex items-center space-x-3 px-4 py-3 rounded-lg border shadow-lg ${colors[type]}`}>
        {icons[type]}
        <span className="text-sm font-medium text-gray-900 dark:text-white">{message}</span>
      </div>
    </div>
  );
}
