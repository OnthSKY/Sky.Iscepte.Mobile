/**
 * Error Utils Tests
 */

// Mock i18n and services before importing
jest.mock('../../../i18n', () => ({
  t: (key: string, options?: any) => {
    if (options?.defaultValue) return options.defaultValue;
    if (key === 'common:errors.network') return 'Network error. Please check your connection.';
    if (key === 'common:errors.timeout') return 'Request timeout. Please try again.';
    if (key === 'common:errors.unauthorized') return 'Unauthorized. Please login again.';
    if (key === 'common:errors.forbidden') return 'Access forbidden.';
    if (key === 'common:errors.not_found') return 'Resource not found.';
    if (key === 'common:errors.validation') return 'Validation error. Please check your input.';
    if (key === 'common:errors.server') return 'Server error. Please try again later.';
    if (key === 'common:errors.unknown') return 'An unknown error occurred.';
    return key;
  },
}));

jest.mock('../../services/monitoringService', () => ({
  captureException: jest.fn(),
  captureMessage: jest.fn(),
}));

jest.mock('../../shared/services/notificationService', () => ({
  default: {
    error: jest.fn(),
  },
}));

import {
  getErrorMessage,
  getErrorCategory,
  isRetryableError,
} from '../errorUtils';
import {
  NetworkError,
  TimeoutError,
  UnauthorizedError,
  ValidationError,
  ServerError,
} from '../../types/apiErrors';

describe('errorUtils', () => {
  describe('getErrorMessage', () => {
    it('returns string error as-is', () => {
      expect(getErrorMessage('Test error')).toBe('Test error');
    });

    it('returns message from Error object', () => {
      const error = new Error('Test error message');
      expect(getErrorMessage(error)).toBe('Test error message');
    });

    it('handles NetworkError', () => {
      const error = new NetworkError('Network error');
      const message = getErrorMessage(error);
      expect(message).toBeTruthy();
    });

    it('handles ValidationError', () => {
      const error = new ValidationError('Validation error');
      const message = getErrorMessage(error);
      expect(message).toBeTruthy();
    });

    it('returns default message for unknown error', () => {
      const error = {};
      const message = getErrorMessage(error);
      expect(message).toBeTruthy();
    });
  });

  describe('getErrorCategory', () => {
    it('returns correct category for NetworkError', () => {
      const error = new NetworkError('Network error');
      expect(getErrorCategory(error)).toBe('api');
    });

    it('returns correct category for ValidationError', () => {
      const error = new ValidationError('Validation error');
      expect(getErrorCategory(error)).toBe('validation');
    });

    it('returns correct category for ServerError', () => {
      const error = new ServerError('Server error');
      expect(getErrorCategory(error)).toBe('system');
    });
  });

  describe('isRetryableError', () => {
    it('returns true for NetworkError', () => {
      const error = new NetworkError('Network error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for TimeoutError', () => {
      const error = new TimeoutError('Timeout error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns true for ServerError', () => {
      const error = new ServerError('Server error');
      expect(isRetryableError(error)).toBe(true);
    });

    it('returns false for ValidationError', () => {
      const error = new ValidationError('Validation error');
      expect(isRetryableError(error)).toBe(false);
    });

    it('returns false for UnauthorizedError', () => {
      const error = new UnauthorizedError('Unauthorized error');
      expect(isRetryableError(error)).toBe(false);
    });
  });
});

