import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Database, Trash2, Download, Upload, Wifi, WifiOff, RefreshCw, ArrowLeft, AlertTriangle } from 'lucide-react';
import { storageService, StorageQuotaInfo } from '../services/storageService';
import { useToast } from '../contexts/ToastContext';

interface DataSettingsProps {
  onBack: () => void;
  onDataCleared?: () => void;
}

export const DataSettings: React.FC<DataSettingsProps> = ({ onBack, onDataCleared }) => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [storageInfo, setStorageInfo] = useState<StorageQuotaInfo>({ used: 0, available: 0, percentUsed: 0 });
  const [isOnline, setIsOnline] = useState(storageService.getOnlineStatus());
  const [lastSync, setLastSync] = useState<number | null>(storageService.getLastSyncTime());
  const [pendingActions, setPendingActions] = useState(storageService.getOfflineQueue().length);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Update storage info
    setStorageInfo(storageService.getStorageInfo());

    // Subscribe to sync events
    const unsubscribe = storageService.onSync(() => {
      setIsOnline(true);
      setLastSync(storageService.getLastSyncTime());
      setPendingActions(storageService.getOfflineQueue().length);
    });

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleClearData = () => {
    storageService.clearAllData();
    setStorageInfo(storageService.getStorageInfo());
    setPendingActions(0);
    setLastSync(null);
    setShowConfirmDialog(false);
    showToast(t('storage.dataCleared'), 'success');
    onDataCleared?.();
  };

  const handleExportData = () => {
    const data = storageService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edufunds-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(t('storage.exportSuccess'), 'success');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (storageService.importData(content)) {
        setStorageInfo(storageService.getStorageInfo());
        showToast(t('storage.importSuccess'), 'success');
      } else {
        showToast(t('storage.importError'), 'error');
      }
    };
    reader.readAsText(file);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await storageService.syncOfflineData();
    setIsSyncing(false);
    setLastSync(storageService.getLastSyncTime());
    setPendingActions(storageService.getOfflineQueue().length);
    showToast(t('storage.syncSuccess'), 'success');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-900 dark:hover:text-white mb-6 transition-colors focus-ring rounded-sm px-2 py-1 -ml-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common.back')}
        </button>
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tighter mb-6 leading-[0.9] dark:text-white">
          {t('storage.title')} &<br />
          <span className="text-stone-400">{t('storage.subtitle')}</span>
        </h2>
        <p className="text-lg text-stone-600 dark:text-stone-400 font-light max-w-2xl font-serif italic">
          {t('storage.description')}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Storage Usage Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              <Database className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            </div>
            <h3 className="text-lg font-semibold dark:text-white">
              {t('storage.currentUsage')}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Progress bar */}
            <div className="w-full bg-stone-200 dark:bg-stone-700 h-4 rounded-full overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-500"
                style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
              />
            </div>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {t('storage.usageInfo', {
                used: formatBytes(storageInfo.used),
                available: formatBytes(storageInfo.available),
                percent: storageInfo.percentUsed.toFixed(1),
              })}
            </p>

            {/* Export/Import buttons */}
            <div className="flex gap-2 pt-4 border-t border-stone-200 dark:border-stone-800">
              <button
                onClick={handleExportData}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                {t('storage.exportData')}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {t('storage.importData')}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Offline Status Card */}
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 sm:p-8 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold dark:text-white">
              {t('storage.offlineStatus')}
            </h3>
          </div>

          <div className="space-y-4">
            {/* Online status indicator */}
            <div className={`p-4 border ${isOnline ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="font-medium dark:text-white">
                  {isOnline ? t('storage.online') : t('storage.offline')}
                </span>
              </div>
              {!isOnline && (
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  {t('storage.offlineMode')}
                </p>
              )}
            </div>

            {/* Pending actions */}
            {pendingActions > 0 && (
              <div className="p-4 border border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
                <p className="text-sm text-stone-700 dark:text-stone-300">
                  {t('storage.pendingActions')}: <strong>{pendingActions}</strong>
                </p>
              </div>
            )}

            {/* Last sync time */}
            {lastSync && (
              <p className="text-sm text-stone-600 dark:text-stone-400">
                {t('storage.lastSync')}: {formatDate(lastSync)}
              </p>
            )}

            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={!isOnline || isSyncing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black dark:bg-white text-white dark:text-black font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              {t('storage.syncNow')}
            </button>
          </div>
        </div>
      </div>

      {/* Clear Data Card */}
      <div className="mt-8 bg-white dark:bg-stone-900 border border-red-200 dark:border-red-800 p-6 sm:p-8 transition-colors duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
            {t('storage.clearData')}
          </h3>
        </div>

        <p className="text-stone-600 dark:text-stone-400 mb-6">
          {t('storage.clearDataWarning')}
        </p>

        {!showConfirmDialog ? (
          <button
            onClick={() => setShowConfirmDialog(true)}
            className="px-6 py-3 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            {t('storage.clearData')}
          </button>
        ) : (
          <div className="p-4 border border-red-500 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-2 mb-4 text-red-700 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">{t('storage.clearDataWarning')}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                {t('storage.confirmClear')}
              </button>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="px-4 py-2 border border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                {t('storage.cancelClear')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataSettings;
