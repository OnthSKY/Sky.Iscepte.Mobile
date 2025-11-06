/**
 * Validators Tests
 */

// Mock i18n before importing validators
jest.mock('../../../i18n', () => ({
  t: (key: string, options?: any) => {
    if (options?.defaultValue) return options.defaultValue;
    if (key === 'common:errors.required') return 'This field is required';
    if (key === 'common:errors.min_length') return `Must be at least ${options?.min} characters`;
    if (key === 'common:errors.max_length') return `Must be at most ${options?.max} characters`;
    if (key === 'common:errors.email') return 'Invalid email address';
    if (key === 'common:errors.not_a_number') return 'Must be a number';
    if (key === 'common:errors.must_be_positive') return 'Must be greater than 0';
    if (key === 'common:errors.range') return `Must be between ${options?.min} and ${options?.max}`;
    if (key === 'common:errors.invalid_phone') return 'Invalid phone number';
    if (key === 'common:errors.invalid_url') return 'Invalid URL';
    return key;
  },
}));

import {
  required,
  minLength,
  maxLength,
  isEmail,
  isNumber,
  isPositive,
  range,
  isPhone,
  isUrl,
  combine,
} from '../validators';

describe('validators', () => {
  describe('required', () => {
    it('returns error for empty string', () => {
      expect(required('')).toBeTruthy();
    });

    it('returns error for null', () => {
      expect(required(null as any)).toBeTruthy();
    });

    it('returns error for undefined', () => {
      expect(required(undefined as any)).toBeTruthy();
    });

    it('returns undefined for valid value', () => {
      expect(required('test')).toBeUndefined();
    });
  });

  describe('minLength', () => {
    it('returns error for string shorter than min', () => {
      expect(minLength(5)('test')).toBeTruthy();
    });

    it('returns undefined for string longer than min', () => {
      expect(minLength(5)('test123')).toBeUndefined();
    });

    it('returns undefined for string equal to min', () => {
      expect(minLength(4)('test')).toBeUndefined();
    });
  });

  describe('maxLength', () => {
    it('returns error for string longer than max', () => {
      expect(maxLength(5)('test123')).toBeTruthy();
    });

    it('returns undefined for string shorter than max', () => {
      expect(maxLength(10)('test')).toBeUndefined();
    });

    it('returns undefined for string equal to max', () => {
      expect(maxLength(4)('test')).toBeUndefined();
    });
  });

  describe('isEmail', () => {
    it('returns error for invalid email', () => {
      expect(isEmail('invalid')).toBeTruthy();
      expect(isEmail('invalid@')).toBeTruthy();
      expect(isEmail('@invalid.com')).toBeTruthy();
    });

    it('returns undefined for valid email', () => {
      expect(isEmail('test@example.com')).toBeUndefined();
      expect(isEmail('user.name@example.co.uk')).toBeUndefined();
    });
  });

  describe('isNumber', () => {
    it('returns error for non-number string', () => {
      expect(isNumber('abc')).toBeTruthy();
      expect(isNumber('12abc')).toBeTruthy();
    });

    it('returns undefined for valid number string', () => {
      expect(isNumber('123')).toBeUndefined();
      expect(isNumber('123.45')).toBeUndefined();
      expect(isNumber('-123')).toBeUndefined();
    });
  });

  describe('isPositive', () => {
    it('returns error for negative number', () => {
      expect(isPositive('-5')).toBeTruthy();
      expect(isPositive(-5)).toBeTruthy();
    });

    it('returns error for zero', () => {
      expect(isPositive('0')).toBeTruthy();
      expect(isPositive(0)).toBeTruthy();
    });

    it('returns undefined for positive number', () => {
      expect(isPositive('5')).toBeUndefined();
      expect(isPositive(5)).toBeUndefined();
    });
  });

  describe('range', () => {
    it('returns error for value below min', () => {
      expect(range(5, 10)('3')).toBeTruthy();
    });

    it('returns error for value above max', () => {
      expect(range(5, 10)('15')).toBeTruthy();
    });

    it('returns undefined for value in range', () => {
      expect(range(5, 10)('7')).toBeUndefined();
      expect(range(5, 10)('5')).toBeUndefined();
      expect(range(5, 10)('10')).toBeUndefined();
    });
  });

  describe('isPhone', () => {
    it('returns error for invalid phone', () => {
      expect(isPhone('123')).toBeTruthy();
      expect(isPhone('abc')).toBeTruthy();
    });

    it('returns undefined for valid phone', () => {
      expect(isPhone('5551234567')).toBeUndefined();
      expect(isPhone('+905551234567')).toBeUndefined();
      expect(isPhone('(555) 123-4567')).toBeUndefined();
    });
  });

  describe('isUrl', () => {
    it('returns error for invalid URL', () => {
      expect(isUrl('invalid')).toBeTruthy();
      expect(isUrl('not-a-url')).toBeTruthy();
    });

    it('returns undefined for valid URL', () => {
      expect(isUrl('https://example.com')).toBeUndefined();
      expect(isUrl('http://example.com')).toBeUndefined();
      expect(isUrl('https://example.com/path')).toBeUndefined();
    });
  });

  describe('combine', () => {
    it('returns first error from multiple validators', () => {
      const validator = combine(required, minLength(5));
      expect(validator('abc')).toBeTruthy();
    });

    it('returns undefined if all validators pass', () => {
      const validator = combine(required, minLength(3));
      expect(validator('test')).toBeUndefined();
    });

    it('works with empty array', () => {
      const validator = combine();
      expect(validator('test')).toBeUndefined();
    });
  });
});

