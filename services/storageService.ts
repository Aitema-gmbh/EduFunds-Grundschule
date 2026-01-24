/**
 * Centralized Storage Service for EduFunds-Grundschule
 * Handles data persistence with localStorage, API caching, offline support, and data sync
 */

// Storage keys used throughout the application
export const STORAGE_KEYS = {
  PROFILE: 'sf_profile',
  DARK_MODE: 'edufunds_darkmode',
  LANGUAGE: 'edufunds_language',
  NOTIFICATION_PREFERENCES: 'edufunds_notification_preferences',
  SCHEDULED_REMINDERS: 'edufunds_scheduled_reminders',
  FILTER_PRESETS: 'filterPresets',
  API_CACHE: 'edufunds_api_cache',
  OFFLINE_QUEUE: 'edufunds_offline_queue',
  LAST_SYNC: 'edufunds_last_sync',
} as const;

// Cache expiration times (in milliseconds)
const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000, // 24 hours
} as const;

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

interface OfflineAction {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
}

interface StorageQuotaInfo {
  used: number;
  available: number;
  percentUsed: number;
}

/**
 * Storage service for managing localStorage with error handling,
 * caching, offline support, and data synchronization
 */
export const storageService = {
  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Get an item from localStorage with type safety
   */
  getItem<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Failed to parse localStorage item "${key}":`, e);
      return defaultValue;
    }
  },

  /**
   * Set an item in localStorage with error handling
   */
  setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      console.warn('localStorage is not available');
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      if (e instanceof DOMException && (
        e.code === 22 || // Legacy quota exceeded
        e.code === 1014 || // Firefox
        e.name === 'QuotaExceededError' ||
        e.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.error('Storage quota exceeded. Attempting to clear old cache...');
        this.clearExpiredCache();
        // Retry once after clearing cache
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          console.error('Still unable to store data after clearing cache');
          return false;
        }
      }
      console.error(`Failed to set localStorage item "${key}":`, e);
      return false;
    }
  },

  /**
   * Remove an item from localStorage
   */
  removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`Failed to remove localStorage item "${key}":`, e);
      return false;
    }
  },

  // ============== API Caching ==============

  /**
   * Get cached API response if still valid
   */
  getCachedResponse<T>(cacheKey: string): T | null {
    const cache = this.getItem<Record<string, CacheEntry<T>>>(STORAGE_KEYS.API_CACHE, {});
    const entry = cache[cacheKey];

    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      // Cache expired, remove it
      delete cache[cacheKey];
      this.setItem(STORAGE_KEYS.API_CACHE, cache);
      return null;
    }

    return entry.data;
  },

  /**
   * Cache an API response
   */
  setCachedResponse<T>(
    cacheKey: string,
    data: T,
    duration: keyof typeof CACHE_DURATION = 'MEDIUM'
  ): boolean {
    const cache = this.getItem<Record<string, CacheEntry<T>>>(STORAGE_KEYS.API_CACHE, {});
    const now = Date.now();

    cache[cacheKey] = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_DURATION[duration],
    };

    return this.setItem(STORAGE_KEYS.API_CACHE, cache);
  },

  /**
   * Clear all expired cache entries
   */
  clearExpiredCache(): number {
    const cache = this.getItem<Record<string, CacheEntry<unknown>>>(STORAGE_KEYS.API_CACHE, {});
    const now = Date.now();
    let cleared = 0;

    for (const key in cache) {
      if (cache[key].expiresAt < now) {
        delete cache[key];
        cleared++;
      }
    }

    if (cleared > 0) {
      this.setItem(STORAGE_KEYS.API_CACHE, cache);
    }

    return cleared;
  },

  /**
   * Clear all cached API responses
   */
  clearAllCache(): boolean {
    return this.removeItem(STORAGE_KEYS.API_CACHE);
  },

  // ============== Offline Support ==============

  /**
   * Check if the browser is online
   */
  isOnline(): boolean {
    return navigator.onLine;
  },

  /**
   * Add listener for online/offline events
   */
  addConnectivityListener(callback: (isOnline: boolean) => void): () => void {
    const onlineHandler = () => callback(true);
    const offlineHandler = () => callback(false);

    window.addEventListener('online', onlineHandler);
    window.addEventListener('offline', offlineHandler);

    return () => {
      window.removeEventListener('online', onlineHandler);
      window.removeEventListener('offline', offlineHandler);
    };
  },

  /**
   * Queue an action for when the app comes back online
   */
  queueOfflineAction(type: string, payload: unknown): string {
    const queue = this.getItem<OfflineAction[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    queue.push({
      id,
      type,
      payload,
      timestamp: Date.now(),
    });

    this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    return id;
  },

  /**
   * Get all queued offline actions
   */
  getOfflineQueue(): OfflineAction[] {
    return this.getItem<OfflineAction[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
  },

  /**
   * Remove an action from the offline queue (after it's been processed)
   */
  removeFromOfflineQueue(id: string): boolean {
    const queue = this.getItem<OfflineAction[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const filtered = queue.filter(action => action.id !== id);

    if (filtered.length === queue.length) {
      return false;
    }

    return this.setItem(STORAGE_KEYS.OFFLINE_QUEUE, filtered);
  },

  /**
   * Clear the entire offline queue
   */
  clearOfflineQueue(): boolean {
    return this.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
  },

  // ============== Data Sync ==============

  /**
   * Get the last sync timestamp
   */
  getLastSyncTime(): number | null {
    const timestamp = this.getItem<number | null>(STORAGE_KEYS.LAST_SYNC, null);
    return timestamp;
  },

  /**
   * Update the last sync timestamp
   */
  updateLastSyncTime(): boolean {
    return this.setItem(STORAGE_KEYS.LAST_SYNC, Date.now());
  },

  /**
   * Process queued offline actions when coming back online
   * Returns the number of actions processed
   */
  async processOfflineQueue(
    processor: (action: OfflineAction) => Promise<boolean>
  ): Promise<number> {
    const queue = this.getOfflineQueue();
    let processed = 0;

    for (const action of queue) {
      try {
        const success = await processor(action);
        if (success) {
          this.removeFromOfflineQueue(action.id);
          processed++;
        }
      } catch (e) {
        console.error(`Failed to process offline action ${action.id}:`, e);
      }
    }

    if (processed > 0) {
      this.updateLastSyncTime();
    }

    return processed;
  },

  // ============== User Data Management ==============

  /**
   * Get approximate storage usage info
   */
  getStorageInfo(): StorageQuotaInfo {
    if (!this.isAvailable()) {
      return { used: 0, available: 0, percentUsed: 0 };
    }

    let totalSize = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        totalSize += localStorage.getItem(key)?.length || 0;
      }
    }

    // Convert to bytes (chars * 2 for UTF-16)
    const usedBytes = totalSize * 2;
    // Typical localStorage limit is 5-10MB, assume 5MB
    const availableBytes = 5 * 1024 * 1024;

    return {
      used: usedBytes,
      available: availableBytes,
      percentUsed: Math.round((usedBytes / availableBytes) * 100),
    };
  },

  /**
   * Clear all EduFunds-related data from localStorage
   * Useful for user-initiated data clearing
   */
  clearAllData(): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      // Clear all known EduFunds keys
      for (const key of Object.values(STORAGE_KEYS)) {
        localStorage.removeItem(key);
      }
      return true;
    } catch (e) {
      console.error('Failed to clear all data:', e);
      return false;
    }
  },

  /**
   * Export all user data as JSON (for backup)
   */
  exportUserData(): Record<string, unknown> {
    const data: Record<string, unknown> = {};

    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          data[name] = JSON.parse(value);
        } catch {
          data[name] = value;
        }
      }
    }

    return data;
  },

  /**
   * Import user data from JSON backup
   */
  importUserData(data: Record<string, unknown>): boolean {
    try {
      for (const [name, value] of Object.entries(data)) {
        const key = STORAGE_KEYS[name as keyof typeof STORAGE_KEYS];
        if (key) {
          this.setItem(key, value);
        }
      }
      return true;
    } catch (e) {
      console.error('Failed to import user data:', e);
      return false;
    }
  },
};

export default storageService;
