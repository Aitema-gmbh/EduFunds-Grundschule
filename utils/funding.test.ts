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

describe('parseBudget', () => {
  it('should parse simple numeric values', () => {
    expect(parseBudget('5000')).toBe(5000);
    expect(parseBudget('100')).toBe(100);
  });

  it('should parse values with Euro symbol', () => {
    expect(parseBudget('5000€')).toBe(5000);
    expect(parseBudget('5.000 €')).toBe(5000);
  });

  it('should parse values with German thousands separator', () => {
    expect(parseBudget('5.000')).toBe(5000);
    expect(parseBudget('10.000€')).toBe(10000);
    expect(parseBudget('100.000 €')).toBe(100000);
  });

  it('should parse values with comma as decimal separator', () => {
    expect(parseBudget('5,5')).toBe(5.5);
    expect(parseBudget('1,5 Mio €')).toBe(1500000);
  });

  it('should handle million abbreviations', () => {
    expect(parseBudget('1 Mio €')).toBe(1000000);
    expect(parseBudget('2,5 Mio')).toBe(2500000);
    expect(parseBudget('10 Million')).toBe(10000000);
  });

  it('should handle thousand abbreviations', () => {
    expect(parseBudget('50 Tsd €')).toBe(50000);
    expect(parseBudget('100 Tausend')).toBe(100000);
  });

  it('should handle Max. prefix', () => {
    expect(parseBudget('Max. 5.000€')).toBe(5000);
    expect(parseBudget('Max. 10.000 €')).toBe(10000);
  });

  it('should return 0 for non-numeric strings', () => {
    expect(parseBudget('')).toBe(0);
    expect(parseBudget('Ausstattung')).toBe(0);
    expect(parseBudget('N/A')).toBe(0);
  });

  it('should handle complex budget descriptions', () => {
    expect(parseBudget('Investiv & Chancenbudget')).toBe(0);
    expect(parseBudget('Personalmittel Musikschule')).toBe(0);
  });
});

describe('parseDeadline', () => {
  it('should parse German date format DD.MM.YYYY', () => {
    const result = parseDeadline('31.03.2026');
    expect(result).toBeInstanceOf(Date);
    expect(result?.getDate()).toBe(31);
    expect(result?.getMonth()).toBe(2); // March is 0-indexed
    expect(result?.getFullYear()).toBe(2026);
  });

  it('should parse dates with single digit day/month', () => {
    const result = parseDeadline('1.1.2026');
    expect(result?.getDate()).toBe(1);
    expect(result?.getMonth()).toBe(0);
    expect(result?.getFullYear()).toBe(2026);
  });

  it('should return null for ongoing programs', () => {
    expect(parseDeadline('Laufend')).toBeNull();
    expect(parseDeadline('Laufend 2026')).toBeNull();
    expect(parseDeadline('laufend')).toBeNull();
  });

  it('should return null for invalid date strings', () => {
    expect(parseDeadline('')).toBeNull();
    expect(parseDeadline('Soon')).toBeNull();
    expect(parseDeadline('2026')).toBeNull();
  });

  it('should extract date from complex deadline strings', () => {
    const result = parseDeadline('Bewerbung bis 15.06.2026');
    expect(result?.getDate()).toBe(15);
    expect(result?.getMonth()).toBe(5);
    expect(result?.getFullYear()).toBe(2026);
  });
});

describe('validateSchoolProfile', () => {
  const validProfile: SchoolProfile = {
    name: 'Grundschule Musterstadt',
    location: 'München',
    state: 'DE-BY',
    studentCount: 250,
    socialIndex: 3,
    focusAreas: ['MINT', 'Sport'],
    needsDescription: 'We need funding for our new science lab.',
  };

  it('should return empty array for valid profile', () => {
    const errors = validateSchoolProfile(validProfile);
    expect(errors).toEqual([]);
  });

  it('should require school name', () => {
    const errors = validateSchoolProfile({ ...validProfile, name: '' });
    expect(errors).toContain('School name is required');
  });

  it('should require location', () => {
    const errors = validateSchoolProfile({ ...validProfile, location: '' });
    expect(errors).toContain('Location (city) is required');
  });

  it('should require state', () => {
    const errors = validateSchoolProfile({ ...validProfile, state: '' });
    expect(errors).toContain('State is required');
  });

  it('should require positive student count', () => {
    const errors = validateSchoolProfile({ ...validProfile, studentCount: 0 });
    expect(errors).toContain('Student count must be greater than 0');

    const errors2 = validateSchoolProfile({ ...validProfile, studentCount: -10 });
    expect(errors2).toContain('Student count must be greater than 0');
  });

  it('should validate social index range', () => {
    const errors = validateSchoolProfile({ ...validProfile, socialIndex: 0 });
    expect(errors).toContain('Social index must be between 1 and 5');

    const errors2 = validateSchoolProfile({ ...validProfile, socialIndex: 6 });
    expect(errors2).toContain('Social index must be between 1 and 5');
  });

  it('should require needs description', () => {
    const errors = validateSchoolProfile({ ...validProfile, needsDescription: '' });
    expect(errors).toContain('Needs description is required');
  });

  it('should validate email format when provided', () => {
    const errors = validateSchoolProfile({ ...validProfile, email: 'invalid-email' });
    expect(errors).toContain('Invalid email format');

    const errors2 = validateSchoolProfile({ ...validProfile, email: 'valid@school.de' });
    expect(errors2).not.toContain('Invalid email format');
  });

  it('should return multiple errors for multiple issues', () => {
    const errors = validateSchoolProfile({ name: '', location: '' });
    expect(errors.length).toBeGreaterThan(1);
    expect(errors).toContain('School name is required');
    expect(errors).toContain('Location (city) is required');
  });
});

describe('isValidEmail', () => {
  it('should accept valid email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@school.de')).toBe(true);
    expect(isValidEmail('admin@sub.domain.org')).toBe(true);
  });

  it('should reject invalid email formats', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('no@domain')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });
});

describe('isProgramAvailableInState', () => {
  const federalProgram: FundingProgram = {
    id: 'federal-1',
    title: 'Federal Program',
    provider: 'Bund',
    budget: '10.000€',
    deadline: '31.12.2026',
    focus: 'Education',
    description: 'A federal program',
    requirements: 'None',
    region: ['DE'],
    targetGroup: 'All',
    fundingQuota: '100%',
    detailedCriteria: [],
    submissionMethod: 'Online',
    requiredDocuments: [],
    fundingPeriod: '1 year',
  };

  const bavariaProgram: FundingProgram = {
    ...federalProgram,
    id: 'bavaria-1',
    title: 'Bavaria Program',
    region: ['DE-BY'],
  };

  const multiStateProgram: FundingProgram = {
    ...federalProgram,
    id: 'multi-1',
    title: 'Multi-State Program',
    region: ['DE-BY', 'DE-BW'],
  };

  it('should return true for federal programs in any state', () => {
    expect(isProgramAvailableInState(federalProgram, 'DE-BY')).toBe(true);
    expect(isProgramAvailableInState(federalProgram, 'DE-NW')).toBe(true);
    expect(isProgramAvailableInState(federalProgram, 'DE-BE')).toBe(true);
  });

  it('should return true for state-specific programs in matching state', () => {
    expect(isProgramAvailableInState(bavariaProgram, 'DE-BY')).toBe(true);
  });

  it('should return false for state-specific programs in non-matching state', () => {
    expect(isProgramAvailableInState(bavariaProgram, 'DE-NW')).toBe(false);
    expect(isProgramAvailableInState(bavariaProgram, 'DE-BE')).toBe(false);
  });

  it('should work with multi-state programs', () => {
    expect(isProgramAvailableInState(multiStateProgram, 'DE-BY')).toBe(true);
    expect(isProgramAvailableInState(multiStateProgram, 'DE-BW')).toBe(true);
    expect(isProgramAvailableInState(multiStateProgram, 'DE-NW')).toBe(false);
  });
});

describe('filterProgramsByQuery', () => {
  const programs: FundingProgram[] = [
    {
      id: '1',
      title: 'Leseförderung Grundschule',
      provider: 'Stiftung Lesen',
      budget: '5.000€',
      deadline: '31.12.2026',
      focus: 'Sprachförderung',
      description: 'Förderung der Lesekompetenz',
      requirements: '',
      region: ['DE'],
      targetGroup: 'All',
      fundingQuota: '100%',
      detailedCriteria: [],
      submissionMethod: 'Online',
      requiredDocuments: [],
      fundingPeriod: '1 year',
    },
    {
      id: '2',
      title: 'MINT-Programm',
      provider: 'Telekom Stiftung',
      budget: '10.000€',
      deadline: '31.12.2026',
      focus: 'MINT',
      description: 'Förderung von Naturwissenschaften',
      requirements: '',
      region: ['DE'],
      targetGroup: 'All',
      fundingQuota: '100%',
      detailedCriteria: [],
      submissionMethod: 'Online',
      requiredDocuments: [],
      fundingPeriod: '1 year',
    },
  ];

  it('should return all programs for empty query', () => {
    expect(filterProgramsByQuery(programs, '')).toEqual(programs);
    expect(filterProgramsByQuery(programs, '   ')).toEqual(programs);
  });

  it('should filter by title', () => {
    const result = filterProgramsByQuery(programs, 'Lese');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should filter by provider', () => {
    const result = filterProgramsByQuery(programs, 'Telekom');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should filter by focus area', () => {
    const result = filterProgramsByQuery(programs, 'MINT');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('should filter by description', () => {
    const result = filterProgramsByQuery(programs, 'Lesekompetenz');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should be case-insensitive', () => {
    const result = filterProgramsByQuery(programs, 'LESEFÖRDERUNG');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('should return empty array when no matches', () => {
    const result = filterProgramsByQuery(programs, 'Sport');
    expect(result).toHaveLength(0);
  });
});

describe('getDaysUntilDeadline', () => {
  it('should calculate days until deadline', () => {
    const referenceDate = new Date(2026, 0, 1); // Jan 1, 2026
    const result = getDaysUntilDeadline('31.01.2026', referenceDate);
    expect(result).toBe(30);
  });

  it('should return negative for past deadlines', () => {
    const referenceDate = new Date(2026, 1, 15); // Feb 15, 2026
    const result = getDaysUntilDeadline('31.01.2026', referenceDate);
    expect(result).toBeLessThan(0);
  });

  it('should return null for ongoing programs', () => {
    const result = getDaysUntilDeadline('Laufend');
    expect(result).toBeNull();
  });

  it('should return 0 for same day deadline', () => {
    const referenceDate = new Date(2026, 0, 31); // Jan 31, 2026
    const result = getDaysUntilDeadline('31.01.2026', referenceDate);
    expect(result).toBe(0);
  });
});

describe('formatBudget', () => {
  it('should format small values', () => {
    expect(formatBudget(500)).toBe('500 €');
    expect(formatBudget(999)).toBe('999 €');
  });

  it('should format thousands with German locale', () => {
    const result = formatBudget(5000);
    expect(result).toMatch(/5[.,]?000.*€/);
  });

  it('should format millions', () => {
    const result = formatBudget(1000000);
    expect(result).toMatch(/1.*Mio.*€/);
  });

  it('should format 1.5 million', () => {
    const result = formatBudget(1500000);
    expect(result).toMatch(/1[,.]5.*Mio.*€/);
  });
});

describe('getStateLabel', () => {
  it('should return correct label for known states', () => {
    expect(getStateLabel('DE')).toBe('Bundesweit');
    expect(getStateLabel('DE-BY')).toBe('Bayern');
    expect(getStateLabel('DE-NW')).toBe('Nordrhein-Westfalen');
    expect(getStateLabel('DE-BE')).toBe('Berlin');
  });

  it('should return code for unknown states', () => {
    expect(getStateLabel('DE-XX')).toBe('DE-XX');
    expect(getStateLabel('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('GERMAN_STATES', () => {
  it('should contain all 16 German states plus federal', () => {
    expect(GERMAN_STATES).toHaveLength(17);
  });

  it('should have unique codes', () => {
    const codes = GERMAN_STATES.map(s => s.code);
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBe(codes.length);
  });

  it('should have DE (Bundesweit) as first entry', () => {
    expect(GERMAN_STATES[0].code).toBe('DE');
    expect(GERMAN_STATES[0].label).toBe('Bundesweit');
  });
});
