import { describe, it, expect } from 'vitest';
import { formatDate, formatCurrency, escapeCSVValue } from './exportService';

// ============================================
// formatDate Tests
// ============================================
describe('formatDate', () => {
  it('should format date in German locale (DD.MM.YYYY)', () => {
    const date = new Date(2025, 11, 31); // December 31, 2025
    expect(formatDate(date)).toBe('31.12.2025');
  });

  it('should pad single-digit day and month with zeros', () => {
    const date = new Date(2025, 0, 5); // January 5, 2025
    expect(formatDate(date)).toBe('05.01.2025');
  });

  it('should handle year boundary correctly', () => {
    const date = new Date(2026, 0, 1); // January 1, 2026
    expect(formatDate(date)).toBe('01.01.2026');
  });

  it('should handle leap year dates', () => {
    const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
    expect(formatDate(date)).toBe('29.02.2024');
  });

  it('should handle end of months correctly', () => {
    const date = new Date(2025, 2, 31); // March 31, 2025
    expect(formatDate(date)).toBe('31.03.2025');
  });
});

// ============================================
// formatCurrency Tests
// ============================================
describe('formatCurrency', () => {
  it('should format positive values with EUR currency', () => {
    const result = formatCurrency(1000);
    expect(result).toContain('1.000');
    expect(result).toContain('€');
  });

  it('should format decimal values correctly', () => {
    const result = formatCurrency(1234.56);
    expect(result).toContain('1.234');
    expect(result).toContain('56');
  });

  it('should format zero correctly', () => {
    const result = formatCurrency(0);
    expect(result).toContain('0');
    expect(result).toContain('€');
  });

  it('should format large values with thousands separators', () => {
    const result = formatCurrency(1000000);
    expect(result).toContain('1.000.000');
  });

  it('should handle small decimal values', () => {
    const result = formatCurrency(0.99);
    expect(result).toContain('0,99');
  });

  it('should format negative values', () => {
    const result = formatCurrency(-500);
    expect(result).toContain('500');
    expect(result).toContain('€');
  });
});

// ============================================
// escapeCSVValue Tests
// ============================================
describe('escapeCSVValue', () => {
  describe('basic values', () => {
    it('should return simple strings unchanged', () => {
      expect(escapeCSVValue('Hello World')).toBe('Hello World');
    });

    it('should convert numbers to strings', () => {
      expect(escapeCSVValue(123)).toBe('123');
      expect(escapeCSVValue(45.67)).toBe('45.67');
    });

    it('should return empty string for undefined', () => {
      expect(escapeCSVValue(undefined)).toBe('');
    });

    it('should return empty string for null', () => {
      // @ts-expect-error Testing null handling
      expect(escapeCSVValue(null)).toBe('');
    });
  });

  describe('values with commas', () => {
    it('should wrap values containing commas in quotes', () => {
      expect(escapeCSVValue('Hello, World')).toBe('"Hello, World"');
    });

    it('should handle multiple commas', () => {
      expect(escapeCSVValue('one, two, three')).toBe('"one, two, three"');
    });
  });

  describe('values with newlines', () => {
    it('should wrap values containing newlines in quotes', () => {
      expect(escapeCSVValue('Line 1\nLine 2')).toBe('"Line 1\nLine 2"');
    });

    it('should handle multiple newlines', () => {
      expect(escapeCSVValue('a\nb\nc')).toBe('"a\nb\nc"');
    });
  });

  describe('values with quotes', () => {
    it('should escape quotes by doubling them', () => {
      expect(escapeCSVValue('He said "Hello"')).toBe('"He said ""Hello"""');
    });

    it('should handle multiple quotes', () => {
      expect(escapeCSVValue('"Quote" and "Another"')).toBe('"""Quote"" and ""Another"""');
    });

    it('should handle quote at the start', () => {
      expect(escapeCSVValue('"Start')).toBe('"""Start"');
    });

    it('should handle quote at the end', () => {
      expect(escapeCSVValue('End"')).toBe('"End"""');
    });
  });

  describe('mixed special characters', () => {
    it('should handle commas and quotes together', () => {
      expect(escapeCSVValue('Name, "Title"')).toBe('"Name, ""Title"""');
    });

    it('should handle all special characters together', () => {
      expect(escapeCSVValue('Line 1, "quote"\nLine 2')).toBe('"Line 1, ""quote""\nLine 2"');
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(escapeCSVValue('')).toBe('');
    });

    it('should handle string with only spaces', () => {
      expect(escapeCSVValue('   ')).toBe('   ');
    });

    it('should handle zero', () => {
      expect(escapeCSVValue(0)).toBe('0');
    });

    it('should handle negative numbers', () => {
      expect(escapeCSVValue(-123)).toBe('-123');
    });

    it('should handle German text with umlauts', () => {
      expect(escapeCSVValue('Förderung')).toBe('Förderung');
    });

    it('should handle German text with special chars and commas', () => {
      expect(escapeCSVValue('Förderung, Schüler')).toBe('"Förderung, Schüler"');
    });
  });
});
