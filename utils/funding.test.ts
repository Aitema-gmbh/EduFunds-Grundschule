import { describe, it, expect } from 'vitest';
import {
  parseBudget,
  parseDeadline,
  validateSchoolProfile,
  isValidEmail,
  isProgramAvailableInState,
  filterProgramsByQuery,
  getDaysUntilDeadline,
  formatBudget,
  getStateLabel,
  GERMAN_STATES,
} from './funding';
import { FundingProgram, SchoolProfile } from '../types';

// ============================================
// parseBudget Tests
// ============================================
describe('parseBudget', () => {
  describe('German number format with dots as thousands separators', () => {
    it('should parse simple German format (5.000€)', () => {
      expect(parseBudget('5.000€')).toBe(5000);
    });

    it('should parse German format with euro sign and space (10.000 €)', () => {
      expect(parseBudget('10.000 €')).toBe(10000);
    });

    it('should parse German format with prefix (Max. 5.000€)', () => {
      expect(parseBudget('Max. 5.000€')).toBe(5000);
    });

    it('should parse larger German format (100.000€)', () => {
      expect(parseBudget('100.000€')).toBe(100000);
    });

    it('should parse German format with decimals (10.000,50€)', () => {
      expect(parseBudget('10.000,50€')).toBe(10000.5);
    });
  });

  describe('Million format', () => {
    it('should parse "10 Mio €" format', () => {
      expect(parseBudget('10 Mio €')).toBe(10000000);
    });

    it('should parse "1,5 Mio €" format', () => {
      expect(parseBudget('1,5 Mio €')).toBe(1500000);
    });

    it('should parse lowercase "mio"', () => {
      expect(parseBudget('5 mio')).toBe(5000000);
    });

    it('should parse "million" keyword', () => {
      expect(parseBudget('2 million €')).toBe(2000000);
    });
  });

  describe('Thousand format', () => {
    it('should parse "50 Tsd €" format', () => {
      expect(parseBudget('50 Tsd €')).toBe(50000);
    });

    it('should parse "tausend" keyword', () => {
      expect(parseBudget('25 tausend')).toBe(25000);
    });

    it('should parse lowercase "tsd"', () => {
      expect(parseBudget('100 tsd')).toBe(100000);
    });
  });

  describe('Plain numbers', () => {
    it('should parse plain number without formatting', () => {
      expect(parseBudget('5000')).toBe(5000);
    });

    it('should parse German decimal without thousands separator (5,5)', () => {
      expect(parseBudget('5,5€')).toBe(5.5);
    });
  });

  describe('Edge cases', () => {
    it('should return 0 for empty string', () => {
      expect(parseBudget('')).toBe(0);
    });

    it('should return 0 for string without numbers', () => {
      expect(parseBudget('no budget')).toBe(0);
    });

    it('should handle text with embedded numbers', () => {
      expect(parseBudget('Budget: circa 2.500€')).toBe(2500);
    });
  });
});

// ============================================
// parseDeadline Tests
// ============================================
describe('parseDeadline', () => {
  it('should parse German date format (DD.MM.YYYY)', () => {
    const result = parseDeadline('31.12.2025');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getDate()).toBe(31);
    expect(result?.getMonth()).toBe(11); // 0-indexed
    expect(result?.getFullYear()).toBe(2025);
  });

  it('should parse single-digit day and month (1.5.2025)', () => {
    const result = parseDeadline('1.5.2025');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getDate()).toBe(1);
    expect(result?.getMonth()).toBe(4);
    expect(result?.getFullYear()).toBe(2025);
  });

  it('should return null for "Laufend" (ongoing)', () => {
    expect(parseDeadline('Laufend')).toBeNull();
  });

  it('should return null for "laufend" (lowercase)', () => {
    expect(parseDeadline('laufend')).toBeNull();
  });

  it('should return null for invalid date format', () => {
    expect(parseDeadline('2025-12-31')).toBeNull();
  });

  it('should return null for empty string', () => {
    expect(parseDeadline('')).toBeNull();
  });

  it('should parse date with surrounding text', () => {
    const result = parseDeadline('Deadline: 15.06.2025');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getDate()).toBe(15);
    expect(result?.getMonth()).toBe(5);
  });
});

// ============================================
// validateSchoolProfile Tests
// ============================================
describe('validateSchoolProfile', () => {
  const validProfile: SchoolProfile = {
    name: 'Test Grundschule',
    location: 'Berlin',
    state: 'DE-BE',
    studentCount: 250,
    socialIndex: 3,
    focusAreas: ['MINT', 'Musik'],
    needsDescription: 'We need new computers for our computer lab.',
  };

  it('should return empty array for valid profile', () => {
    expect(validateSchoolProfile(validProfile)).toEqual([]);
  });

  it('should return error for missing name', () => {
    const profile = { ...validProfile, name: '' };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('School name is required');
  });

  it('should return error for whitespace-only name', () => {
    const profile = { ...validProfile, name: '   ' };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('School name is required');
  });

  it('should return error for missing location', () => {
    const profile = { ...validProfile, location: '' };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('Location (city) is required');
  });

  it('should return error for missing state', () => {
    const profile = { ...validProfile, state: '' };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('State is required');
  });

  it('should return error for zero student count', () => {
    const profile = { ...validProfile, studentCount: 0 };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('Student count must be greater than 0');
  });

  it('should return error for negative student count', () => {
    const profile = { ...validProfile, studentCount: -10 };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('Student count must be greater than 0');
  });

  it('should return error for social index less than 1', () => {
    const profile = { ...validProfile, socialIndex: 0 };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('Social index must be between 1 and 5');
  });

  it('should return error for social index greater than 5', () => {
    const profile = { ...validProfile, socialIndex: 6 };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('Social index must be between 1 and 5');
  });

  it('should return error for missing needs description', () => {
    const profile = { ...validProfile, needsDescription: '' };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('Needs description is required');
  });

  it('should return error for invalid email', () => {
    const profile = { ...validProfile, email: 'invalid-email' };
    const errors = validateSchoolProfile(profile);
    expect(errors).toContain('Invalid email format');
  });

  it('should accept valid email', () => {
    const profile = { ...validProfile, email: 'school@example.de' };
    const errors = validateSchoolProfile(profile);
    expect(errors).not.toContain('Invalid email format');
  });

  it('should return multiple errors for multiple issues', () => {
    const profile = { name: '', location: '', state: '' } as SchoolProfile;
    const errors = validateSchoolProfile(profile);
    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('School name is required');
    expect(errors).toContain('Location (city) is required');
    expect(errors).toContain('State is required');
  });
});

// ============================================
// isValidEmail Tests
// ============================================
describe('isValidEmail', () => {
  it('should return true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should return true for email with subdomain', () => {
    expect(isValidEmail('user@mail.example.de')).toBe(true);
  });

  it('should return true for email with plus sign', () => {
    expect(isValidEmail('user+tag@example.com')).toBe(true);
  });

  it('should return true for email with dots in local part', () => {
    expect(isValidEmail('first.last@example.com')).toBe(true);
  });

  it('should return false for email without @', () => {
    expect(isValidEmail('testexample.com')).toBe(false);
  });

  it('should return false for email without domain', () => {
    expect(isValidEmail('test@')).toBe(false);
  });

  it('should return false for email without local part', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('should return false for email with spaces', () => {
    expect(isValidEmail('test @example.com')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });

  it('should return false for email without TLD', () => {
    expect(isValidEmail('test@example')).toBe(false);
  });
});

// ============================================
// isProgramAvailableInState Tests
// ============================================
describe('isProgramAvailableInState', () => {
  const federalProgram: FundingProgram = {
    id: '1',
    title: 'Federal Program',
    provider: 'BMBF',
    budget: '10.000€',
    deadline: 'Laufend',
    focus: 'Digitalisierung',
    description: 'A federal program',
    requirements: 'None',
    region: ['DE'],
    targetGroup: 'Grundschulen',
    fundingQuota: '80%',
    detailedCriteria: [],
    submissionMethod: 'Online',
    requiredDocuments: [],
    fundingPeriod: '12 Monate',
  };

  const stateProgram: FundingProgram = {
    ...federalProgram,
    id: '2',
    title: 'Bavaria Program',
    region: ['DE-BY'],
  };

  const multiStateProgram: FundingProgram = {
    ...federalProgram,
    id: '3',
    title: 'Multi-State Program',
    region: ['DE-BY', 'DE-BW', 'DE-NW'],
  };

  it('should return true for federal program in any state', () => {
    expect(isProgramAvailableInState(federalProgram, 'DE-BY')).toBe(true);
    expect(isProgramAvailableInState(federalProgram, 'DE-BE')).toBe(true);
    expect(isProgramAvailableInState(federalProgram, 'DE-NW')).toBe(true);
  });

  it('should return true for state program in matching state', () => {
    expect(isProgramAvailableInState(stateProgram, 'DE-BY')).toBe(true);
  });

  it('should return false for state program in non-matching state', () => {
    expect(isProgramAvailableInState(stateProgram, 'DE-BE')).toBe(false);
  });

  it('should return true for multi-state program in any listed state', () => {
    expect(isProgramAvailableInState(multiStateProgram, 'DE-BY')).toBe(true);
    expect(isProgramAvailableInState(multiStateProgram, 'DE-BW')).toBe(true);
    expect(isProgramAvailableInState(multiStateProgram, 'DE-NW')).toBe(true);
  });

  it('should return false for multi-state program in unlisted state', () => {
    expect(isProgramAvailableInState(multiStateProgram, 'DE-BE')).toBe(false);
  });
});

// ============================================
// filterProgramsByQuery Tests
// ============================================
describe('filterProgramsByQuery', () => {
  const programs: FundingProgram[] = [
    {
      id: '1',
      title: 'DigitalPakt Schule',
      provider: 'BMBF',
      budget: '5.000.000€',
      deadline: '31.12.2025',
      focus: 'Digitalisierung',
      description: 'Förderprogramm für digitale Infrastruktur',
      requirements: 'Medienkonzept',
      region: ['DE'],
      targetGroup: 'Grundschulen',
      fundingQuota: '90%',
      detailedCriteria: [],
      submissionMethod: 'Online',
      requiredDocuments: [],
      fundingPeriod: '24 Monate',
    },
    {
      id: '2',
      title: 'Startchancen-Programm',
      provider: 'Kultusministerium',
      budget: '10.000€',
      deadline: 'Laufend',
      focus: 'Soziale Förderung',
      description: 'Unterstützung für Schulen in benachteiligten Gebieten',
      requirements: 'Sozialindex >= 4',
      region: ['DE-NW'],
      targetGroup: 'Grundschulen',
      fundingQuota: '100%',
      detailedCriteria: [],
      submissionMethod: 'Postalisch',
      requiredDocuments: [],
      fundingPeriod: '12 Monate',
    },
    {
      id: '3',
      title: 'Musikförderung Bayern',
      provider: 'Bayerisches Kulturministerium',
      budget: '2.500€',
      deadline: '30.06.2025',
      focus: 'Musik und Kunst',
      description: 'Förderung musikalischer Bildung',
      requirements: 'Musikkonzept',
      region: ['DE-BY'],
      targetGroup: 'Grundschulen',
      fundingQuota: '75%',
      detailedCriteria: [],
      submissionMethod: 'Online',
      requiredDocuments: [],
      fundingPeriod: 'Schuljahr',
    },
  ];

  it('should return all programs for empty query', () => {
    expect(filterProgramsByQuery(programs, '')).toEqual(programs);
  });

  it('should return all programs for whitespace-only query', () => {
    expect(filterProgramsByQuery(programs, '   ')).toEqual(programs);
  });

  it('should filter by title', () => {
    const result = filterProgramsByQuery(programs, 'DigitalPakt');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter by provider', () => {
    const result = filterProgramsByQuery(programs, 'BMBF');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter by description', () => {
    const result = filterProgramsByQuery(programs, 'musikalischer');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('3');
  });

  it('should filter by focus area', () => {
    const result = filterProgramsByQuery(programs, 'Digitalisierung');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should be case-insensitive', () => {
    const result = filterProgramsByQuery(programs, 'digitalpakt');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should return multiple matches', () => {
    const result = filterProgramsByQuery(programs, 'förderung');
    expect(result).toHaveLength(2);
  });

  it('should return empty array for no matches', () => {
    const result = filterProgramsByQuery(programs, 'nonexistent');
    expect(result).toHaveLength(0);
  });

  it('should handle partial matches', () => {
    const result = filterProgramsByQuery(programs, 'schul');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================
// getDaysUntilDeadline Tests
// ============================================
describe('getDaysUntilDeadline', () => {
  it('should return null for ongoing programs (Laufend)', () => {
    expect(getDaysUntilDeadline('Laufend')).toBeNull();
  });

  it('should calculate days correctly for future deadline', () => {
    const fromDate = new Date(2025, 0, 1); // Jan 1, 2025
    const result = getDaysUntilDeadline('10.01.2025', fromDate);
    expect(result).toBe(9);
  });

  it('should return 0 for today', () => {
    const fromDate = new Date(2025, 5, 15); // June 15, 2025
    const result = getDaysUntilDeadline('15.06.2025', fromDate);
    expect(result).toBe(0);
  });

  it('should return negative for past deadline', () => {
    const fromDate = new Date(2025, 0, 15); // Jan 15, 2025
    const result = getDaysUntilDeadline('10.01.2025', fromDate);
    expect(result).toBeLessThan(0);
  });

  it('should return null for invalid date', () => {
    expect(getDaysUntilDeadline('invalid')).toBeNull();
  });
});

// ============================================
// formatBudget Tests
// ============================================
describe('formatBudget', () => {
  it('should format millions with Mio suffix', () => {
    const result = formatBudget(1000000);
    expect(result).toContain('Mio');
    expect(result).toContain('€');
  });

  it('should format 1.5 million correctly', () => {
    const result = formatBudget(1500000);
    expect(result).toContain('1,5');
    expect(result).toContain('Mio');
  });

  it('should format thousands with German locale', () => {
    const result = formatBudget(5000);
    expect(result).toContain('5.000');
    expect(result).toContain('€');
  });

  it('should format small numbers without thousands separator', () => {
    const result = formatBudget(500);
    expect(result).toBe('500 €');
  });

  it('should format zero', () => {
    const result = formatBudget(0);
    expect(result).toBe('0 €');
  });

  it('should format 10 million', () => {
    const result = formatBudget(10000000);
    expect(result).toContain('10');
    expect(result).toContain('Mio');
  });
});

// ============================================
// getStateLabel Tests
// ============================================
describe('getStateLabel', () => {
  it('should return correct label for Bayern', () => {
    expect(getStateLabel('DE-BY')).toBe('Bayern');
  });

  it('should return correct label for Berlin', () => {
    expect(getStateLabel('DE-BE')).toBe('Berlin');
  });

  it('should return Bundesweit for federal code', () => {
    expect(getStateLabel('DE')).toBe('Bundesweit');
  });

  it('should return code for unknown state', () => {
    expect(getStateLabel('XX-YY')).toBe('XX-YY');
  });

  it('should return correct label for all German states', () => {
    GERMAN_STATES.forEach(state => {
      expect(getStateLabel(state.code)).toBe(state.label);
    });
  });
});

// ============================================
// GERMAN_STATES constant Tests
// ============================================
describe('GERMAN_STATES', () => {
  it('should contain 17 entries (16 states + federal)', () => {
    expect(GERMAN_STATES).toHaveLength(17);
  });

  it('should have DE as first entry for federal programs', () => {
    expect(GERMAN_STATES[0].code).toBe('DE');
    expect(GERMAN_STATES[0].label).toBe('Bundesweit');
  });

  it('should have all states with valid DE- prefix codes', () => {
    const stateEntries = GERMAN_STATES.slice(1);
    stateEntries.forEach(state => {
      expect(state.code).toMatch(/^DE-[A-Z]{2}$/);
    });
  });
});
