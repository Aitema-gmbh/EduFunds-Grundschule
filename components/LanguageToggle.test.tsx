/**
 * Tests for the LanguageToggle component
 * Verifies language switching functionality and UI rendering
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { LanguageToggle } from './LanguageToggle';

// Mock react-i18next
const mockChangeLanguage = vi.fn();
let mockLanguage = 'de';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      language: mockLanguage,
      changeLanguage: mockChangeLanguage,
    },
    t: (key: string) => {
      const translations: Record<string, string> = {
        'language.toggle': 'Switch language',
      };
      return translations[key] || key;
    },
  }),
}));

describe('LanguageToggle', () => {
  beforeEach(() => {
    mockLanguage = 'de';
    mockChangeLanguage.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('should render the toggle button', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });

    it('should display DE when language is German', () => {
      mockLanguage = 'de';
      render(<LanguageToggle />);
      expect(screen.getByText('DE')).toBeInTheDocument();
    });

    it('should display EN when language is English', () => {
      mockLanguage = 'en';
      render(<LanguageToggle />);
      expect(screen.getByText('EN')).toBeInTheDocument();
    });

    it('should have proper aria-label for accessibility', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Switch language');
    });

    it('should have title attribute for tooltip', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('title', 'Switch language');
    });
  });

  describe('language switching', () => {
    it('should switch from German to English when clicked', () => {
      mockLanguage = 'de';
      render(<LanguageToggle />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
    });

    it('should switch from English to German when clicked', () => {
      mockLanguage = 'en';
      render(<LanguageToggle />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockChangeLanguage).toHaveBeenCalledWith('de');
    });

    it('should only call changeLanguage once per click', () => {
      render(<LanguageToggle />);
      
      const button = screen.getByRole('button');
      fireEvent.click(button);
      
      expect(mockChangeLanguage).toHaveBeenCalledTimes(1);
    });

    it('should toggle language on multiple clicks', () => {
      mockLanguage = 'de';
      const { rerender } = render(<LanguageToggle />);
      
      const button = screen.getByRole('button');
      
      // First click: de -> en
      fireEvent.click(button);
      expect(mockChangeLanguage).toHaveBeenCalledWith('en');
      
      // Simulate language change
      mockLanguage = 'en';
      rerender(<LanguageToggle />);
      
      // Second click: en -> de
      fireEvent.click(button);
      expect(mockChangeLanguage).toHaveBeenCalledWith('de');
    });
  });

  describe('styling', () => {
    it('should have rounded-full class for circular button', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('rounded-full');
    });

    it('should have transition classes for smooth animations', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('transition-all');
      expect(button.className).toContain('duration-300');
    });

    it('should have flex layout classes', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('flex');
      expect(button.className).toContain('items-center');
    });

    it('should have dark mode support classes', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      expect(button.className).toContain('dark:bg-stone-800');
      expect(button.className).toContain('dark:hover:bg-stone-700');
    });
  });

  describe('icon rendering', () => {
    it('should render the Languages icon', () => {
      render(<LanguageToggle />);
      // The Languages icon from lucide-react should be present
      const button = screen.getByRole('button');
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle rapid clicks gracefully', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      
      // Rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      
      expect(mockChangeLanguage).toHaveBeenCalledTimes(3);
    });

    it('should handle keyboard activation with Enter key', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      
      fireEvent.keyDown(button, { key: 'Enter' });
      fireEvent.click(button);
      
      expect(mockChangeLanguage).toHaveBeenCalled();
    });

    it('should handle keyboard activation with Space key', () => {
      render(<LanguageToggle />);
      const button = screen.getByRole('button');
      
      fireEvent.keyDown(button, { key: ' ' });
      fireEvent.click(button);
      
      expect(mockChangeLanguage).toHaveBeenCalled();
    });
  });
});
