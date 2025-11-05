/**
 * Verification Types
 * Shared types for TC Kimlik and IMEI verification
 */

export type VerificationType = 'tc' | 'imei';

export type VerificationStatus = 'pending' | 'verifying' | 'success' | 'failed' | 'cached';

export interface TCVerificationRequest {
  tcNo: string;
  birthDate: string; // YYYY-MM-DD format
  fullName: string;
}

export interface TCVerificationResponse {
  valid: boolean;
  tcNo: string;
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  gender?: 'M' | 'F';
  message?: string;
}

export interface IMEIVerificationRequest {
  imei: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
}

export interface IMEIVerificationResponse {
  valid: boolean;
  imei: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  status?: 'active' | 'stolen' | 'blocked' | 'unknown';
  message?: string;
}

export interface VerificationResult {
  type: VerificationType;
  status: VerificationStatus;
  request: TCVerificationRequest | IMEIVerificationRequest;
  response?: TCVerificationResponse | IMEIVerificationResponse;
  timestamp: number;
  cacheKey: string; // Unique key for caching
}

export interface VerificationCache {
  [key: string]: VerificationResult;
}

