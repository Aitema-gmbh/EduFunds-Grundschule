import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { storageService, STORAGE_KEYS } from './storageService';

describe('storageService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(storageService.isAvailable()).toBe(true);
    });
  });

  describe('getItem', () => {
    it('should return defaultValue when key does not exist', () => {
      const result = storageService.getItem('nonexistent', 'default');
      expect(result).toBe('default');
    });

    it('should return parsed value when key exists', () => {
      localStorage.setItem('testKey', JSON.stringify({ foo: 'bar' }));
      const result = storageService.getItem<{ foo: string }>('testKey', { foo: '' });
      expect(result).toEqual({ foo: 'bar' });
    });

    it('should return defaultValue when JSON parsing fails', () => {
      localStorage.setItem('invalidJson', 'not valid json {');
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = storageService.getItem('invalidJson', 'default');
      expect(result).toBe('default');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setItem', () => {
    it('should store value in localStorage', () => {
      const success = storageService.setItem('testKey', { hello: 'world' });
      expect(success).toBe(true);
      expect(localStorage.getItem('testKey')).toBe(JSON.stringify({ hello: 'world' }));
    });

    it('should handle arrays correctly', () => {
      const arr = [1, 2, 3];
      storageService.setItem('arrayKey', arr);
      const result = storageService.getItem<number[]>('arrayKey', []);
      expect(result).toEqual([1, 2, 3]);
    });
  });

  describe('removeItem', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('toRemove', 'value');
      const success = storageService.removeItem('toRemove');
      expect(success).toBe(true);
      expect(localStorage.getItem('toRemove')).toBeNull();
    });
  });

  describe('API Caching', () => {
    it('should cache and retrieve API responses', () => {
      const data = { users: ['alice', 'bob'] };
      storageService.setCachedResponse('users-api', data, 'SHORT');

      const cached = storageService.getCachedResponse<typeof data>('users-api');
      expect(cached).toEqual(data);
    });

    it('should return null for non-existent cache', () => {
      const result = storageService.getCachedResponse('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for expired cache', () => {
      // Manually create an expired cache entry
      const cache = {
        'expired-api': {
          data: { test: true },
          timestamp: Date.now() - 1000000,
          expiresAt: Date.now() - 1000, // Expired 1 second ago
        },
      };
      localStorage.setItem(STORAGE_KEYS.API_CACHE, JSON.stringify(cache));

      const result = storageService.getCachedResponse('expired-api');
      expect(result).toBeNull();
    });

    it('should clear expired cache entries', () => {
      const cache = {
        'valid': {
          data: 'valid data',
          timestamp: Date.now(),
          expiresAt: Date.now() + 100000,
        },
        'expired': {
          data: 'expired data',
          timestamp: Date.now() - 1000000,
          expiresAt: Date.now() - 1000,
        },
      };
      localStorage.setItem(STORAGE_KEYS.API_CACHE, JSON.stringify(cache));

      const cleared = storageService.clearExpiredCache();
      expect(cleared).toBe(1);

      const remaining = JSON.parse(localStorage.getItem(STORAGE_KEYS.API_CACHE) || '{}');
      expect(remaining['valid']).toBeDefined();
      expect(remaining['expired']).toBeUndefined();
    });

    it('should clear all cache', () => {
      storageService.setCachedResponse('test1', { data: 1 });
      storageService.setCachedResponse('test2', { data: 2 });

      storageService.clearAllCache();

      expect(localStorage.getItem(STORAGE_KEYS.API_CACHE)).toBeNull();
    });
  });

  describe('Offline Queue', () => {
    it('should queue offline actions', () => {
      const id = storageService.queueOfflineAction('SAVE_PROFILE', { name: 'Test' });
      expect(id).toBeDefined();

      const queue = storageService.getOfflineQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].type).toBe('SAVE_PROFILE');
      expect(queue[0].payload).toEqual({ name: 'Test' });
    });

    it('should remove actions from queue', () => {
      const id1 = storageService.queueOfflineAction('ACTION1', {});
      const id2 = storageService.queueOfflineAction('ACTION2', {});

      storageService.removeFromOfflineQueue(id1);

      const queue = storageService.getOfflineQueue();
      expect(queue).toHaveLength(1);
      expect(queue[0].id).toBe(id2);
    });

    it('should clear entire queue', () => {
      storageService.queueOfflineAction('ACTION1', {});
      storageService.queueOfflineAction('ACTION2', {});

      storageService.clearOfflineQueue();

      expect(storageService.getOfflineQueue()).toHaveLength(0);
    });
  });

  describe('Data Sync', () => {
    it('should track last sync time', () => {
      expect(storageService.getLastSyncTime()).toBeNull();

      storageService.updateLastSyncTime();

      const syncTime = storageService.getLastSyncTime();
      expect(syncTime).toBeDefined();
      expect(typeof syncTime).toBe('number');
      expect(syncTime).toBeGreaterThan(Date.now() - 1000);
    });

    it('should process offline queue', async () => {
      storageService.queueOfflineAction('ACTION1', { id: 1 });
      storageService.queueOfflineAction('ACTION2', { id: 2 });

      const processor = vi.fn().mockResolvedValue(true);

      const processed = await storageService.processOfflineQueue(processor);

      expect(processed).toBe(2);
      expect(processor).toHaveBeenCalledTimes(2);
      expect(storageService.getOfflineQueue()).toHaveLength(0);
    });

    it('should handle processor failures', async () => {
      storageService.queueOfflineAction('ACTION1', {});
      storageService.queueOfflineAction('ACTION2', {});

      const processor = vi.fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const processed = await storageService.processOfflineQueue(processor);

      expect(processed).toBe(1);
      expect(storageService.getOfflineQueue()).toHaveLength(1);

      consoleSpy.mockRestore();
    });
  });

  describe('Storage Info', () => {
    it('should return storage usage info', () => {
      storageService.setItem('test', { data: 'some test data' });

      const info = storageService.getStorageInfo();

      expect(info.used).toBeGreaterThan(0);
      expect(info.available).toBeGreaterThan(0);
      expect(info.percentUsed).toBeGreaterThanOrEqual(0);
      expect(info.percentUsed).toBeLessThanOrEqual(100);
    });
  });

  describe('User Data Management', () => {
    it('should clear all EduFunds data', () => {
      // Set some data
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({ name: 'Test' }));
      localStorage.setItem(STORAGE_KEYS.DARK_MODE, 'true');
      localStorage.setItem('other_app_data', 'should remain');

      storageService.clearAllData();

      expect(localStorage.getItem(STORAGE_KEYS.PROFILE)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.DARK_MODE)).toBeNull();
      expect(localStorage.getItem('other_app_data')).toBe('should remain');
    });

    it('should export user data', () => {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify({ name: 'Test School' }));
      localStorage.setItem(STORAGE_KEYS.LANGUAGE, '"de"');

      const exported = storageService.exportUserData();

      expect(exported.PROFILE).toEqual({ name: 'Test School' });
      expect(exported.LANGUAGE).toBe('de');
    });

    it('should import user data', () => {
      const data = {
        PROFILE: { name: 'Imported School' },
        DARK_MODE: true,
      };

      const success = storageService.importUserData(data);

      expect(success).toBe(true);
      expect(storageService.getItem(STORAGE_KEYS.PROFILE, null)).toEqual({ name: 'Imported School' });
      expect(storageService.getItem(STORAGE_KEYS.DARK_MODE, null)).toBe(true);
    });
  });

  describe('Connectivity', () => {
    it('should report online status', () => {
      // navigator.onLine is typically true in test environments
      expect(typeof storageService.isOnline()).toBe('boolean');
    });

    it('should add and remove connectivity listeners', () => {
      const callback = vi.fn();
      const removeListener = storageService.addConnectivityListener(callback);

      // Dispatch online event
      window.dispatchEvent(new Event('online'));
      expect(callback).toHaveBeenCalledWith(true);

      // Dispatch offline event
      window.dispatchEvent(new Event('offline'));
      expect(callback).toHaveBeenCalledWith(false);

      // Remove listener and verify it's not called anymore
      removeListener();
      callback.mockClear();
      window.dispatchEvent(new Event('online'));
      expect(callback).not.toHaveBeenCalled();
    });
  });
});
