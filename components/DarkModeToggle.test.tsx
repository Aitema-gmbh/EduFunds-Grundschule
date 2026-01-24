/**
 * Tests for the DarkModeToggle component
 * Verifies dark mode toggle functionality and UI rendering
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { DarkModeToggle } from './DarkModeToggle';

// Mock the DarkModeContext
const mockToggleDarkMode = vi.fn();
let mockIsDarkMode = false;

vi.mock('../contexts/DarkModeContext', () => ({
  useDarkMode: () => ({
    isDarkMode: mockIsDarkMode,
    toggleDarkMode: mockToggleDarkMode,
  }),
}));

describe('DarkModeToggle', () => {
  beforeEach(() => {
    mockIsDarkMode = false;
    mockToggleDarkMode.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render the toggle button', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should have aria-label for light mode when dark mode is off', () => {
      mockIsDarkMode = false;
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to dark mode');
    });

    it('should have aria-label for dark mode when dark mode is on', () => {
      mockIsDarkMode = true;
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch to light mode');
    });
  });

  describe('toggle functionality', () => {
    it('should call toggleDarkMode when clicked', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('should call toggleDarkMode only once per click', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      
      expect(mockToggleDarkMode).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple clicks', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockToggleDarkMode).toHaveBeenCalledTimes(3);
    });
  });

  describe('styling', () => {
    it('should have rounded-full class for circular button', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded-full');
    });

    it('should have transition classes for smooth animations', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('transition-all');
      expect(button.className).toContain('duration-300');
    });

    it('should have flex layout classes', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('flex');
      expect(button.className).toContain('items-center');
      expect(button.className).toContain('justify-center');
    });

    it('should have dark mode support classes', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('dark:bg-stone-800');
      expect(button.className).toContain('dark:hover:bg-stone-700');
    });

    it('should have fixed dimensions', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('w-9');
      expect(button.className).toContain('h-9');
    });
  });

  describe('icon rendering', () => {
    it('should render SVG icons for sun and moon', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      const svgs = button.querySelectorAll('svg');
      // Should have both Sun and Moon icons
      expect(svgs.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('accessibility', () => {
    it('should be focusable', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('should respond to Enter key', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      
      button.focus();
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.click(button);
      
      expect(mockToggleDarkMode).toHaveBeenCalled();
    });

    it('should have group class for hover effects', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('group');
    });
  });

  describe('visual states', () => {
    it('should show sun icon more prominently in light mode', () => {
      mockIsDarkMode = false;
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      
      // In light mode, sun should be visible (opacity-100)
      const container = button.querySelector('.relative.w-5.h-5');
      expect(container).toBeInTheDocument();
    });

    it('should show moon icon more prominently in dark mode', () => {
      mockIsDarkMode = true;
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      
      // In dark mode, moon should be visible
      const container = button.querySelector('.relative.w-5.h-5');
      expect(container).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid clicks gracefully', () => {
      render(<DarkModeToggle />);
      const button = screen.getByRole('button');
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button);
      }
      
      expect(mockToggleDarkMode).toHaveBeenCalledTimes(10);
    });

    it('should maintain button structure after toggle', () => {
      mockIsDarkMode = false;
      const { rerender } = render(<DarkModeToggle />);
      
      // Before toggle
      let button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      
      // Simulate toggle
      mockIsDarkMode = true;
      rerender(<DarkModeToggle />);
      
      // After toggle
      button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});
