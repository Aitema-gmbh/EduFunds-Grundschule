import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act, cleanup } from '@testing-library/react';
import React from 'react';
import { DarkModeProvider, useDarkMode } from './DarkModeContext';

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
  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
    
    // Reset document class
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.clearAllMocks();
    cleanup();
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
      }).toThrow();
      
      consoleSpy.mockRestore();
    });
  });

  // ============================================
  // Initial State Tests
  // ============================================
  describe('initial state', () => {
    it('should use localStorage value when available (true)', () => {
      window.localStorage.setItem('edufunds_darkmode', 'true');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      expect(result.current.isDarkMode).toBe(true);
    });

    it('should use localStorage value when available (false)', () => {
      window.localStorage.setItem('edufunds_darkmode', 'false');
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
      window.localStorage.setItem('edufunds_darkmode', 'false');
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
      window.localStorage.setItem('edufunds_darkmode', 'true');
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
      window.localStorage.setItem('edufunds_darkmode', 'false');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      const { result } = renderHook(() => useDarkMode(), { wrapper });

      act(() => {
        result.current.toggleDarkMode();
      });

      expect(window.localStorage.getItem('edufunds_darkmode')).toBe('true');
    });
  });

  // ============================================
  // Document Class Tests
  // ============================================
  describe('document class', () => {
    it('should add dark class when isDarkMode is true', () => {
      window.localStorage.setItem('edufunds_darkmode', 'true');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      renderHook(() => useDarkMode(), { wrapper });

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should remove dark class when isDarkMode is false', () => {
      document.documentElement.classList.add('dark');
      window.localStorage.setItem('edufunds_darkmode', 'false');
      window.matchMedia = createMatchMediaMock(false);

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DarkModeProvider>{children}</DarkModeProvider>
      );
      renderHook(() => useDarkMode(), { wrapper });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });

    it('should update document class when toggling', () => {
      window.localStorage.setItem('edufunds_darkmode', 'false');
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
      window.localStorage.setItem('edufunds_darkmode', 'false');
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
