import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';
import { storageService } from '../services/storageService';

// Mock the storageService
vi.mock('../services/storageService', () => ({
  storageService: {
    isOnline: vi.fn(() => true),
    getLastSyncTime: vi.fn(() => null),
    getOfflineQueue: vi.fn(() => []),
    addConnectivityListener: vi.fn(() => vi.fn()),
    processOfflineQueue: vi.fn(() => Promise.resolve(0)),
  },
}));

describe('useOnlineStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mock implementations
    vi.mocked(storageService.isOnline).mockReturnValue(true);
    vi.mocked(storageService.getLastSyncTime).mockReturnValue(null);
    vi.mocked(storageService.getOfflineQueue).mockReturnValue([]);
    vi.mocked(storageService.addConnectivityListener).mockReturnValue(vi.fn());
    vi.mocked(storageService.processOfflineQueue).mockResolvedValue(0);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Initial State Tests
  // ============================================
  describe('initial state', () => {
    it('should return isOnline from storageService', () => {
      vi.mocked(storageService.isOnline).mockReturnValue(true);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.isOnline).toBe(true);
    });

    it('should return offline when storageService reports offline', () => {
      vi.mocked(storageService.isOnline).mockReturnValue(false);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.isOnline).toBe(false);
    });

    it('should return lastSyncTime from storageService', () => {
      const syncTime = Date.now() - 60000;
      vi.mocked(storageService.getLastSyncTime).mockReturnValue(syncTime);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.lastSyncTime).toBe(syncTime);
    });

    it('should return null lastSyncTime when no sync has occurred', () => {
      vi.mocked(storageService.getLastSyncTime).mockReturnValue(null);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.lastSyncTime).toBeNull();
    });

    it('should return pendingActions count from offline queue', () => {
      vi.mocked(storageService.getOfflineQueue).mockReturnValue([
        { id: '1', type: 'SAVE_PROFILE', payload: {}, timestamp: Date.now() },
        { id: '2', type: 'UPDATE_SETTING', payload: {}, timestamp: Date.now() },
      ]);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.pendingActions).toBe(2);
    });

    it('should return zero pendingActions when queue is empty', () => {
      vi.mocked(storageService.getOfflineQueue).mockReturnValue([]);
      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.pendingActions).toBe(0);
    });
  });

  // ============================================
  // Connectivity Listener Tests
  // ============================================
  describe('connectivity listener', () => {
    it('should register connectivity listener on mount', () => {
      renderHook(() => useOnlineStatus());
      expect(storageService.addConnectivityListener).toHaveBeenCalledTimes(1);
      expect(storageService.addConnectivityListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('should remove connectivity listener on unmount', () => {
      const removeListener = vi.fn();
      vi.mocked(storageService.addConnectivityListener).mockReturnValue(removeListener);

      const { unmount } = renderHook(() => useOnlineStatus());
      unmount();

      expect(removeListener).toHaveBeenCalledTimes(1);
    });

    it('should update isOnline when connectivity changes to online', () => {
      let capturedCallback: ((online: boolean) => void) | null = null;
      vi.mocked(storageService.addConnectivityListener).mockImplementation((callback) => {
        capturedCallback = callback;
        return vi.fn();
      });
      vi.mocked(storageService.isOnline).mockReturnValue(false);

      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.isOnline).toBe(false);

      // Simulate coming back online
      act(() => {
        capturedCallback?.(true);
      });

      expect(result.current.isOnline).toBe(true);
    });

    it('should update isOnline when connectivity changes to offline', () => {
      let capturedCallback: ((online: boolean) => void) | null = null;
      vi.mocked(storageService.addConnectivityListener).mockImplementation((callback) => {
        capturedCallback = callback;
        return vi.fn();
      });
      vi.mocked(storageService.isOnline).mockReturnValue(true);

      const { result } = renderHook(() => useOnlineStatus());
      expect(result.current.isOnline).toBe(true);

      // Simulate going offline
      act(() => {
        capturedCallback?.(false);
      });

      expect(result.current.isOnline).toBe(false);
    });
  });

  // ============================================
  // syncNow Function Tests
  // ============================================
  describe('syncNow', () => {
    it('should return 0 when offline', async () => {
      vi.mocked(storageService.isOnline).mockReturnValue(false);
      const processor = vi.fn();

      const { result } = renderHook(() => useOnlineStatus(processor));

      let processedCount = 0;
      await act(async () => {
        processedCount = await result.current.syncNow();
      });

      expect(processedCount).toBe(0);
      expect(storageService.processOfflineQueue).not.toHaveBeenCalled();
    });

    it('should return 0 when no processor is provided', async () => {
      vi.mocked(storageService.isOnline).mockReturnValue(true);

      const { result } = renderHook(() => useOnlineStatus());

      let processedCount = 0;
      await act(async () => {
        processedCount = await result.current.syncNow();
      });

      expect(processedCount).toBe(0);
      expect(storageService.processOfflineQueue).not.toHaveBeenCalled();
    });

    it('should process offline queue when online with processor', async () => {
      vi.mocked(storageService.isOnline).mockReturnValue(true);
      vi.mocked(storageService.processOfflineQueue).mockResolvedValue(3);
      vi.mocked(storageService.getLastSyncTime).mockReturnValue(Date.now());
      vi.mocked(storageService.getOfflineQueue).mockReturnValue([]);
      const processor = vi.fn().mockResolvedValue(true);

      const { result } = renderHook(() => useOnlineStatus(processor));

      let processedCount = 0;
      await act(async () => {
        processedCount = await result.current.syncNow();
      });

      expect(processedCount).toBe(3);
      expect(storageService.processOfflineQueue).toHaveBeenCalledWith(processor);
    });

    it('should update lastSyncTime after successful sync', async () => {
      const newSyncTime = Date.now();
      vi.mocked(storageService.isOnline).mockReturnValue(true);
      vi.mocked(storageService.processOfflineQueue).mockResolvedValue(2);
      vi.mocked(storageService.getLastSyncTime)
        .mockReturnValueOnce(null)
        .mockReturnValue(newSyncTime);
      vi.mocked(storageService.getOfflineQueue).mockReturnValue([]);
      const processor = vi.fn().mockResolvedValue(true);

      const { result } = renderHook(() => useOnlineStatus(processor));
      expect(result.current.lastSyncTime).toBeNull();

      await act(async () => {
        await result.current.syncNow();
      });

      expect(result.current.lastSyncTime).toBe(newSyncTime);
    });

    it('should update pendingActions after sync', async () => {
      vi.mocked(storageService.isOnline).mockReturnValue(true);
      vi.mocked(storageService.processOfflineQueue).mockResolvedValue(2);
      vi.mocked(storageService.getLastSyncTime).mockReturnValue(Date.now());
      vi.mocked(storageService.getOfflineQueue)
        .mockReturnValueOnce([
          { id: '1', type: 'ACTION', payload: {}, timestamp: Date.now() },
          { id: '2', type: 'ACTION', payload: {}, timestamp: Date.now() },
        ])
        .mockReturnValue([]);
      const processor = vi.fn().mockResolvedValue(true);

      const { result } = renderHook(() => useOnlineStatus(processor));
      expect(result.current.pendingActions).toBe(2);

      await act(async () => {
        await result.current.syncNow();
      });

      expect(result.current.pendingActions).toBe(0);
    });
  });

  // ============================================
  // Auto-sync on Reconnection Tests
  // ============================================
  describe('auto-sync on reconnection', () => {
    it('should auto-sync when coming back online with processor', async () => {
      let capturedCallback: ((online: boolean) => void) | null = null;
      vi.mocked(storageService.addConnectivityListener).mockImplementation((callback) => {
        capturedCallback = callback;
        return vi.fn();
      });
      vi.mocked(storageService.isOnline).mockReturnValue(false);
      vi.mocked(storageService.processOfflineQueue).mockResolvedValue(1);
      vi.mocked(storageService.getLastSyncTime).mockReturnValue(Date.now());
      vi.mocked(storageService.getOfflineQueue).mockReturnValue([]);
      const processor = vi.fn().mockResolvedValue(true);

      renderHook(() => useOnlineStatus(processor));

      // Simulate coming back online
      await act(async () => {
        capturedCallback?.(true);
        // Wait for any promises to resolve
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(storageService.processOfflineQueue).toHaveBeenCalledWith(processor);
    });

    it('should not auto-sync when going offline', async () => {
      let capturedCallback: ((online: boolean) => void) | null = null;
      vi.mocked(storageService.addConnectivityListener).mockImplementation((callback) => {
        capturedCallback = callback;
        return vi.fn();
      });
      vi.mocked(storageService.isOnline).mockReturnValue(true);
      const processor = vi.fn().mockResolvedValue(true);

      renderHook(() => useOnlineStatus(processor));

      // Simulate going offline
      await act(async () => {
        capturedCallback?.(false);
      });

      expect(storageService.processOfflineQueue).not.toHaveBeenCalled();
    });

    it('should not auto-sync without processor even when coming online', async () => {
      let capturedCallback: ((online: boolean) => void) | null = null;
      vi.mocked(storageService.addConnectivityListener).mockImplementation((callback) => {
        capturedCallback = callback;
        return vi.fn();
      });
      vi.mocked(storageService.isOnline).mockReturnValue(false);

      renderHook(() => useOnlineStatus()); // No processor provided

      // Simulate coming back online
      await act(async () => {
        capturedCallback?.(true);
      });

      expect(storageService.processOfflineQueue).not.toHaveBeenCalled();
    });
  });
});
