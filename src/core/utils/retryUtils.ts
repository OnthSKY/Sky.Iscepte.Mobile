/**
 * Retry Utilities
 * 
 * Single Responsibility: Provides intelligent retry strategies
 * Open/Closed: Easy to extend with new retry strategies
 * 
 * Features:
 * - Exponential backoff with jitter
 * - Error-type specific retry strategies
 * - Circuit breaker pattern
 * - Configurable retry limits
 */

import {
  ApiError,
  NetworkError,
  TimeoutError,
  ServerError,
  UnauthorizedError,
  isApiError,
} from '../types/apiErrors';
import { isRetryableError, getErrorStatus } from './errorUtils';

/**
 * Retry configuration
 */
export interface RetryConfig {
  /**
   * Maximum number of retries
   */
  maxRetries: number;
  
  /**
   * Initial retry delay in milliseconds
   */
  initialDelay: number;
  
  /**
   * Maximum retry delay in milliseconds
   */
  maxDelay: number;
  
  /**
   * Exponential backoff multiplier
   */
  backoffMultiplier: number;
  
  /**
   * Whether to add jitter (randomness) to retry delays
   */
  jitter: boolean;
  
  /**
   * Custom retry condition function
   */
  shouldRetry?: (failureCount: number, error: Error) => boolean;
}

/**
 * Default retry configurations for different scenarios
 */
export const RetryConfigs = {
  /**
   * Default retry config for queries
   * - 3 retries
   * - Exponential backoff: 1s, 2s, 4s
   * - Max delay: 30s
   * - With jitter
   */
  query: {
    maxRetries: 3,
    initialDelay: 1000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    jitter: true,
  } as RetryConfig,
  
  /**
   * Retry config for mutations
   * - 1 retry (mutations rarely benefit from retries)
   * - Short delay: 500ms
   */
  mutation: {
    maxRetries: 1,
    initialDelay: 500,
    maxDelay: 2000,
    backoffMultiplier: 2,
    jitter: true,
  } as RetryConfig,
  
  /**
   * Retry config for critical operations
   * - 5 retries
   * - Longer delays
   */
  critical: {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 60000,
    backoffMultiplier: 2,
    jitter: true,
  } as RetryConfig,
  
  /**
   * Retry config for network-heavy operations
   * - 2 retries
   * - Quick retries
   */
  network: {
    maxRetries: 2,
    initialDelay: 500,
    maxDelay: 10000,
    backoffMultiplier: 2,
    jitter: true,
  } as RetryConfig,
} as const;

/**
 * Calculate retry delay with exponential backoff and optional jitter
 * 
 * @param failureCount - Current failure count (0 = first retry)
 * @param config - Retry configuration
 * @returns Delay in milliseconds
 */
export function calculateRetryDelay(failureCount: number, config: RetryConfig): number {
  // Calculate exponential delay
  const exponentialDelay = Math.min(
    config.initialDelay * Math.pow(config.backoffMultiplier, failureCount),
    config.maxDelay
  );
  
  // Add jitter if enabled (prevents retry storms)
  if (config.jitter) {
    // Add ±20% random jitter
    const jitterAmount = exponentialDelay * 0.2;
    const jitter = (Math.random() * 2 - 1) * jitterAmount; // -20% to +20%
    return Math.max(0, Math.floor(exponentialDelay + jitter));
  }
  
  return Math.floor(exponentialDelay);
}

/**
 * Default retry function for React Query
 * 
 * @param failureCount - Current failure count
 * @param error - Error that occurred
 * @param config - Retry configuration
 * @returns true if should retry, false otherwise
 */
export function shouldRetry(
  failureCount: number,
  error: Error | unknown,
  config: RetryConfig = RetryConfigs.query
): boolean {
  // Check if max retries reached
  if (failureCount >= config.maxRetries) {
    return false;
  }
  
  // Use custom retry condition if provided
  if (config.shouldRetry) {
    return config.shouldRetry(failureCount, error instanceof Error ? error : new Error(String(error)));
  }
  
  // Default: only retry if error is retryable
  return isRetryableError(error);
}

/**
 * Create retry function for React Query useQuery/useMutation
 * 
 * @param config - Retry configuration (default: query config)
 * @returns Retry function compatible with React Query
 */
export function createRetryFunction(config: RetryConfig = RetryConfigs.query) {
  return (failureCount: number, error: Error): boolean => {
    return shouldRetry(failureCount, error, config);
  };
}

/**
 * Create retry delay function for React Query
 * 
 * @param config - Retry configuration (default: query config)
 * @returns Retry delay function compatible with React Query
 */
export function createRetryDelayFunction(config: RetryConfig = RetryConfigs.query) {
  return (attemptIndex: number, error: Error): number => {
    // attemptIndex starts at 0, failureCount starts at 0 after first failure
    const failureCount = attemptIndex;
    return calculateRetryDelay(failureCount, config);
  };
}

/**
 * Error-type specific retry strategies
 */
export const RetryStrategies = {
  /**
   * Retry strategy for network errors
   * - More aggressive retries (4 retries)
   * - Quick initial delay
   */
  network: (): RetryConfig => ({
    ...RetryConfigs.network,
    shouldRetry: (failureCount, error) => {
      if (failureCount >= RetryConfigs.network.maxRetries) {
        return false;
      }
      // Network errors: always retry
      return error instanceof NetworkError || error instanceof TimeoutError;
    },
  }),
  
  /**
   * Retry strategy for server errors (5xx)
   * - Moderate retries (3 retries)
   * - Longer delays (server might be recovering)
   */
  server: (): RetryConfig => ({
    ...RetryConfigs.query,
    initialDelay: 2000, // Start with 2s delay
    shouldRetry: (failureCount, error) => {
      if (failureCount >= RetryConfigs.query.maxRetries) {
        return false;
      }
      // Server errors: retry with backoff
      if (error instanceof ServerError) {
        return true;
      }
      const status = getErrorStatus(error);
      return status !== undefined && status >= 500 && status < 600;
    },
  }),
  
  /**
   * Retry strategy for timeout errors
   * - Quick retries (2 retries)
   * - Short delays
   */
  timeout: (): RetryConfig => ({
    ...RetryConfigs.network,
    shouldRetry: (failureCount, error) => {
      if (failureCount >= RetryConfigs.network.maxRetries) {
        return false;
      }
      return error instanceof TimeoutError;
    },
  }),
  
  /**
   * Retry strategy for critical operations
   * - Maximum retries (5 retries)
   * - Progressive delays
   */
  critical: (): RetryConfig => ({
    ...RetryConfigs.critical,
    shouldRetry: (failureCount, error) => {
      if (failureCount >= RetryConfigs.critical.maxRetries) {
        return false;
      }
      // Only retry retryable errors for critical operations
      return isRetryableError(error);
    },
  }),
  
  /**
   * Retry strategy for mutations
   * - Minimal retries (1 retry)
   * - Only for network/server errors
   */
  mutation: (): RetryConfig => ({
    ...RetryConfigs.mutation,
    shouldRetry: (failureCount, error) => {
      if (failureCount >= RetryConfigs.mutation.maxRetries) {
        return false;
      }
      // Mutations: only retry network/server errors
      if (error instanceof NetworkError || error instanceof TimeoutError) {
        return true;
      }
      if (error instanceof ServerError) {
        return true;
      }
      const status = getErrorStatus(error);
      return status !== undefined && status >= 500 && status < 600;
    },
  }),
  
  /**
   * No retry strategy
   */
  none: (): RetryConfig => ({
    maxRetries: 0,
    initialDelay: 0,
    maxDelay: 0,
    backoffMultiplier: 1,
    jitter: false,
    shouldRetry: () => false,
  }),
} as const;

/**
 * Get retry strategy based on error type
 * 
 * @param error - Error that occurred
 * @returns Appropriate retry config
 */
export function getRetryStrategyForError(error: Error | unknown): RetryConfig {
  if (isApiError(error)) {
    if (error instanceof NetworkError || error instanceof TimeoutError) {
      return RetryStrategies.network();
    }
    if (error instanceof ServerError) {
      return RetryStrategies.server();
    }
    if (error instanceof TimeoutError) {
      return RetryStrategies.timeout();
    }
  }
  
  // Default to query strategy
  return RetryConfigs.query;
}

/**
 * Circuit breaker state
 */
enum CircuitState {
  CLOSED = 'CLOSED', // Normal operation
  OPEN = 'OPEN', // Failing, don't retry
  HALF_OPEN = 'HALF_OPEN', // Testing if service recovered
}

/**
 * Simple circuit breaker for retry logic
 * Prevents cascading failures by stopping retries after too many failures
 */
export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  
  constructor(
    private failureThreshold: number = 5,
    private timeout: number = 60000 // 1 minute
  ) {}
  
  /**
   * Check if operation should proceed
   */
  canProceed(): boolean {
    const now = Date.now();
    
    // Check if timeout expired (half-open state)
    if (this.state === CircuitState.OPEN && now - this.lastFailureTime > this.timeout) {
      this.state = CircuitState.HALF_OPEN;
      this.failureCount = 0;
      return true;
    }
    
    // Circuit is open - don't proceed
    if (this.state === CircuitState.OPEN) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Record a successful operation
   */
  recordSuccess(): void {
    this.failureCount = 0;
    this.state = CircuitState.CLOSED;
  }
  
  /**
   * Record a failure
   */
  recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    if (this.failureCount >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
    }
  }
  
  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }
  
  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }
}

/**
 * Global circuit breaker instance (per endpoint)
 */
const circuitBreakers = new Map<string, CircuitBreaker>();

/**
 * Get or create circuit breaker for an endpoint
 * 
 * @param endpoint - API endpoint
 * @returns Circuit breaker instance
 */
export function getCircuitBreaker(endpoint: string): CircuitBreaker {
  if (!circuitBreakers.has(endpoint)) {
    circuitBreakers.set(endpoint, new CircuitBreaker());
  }
  return circuitBreakers.get(endpoint)!;
}

