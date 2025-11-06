/**
 * Monitoring Service
 * 
 * Single Responsibility: Provides centralized error tracking and monitoring
 * Open/Closed: Can be extended with different monitoring providers
 */

import { appConfig } from '../config/appConfig';
import { logger } from '../utils/logger';
import { useAppStore } from '../../store/useAppStore';

// Sentry will be conditionally imported
let Sentry: any = null;
let isSentryInitialized = false;

/**
 * Initialize Sentry for error tracking
 * Only initializes in production or when explicitly enabled
 */
export async function initializeMonitoring(): Promise<void> {
  // Only initialize in production or when explicitly enabled
  if (appConfig.mode === 'mock' && !__DEV__) {
    logger.info('Monitoring disabled in mock mode');
    return;
  }

  try {
    // Dynamically import Sentry to avoid bundling in development
    if (process.env.NODE_ENV === 'production' || process.env.EXPO_PUBLIC_ENABLE_SENTRY === 'true') {
      const SentryModule = await import('@sentry/react-native');
      Sentry = SentryModule.default;
      
      if (Sentry && !isSentryInitialized) {
        Sentry.init({
          dsn: process.env.EXPO_PUBLIC_SENTRY_DSN || '',
          enableInExpoDevelopment: false,
          debug: __DEV__,
          environment: appConfig.mode === 'mock' ? 'development' : 'production',
          // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
          tracesSampleRate: 1.0,
          // Set profilesSampleRate to 1.0 to profile 100% of transactions
          profilesSampleRate: 1.0,
          beforeSend(event, hint) {
            // Filter out sensitive data
            if (event.request) {
              delete event.request.cookies;
              if (event.request.headers) {
                delete event.request.headers.Authorization;
              }
            }
            return event;
          },
        });
        
        isSentryInitialized = true;
        logger.info('Sentry initialized successfully');
      }
    }
  } catch (error) {
    logger.warn('Failed to initialize Sentry:', error);
    // Don't throw - monitoring is optional
  }
}

/**
 * Capture exception/error
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  logger.error('Exception captured:', error, context);
  
  if (Sentry && isSentryInitialized) {
    try {
      Sentry.captureException(error, {
        contexts: {
          custom: context || {},
        },
        user: {
          id: useAppStore.getState().user?.id?.toString(),
          role: useAppStore.getState().role,
        },
      });
    } catch (e) {
      logger.warn('Failed to send exception to Sentry:', e);
    }
  }
}

/**
 * Capture message
 */
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>): void {
  logger[level]('Message captured:', message, context);
  
  if (Sentry && isSentryInitialized) {
    try {
      Sentry.captureMessage(message, {
        level: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
        contexts: {
          custom: context || {},
        },
        user: {
          id: useAppStore.getState().user?.id?.toString(),
          role: useAppStore.getState().role,
        },
      });
    } catch (e) {
      logger.warn('Failed to send message to Sentry:', e);
    }
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(userId: string | number, role?: string, email?: string): void {
  if (Sentry && isSentryInitialized) {
    try {
      Sentry.setUser({
        id: userId.toString(),
        role,
        email,
      });
    } catch (e) {
      logger.warn('Failed to set user context in Sentry:', e);
    }
  }
}

/**
 * Clear user context
 */
export function clearUserContext(): void {
  if (Sentry && isSentryInitialized) {
    try {
      Sentry.setUser(null);
    } catch (e) {
      logger.warn('Failed to clear user context in Sentry:', e);
    }
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, category?: string, level: 'info' | 'warning' | 'error' = 'info', data?: Record<string, any>): void {
  if (Sentry && isSentryInitialized) {
    try {
      Sentry.addBreadcrumb({
        message,
        category: category || 'default',
        level: level === 'info' ? 'info' : level === 'warning' ? 'warning' : 'error',
        data,
        timestamp: Date.now() / 1000,
      });
    } catch (e) {
      logger.warn('Failed to add breadcrumb to Sentry:', e);
    }
  }
}

/**
 * Start a transaction for performance monitoring
 */
export function startTransaction(name: string, op: string = 'navigation'): any {
  if (Sentry && isSentryInitialized) {
    try {
      return Sentry.startTransaction({
        name,
        op,
      });
    } catch (e) {
      logger.warn('Failed to start transaction in Sentry:', e);
      return null;
    }
  }
  return null;
}

/**
 * Set tag for filtering errors
 */
export function setTag(key: string, value: string): void {
  if (Sentry && isSentryInitialized) {
    try {
      Sentry.setTag(key, value);
    } catch (e) {
      logger.warn('Failed to set tag in Sentry:', e);
    }
  }
}

/**
 * Set extra context data
 */
export function setContext(key: string, context: Record<string, any>): void {
  if (Sentry && isSentryInitialized) {
    try {
      Sentry.setContext(key, context);
    } catch (e) {
      logger.warn('Failed to set context in Sentry:', e);
    }
  }
}

const monitoringService = {
  initializeMonitoring,
  captureException,
  captureMessage,
  setUserContext,
  clearUserContext,
  addBreadcrumb,
  startTransaction,
  setTag,
  setContext,
};

export default monitoringService;

