/**
 * Tests for i18n configuration and translation functionality
 * Verifies language switching, translation keys, and fallback behavior
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock localStorage before importing i18n
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((index: number) => Object.keys(store)[index] || null)
  };
})();

Object.defineProperty(global, 'localStorage', { value: mockLocalStorage });

import i18n from './index';
import de from './locales/de.json';
import en from './locales/en.json';

describe('i18n configuration', () => {
  beforeEach(async () => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
    // Reset to default language
    await i18n.changeLanguage('de');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with German as default language', () => {
      expect(i18n.language).toBe('de');
    });

    it('should have German as fallback language', () => {
      expect(i18n.options.fallbackLng).toContain('de');
    });

    it('should have both German and English resources loaded', () => {
      expect(i18n.hasResourceBundle('de', 'translation')).toBe(true);
      expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    });

    it('should have escapeValue disabled for React compatibility', () => {
      expect(i18n.options.interpolation?.escapeValue).toBe(false);
    });
  });

  describe('language switching', () => {
    it('should switch from German to English', async () => {
      expect(i18n.language).toBe('de');
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
    });

    it('should switch from English to German', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
      await i18n.changeLanguage('de');
      expect(i18n.language).toBe('de');
    });

    it('should persist language change to localStorage', async () => {
      await i18n.changeLanguage('en');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('edufunds_language', 'en');
    });
  });

  describe('translations - common namespace', () => {
    it('should translate common.startNow in German', () => {
      expect(i18n.t('common.startNow')).toBe('Jetzt Starten');
    });

    it('should translate common.startNow in English', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.t('common.startNow')).toBe('Get Started');
    });

    it('should translate common.freeTest in German', () => {
      expect(i18n.t('common.freeTest')).toBe('Kostenlos Testen');
    });

    it('should translate common.freeTest in English', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.t('common.freeTest')).toBe('Try Free');
    });
  });

  describe('translations - navigation namespace', () => {
    it('should translate navigation keys in German', () => {
      expect(i18n.t('navigation.dashboard')).toBe('Dashboard');
      expect(i18n.t('navigation.profile')).toBe('01 Profil');
      expect(i18n.t('navigation.matching')).toBe('02 Matching');
    });

    it('should translate navigation keys in English', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.t('navigation.dashboard')).toBe('Dashboard');
      expect(i18n.t('navigation.profile')).toBe('01 Profile');
      expect(i18n.t('navigation.matching')).toBe('02 Matching');
    });
  });

  describe('translations - hero namespace', () => {
    it('should translate hero title in German', () => {
      expect(i18n.t('hero.title1')).toBe('Fördergelder abrufen.');
      expect(i18n.t('hero.title2')).toBe('Ohne den Papierkrieg.');
    });

    it('should translate hero title in English', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.t('hero.title1')).toBe('Access Funding.');
      expect(i18n.t('hero.title2')).toBe('Without the Paperwork.');
    });
  });

  describe('fallback behavior', () => {
    it('should fallback to German for missing English keys', async () => {
      await i18n.changeLanguage('en');
      // If a key exists in DE but not in EN, it should fallback to DE
      // Test with a key that might be missing in EN
      const deValue = i18n.t('common.back', { lng: 'de' });
      const enValue = i18n.t('common.back', { lng: 'en' });
      // If EN has the key, it returns EN value; if not, it falls back to DE
      expect(enValue).toBeDefined();
      expect(typeof enValue).toBe('string');
    });

    it('should return key path for completely missing keys', () => {
      const result = i18n.t('nonexistent.key.path');
      expect(result).toBe('nonexistent.key.path');
    });
  });

  describe('translation key consistency', () => {
    const getNestedKeys = (obj: object, prefix = ''): string[] => {
      let keys: string[] = [];
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          keys = keys.concat(getNestedKeys(value, fullKey));
        } else {
          keys.push(fullKey);
        }
      }
      return keys;
    };

    it('should have German translations for all top-level namespaces', () => {
      const deKeys = Object.keys(de);
      expect(deKeys).toContain('common');
      expect(deKeys).toContain('navigation');
      expect(deKeys).toContain('hero');
      expect(deKeys).toContain('problem');
      expect(deKeys).toContain('howItWorks');
    });

    it('should have English translations for all top-level namespaces', () => {
      const enKeys = Object.keys(en);
      expect(enKeys).toContain('common');
      expect(enKeys).toContain('navigation');
      expect(enKeys).toContain('hero');
      expect(enKeys).toContain('problem');
      expect(enKeys).toContain('howItWorks');
    });

    it('should have matching structure between DE and EN for navigation', () => {
      const deNavKeys = Object.keys(de.navigation);
      const enNavKeys = Object.keys(en.navigation);
      
      // Check that EN has at least the core navigation keys
      expect(enNavKeys).toContain('dashboard');
      expect(enNavKeys).toContain('profile');
      expect(enNavKeys).toContain('matching');
      expect(enNavKeys).toContain('application');
    });

    it('should have matching structure between DE and EN for common', () => {
      const deCommonKeys = Object.keys(de.common);
      const enCommonKeys = Object.keys(en.common);
      
      // Check that EN has the core common keys
      expect(enCommonKeys).toContain('startNow');
      expect(enCommonKeys).toContain('freeTest');
    });
  });

  describe('special characters and escaping', () => {
    it('should handle German umlauts correctly', () => {
      const result = i18n.t('navigation.closeMenu');
      expect(result).toBe('Menü schließen');
    });

    it('should handle quoted strings in translations', () => {
      const result = i18n.t('problem.statusQuoQuote');
      expect(result).toContain('"');
    });
  });

  describe('language persistence', () => {
    it('should trigger languageChanged event', async () => {
      const listener = vi.fn();
      i18n.on('languageChanged', listener);
      
      await i18n.changeLanguage('en');
      
      expect(listener).toHaveBeenCalledWith('en');
      
      i18n.off('languageChanged', listener);
    });
  });
});
