/**
 * Verification Cache Store
 * Stores verification results to avoid re-verification
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VerificationResult, VerificationCache, TCVerificationRequest, IMEIVerificationRequest } from '../types/verification.types';

interface VerificationCacheState {
  cache: VerificationCache;
  loadCache: () => Promise<void>;
  getCachedResult: (cacheKey: string) => VerificationResult | null;
  setCachedResult: (result: VerificationResult) => Promise<void>;
  clearCache: () => Promise<void>;
  generateCacheKey: (type: 'tc' | 'imei', request: TCVerificationRequest | IMEIVerificationRequest) => string;
}

const STORAGE_KEY = 'verification_cache';

export const useVerificationCacheStore = create<VerificationCacheState>((set, get) => ({
  cache: {},

  loadCache: async () => {
    try {
      const cached = await AsyncStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        set({ cache: parsed });
      }
    } catch (error) {
      console.warn('Failed to load verification cache:', error);
    }
  },

  getCachedResult: (cacheKey: string) => {
    const { cache } = get();
    const cached = cache[cacheKey];
    if (cached && cached.status === 'success') {
      // Return as cached status
      return { ...cached, status: 'cached' };
    }
    return cached || null;
  },

  setCachedResult: async (result: VerificationResult) => {
    const { cache } = get();
    const newCache = {
      ...cache,
      [result.cacheKey]: result,
    };
    set({ cache: newCache });
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newCache));
    } catch (error) {
      console.warn('Failed to save verification cache:', error);
    }
  },

  clearCache: async () => {
    set({ cache: {} });
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear verification cache:', error);
    }
  },

  generateCacheKey: (type: 'tc' | 'imei', request: TCVerificationRequest | IMEIVerificationRequest) => {
    if (type === 'tc') {
      const tcRequest = request as TCVerificationRequest;
      // Normalize: lowercase, trim, remove spaces
      const normalizedName = tcRequest.fullName.toLowerCase().trim().replace(/\s+/g, ' ');
      return `tc_${tcRequest.tcNo}_${tcRequest.birthDate}_${normalizedName}`;
    } else {
      const imeiRequest = request as IMEIVerificationRequest;
      return `imei_${imeiRequest.imei}`;
    }
  },
}));

