/**
 * Form Validation Service
 * Provides comprehensive validation utilities for form fields
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Validation rules for different field types
export const validators = {
  /**
   * Validates required fields
   */
  required: (value: string | number | undefined, fieldName: string): ValidationResult => {
    const isEmpty = value === undefined || value === null || value === '' ||
                   (typeof value === 'string' && value.trim() === '');
    return {
      isValid: !isEmpty,
      error: isEmpty ? `${fieldName} ist erforderlich` : undefined
    };
  },

  /**
   * Validates minimum length
   */
  minLength: (value: string, minLen: number, fieldName: string): ValidationResult => {
    const isValid = value.length >= minLen;
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} muss mindestens ${minLen} Zeichen haben`
    };
  },

  /**
   * Validates maximum length
   */
  maxLength: (value: string, maxLen: number, fieldName: string): ValidationResult => {
    const isValid = value.length <= maxLen;
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} darf maximal ${maxLen} Zeichen haben`
    };
  },

  /**
   * Validates email format
   */
  email: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Optional field, empty is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    return {
      isValid,
      error: isValid ? undefined : 'Bitte geben Sie eine gültige E-Mail-Adresse ein'
    };
  },

  /**
   * Validates phone number format (German format)
   */
  phone: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Optional field, empty is valid
    // German phone: +49 or 0 followed by digits, spaces, or hyphens
    const phoneRegex = /^(\+49|0)[0-9\s\-\/]{6,20}$/;
    const isValid = phoneRegex.test(value.replace(/\s/g, ''));
    return {
      isValid,
      error: isValid ? undefined : 'Bitte geben Sie eine gültige Telefonnummer ein'
    };
  },

  /**
   * Validates URL format
   */
  url: (value: string): ValidationResult => {
    if (!value) return { isValid: true }; // Optional field, empty is valid
    try {
      // Allow URLs without protocol prefix
      const urlToTest = value.startsWith('http') ? value : `https://${value}`;
      new URL(urlToTest);
      return { isValid: true };
    } catch {
      return {
        isValid: false,
        error: 'Bitte geben Sie eine gültige Web-Adresse ein'
      };
    }
  },

  /**
   * Validates numeric range
   */
  range: (value: number, min: number, max: number, fieldName: string): ValidationResult => {
    const isValid = value >= min && value <= max;
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} muss zwischen ${min} und ${max} liegen`
    };
  },

  /**
   * Validates positive number
   */
  positiveNumber: (value: number, fieldName: string): ValidationResult => {
    const isValid = value > 0;
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} muss größer als 0 sein`
    };
  },

  /**
   * Validates non-negative number (0 or positive)
   */
  nonNegativeNumber: (value: number, fieldName: string): ValidationResult => {
    const isValid = value >= 0;
    return {
      isValid,
      error: isValid ? undefined : `${fieldName} darf nicht negativ sein`
    };
  }
};

/**
 * Input mask formatters for formatted fields
 */
export const inputMasks = {
  /**
   * Format phone number as user types
   */
  phone: (value: string): string => {
    // Remove all non-digit characters except +
    let cleaned = value.replace(/[^\d+]/g, '');

    // Handle German format
    if (cleaned.startsWith('+49')) {
      cleaned = cleaned.slice(3);
      if (cleaned.length > 0) {
        const parts = [];
        if (cleaned.length > 0) parts.push(cleaned.slice(0, 3));
        if (cleaned.length > 3) parts.push(cleaned.slice(3, 6));
        if (cleaned.length > 6) parts.push(cleaned.slice(6, 10));
        if (cleaned.length > 10) parts.push(cleaned.slice(10));
        return '+49 ' + parts.join(' ');
      }
      return '+49';
    } else if (cleaned.startsWith('0')) {
      const parts = [];
      if (cleaned.length > 0) parts.push(cleaned.slice(0, 4));
      if (cleaned.length > 4) parts.push(cleaned.slice(4, 7));
      if (cleaned.length > 7) parts.push(cleaned.slice(7, 11));
      if (cleaned.length > 11) parts.push(cleaned.slice(11));
      return parts.join(' ');
    }

    return value;
  },

  /**
   * Format date as user types (DD.MM.YYYY)
   */
  date: (value: string): string => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 4)}.${cleaned.slice(4, 8)}`;
  }
};

/**
 * Validates a complete school profile form
 */
export const validateSchoolProfile = (profile: {
  name?: string;
  location?: string;
  state?: string;
  studentCount?: number;
  socialIndex?: number;
  email?: string;
  website?: string;
}): FormErrors => {
  const errors: FormErrors = {};

  // Name validation
  const nameResult = validators.required(profile.name, 'Schulname');
  if (!nameResult.isValid) errors.name = nameResult.error;
  else if (profile.name && profile.name.length < 3) {
    errors.name = 'Schulname muss mindestens 3 Zeichen haben';
  }

  // Location validation
  const locationResult = validators.required(profile.location, 'Standort');
  if (!locationResult.isValid) errors.location = locationResult.error;

  // State validation
  const stateResult = validators.required(profile.state, 'Bundesland');
  if (!stateResult.isValid) errors.state = stateResult.error;

  // Student count validation
  if (profile.studentCount !== undefined) {
    const studentResult = validators.positiveNumber(profile.studentCount, 'Schülerzahl');
    if (!studentResult.isValid) errors.studentCount = studentResult.error;
  }

  // Social index validation
  if (profile.socialIndex !== undefined) {
    const socialResult = validators.range(profile.socialIndex, 1, 5, 'Sozialindex');
    if (!socialResult.isValid) errors.socialIndex = socialResult.error;
  }

  // Email validation (optional)
  if (profile.email) {
    const emailResult = validators.email(profile.email);
    if (!emailResult.isValid) errors.email = emailResult.error;
  }

  // Website validation (optional)
  if (profile.website) {
    const websiteResult = validators.url(profile.website);
    if (!websiteResult.isValid) errors.website = websiteResult.error;
  }

  return errors;
};

/**
 * Validates login form fields
 */
export const validateLoginForm = (name: string, city: string): FormErrors => {
  const errors: FormErrors = {};

  // Name validation
  const nameResult = validators.required(name, 'Schulname');
  if (!nameResult.isValid) {
    errors.name = nameResult.error;
  } else if (name.length < 3) {
    errors.name = 'Schulname muss mindestens 3 Zeichen haben';
  }

  // City validation
  const cityResult = validators.required(city, 'Stadt');
  if (!cityResult.isValid) {
    errors.city = cityResult.error;
  } else if (city.length < 2) {
    errors.city = 'Stadt muss mindestens 2 Zeichen haben';
  }

  return errors;
};

/**
 * Check if form has any errors
 */
export const hasErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(error => error !== undefined);
};

/**
 * Check if form is valid (no errors and required fields filled)
 */
export const isFormValid = (errors: FormErrors): boolean => {
  return !hasErrors(errors);
};
