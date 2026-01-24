/**
 * Storage Service for EduFunds
 *
 * Provides centralized data persistence with localStorage,
 * offline support, and data synchronization capabilities.
 */

// Storage key constants
const STORAGE_PREFIX = 'edufunds_';
const STORAGE_KEYS = {
  PROFILE: `${STORAGE_PREFIX}profile`,
  USER_PREFERENCES: `${STORAGE_PREFIX}preferences`,
  API_CACHE: `${STORAGE_PREFIX}api_cache`,
  OFFLINE_QUEUE: `${STORAGE_PREFIX}offline_queue`,
  LAST_SYNC: `${STORAGE_PREFIX}last_sync`,
  FILTER_PRESETS: `${STORAGE_PREFIX}filter_presets`,
  LANGUAGE: `${STORAGE_PREFIX}language`,
  DARK_MODE: `${STORAGE_PREFIX}dark_mode`,
  NOTIFICATION_PREFS: `${STORAGE_PREFIX}notification_prefs`,
  REMINDERS: `${STORAGE_PREFIX}reminders`,
} as const;

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000;

// Type definitions
export interface UserPreferences {
  language: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
  autoSave: boolean;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export interface OfflineQueueItem {
  id: string;
  action: string;
  payload: unknown;
  timestamp: number;
}

export interface StorageQuotaInfo {
  used: number;
  available: number;
  percentUsed: number;
}

// Default preferences
const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'de',
  darkMode: false,
  notificationsEnabled: true,
  autoSave: true,
};

/**
 * Storage Service class for managing data persistence
 */
class StorageService {
  private isOnline: boolean = navigator.onLine;
  private syncListeners: Set<() => void> = new Set();

  constructor() {
    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }

  /**
   * Handle coming back online - sync queued data
   */
  private handleOnline(): void {
    this.isOnline = true;
    console.log('[StorageService] Connection restored, syncing data...');
    this.syncOfflineData();
    this.notifySyncListeners();
  }

  /**
   * Handle going offline
   */
  private handleOffline(): void {
    this.isOnline = false;
    console.log('[StorageService] Connection lost, entering offline mode');
  }

  /**
   * Check if the browser is online
   */
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Subscribe to sync events (when coming back online)
   */
  public onSync(callback: () => void): () => void {
    this.syncListeners.add(callback);
    return () => this.syncListeners.delete(callback);
  }

  /**
   * Notify all sync listeners
   */
  private notifySyncListeners(): void {
    this.syncListeners.forEach(callback => callback());
  }

  /**
   * Safely get data from localStorage with error handling
   */
  private safeGetItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`[StorageService] Error reading ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Safely set data in localStorage with quota error handling
   */
  private safeSetItem(key: string, value: unknown): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error instanceof DOMException && (
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
      )) {
        console.error('[StorageService] Storage quota exceeded');
        // Try to clear old cache data to make room
        this.clearExpiredCache();
        // Retry once after clearing
        try {
          localStorage.setItem(key, JSON.stringify(value));
          return true;
        } catch {
          console.error('[StorageService] Still unable to save after clearing cache');
          return false;
        }
      }
      console.error(`[StorageService] Error saving ${key}:`, error);
      return false;
    }
  }

  /**
   * Simple obfuscation for sensitive data (not true encryption, but adds a layer of protection)
   * For production, consider using Web Crypto API or a proper encryption library
   */
  private obfuscate(data: string): string {
    return btoa(encodeURIComponent(data));
  }

  /**
   * Deobfuscate data
   */
  private deobfuscate(data: string): string {
    try {
      return decodeURIComponent(atob(data));
    } catch {
      return data;
    }
  }

  // =====================
  // User Preferences
  // =====================

  /**
   * Get user preferences
   */
  public getPreferences(): UserPreferences {
    return this.safeGetItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
  }

  /**
   * Save user preferences
   */
  public savePreferences(preferences: Partial<UserPreferences>): boolean {
    const current = this.getPreferences();
    const updated = { ...current, ...preferences };
    return this.safeSetItem(STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  /**
   * Reset preferences to default
   */
  public resetPreferences(): boolean {
    return this.safeSetItem(STORAGE_KEYS.USER_PREFERENCES, DEFAULT_PREFERENCES);
  }

  // =====================
  // School Profile
  // =====================

  /**
   * Get saved school profile
   */
  public getProfile<T>(): T | null {
    return this.safeGetItem<T | null>(STORAGE_KEYS.PROFILE, null);
  }

  /**
   * Save school profile
   */
  public saveProfile<T>(profile: T): boolean {
    return this.safeSetItem(STORAGE_KEYS.PROFILE, profile);
  }

  // =====================
  // API Response Caching
  // =====================

  /**
   * Get cached API response
   */
  public getCachedResponse<T>(cacheKey: string): T | null {
    const cache = this.safeGetItem<Record<string, CachedData<T>>>(STORAGE_KEYS.API_CACHE, {});
    const cached = cache[cacheKey];

    if (!cached) {
      return null;
    }

    // Check if cache is expired
    if (Date.now() > cached.expiresAt) {
      this.removeCachedResponse(cacheKey);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache an API response
   */
  public cacheResponse<T>(cacheKey: string, data: T, expirationMs: number = CACHE_EXPIRATION_MS): boolean {
    const cache = this.safeGetItem<Record<string, CachedData<T>>>(STORAGE_KEYS.API_CACHE, {});
    const now = Date.now();

    cache[cacheKey] = {
      data,
      timestamp: now,
      expiresAt: now + expirationMs,
    };

    return this.safeSetItem(STORAGE_KEYS.API_CACHE, cache);
  }

  /**
   * Remove a specific cached response
   */
  public removeCachedResponse(cacheKey: string): void {
    const cache = this.safeGetItem<Record<string, CachedData<unknown>>>(STORAGE_KEYS.API_CACHE, {});
    delete cache[cacheKey];
    this.safeSetItem(STORAGE_KEYS.API_CACHE, cache);
  }

  /**
   * Clear all expired cache entries
   */
  public clearExpiredCache(): number {
    const cache = this.safeGetItem<Record<string, CachedData<unknown>>>(STORAGE_KEYS.API_CACHE, {});
    const now = Date.now();
    let cleared = 0;

    Object.keys(cache).forEach(key => {
      if (cache[key].expiresAt < now) {
        delete cache[key];
        cleared++;
      }
    });

    this.safeSetItem(STORAGE_KEYS.API_CACHE, cache);
    return cleared;
  }

  // =====================
  // Offline Support
  // =====================

  /**
   * Add an action to the offline queue
   */
  public queueOfflineAction(action: string, payload: unknown): string {
    const queue = this.safeGetItem<OfflineQueueItem[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    queue.push({
      id,
      action,
      payload,
      timestamp: Date.now(),
    });

    this.safeSetItem(STORAGE_KEYS.OFFLINE_QUEUE, queue);
    return id;
  }

  /**
   * Get all queued offline actions
   */
  public getOfflineQueue(): OfflineQueueItem[] {
    return this.safeGetItem<OfflineQueueItem[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
  }

  /**
   * Remove an action from the offline queue
   */
  public removeFromOfflineQueue(id: string): void {
    const queue = this.safeGetItem<OfflineQueueItem[]>(STORAGE_KEYS.OFFLINE_QUEUE, []);
    const filtered = queue.filter(item => item.id !== id);
    this.safeSetItem(STORAGE_KEYS.OFFLINE_QUEUE, filtered);
  }

  /**
   * Clear the entire offline queue
   */
  public clearOfflineQueue(): void {
    this.safeSetItem(STORAGE_KEYS.OFFLINE_QUEUE, []);
  }

  /**
   * Process and sync offline data when coming back online
   * This is a placeholder that should be implemented based on specific sync requirements
   */
  public async syncOfflineData(): Promise<void> {
    if (!this.isOnline) {
      console.log('[StorageService] Cannot sync: offline');
      return;
    }

    const queue = this.getOfflineQueue();
    if (queue.length === 0) {
      console.log('[StorageService] No offline data to sync');
      return;
    }

    console.log(`[StorageService] Syncing ${queue.length} offline actions...`);

    // Process each queued action
    for (const item of queue) {
      try {
        // Here you would implement actual sync logic based on action type
        // For example: await this.processOfflineAction(item);
        console.log(`[StorageService] Synced action: ${item.action}`);
        this.removeFromOfflineQueue(item.id);
      } catch (error) {
        console.error(`[StorageService] Failed to sync action ${item.id}:`, error);
      }
    }

    this.safeSetItem(STORAGE_KEYS.LAST_SYNC, Date.now());
  }

  /**
   * Get the last sync timestamp
   */
  public getLastSyncTime(): number | null {
    return this.safeGetItem<number | null>(STORAGE_KEYS.LAST_SYNC, null);
  }

  // =====================
  // Storage Management
  // =====================

  /**
   * Get storage usage information
   */
  public getStorageInfo(): StorageQuotaInfo {
    let used = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    }

    // Approximate available storage (typically 5-10MB for localStorage)
    const available = 5 * 1024 * 1024; // 5MB estimate

    return {
      used,
      available,
      percentUsed: (used / available) * 100,
    };
  }

  /**
   * Clear all EduFunds data from localStorage
   */
  public clearAllData(): void {
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log(`[StorageService] Cleared ${keysToRemove.length} storage items`);
  }

  /**
   * Export all user data as JSON for backup
   */
  public exportData(): string {
    const data: Record<string, unknown> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      }
    }

    return JSON.stringify(data, null, 2);
  }

  /**
   * Import data from a backup
   */
  public importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData) as Record<string, unknown>;

      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith(STORAGE_PREFIX)) {
          this.safeSetItem(key, value);
        }
      });

      return true;
    } catch (error) {
      console.error('[StorageService] Failed to import data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();

// Export storage keys for reference
export { STORAGE_KEYS };
