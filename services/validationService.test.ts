import { describe, it, expect } from 'vitest';
import {
  validators,
  inputMasks,
  validateSchoolProfile,
  validateLoginForm,
  hasErrors,
  isFormValid,
  FormErrors,
} from './validationService';

describe('validators', () => {
  describe('required', () => {
    it('should return valid for non-empty string', () => {
      expect(validators.required('test', 'Field').isValid).toBe(true);
    });

    it('should return invalid for empty string', () => {
      const result = validators.required('', 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name ist erforderlich');
    });

    it('should return invalid for whitespace only', () => {
      const result = validators.required('   ', 'Field');
      expect(result.isValid).toBe(false);
    });

    it('should return invalid for undefined', () => {
      const result = validators.required(undefined, 'Field');
      expect(result.isValid).toBe(false);
    });

    it('should return valid for numbers', () => {
      expect(validators.required(0, 'Count').isValid).toBe(true);
      expect(validators.required(100, 'Count').isValid).toBe(true);
    });
  });

  describe('minLength', () => {
    it('should return valid when length meets minimum', () => {
      expect(validators.minLength('hello', 3, 'Text').isValid).toBe(true);
      expect(validators.minLength('abc', 3, 'Text').isValid).toBe(true);
    });

    it('should return invalid when length is below minimum', () => {
      const result = validators.minLength('ab', 3, 'Name');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Name muss mindestens 3 Zeichen haben');
    });
  });

  describe('maxLength', () => {
    it('should return valid when length is within maximum', () => {
      expect(validators.maxLength('hello', 10, 'Text').isValid).toBe(true);
      expect(validators.maxLength('abc', 3, 'Text').isValid).toBe(true);
    });

    it('should return invalid when length exceeds maximum', () => {
      const result = validators.maxLength('hello world', 5, 'Title');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Title darf maximal 5 Zeichen haben');
    });
  });

  describe('email', () => {
    it('should return valid for proper email format', () => {
      expect(validators.email('test@example.com').isValid).toBe(true);
      expect(validators.email('user.name@school.de').isValid).toBe(true);
    });

    it('should return valid for empty string (optional field)', () => {
      expect(validators.email('').isValid).toBe(true);
    });

    it('should return invalid for improper email format', () => {
      const result = validators.email('invalid-email');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Bitte geben Sie eine gültige E-Mail-Adresse ein');
    });

    it('should reject emails without domain extension', () => {
      expect(validators.email('test@domain').isValid).toBe(false);
    });

    it('should reject emails with spaces', () => {
      expect(validators.email('test @example.com').isValid).toBe(false);
    });
  });

  describe('phone', () => {
    it('should return valid for German phone formats', () => {
      expect(validators.phone('+49 123 456789').isValid).toBe(true);
      expect(validators.phone('0123456789').isValid).toBe(true);
      expect(validators.phone('030-12345678').isValid).toBe(true);
    });

    it('should return valid for empty string (optional field)', () => {
      expect(validators.phone('').isValid).toBe(true);
    });

    it('should return invalid for non-German formats', () => {
      const result = validators.phone('123');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Bitte geben Sie eine gültige Telefonnummer ein');
    });
  });

  describe('url', () => {
    it('should return valid for proper URLs', () => {
      expect(validators.url('https://example.com').isValid).toBe(true);
      expect(validators.url('http://school.de').isValid).toBe(true);
    });

    it('should return valid for URLs without protocol', () => {
      expect(validators.url('example.com').isValid).toBe(true);
      expect(validators.url('www.school.de').isValid).toBe(true);
    });

    it('should return valid for empty string (optional field)', () => {
      expect(validators.url('').isValid).toBe(true);
    });

    it('should return invalid for malformed URLs', () => {
      const result = validators.url('not a url at all!!');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Bitte geben Sie eine gültige Web-Adresse ein');
    });
  });

  describe('range', () => {
    it('should return valid when value is within range', () => {
      expect(validators.range(5, 1, 10, 'Value').isValid).toBe(true);
      expect(validators.range(1, 1, 5, 'Index').isValid).toBe(true);
      expect(validators.range(5, 1, 5, 'Index').isValid).toBe(true);
    });

    it('should return invalid when value is outside range', () => {
      const result = validators.range(0, 1, 5, 'Sozialindex');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Sozialindex muss zwischen 1 und 5 liegen');

      const result2 = validators.range(6, 1, 5, 'Sozialindex');
      expect(result2.isValid).toBe(false);
    });
  });

  describe('positiveNumber', () => {
    it('should return valid for positive numbers', () => {
      expect(validators.positiveNumber(1, 'Count').isValid).toBe(true);
      expect(validators.positiveNumber(100, 'Count').isValid).toBe(true);
    });

    it('should return invalid for zero', () => {
      const result = validators.positiveNumber(0, 'Schülerzahl');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Schülerzahl muss größer als 0 sein');
    });

    it('should return invalid for negative numbers', () => {
      const result = validators.positiveNumber(-5, 'Count');
      expect(result.isValid).toBe(false);
    });
  });

  describe('nonNegativeNumber', () => {
    it('should return valid for zero', () => {
      expect(validators.nonNegativeNumber(0, 'Count').isValid).toBe(true);
    });

    it('should return valid for positive numbers', () => {
      expect(validators.nonNegativeNumber(10, 'Count').isValid).toBe(true);
    });

    it('should return invalid for negative numbers', () => {
      const result = validators.nonNegativeNumber(-1, 'Budget');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Budget darf nicht negativ sein');
    });
  });
});

describe('inputMasks', () => {
  describe('phone', () => {
    it('should format +49 numbers correctly', () => {
      expect(inputMasks.phone('+49123456789')).toBe('+49 123 456 789');
    });

    it('should format 0-prefix numbers correctly', () => {
      expect(inputMasks.phone('01234567890')).toBe('0123 456 7890');
    });

    it('should handle partial input', () => {
      expect(inputMasks.phone('+49')).toBe('+49');
      expect(inputMasks.phone('0123')).toBe('0123');
    });
  });

  describe('date', () => {
    it('should format complete dates correctly', () => {
      expect(inputMasks.date('31122026')).toBe('31.12.2026');
    });

    it('should handle partial input', () => {
      expect(inputMasks.date('31')).toBe('31');
      expect(inputMasks.date('3112')).toBe('31.12');
    });

    it('should remove non-digit characters', () => {
      expect(inputMasks.date('31.12.2026')).toBe('31.12.2026');
    });
  });
});

describe('validateSchoolProfile', () => {
  const validProfile = {
    name: 'Grundschule Musterstadt',
    location: 'München',
    state: 'DE-BY',
    studentCount: 250,
    socialIndex: 3,
    email: 'contact@school.de',
    website: 'https://school.de',
  };

  it('should return empty errors for valid profile', () => {
    const errors = validateSchoolProfile(validProfile);
    expect(hasErrors(errors)).toBe(false);
  });

  it('should return error for missing name', () => {
    const errors = validateSchoolProfile({ ...validProfile, name: '' });
    expect(errors.name).toBe('Schulname ist erforderlich');
  });

  it('should return error for name too short', () => {
    const errors = validateSchoolProfile({ ...validProfile, name: 'AB' });
    expect(errors.name).toBe('Schulname muss mindestens 3 Zeichen haben');
  });

  it('should return error for missing location', () => {
    const errors = validateSchoolProfile({ ...validProfile, location: '' });
    expect(errors.location).toBe('Standort ist erforderlich');
  });

  it('should return error for missing state', () => {
    const errors = validateSchoolProfile({ ...validProfile, state: '' });
    expect(errors.state).toBe('Bundesland ist erforderlich');
  });

  it('should return error for invalid student count', () => {
    const errors = validateSchoolProfile({ ...validProfile, studentCount: 0 });
    expect(errors.studentCount).toBe('Schülerzahl muss größer als 0 sein');
  });

  it('should return error for social index out of range', () => {
    const errors = validateSchoolProfile({ ...validProfile, socialIndex: 6 });
    expect(errors.socialIndex).toBe('Sozialindex muss zwischen 1 und 5 liegen');
  });

  it('should return error for invalid email', () => {
    const errors = validateSchoolProfile({ ...validProfile, email: 'invalid' });
    expect(errors.email).toBe('Bitte geben Sie eine gültige E-Mail-Adresse ein');
  });

  it('should return error for invalid website', () => {
    const errors = validateSchoolProfile({ ...validProfile, website: 'not a url!!' });
    expect(errors.website).toBe('Bitte geben Sie eine gültige Web-Adresse ein');
  });
});

describe('validateLoginForm', () => {
  it('should return empty errors for valid input', () => {
    const errors = validateLoginForm('Grundschule Test', 'Berlin');
    expect(hasErrors(errors)).toBe(false);
  });

  it('should return error for empty name', () => {
    const errors = validateLoginForm('', 'Berlin');
    expect(errors.name).toBe('Schulname ist erforderlich');
  });

  it('should return error for name too short', () => {
    const errors = validateLoginForm('AB', 'Berlin');
    expect(errors.name).toBe('Schulname muss mindestens 3 Zeichen haben');
  });

  it('should return error for empty city', () => {
    const errors = validateLoginForm('Grundschule Test', '');
    expect(errors.city).toBe('Stadt ist erforderlich');
  });

  it('should return error for city too short', () => {
    const errors = validateLoginForm('Grundschule Test', 'A');
    expect(errors.city).toBe('Stadt muss mindestens 2 Zeichen haben');
  });

  it('should return multiple errors when both fields are invalid', () => {
    const errors = validateLoginForm('', '');
    expect(errors.name).toBeDefined();
    expect(errors.city).toBeDefined();
  });
});

describe('hasErrors', () => {
  it('should return false for empty errors object', () => {
    expect(hasErrors({})).toBe(false);
  });

  it('should return false when all values are undefined', () => {
    const errors: FormErrors = { name: undefined, email: undefined };
    expect(hasErrors(errors)).toBe(false);
  });

  it('should return true when any error exists', () => {
    const errors: FormErrors = { name: 'Error message' };
    expect(hasErrors(errors)).toBe(true);
  });
});

describe('isFormValid', () => {
  it('should return true when no errors', () => {
    expect(isFormValid({})).toBe(true);
    expect(isFormValid({ name: undefined })).toBe(true);
  });

  it('should return false when errors exist', () => {
    expect(isFormValid({ name: 'Error' })).toBe(false);
  });
});
