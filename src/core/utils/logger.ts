/**
 * Logger Utility
 * 
 * Single Responsibility: Provides centralized logging functionality
 * Open/Closed: Can be extended with different log levels and destinations
 */

import { appConfig } from '../config/appConfig';

/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  /**
   * Whether to enable logging
   * @default true in development, false in production
   */
  enabled?: boolean;
  
  /**
   * Minimum log level to output
   * @default 'error' in production, 'debug' in development
   */
  minLevel?: LogLevel;
}

/**
 * Logger utility class
 */
class Logger {
  private enabled: boolean;
  private minLevel: LogLevel;

  constructor(config: LoggerConfig = {}) {
    const isDevelopment = appConfig.mode === 'mock' || __DEV__;
    this.enabled = config.enabled ?? isDevelopment;
    this.minLevel = config.minLevel ?? (isDevelopment ? LogLevel.DEBUG : LogLevel.ERROR);
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  /**
   * Debug log (development only)
   */
  debug(...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log('[DEBUG]', ...args);
    }
  }

  /**
   * Info log
   */
  info(...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.info('[INFO]', ...args);
    }
  }

  /**
   * Warning log
   */
  warn(...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn('[WARN]', ...args);
    }
  }

  /**
   * Error log (always enabled in production)
   */
  error(...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error('[ERROR]', ...args);
    }
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();

/**
 * Convenience functions for direct use
 */
export const log = {
  debug: (...args: any[]) => logger.debug(...args),
  info: (...args: any[]) => logger.info(...args),
  warn: (...args: any[]) => logger.warn(...args),
  error: (...args: any[]) => logger.error(...args),
};

