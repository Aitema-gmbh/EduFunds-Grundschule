import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface DataSettingsProps {
  onDataCleared?: () => void;
}

/**
 * DataSettings component for managing user data, storage, and offline sync
 */
export const DataSettings: React.FC<DataSettingsProps> = ({ onDataCleared }) => {
  const { isOnline, lastSyncTime, pendingActions } = useOnlineStatus();
  const [storageInfo, setStorageInfo] = useState(storageService.getStorageInfo());
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  useEffect(() => {
    // Update storage info periodically
    const interval = setInterval(() => {
      setStorageInfo(storageService.getStorageInfo());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleClearData = () => {
    const success = storageService.clearAllData();
    if (success) {
      setClearSuccess(true);
      setShowConfirmClear(false);
      setStorageInfo(storageService.getStorageInfo());
      onDataCleared?.();
      setTimeout(() => setClearSuccess(false), 3000);
    }
  };

  const handleClearCache = () => {
    storageService.clearAllCache();
    storageService.clearExpiredCache();
    setStorageInfo(storageService.getStorageInfo());
  };

  const handleExportData = () => {
    const data = storageService.exportUserData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edufunds-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        storageService.importUserData(data);
        setStorageInfo(storageService.getStorageInfo());
        window.location.reload(); // Reload to apply imported settings
      } catch (error) {
        console.error('Failed to import data:', error);
        alert('Fehler beim Importieren der Daten. Bitte überprüfen Sie die Datei.');
      }
    };
    reader.readAsText(file);
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number | null): string => {
    if (!timestamp) return 'Noch nie';
    return new Date(timestamp).toLocaleString('de-DE');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
        Datenverwaltung
      </h2>

      {/* Connection Status */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div
          className={`w-3 h-3 rounded-full ${
            isOnline ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {isOnline ? 'Online' : 'Offline'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Letzte Synchronisierung: {formatDate(lastSyncTime)}
          </p>
          {pendingActions > 0 && (
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              {pendingActions} ausstehende Aktion(en)
            </p>
          )}
        </div>
      </div>

      {/* Storage Usage */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Speichernutzung</span>
          <span className="text-gray-900 dark:text-white">
            {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.available)}
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              storageInfo.percentUsed > 80 ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(storageInfo.percentUsed, 100)}%` }}
          />
        </div>
      </div>

      {/* Data Actions */}
      <div className="space-y-3">
        <button
          onClick={handleClearCache}
          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <div className="font-medium">Cache leeren</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Gespeicherte API-Antworten löschen
          </div>
        </button>

        <button
          onClick={handleExportData}
          className="w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          <div className="font-medium">Daten exportieren</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Alle Einstellungen als JSON-Datei herunterladen
          </div>
        </button>

        <label className="block w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer">
          <div className="font-medium">Daten importieren</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Einstellungen aus einer Backup-Datei wiederherstellen
          </div>
          <input
            type="file"
            accept=".json"
            onChange={handleImportData}
            className="hidden"
          />
        </label>

        {/* Clear All Data */}
        {!showConfirmClear ? (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="w-full px-4 py-2 text-left text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <div className="font-medium">Alle Daten löschen</div>
            <div className="text-sm text-red-500 dark:text-red-400">
              Alle lokalen Einstellungen und gespeicherten Daten entfernen
            </div>
          </button>
        ) : (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-3">
            <p className="text-red-700 dark:text-red-400 font-medium">
              Sind Sie sicher? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Ja, alle Daten löschen
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Success Message */}
      {clearSuccess && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
          Alle Daten wurden erfolgreich gelöscht.
        </div>
      )}
    </div>
  );
};

export default DataSettings;
