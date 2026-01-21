import React, { useState, useEffect } from 'react';
import { Cloud, CloudOff, RefreshCw, Check, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { syncService } from '../services/syncService';
import { isSupabaseEnabled } from '../config/supabase';

export default function SyncStatus({ onOpenAuth }) {
  const [syncStatus, setSyncStatus] = useState({
    status: 'offline',
    lastSync: null,
    error: null,
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync status updates
    const unsubscribe = syncService.addSyncListener((status) => {
      setSyncStatus(status);
    });

    // Initial check
    if (!isSupabaseEnabled()) {
      setSyncStatus({ status: 'disabled' });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  const handleManualSync = async () => {
    const result = await syncService.manualSync();
    if (!result.success) {
      console.error('Manual sync failed:', result.error);
    }
  };

  const getStatusIcon = () => {
    if (!isOnline) {
      return <WifiOff size={16} className="text-gray-400" />;
    }

    switch (syncStatus.status) {
      case 'syncing':
      case 'incoming':
        return <RefreshCw size={16} className="text-blue-500 animate-spin" />;
      case 'synced':
        return <Cloud size={16} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-500" />;
      case 'disabled':
        return <CloudOff size={16} className="text-gray-400" />;
      default:
        return <Cloud size={16} className="text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';

    switch (syncStatus.status) {
      case 'syncing':
        return 'Syncing...';
      case 'incoming':
        return 'Receiving updates...';
      case 'synced':
        return syncStatus.lastSync
          ? `Synced ${formatTimeSince(syncStatus.lastSync)}`
          : 'Synced';
      case 'error':
        return 'Sync error';
      case 'disabled':
        return 'Cloud sync disabled';
      default:
        return 'Not synced';
    }
  };

  const formatTimeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (syncStatus.status === 'disabled') {
    return (
      <button
        onClick={onOpenAuth}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs"
        title="Enable cloud sync"
      >
        <CloudOff size={16} className="text-gray-400" />
        <span className="text-gray-600 dark:text-gray-400">Offline mode</span>
      </button>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={handleManualSync}
        disabled={syncStatus.status === 'syncing' || !isOnline}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        title={`${getStatusText()}${!isOnline ? ' - No internet connection' : ''}`}
      >
        {getStatusIcon()}
        <span className="text-gray-700 dark:text-gray-300">{getStatusText()}</span>
      </button>
    </div>
  );
}
