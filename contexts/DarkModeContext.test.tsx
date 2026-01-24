import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { DarkModeProvider, useDarkMode } from './DarkModeContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
  };
})();

// Mock matchMedia
const createMatchMediaMock = (matches: boolean) => {
  const listeners: ((event: MediaQueryListEvent) => void)[] = [];
  return vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
      listeners.push(callback);
    }),
    removeEventListener: vi.fn((event: string, callback: (event: MediaQueryListEvent) => void) => {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    }),
    dispatchEvent: vi.fn((event: MediaQueryListEvent) => {
      listeners.forEach(listener => listener(event));
      return true;
    }),
    _listeners: listeners, // exposed for testing
  }));
};

describe('DarkModeContext', () => {
  let originalLocalStorage: Storage;
  let originalMatchMedia: typeof window.matchMedia;

  beforeEach(() => {
    originalLocalStorage = window.localStorage;
    originalMatchMedia = window.matchMedia;
    
    Object.defineProperty(window, 'localStorage', { value: localStorageMock, writable: true });
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Reset document class
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', { value: originalLocalStorage, writable: true });
    window.matchMedia = originalMatchMedia;
    vi.clearAllMocks();
  });

  // ============================================
  // useDarkMode Hook Error Tests
  // ============================================
  describe('useDarkMode hook', () => {
    it('should throw error when used outside DarkModeProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      expect(() => {
        renderHook(() => useDarkMode());
      }).toThrow('useDarkMode must be used within a DarkModeProvider');
      
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // Initial State Tests
  // ============================================
  describe('initial state', () => {
    it('should use localStorage value when available (true)', () => {
      localStorageMock.setItem('edufunds_darkmode', 'true');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(true);
    });

    it('should use localStorage value when available (false)', () => {
      localStorageMock.setItem('edufunds_darkmode', 'false');
      window.matchMedia = createMatchMediaMock(true);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(false);
    });

    it('should fall back to system preference when localStorage is empty (dark)', () => {
      window.matchMedia = createMatchMediaMock(true);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(true);
    });

    it('should fall back to system preference when localStorage is empty (light)', () => {
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(false);
    });
  });

  // ============================================
  // Toggle Tests
  // ============================================
  describe('toggleDarkMode', () => {
    it('should toggle dark mode from false to true', () => {
      localStorageMock.setItem('edufunds_darkmode', 'false');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(false);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.isDarkMode).toBe(true);
    });

    it('should toggle dark mode from true to false', () => {
      localStorageMock.setItem('edufunds_darkmode', 'true');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(true);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(result.current.isDarkMode).toBe(false);
    });

    it('should persist toggle to localStorage', () => {
      localStorageMock.setItem('edufunds_darkmode', 'false');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith('edufunds_darkmode', 'true');
    });
  });

  // ============================================
  // Document Class Tests
  // ============================================
  describe('document class', () => {
    it('should add dark class when isDarkMode is true', () => {
      localStorageMock.setItem('edufunds_darkmode', 'true');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      renderHook(() => useDarkMode(), { wrapper });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class when isDarkMode is false', () => {
      document.documentElement.classList.add('dark');
      localStorageMock.setItem('edufunds_darkmode', 'false');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      renderHook(() => useDarkMode(), { wrapper });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should update document class when toggling', () => {
      localStorageMock.setItem('edufunds_darkmode', 'false');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(document.documentElement.classList.contains('dark')).toBe(false);

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });

  // ============================================
  // Multiple Toggles Test
  // ============================================
  describe('multiple toggles', () => {
    it('should handle multiple toggles correctly', () => {
      localStorageMock.setItem('edufunds_darkmode', 'false');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(false);

      act(() => {
        result.current.toggleDarkMode();
      });
      expect(result.current.isDarkMode).toBe(true);

      act(() => {
        result.current.toggleDarkMode();
      });
      expect(result.current.isDarkMode).toBe(false);

      act(() => {
        result.current.toggleDarkMode();
      });
      expect(result.current.isDarkMode).toBe(true);
    });
  });
});
