import { useState, useEffect, useCallback } from 'react';
import { storageService } from '../services/storageService';

interface OnlineStatusHook {
  isOnline: boolean;
  lastSyncTime: number | null;
  pendingActions: number;
  syncNow: () => Promise<number>;
}

/**
 * React hook for monitoring online/offline status and handling data sync
 */
export function useOnlineStatus(
  actionProcessor?: (action: { id: string; type: string; payload: unknown }) => Promise<boolean>
): OnlineStatusHook {
  const [isOnline, setIsOnline] = useState(storageService.isOnline());
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(
    storageService.getLastSyncTime()
  );
  const [pendingActions, setPendingActions] = useState(
    storageService.getOfflineQueue().length
  );

  // Listen for connectivity changes
  useEffect(() => {
    const removeListener = storageService.addConnectivityListener((online) => {
      setIsOnline(online);

      // Auto-sync when coming back online
      if (online && actionProcessor) {
        storageService.processOfflineQueue(actionProcessor).then((processed) => {
          if (processed > 0) {
            setLastSyncTime(storageService.getLastSyncTime());
            setPendingActions(storageService.getOfflineQueue().length);
          }
        });
      }
    });

    return removeListener;
  }, [actionProcessor]);

  // Manually trigger sync
  const syncNow = useCallback(async () => {
    if (!isOnline) {
      return 0;
    }

    if (actionProcessor) {
      const processed = await storageService.processOfflineQueue(actionProcessor);
      setLastSyncTime(storageService.getLastSyncTime());
      setPendingActions(storageService.getOfflineQueue().length);
      return processed;
    }

    return 0;
  }, [isOnline, actionProcessor]);

  return {
    isOnline,
    lastSyncTime,
    pendingActions,
    syncNow,
  };
}

export default useOnlineStatus;
