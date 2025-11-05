import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Low Stock Alert Store
 * Manages user-defined threshold and reminder limits for low stock alerts
 */
export type ReminderFrequency = 'day' | 'week';
export type ReminderLimit = 1 | 2 | 3 | 5 | 10;

type LowStockAlertState = {
  threshold: number;
  enabled: boolean;
  reminderFrequency: ReminderFrequency;
  reminderLimit: ReminderLimit;
  batchMode: boolean; // Toplu bildirim modu (varsayılan true)
  setThreshold: (threshold: number) => Promise<void>;
  setEnabled: (enabled: boolean) => Promise<void>;
  setReminderFrequency: (frequency: ReminderFrequency) => Promise<void>;
  setReminderLimit: (limit: ReminderLimit) => Promise<void>;
  setBatchMode: (batchMode: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
};

const STORAGE_KEY_THRESHOLD = 'low_stock_alert_threshold';
const STORAGE_KEY_ENABLED = 'low_stock_alert_enabled';
const STORAGE_KEY_REMINDER_FREQUENCY = 'low_stock_alert_reminder_frequency';
const STORAGE_KEY_REMINDER_LIMIT = 'low_stock_alert_reminder_limit';
const STORAGE_KEY_BATCH_MODE = 'low_stock_alert_batch_mode';
const DEFAULT_THRESHOLD = 10;
const DEFAULT_REMINDER_FREQUENCY: ReminderFrequency = 'day';
const DEFAULT_REMINDER_LIMIT: ReminderLimit = 3;
const DEFAULT_BATCH_MODE = true;

export const useLowStockAlertStore = create<LowStockAlertState>((set, get) => ({
  threshold: DEFAULT_THRESHOLD,
  enabled: true,
  reminderFrequency: DEFAULT_REMINDER_FREQUENCY,
  reminderLimit: DEFAULT_REMINDER_LIMIT,
  batchMode: DEFAULT_BATCH_MODE,
  
  async setThreshold(threshold: number) {
    if (threshold < 0) {
      threshold = 0;
    }
    set({ threshold });
    await AsyncStorage.setItem(STORAGE_KEY_THRESHOLD, String(threshold));
  },
  
  async setEnabled(enabled: boolean) {
    set({ enabled });
    await AsyncStorage.setItem(STORAGE_KEY_ENABLED, String(enabled));
  },
  
  async setReminderFrequency(frequency: ReminderFrequency) {
    set({ reminderFrequency: frequency });
    await AsyncStorage.setItem(STORAGE_KEY_REMINDER_FREQUENCY, frequency);
  },
  
  async setReminderLimit(limit: ReminderLimit) {
    set({ reminderLimit: limit });
    await AsyncStorage.setItem(STORAGE_KEY_REMINDER_LIMIT, String(limit));
  },
  
  async setBatchMode(batchMode: boolean) {
    set({ batchMode });
    await AsyncStorage.setItem(STORAGE_KEY_BATCH_MODE, String(batchMode));
  },
  
  async hydrate() {
    try {
      const storedThreshold = await AsyncStorage.getItem(STORAGE_KEY_THRESHOLD);
      const storedEnabled = await AsyncStorage.getItem(STORAGE_KEY_ENABLED);
      const storedFrequency = await AsyncStorage.getItem(STORAGE_KEY_REMINDER_FREQUENCY);
      const storedLimit = await AsyncStorage.getItem(STORAGE_KEY_REMINDER_LIMIT);
      const storedBatchMode = await AsyncStorage.getItem(STORAGE_KEY_BATCH_MODE);
      
      if (storedThreshold !== null) {
        const threshold = parseInt(storedThreshold, 10);
        if (!isNaN(threshold) && threshold >= 0) {
          set({ threshold });
        }
      }
      
      if (storedEnabled !== null) {
        set({ enabled: storedEnabled === 'true' });
      }
      
      if (storedFrequency !== null && (storedFrequency === 'day' || storedFrequency === 'week')) {
        set({ reminderFrequency: storedFrequency });
      }
      
      if (storedLimit !== null) {
        const limit = parseInt(storedLimit, 10) as ReminderLimit;
        if ([1, 2, 3, 5, 10].includes(limit)) {
          set({ reminderLimit: limit });
        }
      }
      
      if (storedBatchMode !== null) {
        set({ batchMode: storedBatchMode === 'true' });
      }
    } catch (error) {
      // Error loading settings, use defaults
      console.warn('Failed to load low stock alert settings:', error);
    }
  },
}));

