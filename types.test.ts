import { describe, it, expect } from 'vitest';
import { ViewState, SchoolProfile, FundingProgram, MatchResult, GeneratedApplication, NotificationPreferences, ScheduledReminder } from './types';

// ============================================
// Type Guard Utility Functions
// ============================================

/**
 * Type guard to check if an object is a valid SchoolProfile.
 */
export const isValidSchoolProfile = (obj: unknown): obj is SchoolProfile => {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;
  
  return (
    typeof p.name === 'string' &&
    typeof p.location === 'string' &&
    typeof p.state === 'string' &&
    typeof p.studentCount === 'number' &&
    typeof p.socialIndex === 'number' &&
    Array.isArray(p.focusAreas) &&
    typeof p.needsDescription === 'string'
  );
};

/**
 * Type guard to check if an object is a valid FundingProgram.
 */
export const isValidFundingProgram = (obj: unknown): obj is FundingProgram => {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;
  
  return (
    typeof p.id === 'string' &&
    typeof p.title === 'string' &&
    typeof p.provider === 'string' &&
    typeof p.budget === 'string' &&
    typeof p.deadline === 'string' &&
    typeof p.focus === 'string' &&
    typeof p.description === 'string' &&
    typeof p.requirements === 'string' &&
    Array.isArray(p.region)
  );
};

/**
 * Type guard to check if an object is a valid MatchResult.
 */
export const isValidMatchResult = (obj: unknown): obj is MatchResult => {
  if (typeof obj !== 'object' || obj === null) return false;
  const m = obj as Record<string, unknown>;
  
  return (
    typeof m.programId === 'string' &&
    typeof m.score === 'number' &&
    m.score >= 0 &&
    m.score <= 100 &&
    typeof m.reasoning === 'string'
  );
};

/**
 * Type guard to check if a value is a valid ViewState.
 */
export const isValidViewState = (value: unknown): value is ViewState => {
  return typeof value === 'string' && Object.values(ViewState).includes(value as ViewState);
};

/**
 * Type guard to check if an object is a valid ScheduledReminder.
 */
export const isValidScheduledReminder = (obj: unknown): obj is ScheduledReminder => {
  if (typeof obj !== 'object' || obj === null) return false;
  const r = obj as Record<string, unknown>;
  
  return (
    typeof r.programId === 'string' &&
    typeof r.programTitle === 'string' &&
    typeof r.deadline === 'string' &&
    (r.reminderType === 'seven_days' || r.reminderType === 'one_day') &&
    typeof r.scheduledDate === 'string' &&
    typeof r.sent === 'boolean'
  );
};

// ============================================
// ViewState Enum Tests
// ============================================
describe('ViewState enum', () => {
  it('should have all expected view states', () => {
    expect(ViewState.LANDING).toBe('LANDING');
    expect(ViewState.LOGIN).toBe('LOGIN');
    expect(ViewState.DASHBOARD).toBe('DASHBOARD');
    expect(ViewState.PROFILE).toBe('PROFILE');
    expect(ViewState.MATCHING).toBe('MATCHING');
    expect(ViewState.WRITER).toBe('WRITER');
    expect(ViewState.RESULT).toBe('RESULT');
    expect(ViewState.NOTIFICATIONS).toBe('NOTIFICATIONS');
    expect(ViewState.ANALYTICS).toBe('ANALYTICS');
    expect(ViewState.SETTINGS).toBe('SETTINGS');
  });

  it('should have exactly 10 view states', () => {
    const stateValues = Object.values(ViewState);
    expect(stateValues).toHaveLength(10);
  });

  it('should have unique values for each state', () => {
    const stateValues = Object.values(ViewState);
    const uniqueValues = new Set(stateValues);
    expect(uniqueValues.size).toBe(stateValues.length);
  });
});

// ============================================
// isValidViewState Type Guard Tests
// ============================================
describe('isValidViewState', () => {
  it('should return true for valid ViewState values', () => {
    expect(isValidViewState('LANDING')).toBe(true);
    expect(isValidViewState('LOGIN')).toBe(true);
    expect(isValidViewState('DASHBOARD')).toBe(true);
    expect(isValidViewState('PROFILE')).toBe(true);
    expect(isValidViewState('SETTINGS')).toBe(true);
  });

  it('should return false for invalid string values', () => {
    expect(isValidViewState('INVALID')).toBe(false);
    expect(isValidViewState('landing')).toBe(false); // lowercase
    expect(isValidViewState('')).toBe(false);
    expect(isValidViewState('HOME')).toBe(false);
  });

  it('should return false for non-string values', () => {
    expect(isValidViewState(null)).toBe(false);
    expect(isValidViewState(undefined)).toBe(false);
    expect(isValidViewState(123)).toBe(false);
    expect(isValidViewState({})).toBe(false);
    expect(isValidViewState([])).toBe(false);
  });
});

// ============================================
// isValidSchoolProfile Type Guard Tests
// ============================================
describe('isValidSchoolProfile', () => {
  const validProfile: SchoolProfile = {
    name: 'Test Grundschule',
    location: 'Berlin',
    state: 'DE-BE',
    studentCount: 250,
    socialIndex: 3,
    focusAreas: ['MINT', 'Musik'],
    needsDescription: 'We need new computers for our computer lab.',
  };

  it('should return true for valid SchoolProfile', () => {
    expect(isValidSchoolProfile(validProfile)).toBe(true);
  });

  it('should return true for profile with optional fields', () => {
    const profileWithOptional = {
      ...validProfile,
      website: 'https://school.de',
      email: 'contact@school.de',
      teacherCount: 20,
      awards: ['Schule ohne Rassismus'],
      partners: ['Musikschule XY'],
    };
    expect(isValidSchoolProfile(profileWithOptional)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidSchoolProfile(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidSchoolProfile(undefined)).toBe(false);
  });

  it('should return false for non-object types', () => {
    expect(isValidSchoolProfile('string')).toBe(false);
    expect(isValidSchoolProfile(123)).toBe(false);
    expect(isValidSchoolProfile([])).toBe(false);
  });

  it('should return false for missing required fields', () => {
    expect(isValidSchoolProfile({ name: 'Test' })).toBe(false);
    expect(isValidSchoolProfile({ ...validProfile, name: undefined })).toBe(false);
    expect(isValidSchoolProfile({ ...validProfile, location: undefined })).toBe(false);
    expect(isValidSchoolProfile({ ...validProfile, state: undefined })).toBe(false);
    expect(isValidSchoolProfile({ ...validProfile, studentCount: undefined })).toBe(false);
  });

  it('should return false for wrong field types', () => {
    expect(isValidSchoolProfile({ ...validProfile, name: 123 })).toBe(false);
    expect(isValidSchoolProfile({ ...validProfile, studentCount: '250' })).toBe(false);
    expect(isValidSchoolProfile({ ...validProfile, focusAreas: 'MINT' })).toBe(false);
    expect(isValidSchoolProfile({ ...validProfile, socialIndex: '3' })).toBe(false);
  });
});

// ============================================
// isValidFundingProgram Type Guard Tests
// ============================================
describe('isValidFundingProgram', () => {
  const validProgram: FundingProgram = {
    id: '1',
    title: 'DigitalPakt Schule',
    provider: 'BMBF',
    budget: '5.000.000€',
    deadline: '31.12.2025',
    focus: 'Digitalisierung',
    description: 'Förderprogramm für digitale Infrastruktur',
    requirements: 'Medienkonzept erforderlich',
    region: ['DE'],
    targetGroup: 'Grundschulen',
    fundingQuota: '90%',
    detailedCriteria: ['Nachweis pädagogisches Konzept'],
    submissionMethod: 'Online',
    requiredDocuments: ['Schulkonferenzbeschluss'],
    fundingPeriod: '24 Monate',
  };

  it('should return true for valid FundingProgram', () => {
    expect(isValidFundingProgram(validProgram)).toBe(true);
  });

  it('should return true for program with optional fields', () => {
    const programWithOptional = {
      ...validProgram,
      officialLink: 'https://example.com',
      address: 'Heinemannstraße 2, 53175 Bonn',
    };
    expect(isValidFundingProgram(programWithOptional)).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidFundingProgram(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidFundingProgram(undefined)).toBe(false);
  });

  it('should return false for missing required fields', () => {
    expect(isValidFundingProgram({ id: '1' })).toBe(false);
    expect(isValidFundingProgram({ ...validProgram, id: undefined })).toBe(false);
    expect(isValidFundingProgram({ ...validProgram, title: undefined })).toBe(false);
    expect(isValidFundingProgram({ ...validProgram, region: undefined })).toBe(false);
  });

  it('should return false for wrong field types', () => {
    expect(isValidFundingProgram({ ...validProgram, id: 123 })).toBe(false);
    expect(isValidFundingProgram({ ...validProgram, region: 'DE' })).toBe(false);
    expect(isValidFundingProgram({ ...validProgram, budget: 5000 })).toBe(false);
  });
});

// ============================================
// isValidMatchResult Type Guard Tests
// ============================================
describe('isValidMatchResult', () => {
  const validMatchResult: MatchResult = {
    programId: 'prog-1',
    score: 85,
    reasoning: 'Strong match due to digital focus alignment',
  };

  it('should return true for valid MatchResult', () => {
    expect(isValidMatchResult(validMatchResult)).toBe(true);
  });

  it('should return true for MatchResult with optional tags', () => {
    const resultWithTags = {
      ...validMatchResult,
      tags: ['digital', 'high-priority'],
    };
    expect(isValidMatchResult(resultWithTags)).toBe(true);
  });

  it('should return true for edge case scores', () => {
    expect(isValidMatchResult({ ...validMatchResult, score: 0 })).toBe(true);
    expect(isValidMatchResult({ ...validMatchResult, score: 100 })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidMatchResult(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidMatchResult(undefined)).toBe(false);
  });

  it('should return false for invalid score range', () => {
    expect(isValidMatchResult({ ...validMatchResult, score: -1 })).toBe(false);
    expect(isValidMatchResult({ ...validMatchResult, score: 101 })).toBe(false);
    expect(isValidMatchResult({ ...validMatchResult, score: 150 })).toBe(false);
  });

  it('should return false for missing required fields', () => {
    expect(isValidMatchResult({ programId: '1', score: 50 })).toBe(false);
    expect(isValidMatchResult({ programId: '1', reasoning: 'test' })).toBe(false);
  });

  it('should return false for wrong field types', () => {
    expect(isValidMatchResult({ ...validMatchResult, score: '85' })).toBe(false);
    expect(isValidMatchResult({ ...validMatchResult, programId: 123 })).toBe(false);
  });
});

// ============================================
// isValidScheduledReminder Type Guard Tests
// ============================================
describe('isValidScheduledReminder', () => {
  const validReminder: ScheduledReminder = {
    programId: 'prog-1',
    programTitle: 'DigitalPakt Schule',
    deadline: '31.12.2025',
    reminderType: 'seven_days',
    scheduledDate: '24.12.2025',
    sent: false,
  };

  it('should return true for valid ScheduledReminder', () => {
    expect(isValidScheduledReminder(validReminder)).toBe(true);
  });

  it('should return true for both reminder types', () => {
    expect(isValidScheduledReminder({ ...validReminder, reminderType: 'seven_days' })).toBe(true);
    expect(isValidScheduledReminder({ ...validReminder, reminderType: 'one_day' })).toBe(true);
  });

  it('should return true for sent reminders', () => {
    expect(isValidScheduledReminder({ ...validReminder, sent: true })).toBe(true);
  });

  it('should return false for null', () => {
    expect(isValidScheduledReminder(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isValidScheduledReminder(undefined)).toBe(false);
  });

  it('should return false for invalid reminder type', () => {
    expect(isValidScheduledReminder({ ...validReminder, reminderType: 'invalid' })).toBe(false);
    expect(isValidScheduledReminder({ ...validReminder, reminderType: 'three_days' })).toBe(false);
    expect(isValidScheduledReminder({ ...validReminder, reminderType: '' })).toBe(false);
  });

  it('should return false for missing required fields', () => {
    expect(isValidScheduledReminder({ programId: '1' })).toBe(false);
    expect(isValidScheduledReminder({ ...validReminder, programId: undefined })).toBe(false);
    expect(isValidScheduledReminder({ ...validReminder, sent: undefined })).toBe(false);
  });

  it('should return false for wrong field types', () => {
    expect(isValidScheduledReminder({ ...validReminder, sent: 'false' })).toBe(false);
    expect(isValidScheduledReminder({ ...validReminder, programId: 123 })).toBe(false);
  });
});

// ============================================
// SchoolProfile Interface Tests
// ============================================
describe('SchoolProfile interface structure', () => {
  it('should allow creation of minimal valid profile', () => {
    const profile: SchoolProfile = {
      name: 'Test School',
      location: 'Berlin',
      state: 'DE-BE',
      studentCount: 100,
      socialIndex: 1,
      focusAreas: [],
      needsDescription: 'Test needs',
    };
    
    expect(profile.name).toBe('Test School');
    expect(profile.focusAreas).toEqual([]);
  });

  it('should allow empty arrays for focusAreas, awards, and partners', () => {
    const profile: SchoolProfile = {
      name: 'Test School',
      location: 'Berlin',
      state: 'DE-BE',
      studentCount: 100,
      socialIndex: 1,
      focusAreas: [],
      needsDescription: 'Test needs',
      awards: [],
      partners: [],
    };
    
    expect(Array.isArray(profile.focusAreas)).toBe(true);
    expect(Array.isArray(profile.awards)).toBe(true);
    expect(Array.isArray(profile.partners)).toBe(true);
  });

  it('should support all 16 German state codes plus federal', () => {
    const validStateCodes = [
      'DE', 'DE-BW', 'DE-BY', 'DE-BE', 'DE-BB', 'DE-HB', 'DE-HH',
      'DE-HE', 'DE-MV', 'DE-NI', 'DE-NW', 'DE-RP', 'DE-SL',
      'DE-SN', 'DE-ST', 'DE-SH', 'DE-TH'
    ];
    
    validStateCodes.forEach(stateCode => {
      const profile: SchoolProfile = {
        name: 'Test School',
        location: 'Test City',
        state: stateCode,
        studentCount: 100,
        socialIndex: 3,
        focusAreas: [],
        needsDescription: 'Test needs',
      };
      
      expect(profile.state).toBe(stateCode);
    });
  });

  it('should support social index values 1-5', () => {
    [1, 2, 3, 4, 5].forEach(index => {
      const profile: SchoolProfile = {
        name: 'Test School',
        location: 'Berlin',
        state: 'DE-BE',
        studentCount: 100,
        socialIndex: index,
        focusAreas: [],
        needsDescription: 'Test needs',
      };
      
      expect(profile.socialIndex).toBe(index);
      expect(profile.socialIndex).toBeGreaterThanOrEqual(1);
      expect(profile.socialIndex).toBeLessThanOrEqual(5);
    });
  });
});

// ============================================
// FundingProgram Interface Tests
// ============================================
describe('FundingProgram interface structure', () => {
  it('should require all core fields', () => {
    const program: FundingProgram = {
      id: 'test-1',
      title: 'Test Program',
      provider: 'Test Provider',
      budget: '10.000€',
      deadline: 'Laufend',
      focus: 'Test Focus',
      description: 'Test description',
      requirements: 'Test requirements',
      region: ['DE'],
      targetGroup: 'Grundschulen',
      fundingQuota: '80%',
      detailedCriteria: [],
      submissionMethod: 'Online',
      requiredDocuments: [],
      fundingPeriod: '12 Monate',
    };
    
    expect(program.id).toBe('test-1');
    expect(program.region).toContain('DE');
  });

  it('should support multiple regions', () => {
    const program: FundingProgram = {
      id: 'test-1',
      title: 'Multi-Region Program',
      provider: 'Provider',
      budget: '5.000€',
      deadline: '31.12.2025',
      focus: 'Focus',
      description: 'Description',
      requirements: 'Requirements',
      region: ['DE-BY', 'DE-BW', 'DE-NW'],
      targetGroup: 'Grundschulen',
      fundingQuota: '75%',
      detailedCriteria: [],
      submissionMethod: 'Postalisch',
      requiredDocuments: [],
      fundingPeriod: 'Schuljahr',
    };
    
    expect(program.region).toHaveLength(3);
    expect(program.region).toContain('DE-BY');
    expect(program.region).toContain('DE-BW');
    expect(program.region).toContain('DE-NW');
  });

  it('should support optional fields', () => {
    const program: FundingProgram = {
      id: 'test-1',
      title: 'Test Program',
      provider: 'Provider',
      budget: '10.000€',
      deadline: '31.12.2025',
      focus: 'Focus',
      description: 'Description',
      requirements: 'Requirements',
      region: ['DE'],
      targetGroup: 'Grundschulen',
      fundingQuota: '80%',
      detailedCriteria: ['Criterion 1', 'Criterion 2'],
      submissionMethod: 'Online',
      requiredDocuments: ['Document 1'],
      fundingPeriod: '24 Monate',
      officialLink: 'https://example.com/program',
      address: 'Test Address 123',
    };
    
    expect(program.officialLink).toBe('https://example.com/program');
    expect(program.address).toBe('Test Address 123');
  });
});

// ============================================
// NotificationPreferences Interface Tests
// ============================================
describe('NotificationPreferences interface structure', () => {
  it('should support all notification options', () => {
    const prefs: NotificationPreferences = {
      email: 'user@example.com',
      enabled: true,
      reminders: {
        sevenDays: true,
        oneDay: true,
      },
      subscribedPrograms: ['prog-1', 'prog-2'],
    };
    
    expect(prefs.enabled).toBe(true);
    expect(prefs.reminders.sevenDays).toBe(true);
    expect(prefs.reminders.oneDay).toBe(true);
    expect(prefs.subscribedPrograms).toHaveLength(2);
  });

  it('should support disabled notifications', () => {
    const prefs: NotificationPreferences = {
      email: '',
      enabled: false,
      reminders: {
        sevenDays: false,
        oneDay: false,
      },
      subscribedPrograms: [],
    };
    
    expect(prefs.enabled).toBe(false);
    expect(prefs.subscribedPrograms).toHaveLength(0);
  });
});

// ============================================
// GeneratedApplication Interface Tests
// ============================================
describe('GeneratedApplication interface structure', () => {
  it('should contain all required fields', () => {
    const application: GeneratedApplication = {
      subject: 'Antrag auf Förderung für digitale Ausstattung',
      body: 'Sehr geehrte Damen und Herren...',
      executiveSummary: 'Kurze Zusammenfassung des Antrags',
    };
    
    expect(application.subject).toBeTruthy();
    expect(application.body).toBeTruthy();
    expect(application.executiveSummary).toBeTruthy();
  });

  it('should support multi-line body content', () => {
    const application: GeneratedApplication = {
      subject: 'Test Subject',
      body: `Sehr geehrte Damen und Herren,

wir beantragen hiermit...

Mit freundlichen Grüßen`,
      executiveSummary: 'Summary',
    };
    
    expect(application.body).toContain('\n');
    expect(application.body.split('\n').length).toBeGreaterThan(1);
  });
});
