import { FundingProgram, SchoolProfile } from '../types';

/**
 * Parse a German budget string to a numeric value for comparison.
 * Handles formats like "5.000€", "Max. 5.000€", "10 Mio €", "50 Tsd €"
 *
 * @param budget - Budget string in German format
 * @returns Numeric value of the budget
 */
export const parseBudget = (budget: string): number => {
  // Check for multipliers before cleaning
  const isMillion = budget.toLowerCase().includes('mio') || budget.toLowerCase().includes('million');
  const isThousand = budget.toLowerCase().includes('tsd') || budget.toLowerCase().includes('tausend');

  // Extract numeric portion - handles German format with dots as thousands separators
  // Match patterns like: 5.000 (German thousands), 5000 (plain), 5,5 (German decimal), 10.000,50
  // Order matters: try German format with dots first (must have proper grouping), then plain numbers
  const germanFormat = budget.match(/\d{1,3}(?:\.\d{3})+(?:,\d+)?/); // 5.000 or 10.000,50
  const plainWithDecimal = budget.match(/\d+,\d+/); // 5,5 (German decimal without thousands)
  const plainNumber = budget.match(/\d+/); // 5000

  let numStr: string;

  if (germanFormat) {
    // German format with dots as thousands separators
    numStr = germanFormat[0].replace(/\./g, '').replace(',', '.');
  } else if (plainWithDecimal) {
    // German decimal format without thousands separator
    numStr = plainWithDecimal[0].replace(',', '.');
  } else if (plainNumber) {
    // Plain number
    numStr = plainNumber[0];
  } else {
    return 0;
  }

  const value = parseFloat(numStr);
  if (isNaN(value)) return 0;

  if (isMillion) {
    return value * 1000000;
  }
  if (isThousand) {
    return value * 1000;
  }
  return value;
};

/**
 * Parse a German date string (DD.MM.YYYY) to a Date object.
 * Returns null for ongoing/continuous programs ("Laufend").
 *
 * @param deadline - Deadline string in German date format
 * @returns Date object or null if the program is ongoing
 */
export const parseDeadline = (deadline: string): Date | null => {
  if (deadline.toLowerCase().includes('laufend')) return null;
  const match = deadline.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (match) {
    return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
  }
  return null;
};

/**
 * Validate a school profile for completeness.
 * Returns an array of error messages for missing required fields.
 *
 * @param profile - The school profile to validate
 * @returns Array of validation error messages (empty if valid)
 */
export const validateSchoolProfile = (profile: Partial<SchoolProfile>): string[] => {
  const errors: string[] = [];

  if (!profile.name?.trim()) {
    errors.push('School name is required');
  }

  if (!profile.location?.trim()) {
    errors.push('Location (city) is required');
  }

  if (!profile.state?.trim()) {
    errors.push('State is required');
  }

  if (profile.studentCount === undefined || profile.studentCount <= 0) {
    errors.push('Student count must be greater than 0');
  }

  if (profile.socialIndex !== undefined && (profile.socialIndex < 1 || profile.socialIndex > 5)) {
    errors.push('Social index must be between 1 and 5');
  }

  if (!profile.needsDescription?.trim()) {
    errors.push('Needs description is required');
  }

  if (profile.email && !isValidEmail(profile.email)) {
    errors.push('Invalid email format');
  }

  return errors;
};

/**
 * Validate an email address format.
 *
 * @param email - Email address to validate
 * @returns True if the email format is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a funding program is available in a specific German state.
 *
 * @param program - The funding program to check
 * @param stateCode - ISO code of the state (e.g., "DE-BY" for Bavaria)
 * @returns True if the program is available in the state
 */
export const isProgramAvailableInState = (program: FundingProgram, stateCode: string): boolean => {
  // Federal programs (DE) are available everywhere
  if (program.region.includes('DE')) {
    return true;
  }
  // Check if the specific state is in the program's region list
  return program.region.includes(stateCode);
};

/**
 * Filter programs by search query.
 * Searches across title, provider, description, and focus areas.
 *
 * @param programs - Array of funding programs to search
 * @param query - Search query string
 * @returns Filtered array of matching programs
 */
export const filterProgramsByQuery = (programs: FundingProgram[], query: string): FundingProgram[] => {
  if (!query.trim()) return programs;

  const normalizedQuery = query.toLowerCase().trim();

  return programs.filter(p =>
    p.title.toLowerCase().includes(normalizedQuery) ||
    p.provider.toLowerCase().includes(normalizedQuery) ||
    p.description.toLowerCase().includes(normalizedQuery) ||
    p.focus.toLowerCase().includes(normalizedQuery)
  );
};

/**
 * Calculate days remaining until a deadline.
 *
 * @param deadline - Deadline string in German date format
 * @param fromDate - Reference date (defaults to current date)
 * @returns Number of days remaining, or null for ongoing programs
 */
export const getDaysUntilDeadline = (deadline: string, fromDate: Date = new Date()): number | null => {
  const deadlineDate = parseDeadline(deadline);
  if (!deadlineDate) return null;

  const diffTime = deadlineDate.getTime() - fromDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format a budget value to a human-readable German format.
 *
 * @param value - Numeric budget value
 * @returns Formatted string (e.g., "5.000 €", "1,5 Mio €")
 */
export const formatBudget = (value: number): string => {
  if (value >= 1000000) {
    const millions = value / 1000000;
    return `${millions.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Mio €`;
  }
  if (value >= 1000) {
    return `${value.toLocaleString('de-DE')} €`;
  }
  return `${value} €`;
};

/**
 * German state codes mapping for display purposes.
 */
export const GERMAN_STATES: ReadonlyArray<{ code: string; label: string }> = [
  { code: 'DE', label: 'Bundesweit' },
  { code: 'DE-BW', label: 'Baden-Württemberg' },
  { code: 'DE-BY', label: 'Bayern' },
  { code: 'DE-BE', label: 'Berlin' },
  { code: 'DE-BB', label: 'Brandenburg' },
  { code: 'DE-HB', label: 'Bremen' },
  { code: 'DE-HH', label: 'Hamburg' },
  { code: 'DE-HE', label: 'Hessen' },
  { code: 'DE-MV', label: 'Mecklenburg-Vorpommern' },
  { code: 'DE-NI', label: 'Niedersachsen' },
  { code: 'DE-NW', label: 'Nordrhein-Westfalen' },
  { code: 'DE-RP', label: 'Rheinland-Pfalz' },
  { code: 'DE-SL', label: 'Saarland' },
  { code: 'DE-SN', label: 'Sachsen' },
  { code: 'DE-ST', label: 'Sachsen-Anhalt' },
  { code: 'DE-SH', label: 'Schleswig-Holstein' },
  { code: 'DE-TH', label: 'Thüringen' },
] as const;

/**
 * Get the display label for a German state code.
 *
 * @param code - ISO state code (e.g., "DE-BY")
 * @returns Display label (e.g., "Bayern") or the code if not found
 */
export const getStateLabel = (code: string): string => {
  const state = GERMAN_STATES.find(s => s.code === code);
  return state?.label ?? code;
};
