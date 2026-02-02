/**
 * CivManager - Validation Utilities
 * Centralized validation functions for form inputs and data
 */

/**
 * Validation result type
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate required field
 */
export const validateRequired = (
  value: string | number | null | undefined,
  fieldName: string = 'Field'
): ValidationResult => {
  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }
  return { isValid: true };
};

/**
 * Validate phone number
 */
export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
  if (!phone) {
    return { isValid: false, error: 'Phone number is required' };
  }
  if (!phoneRegex.test(phone)) {
    return { isValid: false, error: 'Invalid phone number format' };
  }
  return { isValid: true };
};

/**
 * Validate minimum length
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string = 'Field'
): ValidationResult => {
  if (!value || value.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters`,
    };
  }
  return { isValid: true };
};

/**
 * Validate maximum length
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string = 'Field'
): ValidationResult => {
  if (value && value.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must not exceed ${maxLength} characters`,
    };
  }
  return { isValid: true };
};

/**
 * Validate positive number
 */
export const validatePositiveNumber = (
  value: number,
  fieldName: string = 'Value'
): ValidationResult => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  if (value <= 0) {
    return { isValid: false, error: `${fieldName} must be positive` };
  }
  return { isValid: true };
};

/**
 * Validate number range
 */
export const validateNumberRange = (
  value: number,
  min: number,
  max: number,
  fieldName: string = 'Value'
): ValidationResult => {
  if (typeof value !== 'number' || isNaN(value)) {
    return { isValid: false, error: `${fieldName} must be a number` };
  }
  if (value < min || value > max) {
    return {
      isValid: false,
      error: `${fieldName} must be between ${min} and ${max}`,
    };
  }
  return { isValid: true };
};

/**
 * Validate date is not in the future
 */
export const validateNotFutureDate = (
  date: Date | string,
  fieldName: string = 'Date'
): ValidationResult => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (dateObj > new Date()) {
    return { isValid: false, error: `${fieldName} cannot be in the future` };
  }
  return { isValid: true };
};

/**
 * Validate date is not in the past
 */
export const validateNotPastDate = (
  date: Date | string,
  fieldName: string = 'Date'
): ValidationResult => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (dateObj < today) {
    return { isValid: false, error: `${fieldName} cannot be in the past` };
  }
  return { isValid: true };
};

/**
 * Validate expense amount
 */
export const validateExpenseAmount = (amount: number): ValidationResult => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return { isValid: false, error: 'Amount must be a number' };
  }
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  if (amount > 100000000) {
    return { isValid: false, error: 'Amount exceeds maximum limit' };
  }
  return { isValid: true };
};

/**
 * Validate project name
 */
export const validateProjectName = (name: string): ValidationResult => {
  const requiredResult = validateRequired(name, 'Project name');
  if (!requiredResult.isValid) return requiredResult;

  const minLengthResult = validateMinLength(name, 3, 'Project name');
  if (!minLengthResult.isValid) return minLengthResult;

  const maxLengthResult = validateMaxLength(name, 100, 'Project name');
  if (!maxLengthResult.isValid) return maxLengthResult;

  return { isValid: true };
};

/**
 * Validate expense description
 */
export const validateExpenseDescription = (
  description: string
): ValidationResult => {
  const requiredResult = validateRequired(description, 'Description');
  if (!requiredResult.isValid) return requiredResult;

  const minLengthResult = validateMinLength(description, 5, 'Description');
  if (!minLengthResult.isValid) return minLengthResult;

  const maxLengthResult = validateMaxLength(description, 500, 'Description');
  if (!maxLengthResult.isValid) return maxLengthResult;

  return { isValid: true };
};

/**
 * Combine multiple validation results
 */
export const combineValidations = (
  ...results: ValidationResult[]
): ValidationResult => {
  for (const result of results) {
    if (!result.isValid) {
      return result;
    }
  }
  return { isValid: true };
};
