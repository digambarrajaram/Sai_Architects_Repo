// src/utils/validationHelpers.ts
export const validationHelpers = {
  required: (value: any, fieldName: string): string | null => {
    if (value === undefined || value === null || value === '') {
      return `${fieldName} is required`;
    }
    return null;
  },

  email: (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  },

  password: (password: string): string | null => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    return null;
  },

  amount: (value: string | number): string | null => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num) || num <= 0) {
      return 'Please enter a valid positive amount';
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): string | null => {
    if (value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): string | null => {
    if (value.length > max) {
      return `${fieldName} must be at most ${max} characters`;
    }
    return null;
  },

  dateRange: (start: Date, end: Date): string | null => {
    if (start > end) {
      return 'Start date must be before end date';
    }
    return null;
  },

  phoneNumber: (phone: string): string | null => {
    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,4}[-\s.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(phone)) {
      return 'Please enter a valid phone number';
    }
    return null;
  },

  validateForm: <T extends Record<string, any>>(
    values: T,
    rules: Record<keyof T, (value: any) => string | null>
  ): { isValid: boolean; errors: Partial<Record<keyof T, string>> } => {
    const errors: Partial<Record<keyof T, string>> = {};

    for (const [field, rule] of Object.entries(rules)) {
      const error = rule(values[field]);
      if (error) {
        errors[field as keyof T] = error;
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  },
};

export default validationHelpers;