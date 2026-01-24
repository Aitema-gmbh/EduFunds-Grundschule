/**
 * Integration Tests for EduFunds-Grundschule
 * Tests the interplay between different modules and validates
 * end-to-end data flow scenarios
 */
import { describe, it, expect } from 'vitest';
import { parseBudget, formatBudget, parseDeadline, getDaysUntilDeadline, validateSchoolProfile as validateProfileFunding, isProgramAvailableInState, filterProgramsByQuery, GERMAN_STATES } from './utils/funding';
import { validators, validateSchoolProfile as validateProfileForm, validateLoginForm, hasErrors, isFormValid, inputMasks } from './services/validationService';
import { formatDate, formatCurrency, escapeCSVValue } from './services/exportService';
import { ViewState, SchoolProfile, FundingProgram, MatchResult } from './types';
import { INITIAL_PROFILE, MOCK_FUNDING_PROGRAMS } from './constants';

// ============================================
// Budget Round-trip Tests
// ============================================
describe('Budget parsing and formatting round-trip', () => {
  it('should maintain consistency when parsing and formatting thousands', () => {
    const original = 5000;
    const formatted = formatBudget(original);
    const parsed = parseBudget(formatted);
    expect(parsed).toBe(original);
  });

  it('should maintain consistency when parsing and formatting millions', () => {
    const original = 10000000;
    const formatted = formatBudget(original);
    const parsed = parseBudget(formatted);
    expect(parsed).toBe(original);
  });

  it('should handle edge case of 1 million correctly', () => {
    const formatted = formatBudget(1000000);
    expect(formatted).toContain('Mio');
    const parsed = parseBudget(formatted);
    expect(parsed).toBe(1000000);
  });

  it('should handle small amounts correctly', () => {
    const original = 500;
    const formatted = formatBudget(original);
    expect(formatted).toBe('500 €');
    const parsed = parseBudget(formatted);
    expect(parsed).toBe(original);
  });
});

// ============================================
// Deadline parsing integration with date utilities
// ============================================
describe('Deadline and date utility integration', () => {
  it('should correctly calculate days until deadline from parsed date', () => {
    const deadline = '31.12.2025';
    const referenceDate = new Date(2025, 11, 25); // Dec 25, 2025
    const days = getDaysUntilDeadline(deadline, referenceDate);
    expect(days).toBe(6);
  });

  it('should return null for "Laufend" deadlines', () => {
    expect(getDaysUntilDeadline('Laufend')).toBeNull();
    expect(getDaysUntilDeadline('Laufend 2026')).toBeNull();
    expect(getDaysUntilDeadline('laufend (Warteliste)')).toBeNull();
  });

  it('should handle deadline string variations', () => {
    const referenceDate = new Date(2025, 0, 1); // Jan 1, 2025
    expect(getDaysUntilDeadline('01.02.2025', referenceDate)).toBe(31);
    expect(getDaysUntilDeadline('1.2.2025', referenceDate)).toBe(31);
  });
});

// ============================================
// Profile validation consistency between modules
// ============================================
describe('Profile validation consistency', () => {
  const validProfile: SchoolProfile = {
    name: 'Grundschule am Park',
    location: 'Berlin',
    state: 'DE-BE',
    studentCount: 250,
    socialIndex: 3,
    focusAreas: ['MINT', 'Musik'],
    needsDescription: 'Digitalisierung und Musikförderung',
  };

  it('should validate a complete profile with both validators', () => {
    // funding.ts validator returns string[]
    const fundingErrors = validateProfileFunding(validProfile);
    expect(fundingErrors).toHaveLength(0);

    // validationService.ts validator returns FormErrors
    const formErrors = validateProfileForm(validProfile);
    expect(hasErrors(formErrors)).toBe(false);
    expect(isFormValid(formErrors)).toBe(true);
  });

  it('should detect missing name in both validators', () => {
    const invalidProfile = { ...validProfile, name: '' };

    const fundingErrors = validateProfileFunding(invalidProfile);
    expect(fundingErrors.some(e => e.toLowerCase().includes('name'))).toBe(true);

    const formErrors = validateProfileForm(invalidProfile);
    expect(formErrors.name).toBeDefined();
  });

  it('should detect invalid social index in both validators', () => {
    const invalidProfile = { ...validProfile, socialIndex: 10 };

    const fundingErrors = validateProfileFunding(invalidProfile);
    expect(fundingErrors.some(e => e.toLowerCase().includes('social') || e.toLowerCase().includes('index'))).toBe(true);

    const formErrors = validateProfileForm(invalidProfile);
    expect(formErrors.socialIndex).toBeDefined();
  });

  it('should validate email format consistently', () => {
    const invalidEmail = 'not-an-email';
    const validEmail = 'test@school.de';

    const profileWithInvalidEmail = { ...validProfile, email: invalidEmail };
    const profileWithValidEmail = { ...validProfile, email: validEmail };

    const formErrorsInvalid = validateProfileForm(profileWithInvalidEmail);
    expect(formErrorsInvalid.email).toBeDefined();

    const formErrorsValid = validateProfileForm(profileWithValidEmail);
    expect(formErrorsValid.email).toBeUndefined();
  });
});

// ============================================
// Program filtering and state availability
// ============================================
describe('Program filtering integration', () => {
  const testPrograms: FundingProgram[] = [
    {
      id: 'federal-prog',
      title: 'Digitalpakt Schule',
      provider: 'BMBF',
      budget: '5.000.000€',
      deadline: '31.12.2025',
      focus: 'Digitalisierung',
      description: 'Bundesweites Förderprogramm für digitale Bildung',
      requirements: 'Alle Schulträger',
      region: ['DE'],
      targetGroup: 'Alle Schulen',
      fundingQuota: '90%',
      detailedCriteria: [],
      submissionMethod: 'Online',
      requiredDocuments: [],
      fundingPeriod: '12 Monate',
    },
    {
      id: 'state-prog-by',
      title: 'Bayerisches Digitalbonus',
      provider: 'Freistaat Bayern',
      budget: '50.000€',
      deadline: '30.06.2025',
      focus: 'Digitalisierung',
      description: 'Förderung für bayerische Schulen',
      requirements: 'Nur bayerische Schulen',
      region: ['DE-BY'],
      targetGroup: 'Grundschulen Bayern',
      fundingQuota: '80%',
      detailedCriteria: [],
      submissionMethod: 'Postalisch',
      requiredDocuments: [],
      fundingPeriod: '6 Monate',
    },
    {
      id: 'state-prog-be',
      title: 'Berliner Musikförderung',
      provider: 'Senat Berlin',
      budget: '10.000€',
      deadline: 'Laufend',
      focus: 'Musik',
      description: 'Förderung für musikalische Bildung in Berlin',
      requirements: 'Berliner Schulen',
      region: ['DE-BE'],
      targetGroup: 'Grundschulen Berlin',
      fundingQuota: '100%',
      detailedCriteria: [],
      submissionMethod: 'Email',
      requiredDocuments: [],
      fundingPeriod: '12 Monate',
    },
  ];

  it('should filter programs by federal availability for all states', () => {
    GERMAN_STATES.forEach(state => {
      const isAvailable = isProgramAvailableInState(testPrograms[0], state.code);
      expect(isAvailable).toBe(true);
    });
  });

  it('should correctly limit state programs to their region', () => {
    // Bavarian program only for Bavaria
    expect(isProgramAvailableInState(testPrograms[1], 'DE-BY')).toBe(true);
    expect(isProgramAvailableInState(testPrograms[1], 'DE-BE')).toBe(false);
    expect(isProgramAvailableInState(testPrograms[1], 'DE-NW')).toBe(false);

    // Berlin program only for Berlin
    expect(isProgramAvailableInState(testPrograms[2], 'DE-BE')).toBe(true);
    expect(isProgramAvailableInState(testPrograms[2], 'DE-BY')).toBe(false);
  });

  it('should filter programs by query across multiple fields', () => {
    const digitalResults = filterProgramsByQuery(testPrograms, 'digital');
    expect(digitalResults.length).toBe(2);

    const musikResults = filterProgramsByQuery(testPrograms, 'Musik');
    expect(musikResults.length).toBe(1);
    expect(musikResults[0].id).toBe('state-prog-be');

    const berlinResults = filterProgramsByQuery(testPrograms, 'Berlin');
    expect(berlinResults.length).toBe(1);
  });

  it('should handle combined filtering criteria', () => {
    // First filter by query, then by state availability
    const digitalPrograms = filterProgramsByQuery(testPrograms, 'digital');
    const availableInBavaria = digitalPrograms.filter(p => isProgramAvailableInState(p, 'DE-BY'));
    expect(availableInBavaria.length).toBe(2); // Federal + Bavarian

    const availableInBerlin = digitalPrograms.filter(p => isProgramAvailableInState(p, 'DE-BE'));
    expect(availableInBerlin.length).toBe(1); // Only federal
  });
});

// ============================================
// CSV Export helper integration
// ============================================
describe('CSV export data preparation', () => {
  it('should correctly escape program descriptions for CSV', () => {
    const description = 'Förderung für "alle" Schulen, inkl. Grundschulen';
    const escaped = escapeCSVValue(description);
    expect(escaped).toContain('""');
    expect(escaped.startsWith('"')).toBe(true);
    expect(escaped.endsWith('"')).toBe(true);
  });

  it('should correctly format dates and budgets for export', () => {
    const date = new Date(2025, 5, 15);
    const formattedDate = formatDate(date);
    expect(formattedDate).toBe('15.06.2025');

    const budget = 25000;
    const formattedBudget = formatCurrency(budget);
    expect(formattedBudget).toContain('25.000');
    expect(formattedBudget).toContain('€');
  });

  it('should handle German special characters in CSV export', () => {
    const germanText = 'Förderung für Schüler mit besonderen Bedürfnissen';
    const escaped = escapeCSVValue(germanText);
    expect(escaped).toBe(germanText); // No special CSV chars, so unchanged
  });

  it('should escape newlines in multi-line descriptions', () => {
    const multiLineText = 'Line 1\nLine 2\nLine 3';
    const escaped = escapeCSVValue(multiLineText);
    expect(escaped.startsWith('"')).toBe(true);
    expect(escaped).toContain('\n');
  });
});

// ============================================
// Input masks validation
// ============================================
describe('Input mask formatting', () => {
  describe('Phone number formatting', () => {
    it('should format German mobile number with +49', () => {
      const input = '+491701234567';
      const formatted = inputMasks.phone(input);
      expect(formatted).toContain('+49');
      expect(formatted).not.toBe(input); // Should be formatted with spaces
    });

    it('should format German landline starting with 0', () => {
      const input = '03012345678';
      const formatted = inputMasks.phone(input);
      expect(formatted).toContain(' '); // Should have spaces for grouping
    });

    it('should handle partial phone number input', () => {
      expect(inputMasks.phone('+49')).toBe('+49');
      expect(inputMasks.phone('0')).toBe('0');
    });
  });

  describe('Date formatting', () => {
    it('should format date with dots', () => {
      const input = '31122025';
      const formatted = inputMasks.date(input);
      expect(formatted).toBe('31.12.2025');
    });

    it('should handle partial date input', () => {
      expect(inputMasks.date('31')).toBe('31');
      expect(inputMasks.date('3112')).toBe('31.12');
      expect(inputMasks.date('311220')).toBe('31.12.20');
    });
  });
});

// ============================================
// Initial state and constants validation
// ============================================
describe('Application constants and initial state', () => {
  it('should have a valid initial profile structure', () => {
    expect(INITIAL_PROFILE).toBeDefined();
    expect(INITIAL_PROFILE.name).toBe('');
    expect(INITIAL_PROFILE.focusAreas).toEqual([]);
    expect(INITIAL_PROFILE.socialIndex).toBe(3); // Default middle value
  });

  it('should have valid mock funding programs', () => {
    expect(MOCK_FUNDING_PROGRAMS).toBeDefined();
    expect(Array.isArray(MOCK_FUNDING_PROGRAMS)).toBe(true);
    expect(MOCK_FUNDING_PROGRAMS.length).toBeGreaterThan(0);

    // Validate each program has required fields
    MOCK_FUNDING_PROGRAMS.forEach(program => {
      expect(program.id).toBeDefined();
      expect(program.title).toBeDefined();
      expect(program.provider).toBeDefined();
      expect(program.region).toBeDefined();
      expect(Array.isArray(program.region)).toBe(true);
    });
  });

  it('should have all German states defined', () => {
    expect(GERMAN_STATES.length).toBe(17); // 16 states + federal

    // Check for major states
    const stateCodes = GERMAN_STATES.map(s => s.code);
    expect(stateCodes).toContain('DE');
    expect(stateCodes).toContain('DE-BY');
    expect(stateCodes).toContain('DE-BE');
    expect(stateCodes).toContain('DE-NW');
  });

  it('should have all ViewState enum values', () => {
    expect(ViewState.LANDING).toBe('LANDING');
    expect(ViewState.LOGIN).toBe('LOGIN');
    expect(ViewState.DASHBOARD).toBe('DASHBOARD');
    expect(ViewState.PROFILE).toBe('PROFILE');
    expect(ViewState.MATCHING).toBe('MATCHING');
    expect(ViewState.WRITER).toBe('WRITER');
    expect(ViewState.NOTIFICATIONS).toBe('NOTIFICATIONS');
    expect(ViewState.ANALYTICS).toBe('ANALYTICS');
    expect(ViewState.SETTINGS).toBe('SETTINGS');
  });
});

// ============================================
// Form validation edge cases
// ============================================
describe('Form validation edge cases', () => {
  describe('Login form validation', () => {
    it('should accept minimum valid input', () => {
      const errors = validateLoginForm('ABC', 'XY');
      expect(hasErrors(errors)).toBe(false);
    });

    it('should reject single character name', () => {
      const errors = validateLoginForm('A', 'Berlin');
      expect(errors.name).toBeDefined();
    });

    it('should reject single character city', () => {
      const errors = validateLoginForm('Test School', 'B');
      expect(errors.city).toBeDefined();
    });

    it('should handle whitespace-only input as empty', () => {
      const errors = validateLoginForm('   ', '   ');
      expect(errors.name).toBeDefined();
      expect(errors.city).toBeDefined();
    });
  });

  describe('Validators edge cases', () => {
    it('should validate required with various empty values', () => {
      expect(validators.required('', 'field').isValid).toBe(false);
      expect(validators.required('  ', 'field').isValid).toBe(false);
      expect(validators.required(undefined, 'field').isValid).toBe(false);
      expect(validators.required(0, 'field').isValid).toBe(true); // 0 is a valid number
    });

    it('should validate URL with various formats', () => {
      expect(validators.url('').isValid).toBe(true); // Empty is valid (optional)
      expect(validators.url('https://example.com').isValid).toBe(true);
      expect(validators.url('example.com').isValid).toBe(true); // Auto-prefixed
      expect(validators.url('http://example.com/path?query=1').isValid).toBe(true);
    });

    it('should validate positive and non-negative numbers', () => {
      expect(validators.positiveNumber(1, 'count').isValid).toBe(true);
      expect(validators.positiveNumber(0, 'count').isValid).toBe(false);
      expect(validators.positiveNumber(-1, 'count').isValid).toBe(false);

      expect(validators.nonNegativeNumber(0, 'count').isValid).toBe(true);
      expect(validators.nonNegativeNumber(1, 'count').isValid).toBe(true);
      expect(validators.nonNegativeNumber(-1, 'count').isValid).toBe(false);
    });

    it('should validate range boundaries', () => {
      expect(validators.range(1, 1, 5, 'index').isValid).toBe(true);
      expect(validators.range(5, 1, 5, 'index').isValid).toBe(true);
      expect(validators.range(0, 1, 5, 'index').isValid).toBe(false);
      expect(validators.range(6, 1, 5, 'index').isValid).toBe(false);
    });
  });
});

// ============================================
// MatchResult scoring validation
// ============================================
describe('MatchResult score validation', () => {
  it('should accept valid score ranges', () => {
    const validMatch: MatchResult = {
      programId: 'test-1',
      score: 85,
      reasoning: 'Good match',
    };
    expect(validMatch.score).toBeGreaterThanOrEqual(0);
    expect(validMatch.score).toBeLessThanOrEqual(100);
  });

  it('should allow optional tags', () => {
    const matchWithTags: MatchResult = {
      programId: 'test-1',
      score: 90,
      reasoning: 'Excellent match',
      tags: ['MINT', 'Digital', 'Bundesweit'],
    };
    expect(matchWithTags.tags).toHaveLength(3);

    const matchWithoutTags: MatchResult = {
      programId: 'test-2',
      score: 70,
      reasoning: 'Moderate match',
    };
    expect(matchWithoutTags.tags).toBeUndefined();
  });
});
