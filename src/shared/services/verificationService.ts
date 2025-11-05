/**
 * Verification Service
 * Handles TC Kimlik and IMEI verification requests
 */

import { apiEndpoints } from '../../core/config/apiEndpoints';
import { httpService } from './httpService';
import {
  TCVerificationRequest,
  TCVerificationResponse,
  IMEIVerificationRequest,
  IMEIVerificationResponse,
} from '../types/verification.types';

export const verificationService = {
  /**
   * Verify TC Kimlik with required fields
   */
  async verifyTC(request: TCVerificationRequest): Promise<TCVerificationResponse> {
    // Send all required fields in the request
    const response = await httpService.post<TCVerificationResponse>(
      `/verification/tc/verify`,
      request
    );
    return response.data;
  },

  /**
   * Verify IMEI with optional fields
   */
  async verifyIMEI(request: IMEIVerificationRequest): Promise<IMEIVerificationResponse> {
    const response = await httpService.post<IMEIVerificationResponse>(
      `/verification/imei/verify`,
      request
    );
    return response.data;
  },
};

export default verificationService;

